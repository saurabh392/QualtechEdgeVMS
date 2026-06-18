import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Check, X, Trash2, CheckCircle, RefreshCw, UserPlus } from 'lucide-react';
import {
  getSettings, addUser, deleteUser,
} from '../../services/settingsService';
import type { SettingsUser, Role, PermissionRow } from '../../services/settingsService';
import styles from './UsersRoles.module.css';

const ROLES = ['Super Admin', 'Procurement Manager', 'Finance Manager', 'Compliance Officer', 'Vendor Portal User'];
const DEPARTMENTS = ['IT Administration', 'Finance & Accounts', 'Procurement', 'Compliance & Risk', 'Operations'];
const BUS = ['Noida HQ', 'Mumbai Hub', 'Bangalore Hub'];

const blankForm = { name: '', email: '', role: '', department: '', businessUnit: '', phone: '' };

export const UsersRoles: React.FC = () => {
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setUsers(data.users || []);
      setRoles(data.roles || []);
      setPermissions(data.permissionsMatrix || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.role) return;
    setSubmitting(true);
    try {
      const newUser = await addUser({
        ...form,
        status: 'Active',
        lastLogin: undefined
      });
      setUsers(prev => [...prev, newUser]);
      setForm(blankForm);
      setShowAddForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Add user failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Remove this user?')) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const totalActive = users.filter(u => u.status === 'Active').length;
  const totalInactive = users.filter(u => u.status === 'Inactive').length;


  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', padding: '40px' }}>
          <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Loading users & roles…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.badge}><Shield size={12} /> Access Control</span>
          <h1 className={styles.title}>Users & Roles</h1>
          <p className={styles.subtitle}>Manage system users, roles and module-level permission access matrix</p>
        </div>
        <div className={styles.headerActions}>
          {saved && <span className={styles.savedBanner}><CheckCircle size={14} /> User added successfully</span>}
          <button className={styles.secondaryBtn} onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
          <button className={styles.primaryBtn} onClick={() => setShowAddForm(v => !v)}>
            <UserPlus size={14} /> {showAddForm ? 'Cancel' : 'Add User'}
          </button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}><Users size={18} /></div>
          <div><div className={styles.kpiValue}>{users.length}</div><div className={styles.kpiLabel}>Total Users</div></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}><CheckCircle size={18} /></div>
          <div><div className={styles.kpiValue}>{totalActive}</div><div className={styles.kpiLabel}>Active Users</div></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconOrange}`}><Users size={18} /></div>
          <div><div className={styles.kpiValue}>{totalInactive}</div><div className={styles.kpiLabel}>Inactive Users</div></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}><Shield size={18} /></div>
          <div><div className={styles.kpiValue}>{roles.length}</div><div className={styles.kpiLabel}>System Roles</div></div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Roles Panel */}
        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Shield size={15} className={styles.cardIcon} />
                <h3 className={styles.cardTitle}>System Roles</h3>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.rolesList}>
                {roles.map(role => (
                  <div key={role.roleId} className={styles.roleItem}>
                    <div className={styles.roleName}>{role.name}</div>
                    <div className={styles.roleCount}>{role.description}</div>
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                      {users.filter(u => u.role === role.name).length} user(s)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Users Panel */}
        <div>
          {/* Add User Form */}
          {showAddForm && (
            <div className={styles.addUserForm}>
              <div>
                <label className={styles.label}>Full Name *</label>
                <input className={styles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label className={styles.label}>Email *</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@qualtech.in" />
              </div>
              <div>
                <label className={styles.label}>Role *</label>
                <select className={styles.select} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="">Select role…</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Department</label>
                <select className={styles.select} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                  <option value="">Select dept…</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Business Unit</label>
                <select className={styles.select} value={form.businessUnit} onChange={e => setForm(p => ({ ...p, businessUnit: e.target.value }))}>
                  <option value="">Select BU…</option>
                  {BUS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98xxx xxxxx" />
              </div>
              <div className={styles.formActions}>
                <button className={styles.secondaryBtn} onClick={() => { setShowAddForm(false); setForm(blankForm); }}>
                  <X size={14} /> Cancel
                </button>
                <button className={styles.primaryBtn} onClick={handleAdd} disabled={submitting || !form.name || !form.email || !form.role}>
                  {submitting ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                  {submitting ? 'Adding…' : 'Add User'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Users size={15} className={styles.cardIcon} />
                <h3 className={styles.cardTitle}>User Directory ({users.length})</h3>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Business Unit</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.userId}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{user.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                          <div>
                            <div className={styles.userName}>{user.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{user.role}</td>
                      <td>{user.department}</td>
                      <td>{user.businessUnit}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${user.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(user.userId)} title="Remove user">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <Shield size={15} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>Module Permission Access Matrix</h3>
          </div>
        </div>
        <div className={styles.matrixWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Module</th>
                <th>Super Admin</th>
                <th>Procurement</th>
                <th>Finance</th>
                <th>Compliance</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(row => (
                <tr key={row.module}>
                  <td>{row.module}</td>
                  <td>{row.superAdmin ? <Check size={16} className={styles.checkIcon} /> : <X size={14} className={styles.crossIcon} />}</td>
                  <td>{row.procurement ? <Check size={16} className={styles.checkIcon} /> : <X size={14} className={styles.crossIcon} />}</td>
                  <td>{row.finance ? <Check size={16} className={styles.checkIcon} /> : <X size={14} className={styles.crossIcon} />}</td>
                  <td>{row.compliance ? <Check size={16} className={styles.checkIcon} /> : <X size={14} className={styles.crossIcon} />}</td>
                  <td>{row.vendor ? <Check size={16} className={styles.checkIcon} /> : <X size={14} className={styles.crossIcon} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
