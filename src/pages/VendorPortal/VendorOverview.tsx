import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, Bell,
  Package, FileText, ShieldAlert, MessageSquare, User,
  CheckSquare, Zap,
} from 'lucide-react';
import {
  useVendorDashboard, useVendorPOs, useVendorDocuments,
  useVendorNotifications, useAcknowledgePO, useMarkNotificationsRead,
  useVendorProfile,
} from '../../hooks/useVendorPortal';
import { VendorOnboarding } from './VendorOnboarding';
import s from './vendor.module.css';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const statusBadge = (status: string) => {
  if (['Verified', 'Delivered', 'Invoiced'].includes(status)) return <span className={s.badgeSuccess}>{status}</span>;
  if (['Expired', 'Rejected'].includes(status))                return <span className={s.badgeDanger}>{status}</span>;
  if (status === 'Acknowledged')                               return <span className={s.badgeInfo}>{status}</span>;
  return <span className={s.badgeWarning}>{status}</span>;
};

/** Pick an icon for a notification message based on keywords */
const notifIcon = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes('purchase order') || m.includes(' po'))   return <Package  size={14} />;
  if (m.includes('document') || m.includes('certificate')) return <FileText size={14} />;
  if (m.includes('kyc'))                                   return <ShieldAlert size={14} />;
  if (m.includes('invoice') || m.includes('payment'))      return <CheckSquare size={14} />;
  if (m.includes('ticket') || m.includes('support'))       return <MessageSquare size={14} />;
  if (m.includes('profile'))                               return <User size={14} />;
  return <Bell size={14} />;
};

/* ── smart alert derivation ──────────────────────────────────────────────── */
interface SmartAlert {
  id: string;
  level: 'danger' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}

function buildSmartAlerts(
  docs: { documentId: string; documentName: string; status: string; expiryDate: string | null }[],
  pos:  { poId: string; status: string }[],
  activeTickets: number,
): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  const expiredDocs  = docs.filter(d => d.status === 'Expired');
  const rejectedDocs = docs.filter(d => d.status === 'Rejected');
  const pendingPOs   = pos.filter(p =>
    p.status === 'Pending Acknowledgement' || p.status === 'Pending Acknowledgment',
  );

  if (expiredDocs.length > 0) {
    alerts.push({
      id: 'expired-docs',
      level: 'danger',
      icon: <AlertTriangle size={15} />,
      title: `${expiredDocs.length} document${expiredDocs.length > 1 ? 's' : ''} expired`,
      description: expiredDocs.map(d => d.documentName).join(', '),
      actionLabel: 'Renew Now',
      actionPath: '/vendor/documents',
    });
  }

  if (rejectedDocs.length > 0) {
    alerts.push({
      id: 'rejected-docs',
      level: 'danger',
      icon: <ShieldAlert size={15} />,
      title: `${rejectedDocs.length} document${rejectedDocs.length > 1 ? 's' : ''} rejected`,
      description: rejectedDocs.map(d => d.documentName).join(', '),
      actionLabel: 'Re-upload',
      actionPath: '/vendor/documents',
    });
  }

  if (pendingPOs.length > 0) {
    alerts.push({
      id: 'pending-pos',
      level: 'warning',
      icon: <Clock size={15} />,
      title: `${pendingPOs.length} purchase order${pendingPOs.length > 1 ? 's' : ''} awaiting acknowledgement`,
      description: pendingPOs.map(p => p.poId).join(', '),
      actionLabel: 'View POs',
      actionPath: '/vendor/purchase-orders',
    });
  }

  if (activeTickets > 0) {
    alerts.push({
      id: 'open-tickets',
      level: 'info',
      icon: <MessageSquare size={15} />,
      title: `${activeTickets} open support ticket${activeTickets > 1 ? 's' : ''}`,
      description: 'Our team is working on your requests.',
      actionLabel: 'View Tickets',
      actionPath: '/vendor/helpdesk',
    });
  }

  return alerts;
}

