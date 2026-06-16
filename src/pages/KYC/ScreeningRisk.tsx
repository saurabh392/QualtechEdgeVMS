import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Search, ChevronDown, Play, ChevronRight } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import styles from './ScreeningRisk.module.css';
import { useVendors } from '../../context/VendorContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const CHECKS_LIST = [
  "PAN Verification",
  "GST Validation",
  "CIN / MCA21",
  "OFAC / UN",
  "PEP Check",
  "Adverse Media",
  "Shell Company",
  "CIBIL Score"
];

const CHECK_OUTCOMES: Record<string, { clear: string[]; advisory: string[] }> = {
  "PAN Verification": {
    clear: ["Valid", "Verified"],
    advisory: ["Invalid", "No Record Found"]
  },
  "GST Validation": {
    clear: ["Active", "Verified"],
    advisory: ["Inactive", "Suspended"]
  },
  "CIN / MCA21": {
    clear: ["Valid", "Active company"],
    advisory: ["Filing delayed", "Under liquidation"]
  },
  "OFAC / UN": {
    clear: ["No sanctions found", "Clear"],
    advisory: ["Potential match"]
  },
  "PEP Check": {
    clear: ["Clear", "No matches found"],
    advisory: ["PEP detected"]
  },
  "Adverse Media": {
    clear: ["Clear", "No adverse media found"],
    advisory: ["Adverse Media Advisory"]
  },
  "Shell Company": {
    clear: ["Clear", "Low risk indicators"],
    advisory: ["High risk indicators"]
  },
  "CIBIL Score": {
    clear: ["Excellent", "Good", "Fair"],
    advisory: ["Poor", "No history"]
  }
};

const getCheckCategory = (status: string): 'Clear' | 'Advisory' | 'Pending' => {
  if (status === 'Pending') return 'Pending';
  const isClear = ["Clear", "Verified", "Active", "Valid", "Active company", "No sanctions found", "Excellent", "Good", "Fair"].includes(status);
  return isClear ? 'Clear' : 'Advisory';
};

