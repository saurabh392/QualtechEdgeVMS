import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, Bell,
  Package, FileText, ShieldAlert, MessageSquare, User,
  CheckSquare, Zap, ShieldCheck, ChevronRight,
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

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  sub: string;
  onClick?: () => void;
  badge?: { count: number; color: string; label: string };
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, sub, onClick, badge }) => (
  <div
    className={s.kpiCard}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e => e.key === 'Enter' && onClick()) : undefined}
    style={{ cursor: onClick ? 'pointer' : 'default', position: 'relative', transition: 'box-shadow 0.18s, transform 0.18s' }}
    onMouseEnter={onClick ? (e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }) : undefined}
    onMouseLeave={onClick ? (e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '';
      (e.currentTarget as HTMLElement).style.transform = '';
    }) : undefined}
  >
    <div className={s.kpiIcon} style={{ background: iconBg, color: iconColor }}>{icon}</div>
    <div className={s.kpiBody}>
      <div className={s.kpiLabel}>{label}</div>
      <div className={s.kpiValue} style={{ color: iconColor }}>{value}</div>
      <div className={s.kpiSub}>{sub}</div>
      {badge && badge.count > 0 && (
        <span style={{
          display: 'inline-block', marginTop: 6,
          background: badge.color, color: '#fff',
          fontSize: 10, fontWeight: 700, borderRadius: 99,
          padding: '2px 8px',
        }}>{badge.count} {badge.label}</span>
      )}
    </div>
    <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, alignSelf: 'center' }} />
  </div>
);

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

