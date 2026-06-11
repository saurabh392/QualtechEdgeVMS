import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  AlertCircle,
  UploadCloud,
  FileSignature,
  Plus,
  Download,
  Eye,
  Search,
  X,
  ShieldAlert
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { getAllContracts } from '../../services/contractService';
import type { ContractRecord } from '../../services/contractService';
import styles from './ContractsDashboard.module.css';

export const ContractsDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Repository & KPI Filters States
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Core Data State
  const [allContracts, setAllContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);

  useEffect(() => {
    async function loadContracts() {
      try {
        setLoading(true);
        const data = await getAllContracts();
        setAllContracts(data);
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, []);

  const handleDownload = (row: ContractRecord) => {
    if (row.uploadedDocuments && row.uploadedDocuments.length > 0) {
      const doc = row.uploadedDocuments[0];
      const link = document.createElement('a');
      link.href = doc.filePath;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info(`No PDF linked to Contract ${row.contractId}. Upload one by editing the contract.`);
    }
  };

  const columns = [
    { header: 'Contract ID', accessor: 'contractId' as keyof ContractRecord },
    { 
      header: 'Vendor Name', 
      accessor: (row: ContractRecord) => row.vendor?.vendorName || 'N/A' 
    },
    { header: 'Type', accessor: 'contractType' as keyof ContractRecord },
    { 
      header: 'Value', 
      accessor: (row: ContractRecord) => {
        const val = row.commercialTerms?.contractValue;
        if (!val) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        return `₹${val.toLocaleString()}`;
      }
    },
    { header: 'Effective', accessor: 'effectiveDate' as keyof ContractRecord },
    { header: 'Expiry', accessor: 'expiryDate' as keyof ContractRecord },
    { 
      header: 'Risk', 
      accessor: (row: ContractRecord) => {
        const risk = row.riskInsights?.portfolioRisk || 'Low';
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (risk === 'Medium') variant = 'warning';
        if (risk === 'High') variant = 'danger';
        return <Badge variant={variant}>{risk}</Badge>;
      } 
    },
    { 
      header: 'Status', 
      accessor: (row: ContractRecord) => {
        let className = styles.statusBadge;
        const status = row.status || 'Draft';
        if (status === 'Active') className = styles.statusActive;
        if (status === 'In Review') className = styles.statusReview;
        if (status === 'Draft') className = styles.statusDraft;
        if (status === 'Expired') className = styles.statusExpired;
        return <span className={className}>{status}</span>;
      } 
    },
    { 
      header: 'Actions', 
      align: 'center' as const,
      accessor: (row: ContractRecord) => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="View Details" onClick={() => setSelectedContract(row)}><Eye size={16} /></button>
          <button className={styles.actionBtn} title="Download Document" onClick={() => handleDownload(row)}><Download size={16} /></button>
        </div>
      ) 
    },
  ];

  // Dynamic KPI Calculations
  const activeCount = allContracts.filter(c => c.status === 'Active').length;
  
  const expiringSoonCount = allContracts.filter(c => {
    if (c.status !== 'Active') return false;
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    const diffTime = exp.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  const pendingReviewCount = allContracts.filter(c => c.status === 'In Review').length;
  
  const highRiskCount = allContracts.filter(c => c.riskInsights?.portfolioRisk === 'High').length;

  // Client-Side Combined Filtering
  const filteredContracts = allContracts.filter(c => {
    // 1. Tab Status Filter
    if (activeTab !== 'All') {
      const targetStatus = activeTab === 'Under Review' ? 'In Review' : activeTab;
      if (c.status?.toLowerCase() !== targetStatus.toLowerCase()) return false;
    }
    
    // 2. Type Filter
    if (typeFilter !== 'All' && typeFilter !== 'Contract Type: All') {
      if (c.contractType?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    }
    
    // 3. Risk Filter
    if (riskFilter !== 'All' && riskFilter !== 'Risk Level: All') {
      if (c.riskInsights?.portfolioRisk?.toLowerCase() !== riskFilter.toLowerCase()) return false;
    }
    
    // 4. Search Query Filter
    if (searchVal) {
      const q = searchVal.toLowerCase();
      const matchesSearch = 
        c.contractId?.toLowerCase().includes(q) ||
        c.vendor?.vendorName?.toLowerCase().includes(q) ||
        c.contractType?.toLowerCase().includes(q) ||
        c.contractName?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.riskInsights?.portfolioRisk?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    
    // 5. KPI Filter
    if (kpiFilter === 'Total Active Contracts') {
      if (c.status !== 'Active') return false;
    } else if (kpiFilter === 'Expiring Soon (30d)') {
      if (c.status !== 'Active') return false;
      if (!c.expiryDate) return false;
      const exp = new Date(c.expiryDate);
      const diffTime = exp.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (!(diffDays > 0 && diffDays <= 30)) return false;
    } else if (kpiFilter === 'Pending Legal Reviews') {
      if (c.status !== 'In Review') return false;
    } else if (kpiFilter === 'High Risk Contracts') {
      if (c.riskInsights?.portfolioRisk !== 'High') return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Contracts Dashboard</h1>
          <p className={styles.breadcrumbs}>Home / Contracts / Dashboard</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" icon={<UploadCloud size={16} />} onClick={() => navigate('/contracts/create')}>Import Contract</Button>
          <Button icon={<Plus size={16} />} onClick={() => navigate('/contracts/create')}>Create Contract</Button>
        </div>
      </header>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        <Card 
          className={`${styles.kpiCard} ${kpiFilter === 'Total Active Contracts' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter(kpiFilter === 'Total Active Contracts' ? null : 'Total Active Contracts')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Active Contracts</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{activeCount}</div>
          <div className={styles.kpiFooter}>↑ 5.2% vs last quarter</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${kpiFilter === 'Expiring Soon (30d)' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter(kpiFilter === 'Expiring Soon (30d)' ? null : 'Expiring Soon (30d)')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Expiring Soon (30d)</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#d97706' }}>{expiringSoonCount}</div>
          <div className={styles.kpiFooter}>Requires renewal action</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${kpiFilter === 'Pending Legal Reviews' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter(kpiFilter === 'Pending Legal Reviews' ? null : 'Pending Legal Reviews')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Legal Reviews</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
              <FileSignature size={20} />
            </div>
          </div>
          <div className={styles.kpiValue}>{pendingReviewCount}</div>
          <div className={styles.kpiFooter}>Avg TAT: 3.2 Days</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${kpiFilter === 'High Risk Contracts' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter(kpiFilter === 'High Risk Contracts' ? null : 'High Risk Contracts')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>High Risk Contracts</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#b91c1c' }}>{highRiskCount}</div>
          <div className={styles.kpiFooter}>Requires mitigation action</div>
        </Card>
      </div>

      {/* Contract Repository Embedded Section */}
      <Card className={styles.tableCard}>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${activeTab === 'All' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('All'); setKpiFilter(null); }}>All Contracts</div>
          <div className={`${styles.tab} ${activeTab === 'Active' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('Active'); setKpiFilter(null); }}>Active</div>
          <div className={`${styles.tab} ${activeTab === 'Under Review' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('Under Review'); setKpiFilter(null); }}>In Review</div>
          <div className={`${styles.tab} ${activeTab === 'Draft' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('Draft'); setKpiFilter(null); }}>Drafts</div>
          <div className={`${styles.tab} ${activeTab === 'Expired' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('Expired'); setKpiFilter(null); }}>Expired</div>
        </div>

        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input 
                placeholder="Search contract ID, vendor..." 
                fullWidth={false} 
                className={styles.searchInput}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
            
            <select 
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">Contract Type: All</option>
              <option value="Master Service Agreement">Master Service Agreement</option>
              <option value="Vendor Agreement">Vendor Agreement</option>
              <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
              <option value="SaaS Agreement">SaaS Agreement</option>
              <option value="Retainer">Retainer</option>
              <option value="Facility Lease">Facility Lease</option>
              <option value="SLA Agreement">SLA Agreement</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">Risk Level: All</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {kpiFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setKpiFilter(null)}
                style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Clear KPI Filter <X size={14} />
              </Button>
            )}
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredContracts} 
          keyExtractor={(row) => row.contractId || ''} 
        />
      </Card>

      {/* Contract Detail Summary Modal */}
      {selectedContract && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <header style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Contract Summary</h3>
              <button 
                onClick={() => setSelectedContract(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </header>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract ID</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.contractId}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Status</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.status}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Vendor Name</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.vendor?.vendorName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract Type</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.contractType}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Effective Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.effectiveDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Expiry Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.expiryDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract Value</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedContract.commercialTerms?.currency} {selectedContract.commercialTerms?.contractValue?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Payment Terms</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.commercialTerms?.paymentTerms}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>SLA Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Uptime SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.uptime || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Response SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.responseTime || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Resolution SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.resolutionTime || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedContract.riskInsights && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} /> AI Risk Assessment ({selectedContract.riskInsights.portfolioRisk} Risk)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#7f1d1d', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedContract.riskInsights.aiAlerts && selectedContract.riskInsights.aiAlerts.length > 0 ? (
                      selectedContract.riskInsights.aiAlerts.map((alert, idx) => (
                        <li key={idx}>{alert}</li>
                      ))
                    ) : (
                      <li>No warnings detected by AI Engine.</li>
                    )}
                  </ul>
                </div>
              )}

              {selectedContract.uploadedDocuments && selectedContract.uploadedDocuments.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Documents</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <FileText size={16} color="#64748b" />
                      <span>{selectedContract.uploadedDocuments[0].fileName}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedContract)}>Download</Button>
                  </div>
                </div>
              )}
            </div>

            <footer style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <Button variant="ghost" onClick={() => setSelectedContract(null)}>Close</Button>
              {selectedContract.status === 'Active' && (
                <Button onClick={() => handleDownload(selectedContract)}>Download PDF Contract</Button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