const getRiskScoreStyle = (score: number) => {
  if (score === 0) return { backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score >= 85) return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score >= 70) return { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  return { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
};

const getRiskTierColors = (riskLevel: string) => {
  switch (riskLevel) {
    case 'Low':
      return {
        border: '4px solid #16a34a',
        backgroundColor: '#f0f9ff',
        color: '#16a34a'
      };
    case 'Medium':
      return {
        border: '4px solid #f59e0b',
        backgroundColor: '#fffbeb',
        color: '#d97706'
      };
    case 'High':
    case 'Critical':
      return {
        border: '4px solid #dc2626',
        backgroundColor: '#fef2f2',
        color: '#dc2626'
      };
    default:
      return {
        border: '4px solid var(--color-primary)',
        backgroundColor: '#eff6ff',
        color: 'var(--color-primary)'
      };
  }
};

const getMeterColor = (value: number) => {
  if (value >= 85) return '#16a34a'; // Low Risk (Green)
  if (value >= 70) return '#f59e0b'; // Medium Risk (Amber)
  return '#dc2626'; // High Risk (Red)
};

export const ScreeningRisk: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryVendorId = searchParams.get('vendor') || searchParams.get('vendorId');

  const { kycData, completeScreening, acceptAdvisory } = useVendors();
  const { user } = useAuth();
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Simulation states
  const [runningChecks, setRunningChecks] = useState(false);
  const [currentProgressIndex, setCurrentProgressIndex] = useState<number>(-1);
  const [currentChecks, setCurrentChecks] = useState<any[]>([]);
  const [simulationData, setSimulationData] = useState<{
    score: number;
    riskLevel: string;
    subScores: any;
    checks: any[];
  } | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (kycData && kycData.vendors && kycData.vendors.length > 0) {
      const defaultId = queryVendorId || kycData.vendors[0]?.vendorId || '';
      setSelectedVendorId(defaultId);
      setLoading(false);
    }
  }, [queryVendorId, kycData]);

  useEffect(() => {
    if (selectedVendorId) {
      window.scrollTo(0, 0);
    }
  }, [selectedVendorId]);

  const activeVendor = useMemo(() => {
    if (!kycData) return null;
    return kycData.vendors.find((v: any) => v.vendorId === selectedVendorId) || kycData.vendors[0] || null;
  }, [selectedVendorId, kycData]);

  const activeScreening = useMemo(() => {
    if (!kycData || !selectedVendorId) return null;
    return kycData.screeningResults.find((s: any) => s.vendorId === selectedVendorId) || null;
  }, [selectedVendorId, kycData]);

  const activeRun = useMemo(() => {
    if (!activeVendor || !activeVendor.screeningHistory || activeVendor.screeningHistory.length === 0) {
      return null;
    }
    return activeVendor.screeningHistory[0]; // most recent run
  }, [activeVendor]);

  const isCompleted = activeScreening?.completed;
  const isAdvisoryAccepted = activeScreening?.advisoryAccepted;

  const activeMetrics = useMemo(() => {
    if (activeRun) {
      return {
        score: activeRun.score,
        riskLevel: activeRun.riskTier,
        subScores: activeRun.subScores,
        checks: activeRun.checks
      };
    }
    // Fallback if no history yet but completed (from initial state)
    if (activeVendor && isCompleted) {
      const score = activeVendor.riskScore || 76;
      const riskLevel = activeVendor.riskLevel || 'Low';
      // derive subscores from score
      const base = score;
      const subScores = {
        financialHealth: Math.max(50, Math.min(100, base - 4)),
        regulatory: Math.max(50, Math.min(100, base + 9)),
        operational: Math.max(50, Math.min(100, base - 8)),
        sanctions: Math.max(50, Math.min(100, base + 19)),
        adverseMedia: Math.max(50, Math.min(100, base - 16)),
        esg: Math.max(50, Math.min(100, base + 2))
      };
      return {
        score,
        riskLevel,
        subScores,
        checks: activeScreening?.checks || []
      };
    }
    return null;
  }, [activeRun, activeVendor, isCompleted, activeScreening]);

  const metersData = useMemo(() => {
    if (!activeMetrics || !activeMetrics.subScores) return [];
    const s = activeMetrics.subScores;
    return [
      { name: 'Financial Health', value: s.financialHealth || 72 },
      { name: 'Regulatory', value: s.regulatory || 85 },
      { name: 'Operational', value: s.operational || 68 },
      { name: 'Sanctions/PEP', value: s.sanctions || 95 },
      { name: 'Adverse Media', value: s.adverseMedia || 60 },
      { name: 'ESG', value: s.esg || 78 }
    ];
  }, [activeMetrics]);

  // Set checks state when active vendor changes
  useEffect(() => {
    if (activeScreening) {
      setCurrentChecks(activeScreening.checks || []);
    }
  }, [activeScreening]);

  // Screening Checks Simulation Effect
  useEffect(() => {
    if (currentProgressIndex === -1 || !runningChecks || !simulationData) return;

    if (currentProgressIndex < 8) {
      const timer = setTimeout(() => {
        const finalCheck = simulationData.checks[currentProgressIndex];
        
        setCurrentChecks(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(c => c.name === finalCheck.name);
          if (idx !== -1) {
            updated[idx] = { ...finalCheck };
          } else {
            updated.push({ ...finalCheck });
          }
          return updated;
        });

        setCurrentProgressIndex(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Completed!
      setRunningChecks(false);
      setCurrentProgressIndex(-1);
      
      const { score, riskLevel, subScores, checks } = simulationData;
      const performedBy = user?.fullName || 'Rahul Verma';
      
      completeScreening(selectedVendorId, checks, score, riskLevel, performedBy, subScores);
      
      const clearCount = checks.filter(c => 
        ["Clear", "Verified", "Active", "Valid", "Active company", "No sanctions found", "Excellent", "Good", "Fair"].includes(c.status)
      ).length;
      const advisoryCount = checks.length - clearCount;
      const outcomeText = advisoryCount === 0 ? 'All checks passed.' : `${clearCount} checks passed • ${advisoryCount} advisory • Review recommended.`;
      
      toast.success(`Screening completed. ${outcomeText}`);
    }
  }, [currentProgressIndex, runningChecks, selectedVendorId, simulationData, user, completeScreening]);

  const handleRunChecks = () => {
    if (!selectedVendorId || runningChecks) return;
    
    // Pre-calculate outcomes
    const score = Math.floor(Math.random() * (95 - 55 + 1)) + 55; // 55 to 95
    let riskLevel = 'High';
    if (score >= 85) riskLevel = 'Low';
    else if (score >= 70) riskLevel = 'Medium';

    const subScores = {
      financialHealth: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      regulatory: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      operational: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      sanctions: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      adverseMedia: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      esg: Math.floor(Math.random() * (100 - 50 + 1)) + 50
    };

    const numAdvisories = riskLevel === 'Low' ? (Math.random() < 0.3 ? 1 : 0) : riskLevel === 'Medium' ? (Math.floor(Math.random() * 2) + 1) : (Math.floor(Math.random() * 3) + 2);
    
    const advisoryIndices = new Set<number>();
    while (advisoryIndices.size < numAdvisories) {
      advisoryIndices.add(Math.floor(Math.random() * CHECKS_LIST.length));
    }

    const checks = CHECKS_LIST.map((name, index) => {
      const checkConfig = CHECK_OUTCOMES[name];
      const isAdvisory = advisoryIndices.has(index);
      const pool = isAdvisory ? checkConfig.advisory : checkConfig.clear;
      const status = pool[Math.floor(Math.random() * pool.length)];
      return { name, status };
    });

    setSimulationData({
      score,
      riskLevel,
      subScores,
      checks
    });

    setRunningChecks(true);
    setCurrentProgressIndex(0);
    setCurrentChecks(CHECKS_LIST.map(name => ({ name, status: 'Pending' })));
  };

  const handleAdvisoryAction = (actionType: 'accept' | 'escalate') => {
    if (!selectedVendorId) return;
    
    if (actionType === 'accept') {
      const username = user?.fullName || 'Saurabh Anand';
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      acceptAdvisory(selectedVendorId, username, timestamp);
      toast.success('Advisory accepted and logged.');
    } else {
      toast.info('Advisory escalated to Compliance.');
    }
  };

  const searchedVendors = useMemo(() => {
    if (!kycData || !search.trim()) return [];
    const q = search.toLowerCase();
    return kycData.vendors.filter((v: any) => 
      v.vendorName.toLowerCase().includes(q) || 
      v.vendorId.toLowerCase().includes(q)
    );
  }, [search, kycData]);

  if (loading || !activeVendor) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading AI Screening & Risk Assessment...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>AI Screening & Risk</h1>
          <p className={styles.breadcrumbs}>Home / Vendor Onboarding & KYC / AI Screening & Risk</p>
          <p className={styles.subtitle}>Automated sanctions, PEP, and adverse media screening checks with composite risk calculation</p>
        </div>
      </header>

      {/* Vendor Selector dropdown */}
      <Card className={styles.selectorCard}>
        <div className={styles.selectorRow}>
          <div className={styles.selectorLeft}>
            <label className={styles.selectorLabel}>Select Vendor to Screen</label>
            <div className={styles.vendorSelectWrap}>
              <select
                className={styles.vendorSelect}
                value={selectedVendorId}
                onChange={e => setSelectedVendorId(e.target.value)}
                disabled={runningChecks}
              >
                {kycData?.vendors.map((v: any) => (
                  <option key={v.vendorId} value={v.vendorId}>
                    {v.vendorName} ({v.vendorId})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.selectorRight}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search vendor..."
                className={styles.searchInput}
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={runningChecks}
              />
            </div>
            {search.length > 0 && searchedVendors.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchedVendors.map((s: any) => (
                  <div
                    key={s.vendorId}
                    className={styles.searchItem}
                    onClick={() => { setSelectedVendorId(s.vendorId); setSearch(''); }}
                  >
                    <span className={styles.searchItemName}>{s.vendorName}</span>
                    <span className={styles.searchItemId}>{s.vendorId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className={styles.screeningWorkspace}>
        {/* Section A: Automated Screening */}
        <Card style={{ padding: '20px' }}>
          <div className={styles.checksHeader}>
            <h3 className={styles.checksTitle}>Automated Screening Checks</h3>
            <Button
              icon={runningChecks ? null : <Play size={14} />}
              onClick={handleRunChecks}
              disabled={runningChecks}
              variant={isCompleted ? 'outline' : 'primary'}
            >
              {runningChecks ? 'Running Checks...' : isCompleted ? 'Rerun Checks' : 'Run All Checks'}
            </Button>
          </div>

          <div className={styles.checksList}>
            {CHECKS_LIST.map((check) => {
              const checkStatusObj = currentChecks.find(c => c.name === check);
              const status = checkStatusObj ? checkStatusObj.status : 'Pending';
              const category = getCheckCategory(status);
              
              return (
                <div key={check} className={styles.checkItem}>
                  <div className={styles.checkItemName}>
                    {category === 'Clear' && <CheckCircle2 size={16} style={{ color: '#16a34a' }} />}
                    {category === 'Advisory' && <AlertTriangle size={16} style={{ color: '#f59e0b' }} />}
                    {category === 'Pending' && <Clock size={16} style={{ color: '#94a3b8' }} />}
                    <span>{check}</span>
                  </div>
                  <div className={styles.checkItemStatus}>
                    <Badge variant={category === 'Clear' ? 'success' : category === 'Advisory' ? 'warning' : 'default' as any}>
                      {status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Run Checks Completion Label */}
          {isCompleted && (() => {
            const clearCount = currentChecks.filter(c => 
              ["Clear", "Verified", "Active", "Valid", "Active company", "No sanctions found", "Excellent", "Good", "Fair"].includes(c.status)
            ).length;
            const advisoryCount = currentChecks.length - clearCount;
            return (
              <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#0369a1' }}>
                {advisoryCount === 0 
                  ? `All 8 checks passed successfully` 
                  : `${clearCount} checks passed • ${advisoryCount} advisory • Review recommended`}
              </div>
            );
          })()}
        </Card>

        {/* Section C: Risk Score Metrics & Meters */}
        {isCompleted && activeMetrics && (
          <div className={styles.riskSection}>
            <Card style={{ padding: '20px' }}>
              <h3 className={styles.cardTitle}>Risk Meter breakdown</h3>
              <div className={styles.metersGrid}>
                {metersData.map(m => (
                  <div key={m.name} className={styles.meterCard}>
                    <div className={styles.meterHeader}>
                      <span className={styles.meterName}>{m.name}</span>
                      <span className={styles.meterValue}>{m.value} / 100</span>
                    </div>
                    <div className={styles.meterTrack}>
                      <div className={styles.meterFill} style={{ width: `${m.value}%`, backgroundColor: getMeterColor(m.value) }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Composite Score & Metadata Summary */}
            <Card className={styles.compositeCard}>
              <div className={styles.compositeLeft}>
                <div className={styles.compositeCircle} style={getRiskTierColors(activeMetrics.riskLevel)}>
                  <span className={styles.compositeNum} style={{ color: getRiskTierColors(activeMetrics.riskLevel).color }}>
                    {activeMetrics.score}
                  </span>
                  <span className={styles.compositeScoreLabel}>Score</span>
                </div>
                <div className={styles.compositeText}>
                  <span className={styles.compositeTitle}>{activeMetrics.riskLevel} Risk Composite Status</span>
                  <span className={styles.compositeDesc}>
                    {activeMetrics.riskLevel === 'Low' && "Recommended for Approval • Standard Due Diligence completed"}
                    {activeMetrics.riskLevel === 'Medium' && "Requires Advisory Review • Enhanced Due Diligence suggested"}
                    {activeMetrics.riskLevel === 'High' && "Requires Executive Approval • Critical flags identified"}
                  </span>
                </div>
              </div>

              <div className={styles.metadataGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>DD Depth</span>
                  <span className={styles.metaValue}>
                    {activeMetrics.riskLevel === 'Low' ? 'Standard' : activeMetrics.riskLevel === 'Medium' ? 'Enhanced' : 'Critical'}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Re-KYC</span>
                  <span className={styles.metaValue}>
                    {activeMetrics.riskLevel === 'Low' ? 'Annual' : activeMetrics.riskLevel === 'Medium' ? 'Semi-Annual' : 'Quarterly'}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Approval Level</span>
                  <span className={styles.metaValue}>
                    {activeMetrics.riskLevel === 'Low' ? 'Procurement Manager' : activeMetrics.riskLevel === 'Medium' ? 'Procurement Head' : 'Tenant Admin / VP'}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Monitoring</span>
                  <span className={styles.metaValue} style={{ color: '#16a34a', fontWeight: '700' }}>Enabled</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Advisory Panel */}
        {isCompleted && !isAdvisoryAccepted && (
          <Card className={styles.advisoryCard}>
            <div className={styles.advisoryHeader}>
              <AlertTriangle className={styles.advisoryIcon} size={28} />
              <div className={styles.advisoryInfo}>
                <span className={styles.advisoryTitle}>Adverse Media Advisory Raised</span>
                <span className={styles.advisoryDesc}>Article from 2022 discussing a minor regulatory compliance audit reporting fine. Action required.</span>
              </div>
            </div>
            <div className={styles.advisoryActions}>
              <Button onClick={() => handleAdvisoryAction('accept')}>Accept & Note</Button>
              <Button variant="outline" onClick={() => handleAdvisoryAction('escalate')}>Escalate to Compliance</Button>
            </div>
          </Card>
        )}

        {isCompleted && isAdvisoryAccepted && (
          <div className={styles.acceptedBanner}>
            <CheckCircle2 size={16} />
            <span>Advisory accepted by {activeScreening?.advisoryAcceptedBy || 'Saurabh Anand'} at {activeScreening?.advisoryAcceptedAt}</span>
          </div>
        )}

        {/* Screening History */}
        {activeVendor.screeningHistory && activeVendor.screeningHistory.length > 0 && (
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>Screening History</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Date & Time</th>
                    <th>Performed By</th>
                    <th>Composite Score</th>
                    <th>Risk Tier</th>
                    <th>Outcome Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVendor.screeningHistory.map((run: any, idx: number) => {
                    const runClearCount = run.checks ? run.checks.filter((c: any) =>
                      ["Clear", "Verified", "Active", "Valid", "Active company", "No sanctions found", "Excellent", "Good", "Fair"].includes(c.status)
                    ).length : 0;
                    const runAdvisoryCount = run.checks ? (run.checks.length - runClearCount) : 0;
                    const runOutcome = runAdvisoryCount === 0 ? "All Clear" : `${runClearCount} Clear • ${runAdvisoryCount} Advisory`;
                    
                    return (
                      <tr key={run.screeningRunId} style={idx === 0 ? { backgroundColor: '#f0fdf4' } : undefined}>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{run.screeningRunId}</td>
                        <td>{run.runDate} {run.runTime}</td>
                        <td>{run.performedBy || 'Rahul Verma'}</td>
                        <td>
                          <span className={styles.scorePill} style={getRiskScoreStyle(run.score)}>
                            {run.score}
                          </span>
                        </td>
                        <td>
                          <Badge variant={run.riskTier === 'Low' ? 'success' : run.riskTier === 'Medium' ? 'warning' : 'danger' as any}>
                            {run.riskTier}
                          </Badge>
                        </td>
                        <td style={{ color: runAdvisoryCount > 0 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                          {runOutcome}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Page navigation transition helper */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/vendors/add?id=${selectedVendorId}&view=true`)}
          >
            View Vendor
          </Button>
          <Button 
            onClick={() => {
              toast.success("Vendor submitted for review successfully.");
            }}
            disabled={!isCompleted || activeVendor.kycStatus === 'Under Review' || activeVendor.kycStatus === 'Approved'}
          >
            {activeVendor.kycStatus === 'Under Review' || activeVendor.kycStatus === 'Approved' ? 'Sent for Review' : 'Send for Review'}
          </Button>
          {isCompleted && (isAdvisoryAccepted || activeVendor.kycStatus === 'Under Review') && (
            <Button icon={<ChevronRight size={16} />} onClick={() => navigate('/kyc/reviews')}>
              Go to Reviews & Approvals
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
