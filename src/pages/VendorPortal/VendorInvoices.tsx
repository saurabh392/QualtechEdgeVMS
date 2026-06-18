import React, { useState } from 'react';
import { Receipt, Plus, X, Calendar, CreditCard, FileText, Percent, Clock, CheckCircle2, XCircle, LayoutList, Search, Filter } from 'lucide-react';
import { useVendorInvoices, useVendorPOs } from '../../hooks/useVendorPortal';
import { VendorInvoiceModal } from './VendorInvoiceModal';
import s from './vendor.module.css';

type VendorInvoice = {
  invoiceId: string;
  poId: string;
  amount: number;
  gstAmount?: number;
  totalAmount?: number;
  tdsSection?: string;
  tdsRate?: number;
  tdsAmount?: number;
  netPayable?: number;
  submitDate: string;
  dueDate?: string;
  verificationStage: string;
  paymentStatus: string;
  remarks?: string;
};

const STAGE_ORDER = ['Submitted', 'Under Review', '3-Way Match', 'Finance Approval', 'Payment Processing', 'Paid'];

const stageBadge = (stage: string) => {
  if (stage === 'Paid' || stage === 'Payment Released') return <span className={s.badgeSuccess}>{stage}</span>;
  if (stage === 'Rejected') return <span className={s.badgeDanger}>{stage}</span>;
  if (stage === 'Finance Approval' || stage === 'Payment Processing') return <span className={s.badgeInfo}>{stage}</span>;
  if (stage === '3-Way Match' || stage === 'Under Review') return <span className={s.badgeInfo} style={{ background: '#ede9fe', color: '#6d28d9' }}>{stage}</span>;
  return <span className={s.badgeWarning}>{stage}</span>;
};

const paymentBadge = (status: string) => {
  if (status === 'Paid' || status === 'Completed') return <span className={s.badgeSuccess}>{status}</span>;
  if (status === 'Rejected') return <span className={s.badgeDanger}>{status}</span>;
  if (status === 'Approved') return <span className={s.badgeInfo}>{status}</span>;
  return <span className={s.badgeWarning}>{status}</span>;
};

