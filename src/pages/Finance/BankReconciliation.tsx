import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, LayoutList, CheckCheck, Clock, AlertCircle, Search, Filter, Download } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from '../Invoices/InvoiceDashboard.module.css';
import pStyles from '../Payments/PaymentDashboard.module.css';

interface ReconRecord {
  reconId: string;
  paymentId: string;
  bankRef: string;
  vendorName: string;
  amount: number;
  bankDate: string;
  ledgerDate: string;
  difference: number;
  status: string;
  approvedBy: string | null;
  notes: string;
}

type TabKey = 'All' | 'Reconciled' | 'Pending' | 'Unreconciled';

export const BankReconciliation: React.FC = () => {
  const [records, setRecords] = useState<ReconRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  const activeFilterCount = [filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax].filter(Boolean).length;
  const clearFilters = () => { setFilterDateFrom(''); setFilterDateTo(''); setFilterAmountMin(''); setFilterAmountMax(''); };

  useEffect(() => {
    axios.get('/api/finance/bank-reconciliation')
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (reconId: string) => {
    try {
      await axios.put(`/api/finance/bank-reconciliation/${reconId}/approve`, { approvedBy: 'Finance Manager' });
      toast.success(`Reconciliation ${reconId} approved.`);
      setRecords(prev => prev.map(r =>
        r.reconId === reconId
          ? { ...r, status: 'Reconciled', approvedBy: 'Finance Manager' }
          : r
      ));
    } catch {
      toast.error('Failed to approve reconciliation record.');
    }
  };

  const filtered = records.filter(r => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    const q = search.toLowerCase();
    if (q && !r.vendorName.toLowerCase().includes(q) && !r.reconId.toLowerCase().includes(q) && !r.paymentId.toLowerCase().includes(q) && !r.bankRef.toLowerCase().includes(q)) return false;
    if (filterAmountMin && r.amount < Number(filterAmountMin)) return false;
    if (filterAmountMax && r.amount > Number(filterAmountMax)) return false;
    if (filterDateFrom && r.bankDate && r.bankDate < filterDateFrom) return false;
    if (filterDateTo   && r.bankDate && r.bankDate > filterDateTo)   return false;
    return true;
  });

  const tabCount = (tab: TabKey) => tab === 'All' ? records.length : records.filter(r => r.status === tab).length;

  const kpiCards: { tab: TabKey; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { tab: 'All',           label: 'Total Records',  icon: <LayoutList size={16} />, color: '#1d4ed8', bg: '#eff6ff' },
    { tab: 'Reconciled',    label: 'Reconciled',     icon: <CheckCheck size={16} />, color: '#15803d', bg: '#dcfce7' },
    { tab: 'Pending',       label: 'Pending',        icon: <Clock size={16} />,      color: '#b45309', bg: '#fef3c7' },
    { tab: 'Unreconciled',  label: 'Unreconciled',   icon: <AlertCircle size={16} />,color: '#dc2626', bg: '#fee2e2' },
  ];

  return (
    <div className={[styles.container, styles.bankReconciliationWrap].join(' ')}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Bank Reconciliation</h1>
          <p className={styles.subtitle}>Match bank statements against ledger entries and approve reconciled items</p>
        </div>
      </header>

      {/* KPI filter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpiCards.map(k => (
          <div
            key={k.tab}
            onClick={() => setActiveTab(k.tab)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveTab(k.tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: 'var(--color-surface)',
              border: `1.5px solid ${activeTab === k.tab ? k.color : 'var(--color-border)'}`,
              borderRadius: 10,
              boxShadow: activeTab === k.tab ? `0 0 0 3px ${k.bg}` : 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{tabCount(k.tab)}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className={styles.tableCard}>
        {/* Toolbar */}
        <div className={pStyles.tableToolbar}>
          <div className={pStyles.searchWrap}>
            <Search size={16} className={pStyles.searchIcon} />
            <input type="text" placeholder="Search vendor, recon ID, payment ID or bank ref..." className={pStyles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={pStyles.toolbarActions}>
            <Button variant={showFilters || activeFilterCount > 0 ? 'primary' : 'ghost'} icon={<Filter size={16} />} onClick={() => setShowFilters(f => !f)}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <Button variant="outline" icon={<Download size={16} />}>Export</Button>
          </div>
        </div>

        {showFilters && (
          <div className={pStyles.filterPanel}>
            <div className={pStyles.filterGrid}>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Bank Date From</label>
                <input type="date" className={pStyles.filterInput} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Bank Date To</label>
                <input type="date" className={pStyles.filterInput} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Min Amount (₹)</label>
                <input type="number" className={pStyles.filterInput} placeholder="e.g. 10000" value={filterAmountMin} onChange={e => setFilterAmountMin(e.target.value)} />
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Max Amount (₹)</label>
                <input type="number" className={pStyles.filterInput} placeholder="e.g. 500000" value={filterAmountMax} onChange={e => setFilterAmountMax(e.target.value)} />
              </div>
            </div>
            {activeFilterCount > 0 && <button className={pStyles.clearFiltersBtn} onClick={clearFilters}>Clear all filters</button>}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table} style={{width:'max-content'}}>  
              <thead>
                <tr>
                  <th>Recon ID</th>
                  <th>Payment ID</th>
                  <th>Bank Ref</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Bank Date</th>
                  <th>Ledger Date</th>
                  <th>Difference</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      No reconciliation records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.reconId}>
                      <td style={{ fontWeight: 600 }}>{r.reconId}</td>
                      <td>{r.paymentId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.bankRef}</td>
                      <td>{r.vendorName}</td>
                      <td style={{ fontWeight: 600 }}>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td>{r.bankDate || '—'}</td>
                      <td>{r.ledgerDate}</td>
                      <td style={{ color: r.difference > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        ₹{r.difference.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <Badge variant={
                          r.status === 'Reconciled' ? 'success' :
                          r.status === 'Unreconciled' ? 'danger' : 'warning'
                        }>
                          {r.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: 180 }}>
                        {r.notes}
                      </td>
                      <td>
                        {r.status !== 'Reconciled' ? (
                          <Button onClick={() => handleApprove(r.reconId)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                            Reconcile
                          </Button>
                        ) : (
                          <span style={{ color: '#16a34a', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
