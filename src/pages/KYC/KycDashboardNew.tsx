import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, Download, Eye, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './KycDashboardNew.module.css';
import { getKycDashboard } from '../../services/kycService';

type KycStatus = 'Verified' | 'Pending' | 'In Progress' | 'High Risk' | 'Re-KYC Due';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type FilterKey = 'All' | 'Verified' | 'Pending' | 'High Risk';

interface Vendor {
  vendorId: string;
  vendorName: string;
  category: string;
  riskScore: number;
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  lastVerified: string;
  nextReviewDate: string;
}

const kycStatusVariant = (s: KycStatus) => {
  switch (s) {
    case 'Verified':    return 'success';
    case 'Pending':     return 'warning';
    case 'In Progress': return 'info';
    case 'High Risk':   return 'danger';
    case 'Re-KYC Due':  return 'danger';
    default:            return 'default';
  }
};

const riskVariant = (r: RiskLevel) => {
  switch (r) {
    case 'Low':      return 'success';
    case 'Medium':   return 'warning';
    case 'High':     return 'danger';
    case 'Critical': return 'danger';
    default:         return 'default';
  }
};

const getRiskScoreStyle = (score: number) => {
  if (score <= 30) return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 60) return { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 80) return { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  return { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
};

const getRiskBadge = (r: RiskLevel) => {
  if (r === 'Critical') {
    return (
      <Badge 
        variant="danger" 
        style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', borderColor: '#991b1b' }}
      >
        {r}
      </Badge>
    );
  }
  return <Badge variant={riskVariant(r)}>{r}</Badge>;
};

const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const KycDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const riskLevels = useMemo(() => {
    const levels = new Set<RiskLevel>();
    vendors.forEach(v => {
      if (v.riskLevel) levels.add(v.riskLevel);
    });
    return Array.from(levels);
  }, [vendors]);

  useEffect(() => {
    getKycDashboard()
      .then(data => {
        setVendors(data.vendors || []);
      })
      .catch(err => {
        console.error('Failed to load KYC dashboard data', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const counts = useMemo(() => ({
    All:           vendors.length,
    Verified:      vendors.filter(v => v.kycStatus === 'Verified').length,
    Pending:       vendors.filter(v => v.kycStatus === 'Pending').length,
    'High Risk':   vendors.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length,
  }), [vendors]);

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      if (activeFilter === 'High Risk') {
        if (v.riskLevel !== 'High' && v.riskLevel !== 'Critical') return false;
      } else if (activeFilter !== 'All' && v.kycStatus !== activeFilter) {
        return false;
      }
      if (riskFilter  !== 'All' && v.riskLevel  !== riskFilter)  return false;
      const q = search.toLowerCase();
      if (q) return v.vendorName.toLowerCase().includes(q) || v.vendorId.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
      return true;
    });
  }, [activeFilter, riskFilter, search, vendors]);

  type KpiDef = { label: string; key: FilterKey; value: number; icon: React.ReactNode; bg: string; color: string; footerClass: string; footer: string };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading KYC Dashboard...</p>
      </div>
    );
  }

  const kpis: KpiDef[] = [
    { label: 'Total Vendors',  key: 'All',          value: counts.All,          icon: <Users size={18} />,       bg: '#eff6ff', color: '#1d4ed8', footerClass: styles.kpiFooter,      footer: 'All registered vendors' },
    { label: 'Verified',       key: 'Verified',      value: counts.Verified,     icon: <CheckCircle2 size={18} />, bg: '#dcfce7', color: '#16a34a', footerClass: styles.kpiFooterGreen, footer: 'KYC fully approved' },
    { label: 'Pending',        key: 'Pending',       value: counts.Pending,      icon: <Clock size={18} />,        bg: '#fffbeb', color: '#f59e0b', footerClass: styles.kpiFooter,      footer: 'Awaiting verification' },
    { label: 'High Risk',      key: 'High Risk',     value: counts['High Risk'],  icon: <AlertTriangle size={18} />, bg: '#fee2e2', color: '#dc2626', footerClass: styles.kpiFooterRed,  footer: 'Requires escalation' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>KYC Dashboard</h1>
          <p className={styles.subtitle}>Vendor due diligence status, verification overview, and risk monitoring</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateFilter}><span>09 Jun 2026</span></div>
          <Button icon={<Download size={16} />} variant="outline">Export Report</Button>
          <Button icon={<ShieldCheck size={16} />} onClick={() => navigate('/kyc/screening')}>Run Screening</Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map(k => (
          <Card
            key={k.key}
            className={`${styles.kpiCard} ${activeFilter === k.key ? styles.kpiCardActive : ''}`}
            onClick={() => setActiveFilter(k.key)}
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className={styles.kpiValue}>{k.value}</div>
            <div className={k.footerClass}>{k.footer}</div>
          </Card>
        ))}
      </div>

      {/* Vendor List */}
      <Card className={styles.tableCard}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {(['All', 'Verified', 'Pending', 'High Risk'] as FilterKey[]).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeFilter === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab === 'All' ? 'All Vendors' : tab} <span className={styles.tabCount}>({counts[tab]})</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vendor name, ID or category..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarRight}>
            <select
              className={styles.filterSelect}
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as 'All' | RiskLevel)}
            >
              <option value="All">All Risk Levels</option>
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <Button variant="ghost" icon={<Filter size={16} />}>Filters</Button>
          </div>
        </div>

        {/* Active Filter Pill */}
        {activeFilter !== 'All' && (
          <div className={styles.filterPillRow}>
            <span className={styles.filterPill}>
              {activeFilter}
              <button className={styles.pillClear} onClick={() => setActiveFilter('All')}>×</button>
            </span>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>KYC Status</th>
                <th>Last Verified</th>
                <th>Next Review</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const days = daysUntil(v.nextReviewDate);
                return (
                  <tr key={v.vendorId}>
                    <td>
                      <div className={styles.vendorCell}>
                        <span className={styles.vendorName}>{v.vendorName}</span>
                        <span className={styles.vendorId}>{v.vendorId}</span>
                      </div>
                    </td>
                    <td>{v.category}</td>
                    <td>
                      <span style={getRiskScoreStyle(v.riskScore || 0)}>
                        {v.riskScore || 0}
                      </span>
                    </td>
                    <td>{getRiskBadge(v.riskLevel)}</td>
                    <td><Badge variant={kycStatusVariant(v.kycStatus) as any}>{v.kycStatus}</Badge></td>
                    <td>{v.lastVerified}</td>
                    <td>
                      <div className={styles.reviewCell}>
                        <span>{v.nextReviewDate}</span>
                        {days <= 30 && (
                          <span className={days < 0 ? styles.overdueTag : styles.dueTag}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.actionBtn} onClick={() => navigate(`/kyc/${v.vendorId}`)}>
                          <Eye size={14} /> View
                        </button>
                        <button className={styles.actionBtn} onClick={() => navigate('/kyc/screening')}>
                          <ShieldCheck size={14} /> Screen
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>No vendors match the selected filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing {filtered.length} of {vendors.length} vendors</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtnNext}><ChevronRight size={14} /></button>
          </div>
        </div>
      </Card>
    </div>
  );
};