/* ── Alert level colours ──────────────────────────────────────────────────── */
const ALERT_STYLES: Record<SmartAlert['level'], { bg: string; border: string; iconColor: string; titleColor: string }> = {
  danger:  { bg: 'var(--color-danger-bg)',  border: 'var(--color-danger)',  iconColor: 'var(--color-danger)',       titleColor: 'var(--color-danger-text)' },
  warning: { bg: 'var(--color-warning-bg)', border: '#f59e0b',              iconColor: '#d97706',                   titleColor: 'var(--color-warning-text)' },
  info:    { bg: 'var(--color-info-bg)',    border: 'var(--color-primary)', iconColor: 'var(--color-info)',         titleColor: 'var(--color-info-text)' },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export const VendorOverview: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: profile }                      = useVendorProfile();
  const { data: stats,  isLoading: statsLoading } = useVendorDashboard();
  const { data: pos = [], isLoading: posLoading } = useVendorPOs();
  const { data: docs = [] }                    = useVendorDocuments();
  const { data: notifs = [] }                  = useVendorNotifications();

  const ackMutation  = useAcknowledgePO();
  const readMutation = useMarkNotificationsRead();

  React.useEffect(() => {
    if (profile && profile.onboardingComplete === false) setShowOnboarding(true);
  }, [profile]);

  const unreadNotifs  = notifs.filter(n => !n.read);
  const smartAlerts   = buildSmartAlerts(docs, pos, stats?.activeTickets ?? 0);
  const hasAlerts     = smartAlerts.length > 0 || notifs.length > 0;

  if (statsLoading || posLoading) {
    return (
      <div className={s.page}>
        <div className={s.kpiGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={s.kpiCard}>
              <div className={s.kpiIcon} style={{ background: 'var(--color-surface-2)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={s.skeleton} style={{ height: 10, width: '60%' }} />
                <div className={s.skeleton} style={{ height: 22, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && <VendorOnboarding onClose={() => setShowOnboarding(false)} />}

      <div className={s.page}>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className={s.kpiGrid}>
          <div className={s.kpiCard}>
            <div className={s.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={22} /></div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>Pending POs</div>
              <div className={s.kpiValue} style={{ color: '#d97706' }}>{stats?.pendingPOs ?? 0}</div>
              <div className={s.kpiSub}>Require acknowledgement</div>
            </div>
          </div>

          <div className={s.kpiCard}>
            <div className={s.kpiIcon} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}><CheckCircle size={22} /></div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>Paid Invoices</div>
              <div className={s.kpiValue} style={{ color: 'var(--color-success)' }}>{stats?.paidInvoices ?? 0}</div>
              <div className={s.kpiSub}>Cleared this cycle</div>
            </div>
          </div>

          <div className={s.kpiCard}>
            <div className={s.kpiIcon} style={{
              background: (stats?.expiredDocuments ?? 0) > 0 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
              color:      (stats?.expiredDocuments ?? 0) > 0 ? 'var(--color-danger)'    : 'var(--color-success)',
            }}><AlertTriangle size={22} /></div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>Compliance Health</div>
              <div className={s.kpiValue} style={{ color: (stats?.expiredDocuments ?? 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {stats?.expiredDocuments ?? 0} Expired
              </div>
              <div className={s.kpiSub}>Documents need renewal</div>
            </div>
          </div>

          <div className={s.kpiCard}>
            <div className={s.kpiIcon} style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}><HelpCircle size={22} /></div>
            <div className={s.kpiBody}>
              <div className={s.kpiLabel}>Open Tickets</div>
              <div className={s.kpiValue} style={{ color: 'var(--color-info)' }}>{stats?.activeTickets ?? 0}</div>
              <div className={s.kpiSub}>Awaiting response</div>
            </div>
          </div>
        </div>

        {/* ── POs + Docs ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* Recent POs */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardTitle}><Package size={16} /> Latest Purchase Orders</div>
              <button className={s.btnGhost} onClick={() => navigate('/vendor/purchase-orders')}>View All <ArrowRight size={13} /></button>
            </div>
            {pos.length === 0 ? (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}><Package size={24} /></div>
                <div className={s.emptyTitle}>No purchase orders yet</div>
                <div className={s.emptyText}>POs issued to you will appear here.</div>
              </div>
            ) : (
              <div className={s.tableWrapper}>
                <table className={s.table}>
                  <thead><tr><th>PO Ref</th><th>Date</th><th>Value</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {pos.slice(0, 4).map(po => (
                      <tr key={po.poId}>
                        <td>{po.poId}</td>
                        <td>{po.issueDate}</td>
                        <td>₹{po.value.toLocaleString('en-IN')}</td>
                        <td>{statusBadge(po.status)}</td>
                        <td>
                          {(po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment') ? (
                            <button
                              className={s.btnPrimary}
                              style={{ padding: '5px 10px', fontSize: 11 }}
                              disabled={ackMutation.isPending}
                              onClick={() => ackMutation.mutate(po.poId)}
                            >
                              Acknowledge
                            </button>
                          ) : <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Compliance doc health */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardTitle}><FileText size={16} /> Compliance Documents</div>
              <button className={s.btnGhost} onClick={() => navigate('/vendor/documents')}>Manage <ArrowRight size={13} /></button>
            </div>
            {docs.length === 0 ? (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}><FileText size={24} /></div>
                <div className={s.emptyTitle}>No documents uploaded</div>
                <div className={s.emptyText}>Upload compliance documents to get verified.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {docs.map(doc => (
                  <div key={doc.documentId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 8, background: 'var(--color-surface-2)',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{doc.documentName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                        {doc.documentType} · Expiry: {doc.expiryDate || 'N/A'}
                      </div>
                    </div>
                    {statusBadge(doc.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Notifications & Alerts panel ──────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardTitle}>
              <Bell size={16} />
              Notifications &amp; Alerts
              {(smartAlerts.length > 0 || unreadNotifs.length > 0) && (
                <span style={{
                  background: smartAlerts.some(a => a.level === 'danger') ? 'var(--color-danger)' : '#f59e0b',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 10, marginLeft: 4,
                }}>
                  {smartAlerts.length + unreadNotifs.length} new
                </span>
              )}
            </div>
            {unreadNotifs.length > 0 && (
              <button
                className={s.btnOutline}
                style={{ fontSize: 12, padding: '5px 12px' }}
                disabled={readMutation.isPending}
                onClick={() => readMutation.mutate()}
              >
                <CheckSquare size={13} /> Mark All Read
              </button>
            )}
          </div>

          {!hasAlerts ? (
            /* All clear state */
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '18px 20px', borderRadius: 10,
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--color-success)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success-text)' }}>All clear — no action needed</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Your documents, POs and tickets are all up to date.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Smart alerts */}
              {smartAlerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Action Required
                  </div>
                  {smartAlerts.map(alert => {
                    const st = ALERT_STYLES[alert.level];
                    return (
                      <div key={alert.id} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px', borderRadius: 10,
                        background: st.bg,
                        borderLeft: `4px solid ${st.border}`,
                        border: `1px solid ${st.border}`,
                      }}>
                        <div style={{ color: st.iconColor, flexShrink: 0 }}>{alert.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: st.titleColor }}>{alert.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {alert.description}
                          </div>
                        </div>
                        <button
                          className={s.btnOutline}
                          style={{ padding: '5px 12px', fontSize: 11, flexShrink: 0 }}
                          onClick={() => navigate(alert.actionPath)}
                        >
                          {alert.actionLabel} <ArrowRight size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activity feed */}
              {notifs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {smartAlerts.length > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                      Recent Activity
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
                    {[...notifs].reverse().slice(0, 10).map(n => (
                      <div key={n.notificationId} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 8,
                        background: n.read ? 'var(--color-surface-2)' : 'var(--color-info-bg)',
                        borderLeft: `3px solid ${n.read ? 'var(--color-border)' : 'var(--color-primary)'}`,
                        transition: 'background 0.2s',
                      }}>
                        <div style={{ color: n.read ? 'var(--color-text-tertiary)' : 'var(--color-primary)', flexShrink: 0 }}>
                          {notifIcon(n.message)}
                        </div>
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                          {n.message}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                          {n.createdDate}
                        </span>
                        {!n.read && (
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: 'var(--color-primary)', flexShrink: 0,
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </>
  );
};
