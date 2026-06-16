import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Menu, Bell, Sun, Moon, HelpCircle, CheckCheck, FileWarning, ShoppingCart, FileText, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from './VendorTopbar.module.css';

interface VendorNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
}

interface Props {
  onMobileMenuToggle: () => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  po_raised:          <ShoppingCart size={15} />,
  po_updated:         <ShoppingCart size={15} />,
  invoice_approved:   <FileText size={15} />,
  invoice_rejected:   <FileText size={15} />,
  document_expiry:    <FileWarning size={15} />,
  document_expired:   <FileWarning size={15} />,
  document_rejected:  <AlertCircle size={15} />,
  payment_processed:  <CheckCheck size={15} />,
  kyc_approved:       <CheckCheck size={15} />,
  kyc_rejected:       <AlertCircle size={15} />,
};

const TYPE_COLOR: Record<string, string> = {
  po_raised:          '#1d4ed8',
  po_updated:         '#1d4ed8',
  invoice_approved:   '#16a34a',
  invoice_rejected:   '#dc2626',
  document_expiry:    '#f59e0b',
  document_expired:   '#dc2626',
  document_rejected:  '#dc2626',
  payment_processed:  '#16a34a',
  kyc_approved:       '#16a34a',
  kyc_rejected:       '#dc2626',
};

function deriveType(msg = ''): string {
  const m = msg.toLowerCase();
  if (m.includes('kyc') && m.includes('verified')) return 'kyc_approved';
  if (m.includes('kyc') && m.includes('rejected')) return 'kyc_rejected';
  if (m.includes('kyc')) return 'kyc_approved';
  if (m.includes('purchase order') && m.includes('acknowledged')) return 'po_updated';
  if (m.includes('purchase order')) return 'po_raised';
  if (m.includes('invoice') && m.includes('paid')) return 'payment_processed';
  if (m.includes('invoice') && m.includes('rejected')) return 'invoice_rejected';
  if (m.includes('invoice')) return 'invoice_approved';
  if (m.includes('document') || m.includes('uploaded')) return 'document_expiry';
  return 'po_raised';
}

function shortTitle(msg = ''): string {
  const m = msg.toLowerCase();
  if (m.includes('kyc') && m.includes('verified')) return 'KYC Verified';
  if (m.includes('kyc') && m.includes('rejected')) return 'KYC Rejected';
  if (m.includes('kyc')) return 'KYC Update';
  if (m.includes('purchase order')) return 'Purchase Order Update';
  if (m.includes('invoice') && m.includes('paid')) return 'Payment Processed';
  if (m.includes('invoice')) return 'Invoice Update';
  if (m.includes('document') || m.includes('uploaded')) return 'Document Update';
  if (m.includes('support ticket')) return 'Support Ticket';
  if (m.includes('profile')) return 'Profile Updated';
  return 'Notification';
}

const PAGE_TITLES: Record<string, string> = {
  '/vendor/overview': 'Overview',
  '/vendor/profile': 'My Profile',
  '/vendor/documents': 'Documents & Compliance',
  '/vendor/kyc': 'KYC Status',
  '/vendor/contracts': 'Contracts & SLAs',
  '/vendor/purchase-orders': 'Purchase Orders',
  '/vendor/invoices': 'Invoices',
  '/vendor/payments': 'Payments',
  '/vendor/helpdesk': 'Support Tickets',
  '/vendor/settings': 'Settings',
};

export const VendorTopbar: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() =>
    localStorage.getItem('vms_theme') === 'dark' ||
    (!localStorage.getItem('vms_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [notifs, setNotifs] = useState<VendorNotif[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('vms_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await axios.get('/api/vendor-portal/notifications');
      // Normalize legacy format { notificationId, message, createdDate } to expected shape
      const normalized: VendorNotif[] = res.data.map((n: Record<string, unknown>) => ({
        id: (n.id ?? n.notificationId) as string,
        type: (n.type ?? deriveType(n.message as string)) as string,
        title: (n.title ?? shortTitle(n.message as string)) as string,
        message: n.message as string,
        link: n.link as string | undefined,
        timestamp: (n.timestamp ?? `${n.createdDate}T00:00:00.000Z`) as string,
        read: n.read as boolean,
      }));
      setNotifs(normalized.slice().reverse());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await axios.post('/api/vendor-portal/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleNotifClick = (notif: VendorNotif) => {
    if (!notif.read) {
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    setShowNotifs(false);
    if (notif.link) navigate(notif.link);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'V';

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Vendor Portal';

  return (
    <header className={styles.topbar}>
      <button className={styles.hamburger} onClick={onMobileMenuToggle} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <span className={styles.pageTitle}>{pageTitle}</span>

      <div className={styles.actions}>
        <button
          className={styles.themeBtn}
          onClick={() => setDark(d => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Light' : 'Dark'}
        </button>

        <div className={styles.divider} />

        <button className={styles.iconBtn} aria-label="Help">
          <HelpCircle size={19} />
        </button>

        {/* Notification Bell */}
        <div ref={panelRef} style={{ position: 'relative' }}>
          <button
            className={styles.iconBtn}
            aria-label={`${unread} notifications`}
            onClick={() => setShowNotifs(v => !v)}
          >
            {unread > 0 && (
              <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
            )}
            <Bell size={19} />
          </button>

          {showNotifs && (
            <div className={styles.notifPanel}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {unread > 0 && (
                  <button className={styles.markReadBtn} onClick={markAllRead}>
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notifList}>
                {notifs.length === 0 ? (
                  <div className={styles.notifEmpty}>
                    <Bell size={28} strokeWidth={1.2} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifs.slice(0, 20).map(notif => {
                    const color = TYPE_COLOR[notif.type] ?? '#6b7280';
                    const icon = TYPE_ICON[notif.type] ?? <Bell size={15} />;
                    return (
                      <div
                        key={notif.id}
                        className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ''}`}
                        onClick={() => handleNotifClick(notif)}
                      >
                        <div className={styles.notifIcon} style={{ background: `${color}18`, color }}>
                          {icon}
                        </div>
                        <div className={styles.notifBody}>
                          <p className={styles.notifItemTitle}>{notif.title}</p>
                          <p className={styles.notifMsg}>{notif.message}</p>
                          <span className={styles.notifTime}>{formatTime(notif.timestamp)}</span>
                        </div>
                        {!notif.read && <span className={styles.unreadDot} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.avatar} title={user?.fullName}>{initials}</div>
      </div>
    </header>
  );
};
