import React, { useState } from 'react';
import {
  Package, Search, CheckCircle, ChevronRight, X,
  Calendar, Tag, Building2, CreditCard, Clock, FileCheck,
  ShoppingCart, Hourglass, Truck, FileText, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorPOs, useAcknowledgePO } from '../../hooks/useVendorPortal';
import s from './vendor.module.css';

const statusBadge = (status: string) => {
  if (status === 'Delivered' || status === 'Acknowledged')
    return <span className={s.badgeSuccess}>{status}</span>;
  if (status === 'Invoiced')
    return <span className={s.badgeInfo}>{status}</span>;
  if (status === 'Pending Acknowledgement' || status === 'Pending Acknowledgment')
    return <span className={s.badgeWarning}>{status}</span>;
  return <span className={s.badgeDefault}>{status}</span>;
};

export const VendorPOs: React.FC = () => {
  const { data: pos = [], isLoading, refetch } = useVendorPOs();
  const ackMutation = useAcknowledgePO();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Acknowledged' | 'Invoiced'>('All');
  const [selectedPO, setSelectedPO] = useState<(typeof pos)[0] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = {
    All:          pos.length,
    Pending:      pos.filter(p => p.status.startsWith('Pending')).length,
    Acknowledged: pos.filter(p => p.status === 'Acknowledged' || p.status === 'Delivered').length,
    Invoiced:     pos.filter(p => p.status === 'Invoiced').length,
  };

  const kpiCards: { key: typeof activeTab; label: string; icon: React.ReactNode; bg: string; color: string; sub: string }[] = [
    { key: 'All',          label: 'Total POs',          icon: <ShoppingCart size={16} />, bg: '#eff6ff', color: '#3b82f6', sub: 'All purchase orders' },
    { key: 'Pending',      label: 'Pending',            icon: <Hourglass size={16} />,    bg: '#fffbeb', color: '#f59e0b', sub: 'Awaiting acknowledgement' },
    { key: 'Acknowledged', label: 'Acknowledged',       icon: <Truck size={16} />,        bg: '#dcfce7', color: '#10b981', sub: 'Confirmed & in delivery' },
    { key: 'Invoiced',     label: 'Invoiced',           icon: <FileText size={16} />,     bg: '#f3e8ff', color: '#8b5cf6', sub: 'Invoice submitted' },
  ];

  const activeFilterCount = [categoryFilter !== 'All'].filter(Boolean).length;

  const filtered = pos.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      p.poId.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q);

    const matchesTab =
      activeTab === 'All' ? true :
      activeTab === 'Pending' ? p.status.startsWith('Pending') :
      activeTab === 'Acknowledged' ? (p.status === 'Acknowledged' || p.status === 'Delivered') :
      activeTab === 'Invoiced' ? p.status === 'Invoiced' : true;

    const matchesCategory = categoryFilter === 'All' || (p.category || '') === categoryFilter;

    return matchesSearch && matchesTab && matchesCategory;
  });

  const handleAcknowledge = (poId: string) => {
    ackMutation.mutate(poId, {
      onSuccess: () => {
        toast.success(`PO ${poId} acknowledged successfully.`);
        refetch();
        if (selectedPO?.poId === poId) {
          setSelectedPO(prev => prev ? { ...prev, status: 'Acknowledged' } : null);
        }
      },
      onError: () => toast.error('Failed to acknowledge PO.'),
    });
  };

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          {[1, 2, 3].map(i => (
            <div key={i} className={s.skeleton} style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Purchase Orders</div>
          <div className={s.pageSubtitle}>
            {pos.length} total &mdash; {pos.filter(p => p.status.startsWith('Pending')).length} pending acknowledgement
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={s.kpiGrid}>
        {kpiCards.map(k => (
          <div
            key={k.key}
            className={`${s.kpiCard} ${activeTab === k.key ? s.kpiCardActive : ''}`}
            onClick={() => setActiveTab(k.key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveTab(k.key)}
          >
            <div className={s.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>{k.label}</div>
              <div className={s.kpiValue}>{counts[k.key]}</div>
              <div className={s.kpiSub}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* PO List */}
        <div className={s.tableCard} style={{ flex: 1, minWidth: 0 }}>
          {/* Search & Filter Toolbar */}
          <div className={s.vendorToolbar}>
            <div className={s.searchWrap}>
              <Search size={14} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search PO ID, category, description..."
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
                  <label className={s.filterLabel}>Category</label>
                  <select className={s.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <button className={s.clearFiltersBtn} onClick={() => setCategoryFilter('All')}>
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}><Package size={28} /></div>
              <div className={s.emptyTitle}>{search ? 'No matching POs' : 'No purchase orders yet'}</div>
              <div className={s.emptyText}>Purchase orders issued to you will appear here.</div>
            </div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>PO Reference</th>
                    <th>Category</th>
                    <th>Issue Date</th>
                    <th>Delivery Due</th>
                    <th>Value (₹)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(po => (
                    <tr
                      key={po.poId}
                      style={{ cursor: 'pointer', background: selectedPO?.poId === po.poId ? 'var(--color-primary-bg, #eff6ff)' : '' }}
                      onClick={() => setSelectedPO(selectedPO?.poId === po.poId ? null : po)}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{po.poId}</td>
                      <td>{po.category || '—'}</td>
                      <td>{po.issueDate}</td>
                      <td style={{ color: new Date(po.deliveryDate) < new Date() && po.status.startsWith('Pending') ? '#dc2626' : '' }}>
                        {po.deliveryDate}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{po.value.toLocaleString('en-IN')}</td>
                      <td>{statusBadge(po.status)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        {(po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment') ? (
                          <button
                            className={s.btnPrimary}
                            style={{ padding: '5px 12px', fontSize: 12 }}
                            disabled={ackMutation.isPending}
                            onClick={() => handleAcknowledge(po.poId)}
                          >
                            <CheckCircle size={13} /> Acknowledge
                          </button>
                        ) : (
                          <button
                            className={s.btnGhost}
                            style={{ padding: '5px 12px', fontSize: 12 }}
                            onClick={() => setSelectedPO(selectedPO?.poId === po.poId ? null : po)}
                          >
                            <ChevronRight size={13} /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedPO && (
          <div className={s.card} style={{ width: 320, flexShrink: 0, position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>PO Details</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}
                onClick={() => setSelectedPO(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)', marginBottom: 4 }}>
              {selectedPO.poId}
            </div>
            <div style={{ marginBottom: 14 }}>{statusBadge(selectedPO.status)}</div>

            {selectedPO.description && (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 14, lineHeight: 1.5, padding: '8px 10px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
                {selectedPO.description}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <Tag size={14} />, label: 'Category', value: selectedPO.category || '—' },
                { icon: <Calendar size={14} />, label: 'Issue Date', value: selectedPO.issueDate },
                { icon: <Clock size={14} />, label: 'Delivery Due', value: selectedPO.deliveryDate },
                { icon: <CreditCard size={14} />, label: 'PO Value', value: `₹${selectedPO.value.toLocaleString('en-IN')}` },
                { icon: <FileCheck size={14} />, label: 'Line Items', value: String(selectedPO.items) },
                { icon: <Building2 size={14} />, label: 'Issued By', value: selectedPO.issuedBy || 'Axis Max Life Insurance' },
                ...(selectedPO.paymentTerms ? [{ icon: <CreditCard size={14} />, label: 'Payment Terms', value: selectedPO.paymentTerms }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-text-tertiary)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {(selectedPO.status === 'Pending Acknowledgement' || selectedPO.status === 'Pending Acknowledgment') && (
              <button
                className={s.btnPrimary}
                style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
                disabled={ackMutation.isPending}
                onClick={() => handleAcknowledge(selectedPO.poId)}
              >
                <CheckCircle size={15} />
                {ackMutation.isPending ? 'Acknowledging…' : 'Acknowledge PO'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
