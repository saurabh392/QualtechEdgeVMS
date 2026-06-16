import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, FileText, Clock, CheckCheck, Search, Filter, Download } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from '../Invoices/InvoiceDashboard.module.css';
import pStyles from '../Payments/PaymentDashboard.module.css';

interface TDSRecord {
  tdsId: string;
  invoiceId: string;
  vendorId: string;
  vendorName: string;
  vendorPAN: string;
  section: string;
  rate: number;
  grossAmount: number;
  tdsAmount: number;
  netAmount: number;
  quarter: string;
  status: string;
  approvedBy: string | null;
  approvedDate: string | null;
}

type TabKey = 'All' | 'Pending Approval' | 'Approved';

export const TDSApprovals: React.FC = () => {
  const [records, setRecords] = useState<TDSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSection, setFilterSection] = useState('');
  const [filterQuarter, setFilterQuarter] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  const activeFilterCount = [filterSection, filterQuarter, filterAmountMin, filterAmountMax].filter(Boolean).length;
  const clearFilters = () => { setFilterSection(''); setFilterQuarter(''); setFilterAmountMin(''); setFilterAmountMax(''); };

  const sections = [...new Set(records.map(r => r.section))].sort();
  const quarters = [...new Set(records.map(r => r.quarter))].sort();

  useEffect(() => {
    axios.get('/api/tds')
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (tdsId: string) => {
    try {
      await axios.put(`/api/tds/${tdsId}/approve`, { approvedBy: 'Finance Manager' });
      toast.success(`TDS ${tdsId} approved.`);
      setRecords(prev => prev.map(r =>
        r.tdsId === tdsId
          ? { ...r, status: 'Approved', approvedBy: 'Finance Manager', approvedDate: new Date().toISOString() }
          : r
      ));
    } catch {
      toast.error('Failed to approve TDS record.');
    }
  };

  const filtered = records.filter(r => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    const q = search.toLowerCase();
    if (q && !r.vendorName.toLowerCase().includes(q) && !r.tdsId.toLowerCase().includes(q) && !r.invoiceId.toLowerCase().includes(q)) return false;
    if (filterSection && r.section !== filterSection) return false;
    if (filterQuarter && r.quarter !== filterQuarter) return false;
    if (filterAmountMin && r.tdsAmount < Number(filterAmountMin)) return false;
    if (filterAmountMax && r.tdsAmount > Number(filterAmountMax)) return false;
    return true;
  });

  const totalWithheld = records.reduce((s, r) => s + r.tdsAmount, 0);
  const totalPending = records.filter(r => r.status === 'Pending Approval').reduce((s, r) => s + r.tdsAmount, 0);
  const totalApproved = records.filter(r => r.status === 'Approved').reduce((s, r) => s + r.tdsAmount, 0);

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className={[styles.container, styles.TDSApprovalWrapper].join(' ')}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>TDS Approvals</h1>
          <p className={styles.subtitle}>Review and approve Tax Deducted at Source (TDS) deductions</p>
        </div>
      </header>

      {/* Summary Cards — click to filter */}
      <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {([
          { tab: 'All' as TabKey,              label: 'Total TDS Withheld', value: fmt(totalWithheld), icon: <FileText size={16} />,  bg: '#eff6ff', color: '#1d4ed8', sub: 'All quarters' },
          { tab: 'Pending Approval' as TabKey, label: 'Pending Approval',   value: fmt(totalPending),  icon: <Clock size={16} />,      bg: '#fef3c7', color: '#b45309', sub: 'Requires Finance sign-off' },
          { tab: 'Approved' as TabKey,         label: 'Approved',           value: fmt(totalApproved), icon: <CheckCheck size={16} />, bg: '#dcfce7', color: '#15803d', sub: 'Ready for remittance' },
        ]).map(k => (
          <Card
            key={k.label}
            className={styles.kpiCard}
            onClick={() => setActiveTab(k.tab)}
            style={{
              cursor: 'pointer',
              outline: activeTab === k.tab ? `2px solid ${k.color}` : '2px solid transparent',
              outlineOffset: -2,
            }}
          >
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className={styles.tableCard}>
        {/* Toolbar */}
        <div className={pStyles.tableToolbar}>
          <div className={pStyles.searchWrap}>
            <Search size={16} className={pStyles.searchIcon} />
            <input type="text" placeholder="Search vendor, TDS ID or invoice ref..." className={pStyles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
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
                <label className={pStyles.filterLabel}>TDS Section</label>
                <select className={pStyles.filterSelect} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Quarter</label>
                <select className={pStyles.filterSelect} value={filterQuarter} onChange={e => setFilterQuarter(e.target.value)}>
                  <option value="">All Quarters</option>
                  {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Min TDS Amount (₹)</label>
                <input type="number" className={pStyles.filterInput} placeholder="e.g. 1000" value={filterAmountMin} onChange={e => setFilterAmountMin(e.target.value)} />
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Max TDS Amount (₹)</label>
                <input type="number" className={pStyles.filterInput} placeholder="e.g. 50000" value={filterAmountMax} onChange={e => setFilterAmountMax(e.target.value)} />
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
            <table className={styles.table} style={{ width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th>TDS ID</th>
                  <th>Invoice Ref</th>
                  <th>Vendor</th>
                  <th>PAN</th>
                  <th>Section</th>
                  <th>Rate</th>
                  <th>Gross Amount</th>
                  <th>TDS Amount</th>
                  <th>Net Amount</th>
                  <th>Quarter</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                      No TDS records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.tdsId}>
                      <td style={{ fontWeight: 600 }}>{r.tdsId}</td>
                      <td>{r.invoiceId}</td>
                      <td>{r.vendorName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{r.vendorPAN}</td>
                      <td><Badge variant="info">Sec {r.section}</Badge></td>
                      <td>{r.rate}%</td>
                      <td>{fmt(r.grossAmount)}</td>
                      <td style={{ fontWeight: 600, color: '#dc2626' }}>{fmt(r.tdsAmount)}</td>
                      <td>{fmt(r.netAmount)}</td>
                      <td>{r.quarter}</td>
                      <td>
                        <Badge variant={r.status === 'Approved' ? 'success' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        {r.status === 'Pending Approval' ? (
                          <Button onClick={() => handleApprove(r.tdsId)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                            Approve
                          </Button>
                        ) : (
                          <span style={{ color: '#16a34a', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Approved
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