const ALERT_STYLES: Record<SmartAlert['level'], { bg: string; border: string; iconColor: string; titleColor: string }> = {
  danger:  { bg: 'var(--color-danger-bg)',  border: 'var(--color-danger)',  iconColor: 'var(--color-danger)',  titleColor: 'var(--color-danger-text)' },
  warning: { bg: 'var(--color-warning-bg)', border: '#f59e0b',              iconColor: '#d97706',              titleColor: 'var(--color-warning-text)' },
  info:    { bg: 'var(--color-info-bg)',    border: 'var(--color-primary)', iconColor: 'var(--color-info)',    titleColor: 'var(--color-info-text)' },
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

  // Derived doc stats
  const verifiedDocs  = docs.filter(d => d.status === 'Verified').length;
  const pendingDocs   = docs.filter(d => d.status === 'Pending').length;
  const expiredDocs   = docs.filter(d => d.status === 'Expired').length;
  const rejectedDocs  = docs.filter(d => d.status === 'Rejected').length;
  const totalDocs     = docs.length;

  // Compliance health score
  const complianceIssues = expiredDocs + rejectedDocs;
  const complianceHealthy = complianceIssues === 0;

  // Pending POs
  const pendingPOsList = pos.filter(p => p.status === 'Pending Acknowledgement' || p.status === 'Pending Acknowledgment');

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

          {/* Pending POs */}
          <KpiCard
            icon={<Clock size={22} />}
            iconBg="#fef3c7"
            iconColor="#d97706"
            label="Pending POs"
            value={pendingPOsList.length}
            sub={pendingPOsList.length === 0 ? 'All acknowledged' : 'Require acknowledgement'}
            onClick={() => navigate('/vendor/purchase-orders')}
            badge={pendingPOsList.length > 0 ? { count: pendingPOsList.length, color: '#d97706', label: 'action needed' } : undefined}
          />

          {/* Paid Invoices → Invoices page */}
          <KpiCard
            icon={<CheckCircle size={22} />}
            iconBg="var(--color-success-bg)"
            iconColor="var(--color-success)"
            label="Paid Invoices"
            value={stats?.paidInvoices ?? 0}
            sub="Cleared this cycle"
            onClick={() => navigate('/vendor/invoices')}
          />

          {/* Compliance Health */}
          <KpiCard
            icon={<ShieldCheck size={22} />}
            iconBg={complianceHealthy ? 'var(--color-success-bg)' : 'var(--color-danger-bg)'}
            iconColor={complianceHealthy ? 'var(--color-success)' : 'var(--color-danger)'}
            label="Compliance Health"
            value={complianceHealthy ? 'All Good' : `${complianceIssues} Issue${complianceIssues > 1 ? 's' : ''}`}
            sub={complianceHealthy ? 'All documents valid' : `${expiredDocs} expired · ${rejectedDocs} rejected`}
            badge={complianceIssues > 0 ? { count: complianceIssues, color: 'var(--color-danger)', label: 'need attention' } : undefined}
          />

          {/* Compliance Documents */}
          <KpiCard
            icon={<FileText size={22} />}
            iconBg="var(--color-info-bg)"
            iconColor="var(--color-info)"
            label="Compliance Documents"
            value={totalDocs}
            sub={`${verifiedDocs} verified · ${pendingDocs} pending`}
            badge={pendingDocs > 0 ? { count: pendingDocs, color: '#d97706', label: 'under review' } : undefined}
          />

        </div>

        {/* ── Quick Actions strip ────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          {[
            { label: 'My Documents',      path: '/vendor/documents',       icon: <FileText size={13} />,    color: 'var(--color-primary)' },
            { label: 'Purchase Orders',   path: '/vendor/purchase-orders', icon: <Package size={13} />,     color: '#d97706' },
            { label: 'My Invoices',       path: '/vendor/invoices',        icon: <CheckSquare size={13} />, color: 'var(--color-success)' },
            { label: 'KYC Status',        path: '/vendor/kyc',             icon: <ShieldCheck size={13} />, color: 'var(--color-info)' },
            { label: 'Contracts & SLAs',  path: '/vendor/contracts',       icon: <ShieldAlert size={13} />, color: '#7c3aed' },
            { label: 'Support Tickets',   path: '/vendor/helpdesk',        icon: <HelpCircle size={13} />,  color: '#64748b' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', border: '1px solid var(--color-border)',
                borderRadius: 99, background: 'var(--color-surface)',
                fontSize: 12, fontWeight: 600, color: item.color,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface)')}
            >
              {item.icon} {item.label}
            </button>
          ))}
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
                    {pos.slice(0, 5).map(po => (
                      <tr key={po.poId}>
                        <td style={{ fontWeight: 600, fontSize: 12 }}>{po.poId}</td>
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
                          ) : (
                            <button className={s.btnGhost} style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => navigate('/vendor/purchase-orders')}>
                              Details <ArrowRight size={10} />
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

          {/* Compliance Documents */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardTitle}><FileText size={16} /> Compliance Documents</div>
              <button className={s.btnGhost} onClick={() => navigate('/vendor/documents')}>Manage <ArrowRight size={13} /></button>
            </div>

            {/* Mini stats bar */}
            {docs.length > 0 && (
              <div style={{
                display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap',
              }}>
                {[
                  { label: 'Verified',  count: verifiedDocs,  color: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
                  { label: 'Pending',   count: pendingDocs,   color: '#d97706',               bg: '#fef3c7' },
                  { label: 'Expired',   count: expiredDocs,   color: 'var(--color-danger)',   bg: 'var(--color-danger-bg)' },
                  { label: 'Rejected',  count: rejectedDocs,  color: 'var(--color-danger)',   bg: 'var(--color-danger-bg)' },
                ].filter(x => x.count > 0).map(x => (
                  <span key={x.label} style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 99, background: x.bg, color: x.color,
                  }}>
                    {x.count} {x.label}
                  </span>
                ))}
              </div>
            )}

            {docs.length === 0 ? (
              <div className={s.emptyState}>
                <div className={s.emptyIcon}><FileText size={24} /></div>
                <div className={s.emptyTitle}>No documents uploaded</div>
                <div className={s.emptyText}>Upload compliance documents to get verified.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {docs.map(doc => (
                  <div
                    key={doc.documentId}
                    onClick={() => navigate('/vendor/documents')}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', border: '1px solid var(--color-border)',
                      borderRadius: 8, background: 'var(--color-surface-2)',
                      cursor: 'pointer', transition: 'background 0.15s',
                      borderLeft: doc.status === 'Expired' || doc.status === 'Rejected'
                        ? '3px solid var(--color-danger)'
                        : doc.status === 'Pending'
                          ? '3px solid #f59e0b'
                          : '3px solid var(--color-success)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.documentName}</div>
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
                        border: `1px solid ${st.border}`,
                        borderLeft: `4px solid ${st.border}`,
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
