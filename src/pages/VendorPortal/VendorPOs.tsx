import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { useVendorPOs } from '../../hooks/useVendorPortal';
import s from './vendor.module.css';

const statusBadge = (status: string) => {
  if (status === 'Delivered' || status === 'Acknowledged') return <span className={s.badgeSuccess}>{status}</span>;
  if (status === 'Invoiced') return <span className={s.badgeInfo}>{status}</span>;
  return <span className={s.badgeWarning}>{status}</span>;
};

export const VendorPOs: React.FC = () => {
  const { data: pos = [], isLoading } = useVendorPOs();
  const [search, setSearch] = useState('');

  const filtered = pos.filter(p =>
    p.poId.toLowerCase().includes(search.toLowerCase()) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className={s.pageTitle}>Purchase Orders</div>
          <div className={s.pageSubtitle}>
            {pos.length} total — {pos.filter(p => p.status.startsWith('Pending')).length} pending acknowledgement
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          <input className={s.input} style={{ paddingLeft: 30, width: 220 }} placeholder="Search POs…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={s.card}>
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
                <tr><th>PO Reference</th><th>Issue Date</th><th>Line Items</th><th>Value (₹)</th><th>Status</th>
                {/* <th>Action</th> */}
              </tr>
              </thead>
              <tbody>
                {filtered.map(po => (
                  <tr key={po.poId}>
                    <td>{po.poId}</td>
                    <td>{po.issueDate}</td>
                    <td>{po.items}</td>
                    <td>₹{po.value.toLocaleString('en-IN')}</td>
                    <td>{statusBadge(po.status)}</td>
                    {/* <td>
                      {(po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment') ? (
                        <button className={s.btnPrimary} style={{ padding: '5px 12px', fontSize: 12 }}
                          disabled={ackMutation.isPending}
                          onClick={() => ackMutation.mutate(po.poId)}>
                          <CheckCircle size={13} /> Acknowledge
                        </button>
                      ) : <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>—</span>}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
