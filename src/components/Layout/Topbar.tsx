import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Topbar.module.css';

interface Props {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();

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

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search vendors, documents, invoices..."
          className={styles.searchInput}
          aria-label="Global search"
        />
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

        {/* <button className={styles.iconBtn} aria-label="Help">
          <HelpCircle size={20} />
        </button> */}

        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>

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
