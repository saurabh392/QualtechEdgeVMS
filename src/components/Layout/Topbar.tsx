import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Bell, ChevronDown, Sun, Moon, Menu, CheckCheck, X, Users, FileText, ClipboardCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from './Topbar.module.css';

interface AdminNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
}

interface SearchResult {
  type: string;
  id: string;
  label: string;
  sub: string;
  link: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  vendor_onboarding: <Users size={14} />,
  vendor_approved: <CheckCheck size={14} />,
  vendor_rejected: <X size={14} />,
  document: <FileText size={14} />,
  document_expiry: <FileText size={14} />,
  document_expired: <FileText size={14} />,
  kyc_review: <ClipboardCheck size={14} />,
};

const RESULT_TYPE_ICON: Record<string, React.ReactNode> = {
  Vendor: <Users size={13} />,
  Document: <FileText size={13} />,
  Approval: <ClipboardCheck size={13} />,
};

interface Props {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    return (
      localStorage.getItem('vms_theme') === 'dark' ||
      (!localStorage.getItem('vms_theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('vms_theme', dark ? 'dark' : 'light');
  }, [dark]);

  // ── Notifications ────────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin-notifications');
      setNotifs((res.data as AdminNotif[]).slice().reverse());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await axios.post('/api/admin-notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    await axios.delete('/api/admin-notifications');
    setNotifs([]);
  };

  const handleNotifClick = (notif: AdminNotif) => {
    setShowNotifs(false);
    if (notif.link) navigate(notif.link);
  };

  // ── Global Search ────────────────────────────────────────────────────────────
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQ.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQ)}`);
        setSearchResults(res.data);
        setShowSearch(true);
      } catch { /* silent */ }
      finally { setSearchLoading(false); }
    }, 300);
  }, [searchQ]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (r: SearchResult) => {
    setShowSearch(false);
    setSearchQ('');
    navigate(r.link);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const formattedRole = (role: string) => {
    if (!role) return '';
    if (role === 'ADMIN') return 'Tenant Admin';
    if (role === 'PROCUREMENT') return 'Procurement Manager';
    if (role === 'FINANCE') return 'Finance Manager';
    if (role === 'ONBOARDING') return 'Vendor Onboarding Officer';
    if (role === 'COMPLIANCE') return 'Vendor Onboarding Officer';
    if (role === 'VENDOR') return 'Vendor Portal User';
    return role.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <header className={styles.topbar}>
      <button
        className={styles.hamburger}
        onClick={onMobileMenuToggle}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Global Search */}
      <div className={styles.searchContainer} ref={searchRef} style={{ position: 'relative' }}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search vendors, documents, invoices..."
          className={styles.searchInput}
          aria-label="Global search"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowSearch(true)}
        />
        {showSearch && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
            maxHeight: 320, overflowY: 'auto',
          }}>
            {searchLoading && (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>Searching…</div>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>No results found</div>
            )}
            {!searchLoading && searchResults.map(r => (
              <button
                key={r.id + r.type}
                onClick={() => handleSearchSelect(r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', borderBottom: '1px solid var(--color-border-light)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>{RESULT_TYPE_ICON[r.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{r.sub}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                }}>{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className={styles.iconBtn}
            aria-label="Notifications"
            onClick={() => setShowNotifs(v => !v)}
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16,
                background: 'var(--color-danger)', color: '#fff', borderRadius: 99,
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 3px', lineHeight: 1,
              }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 360, zIndex: 300,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.14)', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>
                  Notifications {unread > 0 && <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>({unread} new)</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {unread > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  {notifs.length > 0 && (
                    <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No notifications yet
                  </div>
                ) : notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      display: 'flex', gap: 10, width: '100%', padding: '12px 16px',
                      background: n.read ? 'none' : 'var(--color-primary-bg)',
                      border: 'none', borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer', textAlign: 'left',
                      borderLeft: n.read ? '3px solid transparent' : '3px solid var(--color-primary)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'none' : 'var(--color-primary-bg)')}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                      background: n.type === 'vendor_rejected' ? 'var(--color-danger-bg)' : n.type === 'vendor_approved' ? 'var(--color-success-bg)' : n.type === 'document_expired' ? 'var(--color-danger-bg)' : n.type === 'document_expiry' ? 'var(--color-warning-bg)' : 'var(--color-primary-bg)',
                      color: n.type === 'vendor_rejected' ? 'var(--color-danger)' : n.type === 'vendor_approved' ? 'var(--color-success)' : n.type === 'document_expired' ? 'var(--color-danger)' : n.type === 'document_expiry' ? 'var(--color-warning)' : 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {TYPE_ICON[n.type] ?? <Bell size={13} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text-primary)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                        {new Date(n.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden="true">{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName || 'Admin'}</span>
            <span className={styles.userRole}>{user ? formattedRole(user.role) : 'Administrator'}</span>
          </div>
          <ChevronDown size={16} className={styles.chevron} />
        </div>
      </div>
    </header>
  );
};
