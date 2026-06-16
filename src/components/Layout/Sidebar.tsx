import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileSignature,
  ShoppingCart,
  Receipt,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Globe,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
}

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Vendor Onboarding & KYC',
    path: '/vendors',
    icon: Users,
    subItems: [
      { name: 'Vendor List', path: '/vendors' },
      { name: 'Register Vendor', path: '/vendors/add' },
      { name: 'AI Screening & Risk', path: '/kyc/screening' },
      { name: 'Reviews & Approvals', path: '/kyc/reviews' },
    ],
  },
  {
    name: 'Documents',
    path: '/documents',
    icon: FileText,
    subItems: [
      { name: 'Document List', path: '/documents' },
      { name: 'Upload Document', path: '/documents/upload' },
      { name: 'Expiry Tracker', path: '/documents/expiry' },
      { name: 'Verification Queue', path: '/documents/approvals' },
    ],
  },

  {
    name: 'Item & Service Catalogue',
    path: '/catalogue',
    icon: Package,
    subItems: [
      { name: 'Catalogue Dashboard', path: '/catalogue/dashboard' },
      { name: 'Item Master', path: '/catalogue/items' },
      { name: 'Service Master', path: '/catalogue/services' },
      { name: 'Vendor Mapping', path: '/catalogue/vendor-mapping' },
      { name: 'Category Management', path: '/catalogue/categories' },
      { name: 'HSN/SAC Mapping', path: '/catalogue/hsn-sac' },
      { name: 'UOM Management', path: '/catalogue/uom' },
      { name: 'Rate & Price Reference', path: '/catalogue/rates' },
      { name: 'Quality Standards', path: '/catalogue/quality' },
      { name: 'Approval Workflow', path: '/catalogue/approvals' },
    ],
  },
  {
    name: 'Contracts & SLAs',
    path: '/contracts',
    icon: FileSignature,
    subItems: [
      { name: 'Dashboard', path: '/contracts/dashboard' },
      { name: 'Create Contract', path: '/contracts/create' },
      { name: 'Clause Library', path: '/contracts/clauses' },
      { name: 'Renewals', path: '/contracts/renewals' },
      { name: 'Approvals', path: '/contracts/approvals' },
    ],
  },
  {
    name: 'Purchase Orders',
    path: '/purchase-orders',
    icon: ShoppingCart,
    subItems: [
      { name: 'PO Dashboard', path: '/purchase-orders/dashboard' },
      { name: 'Create Requisition', path: '/purchase-orders/create' },
      { name: 'Approvals', path: '/purchase-orders/approvals' },
    ],
  },
  {
    name: 'Invoices',
    path: '/invoices',
    icon: Receipt,
    subItems: [
      { name: 'Invoice Dashboard', path: '/invoices/dashboard' },
      { name: 'Upload Invoice', path: '/invoices/upload' },
      { name: 'Goods Receipt (GRN)', path: '/invoices/grn' },
      { name: '3-Way Match Engine', path: '/invoices/match' },
      { name: 'Approvals', path: '/invoices/approvals' },
    ],
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: CreditCard,
    subItems: [
      { name: 'Payments Dashboard', path: '/payments/dashboard' },
      { name: 'Payment Processing', path: '/payments/processing' },
      { name: 'Approvals', path: '/payments/approvals' },
    ],
  },
  {
    name: 'Reports & MIS',
    path: '/reports',
    icon: BarChart,
    subItems: [
      { name: 'MIS Dashboard', path: '/reports/dashboard' },
      { name: 'Performance & Analytics', path: '/reports/performance' },
      { name: 'AI Insights', path: '/reports/insights' },
    ],
  },
  {
    name: 'Vendor Portal',
    path: '/vendor-portal',
    icon: Globe,
    subItems: [{ name: 'Portal Dashboard', path: '/vendor-portal' }],
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    subItems: [
      { name: 'General Settings', path: '/settings/general' },
      { name: 'Users & Roles', path: '/settings/users' },
      { name: 'System Preferences', path: '/settings/preferences' },
    ],
  },
];

const VENDOR_NAV_ITEMS = [
  {
    name: 'Vendor Portal',
    path: '/vendor/dashboard',
    icon: Globe,
    subItems: [
      { name: 'Vendor Dashboard', path: '/vendor/dashboard?tab=overview' },
      { name: 'My Documents', path: '/vendor/dashboard?tab=documents' },
      { name: 'KYC', path: '/vendor/dashboard?tab=kyc' },
      { name: 'Contracts', path: '/vendor/dashboard?tab=contracts' },
      { name: 'Invoices', path: '/vendor/dashboard?tab=invoices' },
      { name: 'Payments', path: '/vendor/dashboard?tab=invoices' },
      { name: 'Profile', path: '/vendor/dashboard?tab=profile' },
      { name: 'Support', path: '/vendor/dashboard?tab=queries' },
    ],
  },
];

