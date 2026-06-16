import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './PaymentDashboard.module.css';

interface Payment {
  paymentId: string;
  vendorName: string;
  invoiceId: string;
  amount: number;
  mode: string;
  utrRef: string;
  scheduledDate: string;
  processedDate: string;
  status: string;
  vendorType: string;
  tdsDeducted: number;
}

type TabKey = 'All' | 'Completed' | 'Processing' | 'Failed' | 'MSME';

export const PaymentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState('');
  const [filterVendorType, setFilterVendorType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  const activeFilterCount = [filterMode, filterVendorType, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax].filter(Boolean).length;

  const clearFilters = () => {
    setFilterMode(''); setFilterVendorType('');
    setFilterDateFrom(''); setFilterDateTo('');
    setFilterAmountMin(''); setFilterAmountMax('');
  };

  useEffect(() => {
    axios.get('/api/payments')
      .then(r => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabCounts: Record<TabKey, number> = {
    All:        payments.length,
    Completed:  payments.filter(p => p.status === 'Completed').length,
    Processing: payments.filter(p => p.status === 'Processing').length,
    Failed:     payments.filter(p => p.status === 'Failed').length,
    MSME:       payments.filter(p => p.vendorType === 'MSME').length,
  };

  const filteredPayments = payments.filter(p => {
    if (activeTab === 'Completed'  && p.status !== 'Completed')  return false;
    if (activeTab === 'Processing' && p.status !== 'Processing') return false;
    if (activeTab === 'Failed'     && p.status !== 'Failed')     return false;
    if (activeTab === 'MSME'       && p.vendorType !== 'MSME')   return false;
    const q = search.toLowerCase();
    if (q && !p.vendorName.toLowerCase().includes(q) && !p.paymentId.toLowerCase().includes(q) && !p.invoiceId.toLowerCase().includes(q)) return false;
    if (filterMode && p.mode !== filterMode) return false;
    if (filterVendorType && p.vendorType !== filterVendorType) return false;
    if (filterAmountMin && p.amount < Number(filterAmountMin)) return false;
    if (filterAmountMax && p.amount > Number(filterAmountMax)) return false;
    if (filterDateFrom && p.scheduledDate < filterDateFrom) return false;
    if (filterDateTo   && p.scheduledDate > filterDateTo)   return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Treasury & Payments</h1>
          <p className={styles.subtitle}>Automate payment execution, treasury scheduling, and bank reconciliation</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateFilter}>
            <span>12 May 2026 - 18 May 2026</span>
          </div>
          <Button icon={<CreditCard size={16} />} onClick={() => navigate('/payments/processing')}>Release Payouts</Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {([
          { tab: 'All',        label: 'Total Payments',  icon: <CreditCard size={16} />,    bg: '#eff6ff', color: '#1d4ed8', sub: '+12.4% vs last month' },
          { tab: 'Completed',  label: 'Completed',       icon: <CheckCircle2 size={16} />,  bg: '#dcfce7', color: '#16a34a', sub: 'Successfully settled' },
          { tab: 'Processing', label: 'Processing',      icon: <AlertTriangle size={16} />, bg: '#fffbeb', color: '#f59e0b', sub: 'Awaiting bank confirmation' },
          { tab: 'Failed',     label: 'Failed',          icon: <XCircle size={16} />,       bg: '#fee2e2', color: '#dc2626', sub: 'Beneficiary account issues' },
          { tab: 'MSME',       label: 'MSME Payments',   icon: <Users size={16} />,         bg: '#f3e8ff', color: '#7c3aed', sub: 'Statutory 45-day tracking' },
        ] as const).map(k => (
          <Card key={k.tab} className={`${styles.kpiCard} ${activeTab === k.tab ? styles.kpiCardActive : ''}`} onClick={() => setActiveTab(k.tab)}>
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{tabCounts[k.tab].toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment List Card */}
      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vendor name, payment ID or invoice ref..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarActions}>
            <Button
              variant={showFilters || activeFilterCount > 0 ? 'primary' : 'ghost'}
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(f => !f)}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <Button variant="outline" icon={<Download size={16} />}>Export</Button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Payment Mode</label>
                <select className={styles.filterSelect} value={filterMode} onChange={e => setFilterMode(e.target.value)}>
                  <option value="">All Modes</option>
                  {['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Vendor Type</label>
                <select className={styles.filterSelect} value={filterVendorType} onChange={e => setFilterVendorType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="MSME">MSME</option>
                  <option value="Non-MSME">Non-MSME</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Scheduled From</label>
                <input type="date" className={styles.filterInput} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Scheduled To</label>
                <input type="date" className={styles.filterInput} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Min Amount (₹)</label>
                <input type="number" className={styles.filterInput} placeholder="e.g. 10000" value={filterAmountMin} onChange={e => setFilterAmountMin(e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Max Amount (₹)</label>
                <input type="number" className={styles.filterInput} placeholder="e.g. 500000" value={filterAmountMax} onChange={e => setFilterAmountMax(e.target.value)} />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear all filters</button>
            )}
          </div>
        )}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <table className={styles.table} style={{ width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Vendor Name</th>
                  <th>Invoice Ref</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>UTR Reference</th>
                  <th>Scheduled Date</th>
                  <th>Processed Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.paymentId}>
                    <td className={styles.paymentId}>{p.paymentId}</td>
                    <td>
                      <div className={styles.vendorNameCell}>
                        <span className={styles.vendorName}>{p.vendorName}</span>
                        {p.vendorType === 'MSME' && <span className={styles.msmeTag}>MSME</span>}
                      </div>
                    </td>
                    <td>{p.invoiceId}</td>
                    <td className={styles.amountCell}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td>{p.mode}</td>
                    <td className={styles.utrCell}>{p.utrRef}</td>
                    <td>{p.scheduledDate}</td>
                    <td>{p.processedDate}</td>
                    <td>
                      <Badge
                        variant={
                          p.status === 'Completed' ? 'success' :
                          p.status === 'Processing' ? 'warning' : 'danger'
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {p.status === 'Completed'  && <button className={styles.actionBtn}><Download size={14} /> Advice</button>}
                        {p.status === 'Failed'     && <button className={styles.actionBtn} style={{ color: '#dc2626' }}>Retry Payout</button>}
                        {p.status === 'Processing' && <button className={styles.actionBtn}>Track Node</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '32px' }}>
                      No payments match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filteredPayments.length} of {filteredPayments.length} entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtnNext}>&gt;</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