type TabKey = 'All' | 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export const VendorInvoices: React.FC = () => {
  const { data: invoices = [], isLoading, refetch } = useVendorInvoices();
  const { data: pos = [] } = useVendorPOs();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<VendorInvoice | null>(null);
  const [stageFilter, setStageFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const acknowledgedPOs = pos.filter(p => p.status === 'Acknowledged' || p.status === 'Delivered');

  const counts: Record<TabKey, number> = {
    All:      invoices.length,
    Pending:  invoices.filter(i => ['Submitted', 'Under Review', '3-Way Match', 'Finance Approval', 'Payment Processing'].includes(i.verificationStage)).length,
    Approved: invoices.filter(i => i.paymentStatus === 'Approved').length,
    Paid:     invoices.filter(i => i.paymentStatus === 'Paid' || i.verificationStage === 'Paid').length,
    Rejected: invoices.filter(i => i.verificationStage === 'Rejected').length,
  };

  const activeFilterCount = [stageFilter !== 'All'].filter(Boolean).length;

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q || inv.invoiceId.toLowerCase().includes(q) || (inv.poId || '').toLowerCase().includes(q);
    const matchTab =
      activeTab === 'All' ? true :
      activeTab === 'Pending' ? ['Submitted', 'Under Review', '3-Way Match', 'Finance Approval', 'Payment Processing'].includes(inv.verificationStage) :
      activeTab === 'Approved' ? inv.paymentStatus === 'Approved' :
      activeTab === 'Paid' ? (inv.paymentStatus === 'Paid' || inv.verificationStage === 'Paid') :
      activeTab === 'Rejected' ? inv.verificationStage === 'Rejected' : true;
    const matchStage = stageFilter === 'All' || inv.verificationStage === stageFilter;
    return matchSearch && matchTab && matchStage;
  });

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
      {showModal && (
        <VendorInvoiceModal
          po={null}
          allPOs={acknowledgedPOs}
          onClose={() => setShowModal(false)}
          onSuccess={() => { refetch(); setShowModal(false); }}
        />
      )}

      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Invoices</div>
          <div className={s.pageSubtitle}>{invoices.length} invoices — {counts.Paid} paid, {counts.Pending} under review</div>
        </div>
        <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={15} /> Submit Invoice
        </button>
      </div>

      {/* KPI strip */}
      <div className={s.kpiGrid}>
        {([
          { label: 'Total Submitted', value: counts.All,      tab: 'All',      color: '#1d4ed8', bg: '#eff6ff', icon: <LayoutList size={16} /> },
          { label: 'Under Review',    value: counts.Pending,  tab: 'Pending',  color: '#b45309', bg: '#fef3c7', icon: <Clock size={16} /> },
          { label: 'Paid',            value: counts.Paid,     tab: 'Paid',     color: '#15803d', bg: '#dcfce7', icon: <CheckCircle2 size={16} /> },
          { label: 'Rejected',        value: counts.Rejected, tab: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={16} /> },
        ] as const).map(k => (
          <div
            key={k.label}
            className={s.kpiCard}
            style={{
              cursor: 'pointer',
              outline: activeTab === k.tab ? `2px solid ${k.color}` : '2px solid transparent',
              outlineOffset: -2,
            }}
            onClick={() => setActiveTab(k.tab as TabKey)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveTab(k.tab as TabKey)}
          >
            <div className={s.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>{k.label}</div>
              <div className={s.kpiValue} style={{ color: k.color }}>{k.value}</div>
            </div>
          </div>
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
                placeholder="Search by Invoice ID or PO reference..."
                className={s.searchInput}
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                  <label className={s.filterLabel}>Verification Stage</label>
                  <select className={s.filterSelect} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                    <option value="All">All Stages</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="3-Way Match">3-Way Match</option>
                    <option value="Finance Approval">Finance Approval</option>
                    <option value="Payment Processing">Payment Processing</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <button className={s.clearFiltersBtn} onClick={() => setStageFilter('All')}>
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}><Receipt size={28} /></div>
              <div className={s.emptyTitle}>{search ? 'No matching invoices' : 'No invoices yet'}</div>
              <div className={s.emptyText}>Submit an invoice against an acknowledged PO to start the payment process.</div>
              <button className={s.btnPrimary} style={{ marginTop: 10 }} onClick={() => setShowModal(true)}>
                <Plus size={14} /> Submit Invoice
              </button>
            </div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>PO Ref</th>
                    <th>Base Amount</th>
                    <th>Net Payable</th>
                    <th>Submit Date</th>
                    <th>Stage</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr
                      key={inv.invoiceId}
                      style={{ cursor: 'pointer', background: selected?.invoiceId === inv.invoiceId ? 'var(--color-primary-bg, #eff6ff)' : '' }}
                      onClick={() => setSelected(selected?.invoiceId === inv.invoiceId ? null : inv as VendorInvoice)}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceId}</td>
                      <td>{inv.poId || '—'}</td>
                      <td>₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>
                        {inv.netPayable ? `₹${inv.netPayable.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>{inv.submitDate}</td>
                      <td>{stageBadge(inv.verificationStage)}</td>
                      <td>{paymentBadge(inv.paymentStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={s.card} style={{ width: 300, flexShrink: 0, position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Invoice Details</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-primary)', marginBottom: 6 }}>{selected.invoiceId}</div>
            <div style={{ marginBottom: 14 }}>{stageBadge(selected.verificationStage)}</div>

            {/* Stage progress */}
            {selected.verificationStage !== 'Rejected' && (
              <div style={{ marginBottom: 16 }}>
                {STAGE_ORDER.map((stage, i) => {
                  const current = STAGE_ORDER.indexOf(selected.verificationStage);
                  const done = i < current;
                  const active = i === current;
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: done ? '#16a34a' : active ? '#1d4ed8' : 'var(--color-border)', border: active ? '2px solid #1d4ed8' : 'none' }} />
                      <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: done || active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{stage}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Financial breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <CreditCard size={13} />, label: 'PO Reference', value: selected.poId || '—' },
                { icon: <Calendar size={13} />, label: 'Submit Date', value: selected.submitDate },
                { icon: <Calendar size={13} />, label: 'Due Date', value: selected.dueDate || '—' },
                { icon: <Receipt size={13} />, label: 'Base Amount', value: `₹${selected.amount.toLocaleString('en-IN')}` },
                ...(selected.gstAmount ? [{ icon: <Percent size={13} />, label: 'GST Amount', value: `₹${selected.gstAmount.toLocaleString('en-IN')}` }] : []),
                ...(selected.tdsSection ? [{ icon: <FileText size={13} />, label: `TDS (Sec ${selected.tdsSection})`, value: `₹${(selected.tdsAmount || 0).toLocaleString('en-IN')} @ ${selected.tdsRate}%` }] : []),
                { icon: <CreditCard size={13} />, label: 'Net Payable', value: selected.netPayable ? `₹${selected.netPayable.toLocaleString('en-IN')}` : '—', bold: true },
              ].map(({ icon, label, value, bold }) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-text-tertiary)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: bold ? 700 : 600, color: bold ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{value}</div>
                  </div>
                </div>
              ))}
              {selected.remarks && (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: '8px 10px', borderRadius: 6, marginTop: 4 }}>
                  <strong>Remarks:</strong> {selected.remarks}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