const END_PATHS = new Set([
  '/vendors', '/documents', '/kyc', '/catalogue/dashboard', '/contracts/dashboard',
  '/purchase-orders/dashboard', '/invoices/dashboard', '/payments/dashboard',
  '/reports/dashboard', '/vendor-portal', '/vendor/dashboard', '/settings/dashboard',
]);

export const Sidebar: React.FC<Props> = ({ collapsed, onToggleCollapse, mobileOpen }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    'Vendor Onboarding & KYC': false,
    Documents: false,
    'Item & Service Catalogue': false,
    'Contracts & SLAs': false,
    'Purchase Orders': false,
    Invoices: false,
    Payments: false,
    'Reports & MIS': false,
    'Vendor Portal': true,
    Settings: false,
  });

  const toggleMenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (collapsed) return;
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const rawItems = user?.role === 'VENDOR' ? VENDOR_NAV_ITEMS : NAV_ITEMS;
  const filteredNavItems = rawItems
    .filter(item => {
      if (item.name === 'Documents') return false;
      if (['ADMIN', 'PROCUREMENT', 'COMPLIANCE', 'ONBOARDING', 'FINANCE'].includes(user?.role || '')) {
        if (item.name === 'Vendor Portal') return false;
      }
      return hasPermission(item.name);
    })
    .map(item => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => {
            if (
              sub.name === 'My Documents' || 
              sub.name === 'Document List' || 
              sub.name === 'Upload Document' || 
              sub.name === 'Expiry Tracker' || 
              sub.name === 'Verification Queue'
            ) {
              return false;
            }
            // Check dynamic subItem routing permissions
            if (sub.path.startsWith('/kyc/')) {
              return hasPermission('Vendor Onboarding & KYC');
            }
            if (sub.path.startsWith('/vendors/')) {
              return hasPermission('Vendor Onboarding & KYC');
            }
            return true;
          })
        };
      }
      return item;
    });

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
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <h2>Qualtech Edge VMS</h2>
            <p>AI-Powered Vendor Management</p>
          </div>
        )}
      </div>

      {/* User identity card */}
      <div className={styles.userCard}>
        <div className={styles.userAvatar}>{initials}</div>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.fullName || 'Admin'}</div>
            <div className={styles.userRole}>
              {user?.role === 'ADMIN' && 'Tenant Admin'}
              {user?.role === 'PROCUREMENT' && 'Procurement Manager'}
              {user?.role === 'FINANCE' && 'Finance Manager'}
              {user?.role === 'ONBOARDING' && 'Vendor Onboarding Officer'}
              {user?.role === 'COMPLIANCE' && 'Vendor Onboarding Officer'}
              {user?.role === 'VENDOR' && 'Vendor Portal User'}
              {!['ADMIN', 'PROCUREMENT', 'FINANCE', 'ONBOARDING', 'COMPLIANCE', 'VENDOR'].includes(user?.role || '') && (user?.role || 'Administrator')}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        {filteredNavItems.map(item => {
          const Icon = item.icon;
          const isExpanded = expandedMenus[item.name];

          if (item.subItems && item.subItems.length > 0) {
            return (
              <div key={item.name} className={styles.navGroup}>
                <div
                  className={styles.navItem}
                  onClick={(e) => toggleMenu(item.name, e)}
                  role="button"
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleMenu(item.name, e as any)}
                  title={collapsed ? item.name : undefined}
                >
                  <span className={styles.navIcon}><Icon size={18} /></span>
                  <span className={styles.navLabel}>{item.name}</span>
                  {!collapsed && (
                    isExpanded
                      ? <ChevronUp size={14} className={styles.chevron} />
                      : <ChevronDown size={14} className={styles.chevron} />
                  )}
                </div>

                {isExpanded && !collapsed && (
                  <div className={styles.subMenu}>
                    {item.subItems.map(sub => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        state={item.name === 'Vendor Onboarding & KYC' ? { fromOnboarding: true } : undefined}
                        end={END_PATHS.has(sub.path)}
                        className={({ isActive }) =>
                          [styles.subNavItem, isActive ? styles.activeSub : ''].join(' ')
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
              title={collapsed ? item.name : undefined}
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              <span className={styles.navLabel}>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={styles.navIcon}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          <span className={styles.navLabel}>Collapse</span>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <span className={styles.navIcon}><LogOut size={18} /></span>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
