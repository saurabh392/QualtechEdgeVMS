import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock,
  Search, Download, Eye, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './KycDashboardNew.module.css';
import { useVendors } from '../../context/VendorContext';

type KycStatus = 'Pending Screening' | 'Screening Done' | 'Under Review' | 'Approved' | 'Rejected';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type FilterKey = 'All' | 'Screening Completed' | 'Pending Review' | 'Approved & Empanelled';

interface Vendor {
  vendorId: string;
  vendorName: string;
  category: string;
  riskScore: number;
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  lastVerified: string;
  nextReviewDate: string;
  status: string;
}

const kycStatusVariant = (s: KycStatus) => {
  switch (s) {
    case 'Approved':           return 'success';
    case 'Pending Screening':  return 'warning';
    case 'Screening Done':     return 'info';
    case 'Under Review':       return 'info';
    case 'Rejected':           return 'danger';
    default:                   return 'default';
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
  if (score === 0) return { backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 30) return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 60) return { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 80) return { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  return { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
};

export const KycDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [search, setSearch] = useState('');
  const { kycData, loading } = useVendors();
  const vendors = (kycData ? kycData.vendors : []) as Vendor[];

  const counts = useMemo(() => {
    return {
      All: vendors.length,
      ScreeningCompleted: vendors.filter(v => v.kycStatus !== 'Pending Screening').length,
      PendingReview: vendors.filter(v => v.kycStatus === 'Under Review' || v.kycStatus === 'Screening Done' || v.kycStatus === 'Pending Screening').length,
      Approved: vendors.filter(v => v.kycStatus === 'Approved').length,
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      // Clickable KPI filters
      if (activeFilter === 'Screening Completed') {
        if (v.kycStatus === 'Pending Screening') return false;
      } else if (activeFilter === 'Pending Review') {
        if (v.kycStatus === 'Approved' || v.kycStatus === 'Rejected') return false;
      } else if (activeFilter === 'Approved & Empanelled') {
        if (v.kycStatus !== 'Approved') return false;
      }

      // Search filter
      const q = search.toLowerCase();
      if (q) {
        return (
          v.vendorName.toLowerCase().includes(q) ||
          v.vendorId.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.kycStatus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeFilter, search, vendors]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading KYC Dashboard...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Total KYC Records', key: 'All' as FilterKey, value: counts.All, icon: <Users size={18} />, bg: '#eff6ff', color: '#1d4ed8', footer: 'All registered vendors' },
    { label: 'Screening Completed', key: 'Screening Completed' as FilterKey, value: counts.ScreeningCompleted, icon: <CheckCircle2 size={18} />, bg: '#e0f2fe', color: '#0284c7', footer: 'AML screening finished' },
    { label: 'Pending Review', key: 'Pending Review' as FilterKey, value: counts.PendingReview, icon: <Clock size={18} />, bg: '#fffbeb', color: '#f59e0b', footer: 'Awaiting checks / sign-off' },
    { label: 'Approved & Empanelled', key: 'Approved & Empanelled' as FilterKey, value: counts.Approved, icon: <ShieldCheck size={18} />, bg: '#dcfce7', color: '#16a34a', footer: 'Empanelled successfully' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>KYC Dashboard</h1>
          <p className={styles.subtitle}>Vendor due diligence status, AI screening results, and empanelment approvals</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateFilter}><span>15 Jun 2026</span></div>
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
            <div className={styles.kpiFooter}>{k.footer}</div>
          </Card>
        ))}
      </div>

      <Card className={styles.tableCard}>
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
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>KYC Status</th>
                <th>Risk Score</th>
                <th>Risk Tier</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.vendorId}>
                  <td style={{ fontWeight: '600' }}>{v.vendorId}</td>
                  <td style={{ fontWeight: '500' }}>{v.vendorName}</td>
                  <td>{v.category}</td>
                  <td>
                    <Badge variant={kycStatusVariant(v.kycStatus) as any}>{v.kycStatus}</Badge>
                  </td>
                  <td>
                    <span style={getRiskScoreStyle(v.riskScore)}>
                      {v.riskScore > 0 ? v.riskScore : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <Badge variant={riskVariant(v.riskLevel) as any}>{v.riskLevel}</Badge>
                  </td>
                  <td>{v.lastVerified}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => navigate(`/kyc/screening?vendor=${v.vendorId}`)}
                        title="View Details"
                      >
                        <Eye size={14} /> View
                      </button>
                      {v.kycStatus === 'Pending Screening' && (
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => navigate(`/kyc/screening?vendorId=${v.vendorId}`)}
                          title="Run AI Screening Checks"
                          style={{ color: '#16a34a' }}
                        >
                          <ShieldCheck size={14} /> Screen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
