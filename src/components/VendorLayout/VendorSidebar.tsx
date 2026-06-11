import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  ShieldCheck,
  FileSignature,
  Package,
  Receipt,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './VendorSidebar.module.css';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  pendingPOs?: number;
  expiredDocs?: number;
}

const NAV = [
  { label: 'Dashboard', path: '/vendor/overview', icon: LayoutDashboard },
  { label: 'My Profile', path: '/vendor/profile', icon: User },
  { label: 'Documents', path: '/vendor/documents', icon: FileText, badgeKey: 'expiredDocs' as const },
  { label: 'KYC Status', path: '/vendor/kyc', icon: ShieldCheck },
  { label: 'Contracts & SLAs', path: '/vendor/contracts', icon: FileSignature },
  null, // divider
  { label: 'Purchase Orders', path: '/vendor/purchase-orders', icon: Package, badgeKey: 'pendingPOs' as const },
  { label: 'Invoices', path: '/vendor/invoices', icon: Receipt },
  { label: 'Payments', path: '/vendor/payments', icon: CreditCard },
  null,
  { label: 'Support Tickets', path: '/vendor/helpdesk', icon: HelpCircle },
  { label: 'Settings', path: '/vendor/settings', icon: Settings },
];

export const VendorSidebar: React.FC<Props> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  pendingPOs = 0,
  expiredDocs = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const badges: Record<string, number> = { pendingPOs, expiredDocs };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'V';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={[
        styles.sidebar,
        collapsed ? styles.collapsed : '',
        mobileOpen ? styles.mobileOpen : '',
      ].join(' ')}
    >
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <h2>Qualtech Edge VMS</h2>
            <p>Vendor Self-Service Portal</p>
          </div>
        )}
      </div>

      {/* Vendor identity */}
      <div className={styles.vendorCard}>
        <div className={styles.vendorAvatar}>{initials}</div>
        {!collapsed && (
          <div className={styles.vendorInfo}>
            <div className={styles.vendorName}>{user?.fullName || 'Vendor'}</div>
            <div className={styles.vendorMeta}>
              <span className={styles.statusDot} />
              Verified Partner
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map((item, i) => {
          if (item === null) return <div key={i} className={styles.navDivider} />;
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}><Icon size={17} /></span>
              <span className={styles.navLabel}>{item.label}</span>
              {badgeCount > 0 && <span className={styles.navBadge}>{badgeCount}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.collapseBtn} onClick={onToggleCollapse} title="Toggle sidebar">
          <span className={styles.navIcon}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          <span className={styles.navLabel}>Collapse</span>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.navIcon}><LogOut size={16} /></span>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
