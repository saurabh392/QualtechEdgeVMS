import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Shield, Search, ChevronDown } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import styles from './ScreeningRisk.module.css';
import { getScreenings } from '../../services/screeningService';

type ScreeningTab = 'All Checks' | 'Sanctions' | 'PEP' | 'Adverse Media' | 'Shell Check';

interface CheckDetail {
  result: string;
  score: number;
  lastChecked: string;
  details: string;
  findings?: number;
}

interface Screening {
  vendorId: string;
  vendorName: string;
  sanctions: CheckDetail;
  pep: CheckDetail;
  adverseMedia: CheckDetail;
  blacklist: CheckDetail;
  shellCompany: CheckDetail;
  riskScore: number;
}

const resultVariant = (result: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (result === 'Clear' || result === 'No Findings') return 'success';
  if (result.includes('Match') || result === 'Blacklisted') return 'danger';
  if (result.includes('Finding') || result.includes('Risk')) return 'warning';
  return 'default';
};

const riskScoreClass = (score: number) => {
  if (score <= 20)  return styles.scoreGreen;
  if (score <= 60)  return styles.scoreAmber;
  if (score <= 120) return styles.scoreOrange;
  return styles.scoreRed;
};

const riskScoreLabel = (score: number) => {
  if (score <= 20)  return 'Low Risk';
  if (score <= 60)  return 'Medium Risk';
  if (score <= 120) return 'High Risk';
  return 'Critical Risk';
};

export const ScreeningRisk: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ScreeningTab>('All Checks');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScreenings()
      .then(data => {
        setScreenings(data.screenings || []);
        if (data.screenings && data.screenings.length > 0) {
          setSelectedVendorId(data.screenings[0].vendorId);
        }
      })
      .catch(err => {
        console.error('Failed to load screenings data', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const screening = useMemo(
    () => screenings.find(s => s.vendorId === selectedVendorId) ?? screenings[0],
    [selectedVendorId, screenings]
  );

  const tabs: ScreeningTab[] = ['All Checks', 'Sanctions', 'PEP', 'Adverse Media', 'Shell Check'];

  type CheckRow = { checkType: string; data: CheckDetail; tab: ScreeningTab };
  const allChecks: CheckRow[] = screening ? [
    { checkType: 'Sanctions Screening', data: screening.sanctions,    tab: 'Sanctions'      },
    { checkType: 'PEP Check',           data: screening.pep,          tab: 'PEP'            },
    { checkType: 'Adverse Media',        data: screening.adverseMedia, tab: 'Adverse Media'  },
    { checkType: 'Blacklist Check',      data: screening.blacklist,    tab: 'Sanctions'      },
    { checkType: 'Shell Company Check',  data: screening.shellCompany, tab: 'Shell Check'    },
  ] : [];

  const visibleChecks = allChecks.filter(c => {
    if (activeTab === 'All Checks') return true;
    return c.tab === activeTab;
  });

  // Global search mode — show all vendors
  const searchedVendors = search.length > 0
    ? screenings.filter(s => s.vendorName.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading Screening & Risk Assessment...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>AI Screening & Risk</h1>
          <p className={styles.subtitle}>Unified sanctions, PEP, adverse media, blacklist, and shell company checks with auto-calculated risk score</p>
        </div>
      </header>

      {/* Vendor Selector */}
      <Card className={styles.selectorCard}>
        <div className={styles.selectorRow}>
          <div className={styles.selectorLeft}>
            <label className={styles.selectorLabel}>Select Vendor to Screen</label>
            <div className={styles.vendorSelectWrap}>
              <select
                className={styles.vendorSelect}
                value={selectedVendorId}
                onChange={e => setSelectedVendorId(e.target.value)}
              >
                {screenings.map(s => (
                  <option key={s.vendorId} value={s.vendorId}>
                    {s.vendorName} ({s.vendorId})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>
          </div>

          {/* Quick search across all vendors */}
          <div className={styles.selectorRight}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search vendor..."
                className={styles.searchInput}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search.length > 0 && searchedVendors.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchedVendors.map(s => (
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

      {/* Risk Score Summary */}
      {screening && (
        <div className={styles.scoreGrid}>
          <Card className={styles.scoreCard}>
            <div className={styles.scoreLabelRow}>
              <Shield size={20} className={styles.shieldIcon} />
              <span className={styles.scoreTitle}>Total Risk Score</span>
            </div>
            <div className={`${styles.scoreValue} ${riskScoreClass(screening.riskScore)}`}>
              {screening.riskScore}
            </div>
            <div className={`${styles.scoreLabel} ${riskScoreClass(screening.riskScore)}`}>
              {riskScoreLabel(screening.riskScore)}
            </div>
          </Card>

          {/* Individual scores summary */}
          {[
            { label: 'Sanctions',     score: screening.sanctions.score,    result: screening.sanctions.result    },
            { label: 'PEP',           score: screening.pep.score,          result: screening.pep.result          },
            { label: 'Adverse Media', score: screening.adverseMedia.score,  result: screening.adverseMedia.result },
            { label: 'Blacklist',     score: screening.blacklist.score,     result: screening.blacklist.result    },
            { label: 'Shell Company', score: screening.shellCompany.score,  result: screening.shellCompany.result },
          ].map(item => (
            <Card key={item.label} className={styles.miniScoreCard}>
              <span className={styles.miniLabel}>{item.label}</span>
              <div className={styles.miniResult}>
                <Badge variant={resultVariant(item.result)}>{item.result}</Badge>
              </div>
              <div className={`${styles.miniScore} ${riskScoreClass(item.score)}`}>Score: {item.score}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs + Detail Table */}
      <Card className={styles.detailCard}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Check Type</th>
                <th>Result</th>
                <th>Risk Score</th>
                <th>Last Checked</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleChecks.map(row => (
                <tr key={row.checkType}>
                  <td>
                    <div className={styles.checkTypeCell}>
                      {row.data.result === 'Clear' || row.data.result === 'No Findings'
                        ? <CheckCircle2 size={16} className={styles.iconGreen} />
                        : row.data.score > 40
                          ? <XCircle size={16} className={styles.iconRed} />
                          : <AlertTriangle size={16} className={styles.iconAmber} />
                      }
                      <span>{row.checkType}</span>
                    </div>
                  </td>
                  <td><Badge variant={resultVariant(row.data.result)}>{row.data.result}</Badge></td>
                  <td>
                    <span className={`${styles.scorePill} ${riskScoreClass(row.data.score)}`}>
                      {row.data.score}
                    </span>
                  </td>
                  <td>{row.data.lastChecked}</td>
                  <td className={styles.detailsCell}>{row.data.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
