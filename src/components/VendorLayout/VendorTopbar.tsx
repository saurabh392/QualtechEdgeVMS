import React, { useEffect, useState } from 'react';
import { Menu, Bell, Sun, Moon, HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './VendorTopbar.module.css';

interface Props {
  onMobileMenuToggle: () => void;
  notifCount?: number;
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

export const VendorTopbar: React.FC<Props> = ({ onMobileMenuToggle, notifCount = 0 }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('vms_theme') === 'dark' ||
      (!localStorage.getItem('vms_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('vms_theme', dark ? 'dark' : 'light');
  }, [dark]);

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

        <button className={styles.iconBtn} aria-label={`${notifCount} notifications`}>
          {notifCount > 0 && <span className={styles.badge}>{notifCount > 9 ? '9+' : notifCount}</span>}
          <Bell size={19} />
        </button>

        <div className={styles.avatar} title={user?.fullName}>{initials}</div>
      </div>
    </header>
  );
};
