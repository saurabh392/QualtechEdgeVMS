import React, { useState } from 'react';
import { CreditCard, TrendingUp, Clock, XCircle, CheckCircle2, X, Calendar, Hash, Banknote, Percent, Search, Filter } from 'lucide-react';
import { useVendorPayments } from '../../hooks/useVendorPortal';
import s from './vendor.module.css';

type TabKey = 'All' | 'Completed' | 'Processing' | 'Failed';

export const VendorPayments: React.FC = () => {
  const { data: payments = [], isLoading } = useVendorPayments();
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [selected, setSelected] = useState<(typeof payments)[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const totalPaid    = payments.filter(p => p.status === 'Completed' || p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalTDS     = payments.filter(p => p.tdsDeducted).reduce((sum, p) => sum + (p.tdsDeducted || 0), 0);
  const processingAmt = payments.filter(p => p.status === 'Processing').reduce((sum, p) => sum + p.amount, 0);

  const counts: Record<TabKey, number> = {
    All:        payments.length,
    Completed:  payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length,
    Processing: payments.filter(p => p.status === 'Processing').length,
    Failed:     payments.filter(p => p.status === 'Failed').length,
  };

  const activeFilterCount = [modeFilter !== 'All'].filter(Boolean).length;

  const filtered = payments.filter(p => {
    if (activeTab === 'Completed' && !(p.status === 'Completed' || p.status === 'Paid')) return false;
    if (activeTab === 'Processing' && p.status !== 'Processing') return false;
    if (activeTab === 'Failed' && p.status !== 'Failed') return false;
    if (modeFilter !== 'All' && p.mode !== modeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.paymentId.toLowerCase().includes(q) ||
        p.invoiceId.toLowerCase().includes(q) ||
        (p.utrRef || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusBadge = (status: string) => {
    if (status === 'Completed' || status === 'Paid')
      return <span className={s.badgeSuccess}><CheckCircle2 size={11} /> {status}</span>;
    if (status === 'Failed')
      return <span className={s.badgeDanger}><XCircle size={11} /> {status}</span>;
    return <span className={s.badgeWarning}><Clock size={11} /> {status}</span>;
  };

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          {[1, 2, 3].map(i => <div key={i} className={s.skeleton} style={{ height: 44, marginBottom: 8, borderRadius: 8 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Payment History</div>
          <div className={s.pageSubtitle}>{payments.length} payments — ₹{totalPaid.toLocaleString('en-IN')} total received</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-success)', fontWeight: 600 }}>
          <TrendingUp size={16} /> ₹{totalPaid.toLocaleString('en-IN')} received
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {([
          { label: 'Total Received', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: <CheckCircle2 size={16} />, color: '#15803d', bg: '#dcfce7' },
          { label: 'TDS Deducted', value: `₹${totalTDS.toLocaleString('en-IN')}`, icon: <Percent size={16} />, color: '#7c3aed', bg: '#f3e8ff' },
          { label: 'Processing', value: `₹${processingAmt.toLocaleString('en-IN')}`, icon: <Clock size={16} />, color: '#b45309', bg: '#fef3c7' },
          { label: 'Failed', value: counts.Failed, icon: <XCircle size={16} />, color: '#dc2626', bg: '#fee2e2' },
        ] as const).map(k => (
          <div key={k.label} className={s.card} style={{ padding: '12px 16px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{k.label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{typeof k.value === 'number' ? k.value : k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={s.tabsRow}>
        {(['All', 'Completed', 'Processing', 'Failed'] as TabKey[]).map(t => (
          <button key={t} className={`${s.tabBtn} ${activeTab === t ? s.tabBtnActive : ''}`} onClick={() => setActiveTab(t)}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className={s.tableCard} style={{ flex: 1, minWidth: 0 }}>
          {/* Search & Filter Toolbar */}
          <div className={s.vendorToolbar}>
            <div className={s.searchWrap}>
              <Search size={14} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search by Payment ID, Invoice, UTR..."
                className={s.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={s.filterBtn} onClick={() => setFiltersOpen(v => !v)}>
              <Filter size={14} /> Filters
              {activeFilterCount > 0 && <span className={s.filterBadge}>{activeFilterCount}</span>}
            </button>
          </div>

          {filtersOpen && (
            <div className={s.filterPanel}>
              <div className={s.filterPanelRow}>
                <div className={s.filterGroup}>
                  <label className={s.filterLabel}>Payment Mode</label>
                  <select className={s.filterSelect} value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                    <option value="All">All Modes</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="IMPS">IMPS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <button className={s.clearFiltersBtn} onClick={() => setModeFilter('All')}>
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}><CreditCard size={28} /></div>
              <div className={s.emptyTitle}>No payments {activeTab !== 'All' ? `with status "${activeTab}"` : 'yet'}</div>
              <div className={s.emptyText}>Cleared payments will appear here once your invoices are processed.</div>
            </div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Invoice Ref</th>
                    <th>Amount (₹)</th>
                    <th>Mode</th>
                    <th>UTR Reference</th>
                    <th>Payment Date</th>
                    <th>TDS</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr
                      key={p.paymentId}
                      style={{ cursor: 'pointer', background: selected?.paymentId === p.paymentId ? 'var(--color-primary-bg, #eff6ff)' : '' }}
                      onClick={() => setSelected(selected?.paymentId === p.paymentId ? null : p)}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.paymentId}</td>
                      <td>{p.invoiceId}</td>
                      <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td>{p.mode || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.utrRef || '—'}</td>
                      <td>{p.paymentDate || p.scheduledDate || '—'}</td>
                      <td>{p.tdsDeducted ? `₹${p.tdsDeducted.toLocaleString('en-IN')}` : '—'}</td>
                      <td>{statusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={s.card} style={{ width: 280, flexShrink: 0, position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Payment Details</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)', marginBottom: 8 }}>{selected.paymentId}</div>
            <div style={{ marginBottom: 14 }}>{statusBadge(selected.status)}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <Hash size={13} />, label: 'Invoice Ref', value: selected.invoiceId },
                { icon: <Banknote size={13} />, label: 'Amount', value: `₹${selected.amount.toLocaleString('en-IN')}`, bold: true },
                { icon: <CreditCard size={13} />, label: 'Payment Mode', value: selected.mode || '—' },
                { icon: <Hash size={13} />, label: 'UTR Reference', value: selected.utrRef || 'Awaiting' },
                ...(selected.bankAccount ? [{ icon: <Banknote size={13} />, label: 'Bank Account', value: selected.bankAccount }] : []),
                { icon: <Calendar size={13} />, label: 'Scheduled Date', value: selected.scheduledDate || '—' },
                { icon: <Calendar size={13} />, label: 'Payment Date', value: selected.paymentDate || 'Pending' },
                ...(selected.tdsDeducted ? [{ icon: <Percent size={13} />, label: 'TDS Deducted', value: `₹${selected.tdsDeducted.toLocaleString('en-IN')}` }] : []),
              ].map(({ icon, label, value, bold }) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-text-tertiary)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: bold ? 700 : 600, color: bold ? 'var(--color-primary)' : 'var(--color-text-primary)', fontFamily: label === 'UTR Reference' ? 'monospace' : '' }}>{value}</div>
                  </div>
                </div>
              ))}
              {selected.remarks && (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: '8px 10px', borderRadius: 6, marginTop: 4 }}>
                  {selected.remarks}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
