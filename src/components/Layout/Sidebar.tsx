import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldCheck, 
  FileSignature,
  ShoppingCart,
  Receipt,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Globe,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Vendors', 
    path: '/vendors', 
    icon: Users,
    subItems: [
      { name: 'Vendor List', path: '/vendors' },
      { name: 'Add Vendor', path: '/vendors/add' },
      { name: 'Approvals', path: '/vendors/approvals' },
    ]
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
    ]
  },
  { 
    name: 'Due Diligence & KYC', 
    path: '/kyc', 
    icon: ShieldCheck,
    subItems: [
      { name: 'KYC Verification', path: '/kyc' },
      { name: 'Risk Assessment', path: '/kyc/risk' },
      { name: 'Sanctions Screening', path: '/kyc/sanctions' },
      { name: 'Blacklist Check', path: '/kyc/blacklist' },
      { name: 'PEP Check', path: '/kyc/pep' },
      { name: 'Adverse Media', path: '/kyc/media' },
      { name: 'Shell Company Check', path: '/kyc/shell' },
      { name: 'Re-KYC Scheduling', path: '/kyc/schedule' },
      { name: 'Approvals', path: '/kyc/approvals' },
    ]
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
      { name: 'Vendor Comparison', path: '/catalogue/comparison' },
      { name: 'Approval Workflow', path: '/catalogue/approvals' },
      { name: 'AI Recommendations', path: '/catalogue/ai-recommendations' },
      { name: 'Catalogue Analytics', path: '/catalogue/analytics' }
    ]
  },

  { 
    name: 'Contracts & SLAs', 
    path: '/contracts', 
    icon: FileSignature,
    subItems: [
      { name: 'Dashboard', path: '/contracts/dashboard' },
      { name: 'Repository', path: '/contracts/repository' },
      { name: 'Create Contract', path: '/contracts/create' },
      { name: 'Clause Library', path: '/contracts/clauses' },
      { name: 'Renewals', path: '/contracts/renewals' },
      { name: 'Approvals', path: '/contracts/approvals' },
    ]
  },
  { 
    name: 'Purchase Orders', 
    path: '/purchase-orders', 
    icon: ShoppingCart,
    subItems: [
      { name: 'PO Dashboard', path: '/purchase-orders/dashboard' },
      { name: 'Create Requisition', path: '/purchase-orders/create' },
      { name: 'PO List', path: '/purchase-orders/list' },
      { name: 'Approvals', path: '/purchase-orders/approvals' },
      { name: 'Goods Receipt (GRN)', path: '/purchase-orders/grn' },
      { name: '3-Way Match', path: '/purchase-orders/match' },
    ]
  },
  { 
    name: 'Invoices', 
    path: '/invoices', 
    icon: Receipt,
    subItems: [
      { name: 'Invoice Dashboard', path: '/invoices/dashboard' },
      { name: 'Upload Invoice', path: '/invoices/upload' },
      { name: 'Invoice List', path: '/invoices/list' },
      { name: 'Approvals', path: '/invoices/approvals' },
      { name: '3-Way Matching', path: '/invoices/match' },
      { name: 'GST Validation', path: '/invoices/gst' },
      { name: 'Exception Management', path: '/invoices/exceptions' },
      { name: 'Invoice Analytics', path: '/invoices/analytics' },
    ]
  },
  { 
    name: 'Payments', 
    path: '/payments', 
    icon: CreditCard,
    subItems: [
      { name: 'Payments Dashboard', path: '/payments/dashboard' },
      { name: 'Payment Processing', path: '/payments/processing' },
      { name: 'Payment List', path: '/payments/list' },
      { name: 'Approvals', path: '/payments/approvals' },
      { name: 'Bank Reconciliation', path: '/payments/recon' },
      { name: 'MSME Tracking', path: '/payments/msme' },
      { name: 'TDS & GST', path: '/payments/tax' },
      { name: 'Failed Payments', path: '/payments/failed' },
      { name: 'Payment Analytics', path: '/payments/analytics' },
    ]
  },
  { 
    name: 'Reports & MIS', 
    path: '/reports', 
    icon: BarChart,
    subItems: [
      { name: 'Executive Dashboard', path: '/reports/dashboard' },
      { name: 'Procurement Analytics', path: '/reports/procurement' },
      { name: 'Vendor Performance Reports', path: '/reports/performance' },
      { name: 'Spend Analytics', path: '/reports/spend' },
      { name: 'Invoice & Payment Reports', path: '/reports/finance' },
      { name: 'Compliance Reports', path: '/reports/compliance' },
      { name: 'SLA & KPI Reports', path: '/reports/sla' },
      { name: 'Custom Reports', path: '/reports/builder' },
      { name: 'Audit Reports', path: '/reports/audit' },
      { name: 'AI Insights', path: '/reports/insights' },
    ]
  },
  { 
    name: 'Vendor Portal', 
    path: '/vendor-portal', 
    icon: Globe,
    subItems: [
      { name: 'Portal Dashboard', path: '/vendor-portal' }
    ]
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings,
    subItems: [
      { name: 'Organization Settings', path: '/settings/org' },
      { name: 'User & Role Management', path: '/settings/roles' },
      { name: 'Approval Workflow', path: '/settings/workflow' },
      { name: 'Vendor Configuration', path: '/settings/dashboard' },
      { name: 'Document Settings', path: '/settings/dashboard' },
      { name: 'Compliance Settings', path: '/settings/security' },
      { name: 'Notification Settings', path: '/settings/dashboard' },
      { name: 'Integration Settings', path: '/settings/integrations' },
      { name: 'Security Settings', path: '/settings/security' },
      { name: 'Finance & Tax Settings', path: '/settings/org' },
      { name: 'SLA & KPI Settings', path: '/settings/workflow' },
      { name: 'AI Engine Settings', path: '/settings/dashboard' },
      { name: 'Audit & Logs', path: '/settings/security' },
      { name: 'Master Data Management', path: '/settings/dashboard' },
      { name: 'System Preferences', path: '/settings/dashboard' }
    ]
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
      { name: 'KYC', path: '/vendor/dashboard?tab=documents' },
      { name: 'Contracts', path: '/vendor/dashboard?tab=pos' },
      { name: 'Invoices', path: '/vendor/dashboard?tab=invoices' },
      { name: 'Payments', path: '/vendor/dashboard?tab=invoices' },
      { name: 'Profile', path: '/vendor/dashboard?tab=overview' },
      { name: 'Support', path: '/vendor/dashboard?tab=queries' }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    'Vendors': false,
    'Documents': false,
    'Due Diligence & KYC': false,
    'Item & Service Catalogue': false,
    'Contracts & SLAs': false,
    'Purchase Orders': false,
    'Invoices': false,
    'Payments': false,
    'Reports & MIS': false,
    'Vendor Portal': true,
    'Settings': false
  });

  const toggleMenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  // 1. Get raw items list based on role
  const rawItems = user?.role === 'VENDOR' ? VENDOR_NAV_ITEMS : NAV_ITEMS;

  // 2. Filter root level items
  const filteredNavItems = rawItems.filter(item => {
    if (user?.role === 'ADMIN') {
      if (item.name === 'Vendor Portal') {
        return false;
      }
    }
    return hasPermission(item.name);
  });

  const getFilteredSubItems = (item: typeof NAV_ITEMS[0]) => {
    if (!item.subItems) return undefined;
    
    return item.subItems;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          <h2>Qualtech Edge VMS</h2>
          <p>AI-Powered Vendor Management System</p>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus[item.name];
          const displaySubItems = getFilteredSubItems(item);

          if (displaySubItems && displaySubItems.length > 0) {
            return (
              <div key={item.name} className={styles.navGroup}>
                <div 
                  className={styles.navItem} 
                  onClick={(e) => toggleMenu(item.name, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon size={20} />
                  <span className={styles.navLabel}>{item.name}</span>
                  {isExpanded ? <ChevronUp size={16} className={styles.chevron} /> : <ChevronDown size={16} className={styles.chevron} />}
                </div>
                
                {isExpanded && (
                  <div className={styles.subMenu}>
                    {displaySubItems.map(subItem => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        end={subItem.path === '/vendors' || subItem.path === '/documents' || subItem.path === '/kyc' || subItem.path === '/catalogue/dashboard' || subItem.path === '/contracts/dashboard' || subItem.path === '/purchase-orders/dashboard' || subItem.path === '/invoices/dashboard' || subItem.path === '/payments/dashboard' || subItem.path === '/reports/dashboard' || subItem.path === '/vendor-portal' || subItem.path === '/vendor/dashboard' || subItem.path === '/settings/dashboard'}
                        className={({ isActive }) => clsx(styles.subNavItem, isActive && styles.activeSub)}
                      >
                        {subItem.name}
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
              className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className={styles.footer}>
        <button onClick={handleLogoutClick} className={styles.logoutBtn} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
