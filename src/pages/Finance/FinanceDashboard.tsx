import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, AlertCircle, Scale, Users, TrendingUp, Loader2, CheckCircle2, Search, Filter, X } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from '../Invoices/InvoiceDashboard.module.css';

interface DashboardStats {
  pendingInvoices: number;
  pendingTDS: number;
  unreconciledItems: number;
  msmePayables: number;
  cashFlowThisMonth: number;
  totalPayables: number;
}

interface AgingRecord {
  vendorId: string;
  vendorName: string;
  vendorType: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
  oldestDue: string;
}

interface TDSRecord {
  tdsId: string;
  invoiceId: string;
  vendorName: string;
  section: string;
  grossAmount: number;
  tdsAmount: number;
  quarter: string;
  status: string;
}

interface ReconRecord {
  reconId: string;
  paymentId: string;
  vendorName: string;
  amount: number;
  bankDate: string;
  ledgerDate: string;
  difference: number;
  status: string;
  notes: string;
}

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aging, setAging] = useState<AgingRecord[]>([]);
  const [tds, setTds] = useState<TDSRecord[]>([]);
  const [recon, setRecon] = useState<ReconRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [agingSearch, setAgingSearch] = useState('');
  const [agingTypeFilter, setAgingTypeFilter] = useState('All');
  const [agingFiltersOpen, setAgingFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/finance/dashboard'),
      axios.get('/api/finance/aging-report'),
      axios.get('/api/tds?status=Pending Approval'),
      axios.get('/api/finance/bank-reconciliation'),
    ]).then(([statsRes, agingRes, tdsRes, reconRes]) => {
      setStats(statsRes.data);
      setAging(agingRes.data);
      setTds(tdsRes.data.slice(0, 3));
      setRecon(reconRes.data.filter((r: ReconRecord) => r.status !== 'Reconciled').slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApproveTDS = async (tdsId: string) => {
    try {
      await axios.put(`/api/tds/${tdsId}/approve`, { approvedBy: 'Finance Manager' });
      toast.success(`TDS ${tdsId} approved.`);
      setTds(prev => prev.filter(t => t.tdsId !== tdsId));
    } catch {
      toast.error('Failed to approve TDS.');
    }
  };

  const handleApproveRecon = async (reconId: string) => {
    try {
      await axios.put(`/api/finance/bank-reconciliation/${reconId}/approve`, { approvedBy: 'Finance Manager' });
      toast.success(`Reconciliation ${reconId} approved.`);
      setRecon(prev => prev.filter(r => r.reconId !== reconId));
    } catch {
      toast.error('Failed to approve reconciliation.');
    }
  };

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  const agingFilterCount = [agingTypeFilter !== 'All'].filter(Boolean).length;
  const filteredAging = aging.filter(a => {
    const matchSearch = !agingSearch || a.vendorName.toLowerCase().includes(agingSearch.toLowerCase());
    const matchType = agingTypeFilter === 'All' || a.vendorType === agingTypeFilter;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Finance Manager Dashboard</h1>
          <p className={styles.subtitle}>Accounts Payable, TDS, Reconciliation &amp; Cash Flow</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {([
          { label: 'Pending Invoice Approvals', icon: <FileText size={16} />,   bg: '#eff6ff', color: '#1d4ed8', value: stats?.pendingInvoices ?? 0,                   sub: 'Awaiting Finance Approval',  onClick: () => navigate('/invoices/approvals') },
          { label: 'Pending TDS Approvals',     icon: <Scale size={16} />,      bg: '#f3e8ff', color: '#7c3aed', value: stats?.pendingTDS ?? 0,                         sub: 'Requires Finance sign-off',  onClick: () => navigate('/finance/tds') },
          { label: 'Unreconciled Items',        icon: <AlertCircle size={16} />,bg: '#fee2e2', color: '#dc2626', value: stats?.unreconciledItems ?? 0,                   sub: 'Pending bank matching',      onClick: () => navigate('/finance/reconciliation') },
          { label: 'MSME Payables',             icon: <Users size={16} />,      bg: '#fffbeb', color: '#f59e0b', value: fmt(stats?.msmePayables ?? 0),                  sub: '45-day statutory deadline',  onClick: undefined },
          { label: 'Cash Flow This Month',      icon: <TrendingUp size={16} />, bg: '#dcfce7', color: '#16a34a', value: fmt(stats?.cashFlowThisMonth ?? 0),             sub: 'Total paid invoices',        onClick: undefined },
        ]).map(k => (
          <Card key={k.label} className={styles.kpiCard} onClick={k.onClick} style={{ cursor: k.onClick ? 'pointer' : 'default' }}>
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Aging + TDS */}
      <div className={styles.financeCardDashboard}>
        {/* Aging Report */}
        <Card className={styles.tableCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Vendor Aging Report</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className={styles.searchWrap} style={{ minWidth: 200 }}>
                <Search size={13} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search vendor..."
                  className={styles.searchInput}
                  value={agingSearch}
                  onChange={e => setAgingSearch(e.target.value)}
                />
              </div>
              <button className={styles.filterBtn} onClick={() => setAgingFiltersOpen(v => !v)}>
                <Filter size={13} /> Filters
                {agingFilterCount > 0 && <span className={styles.filterBadge}>{agingFilterCount}</span>}
              </button>
              <Button variant="outline" size="sm" onClick={() => navigate('/finance/reconciliation')}>View Full</Button>
            </div>
          </div>
          {agingFiltersOpen && (
            <div className={styles.filterPanel}>
              <div className={styles.filterPanelRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Vendor Type</label>
                  <select className={styles.filterSelect} value={agingTypeFilter} onChange={e => setAgingTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="MSME">MSME</option>
                    <option value="Non-MSME">Non-MSME</option>
                  </select>
                </div>
                {agingFilterCount > 0 && (
                  <button className={styles.clearFiltersBtn} onClick={() => setAgingTypeFilter('All')}>
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Current</th>
                  <th>1–30 Days</th>
                  <th>31–60 Days</th>
                  <th>61–90 Days</th>
                  <th style={{ color: '#dc2626' }}>90+ Days</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredAging.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>No matching vendors.</td></tr>
                ) : filteredAging.map(a => (
                  <tr key={a.vendorId}>
                    <td style={{ fontWeight: 600 }}>{a.vendorName}</td>
                    <td>
                      <Badge variant={a.vendorType === 'MSME' ? 'warning' : 'info'}>{a.vendorType}</Badge>
                    </td>
                    <td>{fmt(a.current)}</td>
                    <td>{fmt(a.days1to30)}</td>
                    <td>{fmt(a.days31to60)}</td>
                    <td>{fmt(a.days61to90)}</td>
                    <td style={{ color: a.over90 > 0 ? '#dc2626' : 'inherit', fontWeight: a.over90 > 0 ? 700 : 400 }}>
                      {fmt(a.over90)}
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmt(a.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* TDS Pending */}
        <Card className={styles.tableCard}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>TDS Pending Approvals</h3>
            <Button variant="ghost" onClick={() => navigate('/finance/tds')}>View All</Button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {tds.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={32} color="#16a34a" style={{ marginBottom: 8 }} />
                <p>All TDS records approved</p>
              </div>
            ) : (
              tds.map(t => (
                <div key={t.tdsId} style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.tdsId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t.vendorName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        Sec {t.section} • {t.quarter} • TDS: ₹{t.tdsAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <Button onClick={() => handleApproveTDS(t.tdsId)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bank Reconciliation */}
      <div className={styles.financeBankReconciliationWrap}>
        <Card className={styles.tableCard} style={{ marginTop: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Bank Reconciliation — Pending Items</h3>
            <Button variant="outline" onClick={() => navigate('/finance/reconciliation')}>View All</Button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Recon ID</th>
                  <th>Payment ID</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Bank Date</th>
                  <th>Ledger Date</th>
                  <th>Difference</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recon.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                      No pending reconciliation items.
                    </td>
                  </tr>
                ) : (
                  recon.map(r => (
                    <tr key={r.reconId}>
                      <td style={{ fontWeight: 600 }}>{r.reconId}</td>
                      <td>{r.paymentId}</td>
                      <td>{r.vendorName}</td>
                      <td>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td>{r.bankDate || '—'}</td>
                      <td>{r.ledgerDate}</td>
                      <td style={{ color: r.difference > 0 ? '#dc2626' : '#16a34a' }}>
                        ₹{r.difference.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <Badge variant={r.status === 'Unreconciled' ? 'danger' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        <Button onClick={() => handleApproveRecon(r.reconId)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          Reconcile
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
