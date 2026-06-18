import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  ShoppingCart,
  Receipt,
  CreditCard,
  FileText,
  FileSignature,
  DollarSign,
  ArrowRight,
  UserPlus,
  UserCheck,
  ShieldAlert,
  BookOpen,
  Wallet,
} from 'lucide-react';

import { Card } from '../../components/Card/Card';
import { useVendors } from '../../context/VendorContext';
import styles from './Dashboard.module.css';

// ── Static mock data ──────────────────────────────────────────────────────────

const recentActivity = [
  { id: 1, title: 'New vendor "XYZ Infra Pvt Ltd" onboarded', time: '12 May 2026, 11:30 AM', status: 'Onboarded', icon: 'UserPlus' },
  { id: 2, title: 'Contract with "Tech Solutions Pvt Ltd" approved', time: '12 May 2026, 10:45 AM', status: 'Approved', icon: 'FileSignature' },
  { id: 3, title: 'Invoice INV-2026-0487 matched successfully', time: '12 May 2026, 10:20 AM', status: 'Invoice Matched', icon: 'Receipt' },
  { id: 4, title: 'Payment of ₹ 12.45 Lakh released to ABC Services', time: '12 May 2026, 09:15 AM', status: 'Payment Released', icon: 'DollarSign' },
];

// ── Approval Queue static config (counts fetched dynamically) ─────────────────

interface ApprovalQueueItem {
  id: number;
  name: string;
  icon: string;
  color: string;
  route: string;
  count: number;
}

const APPROVAL_QUEUE_CONFIG: Omit<ApprovalQueueItem, 'count'>[] = [
  { id: 1, name: 'Vendor Approval',                     icon: 'UserCheck',     color: '#1D4ED8', route: '/kyc/reviews'                },
  { id: 2, name: 'ITEM & SERVICE CATALOGUE Approvals',  icon: 'BookOpen',      color: '#16A34A', route: '/catalogue/approvals'        },
  { id: 3, name: 'Invoice Approval',                    icon: 'Receipt',       color: '#9333EA', route: '/invoices/approvals'         },
  { id: 4, name: 'Payment Approvals',                   icon: 'Wallet',        color: '#DC2626', route: '/payments/approvals'         },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, loading: vendorsLoading } = useVendors();

  const [kpiCounts, setKpiCounts] = useState({
    totalPOs: 0,
    totalInvoices: 0,
    totalPayments: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(true);

  // Approval queue — live counts
  const [approvalCounts, setApprovalCounts] = useState<Record<string, number>>({
    vendorApprovals: 0,
    catalogueApprovals: 0,
    poApprovals: 0,
    invoiceApprovals: 0,
    paymentApprovals: 0,
  });
  const [approvalLoading, setApprovalLoading] = useState(true);

  useEffect(() => {
    setKpiLoading(true);
    Promise.all([
      axios.get('/api/purchase-orders').catch(() => ({ data: [] })),
      axios.get('/api/invoices').catch(() => ({ data: [] })),
      axios.get('/api/payments').catch(() => ({ data: [] })),
    ]).then(([posRes, invoicesRes, paymentsRes]) => {
      setKpiCounts({
        totalPOs: Array.isArray(posRes.data) ? posRes.data.length : 0,
        totalInvoices: Array.isArray(invoicesRes.data) ? invoicesRes.data.length : 0,
        totalPayments: Array.isArray(paymentsRes.data) ? paymentsRes.data.length : 0,
      });
    }).catch((err) => {
      console.error('Dashboard KPI fetch error:', err);
    }).finally(() => {
      setKpiLoading(false);
    });
  }, []);

  // Fetch live approval queue counts from the dedicated aggregation endpoint
  useEffect(() => {
    setApprovalLoading(true);
    axios.get('/api/dashboard/approval-counts')
      .then(res => {
        if (res.data && typeof res.data === 'object') {
          setApprovalCounts({
            vendorApprovals:    res.data.vendorApprovals    ?? 0,
            catalogueApprovals: res.data.catalogueApprovals ?? 0,
            poApprovals:        res.data.poApprovals        ?? 0,
            invoiceApprovals:   res.data.invoiceApprovals   ?? 0,
            paymentApprovals:   res.data.paymentApprovals   ?? 0,
          });
        }
      })
      .catch(err => {
        console.error('Dashboard approval counts fetch error:', err);
      })
      .finally(() => {
        setApprovalLoading(false);
      });
  }, []);

  // Map config entries to live counts
  const approvalQueueItems: ApprovalQueueItem[] = [
    { ...APPROVAL_QUEUE_CONFIG[0], count: approvalCounts.vendorApprovals    },
    { ...APPROVAL_QUEUE_CONFIG[1], count: approvalCounts.catalogueApprovals },
    { ...APPROVAL_QUEUE_CONFIG[2], count: approvalCounts.invoiceApprovals   },
    { ...APPROVAL_QUEUE_CONFIG[3], count: approvalCounts.paymentApprovals   },
  ];

  const loading = vendorsLoading || kpiLoading;

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 100, borderRadius: 12, padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', gap: 14 }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 24, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeVendorCount = vendors.filter(v => v.status === 'Active').length;

  const kpiCards = [
    {
      label: 'Total Vendors',
      value: vendors.length,
      icon: <Users size={20} />,
      bg: '#eff6ff',
      color: '#1d4ed8',
      footer: `${activeVendorCount} Active`,
      onClick: () => navigate('/vendors'),
    },
    {
      label: 'Active Vendors',
      value: activeVendorCount,
      icon: <UserCheck size={20} />,
      bg: '#dcfce7',
      color: '#16a34a',
      footer: 'Active & Approved Vendors',
      onClick: () => navigate('/vendors'),
    },
    {
      label: 'Total POs',
      value: kpiCounts.totalPOs,
      icon: <ShoppingCart size={20} />,
      bg: '#e0f2fe',
      color: '#0ea5e9',
      footer: 'Purchase Orders',
      onClick: () => navigate('/purchase-orders/dashboard'),
    },
    {
      label: 'Total Invoices',
      value: kpiCounts.totalInvoices,
      icon: <Receipt size={20} />,
      bg: '#f3e8ff',
      color: '#9333ea',
      footer: 'Across all stages',
      onClick: () => navigate('/invoices/dashboard'),
    },
    {
      label: 'Total Payments',
      value: kpiCounts.totalPayments,
      icon: <CreditCard size={20} />,
      bg: '#fef3c7',
      color: '#f59e0b',
      footer: 'Payment records',
      onClick: () => navigate('/payments/dashboard'),
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, Saurabh Anand! 👋</h1>
          <p className={styles.subtitle}>Here's what's happening with your vendor ecosystem.</p>
        </div>

      </header>

      {/* KPI Cards Row (5 Live-Data Cards) */}
      <div className={styles.kpiGrid}>
        {kpiCards.map(k => (
          <Card
            key={k.label}
            className={styles.kpiCard}
            onClick={k.onClick}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: k.bg, color: k.color }}>
                {k.icon}
              </div>
            </div>
            <div className={styles.kpiValue} style={{ color: k.color }}>{k.value.toLocaleString('en-IN')}</div>
            <div className={styles.kpiFooter}>
              <span className={styles.neutralText}>{k.footer}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Card */}
      <Card className={styles.quickActionsCard}>
        <div className={styles.quickActionsHeader}>
          <span className={styles.quickActionsTitle}>⚡ Quick Actions</span>
          <span className={styles.quickActionsSubtitle}>Frequently used workflows</span>
        </div>
        <div className={styles.quickActionsGrid}>
          {[
            {
              label: 'Register Vendor',
              description: 'Create a new vendor profile',
              icon: <UserPlus size={22} />,
              bg: '#eff6ff',
              color: '#1d4ed8',
              path: '/vendors/add',
            },
            {
              label: 'Run KYC Screening',
              description: 'AI Screening & Risk assessment',
              icon: <ShieldAlert size={22} />,
              bg: '#fef3c7',
              color: '#d97706',
              path: '/kyc/screening',
            },
            {
              label: 'Raise PO',
              description: 'Create a new Purchase Requisition',
              icon: <ShoppingCart size={22} />,
              bg: '#dcfce7',
              color: '#16a34a',
              path: '/purchase-orders/create',
            },
            {
              label: 'Upload Invoice',
              description: 'Upload and process vendor invoice',
              icon: <Receipt size={22} />,
              bg: '#f3e8ff',
              color: '#9333ea',
              path: '/invoices/upload',
            },
          ].map(action => (
            <button
              key={action.label}
              className={styles.quickActionBtn}
              onClick={() => navigate(action.path)}
            >
              <div className={styles.quickActionIcon} style={{ backgroundColor: action.bg, color: action.color }}>
                {action.icon}
              </div>
              <div className={styles.quickActionText}>
                <span className={styles.quickActionLabel}>{action.label}</span>
                <span className={styles.quickActionDesc}>{action.description}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Bottom Widgets Row */}
      <div className={styles.widgetsGrid}>

        {/* Recent Activity */}
        <Card className={styles.widgetCard}>
          <div className={styles.chartHeader}>
            <h3>Recent Activity</h3>

          </div>
          <div className={styles.activityList}>
            {recentActivity.map(item => (
              <div key={item.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {item.icon === 'UserPlus' && <UserPlus size={18} color="#1d4ed8" />}
                  {item.icon === 'FileSignature' && <FileSignature size={18} color="#9333ea" />}
                  {item.icon === 'Receipt' && <Receipt size={18} color="#0ea5e9" />}
                  {item.icon === 'DollarSign' && <DollarSign size={18} color="#f59e0b" />}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>{item.title}</p>
                  <span className={styles.activityTime}>{item.time}</span>
                </div>
                <div className={styles.activityBadge}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Approval Queue — dynamic counts + click routing */}
        <Card className={styles.widgetCard}>
          <div className={styles.chartHeader}>
            <h3>Approval Queue</h3>

          </div>
          <div className={styles.queueList}>
            {approvalQueueItems.map(item => (
              <div
                key={item.id}
                className={styles.queueItem}
                onClick={() => navigate(item.route)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(item.route)}
              >
                <div className={styles.queueLeft}>
                  <div className={styles.queueIcon} style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                    {item.icon === 'UserCheck'   && <UserCheck  size={18} />}
                    {item.icon === 'BookOpen'     && <BookOpen   size={18} />}
                    {item.icon === 'FileText'     && <FileText   size={18} />}
                    {item.icon === 'Receipt'      && <Receipt    size={18} />}
                    {item.icon === 'Wallet'       && <Wallet     size={18} />}
                  </div>
                  <span className={styles.queueName}>{item.name}</span>
                </div>
                <div className={styles.queueRight}>
                  {approvalLoading ? (
                    <span className={styles.queueCount} style={{ color: item.color }}>—</span>
                  ) : (
                    <span className={styles.queueCount} style={{ color: item.color }}>{item.count}</span>
                  )}
                  <ArrowRight size={16} color="#cbd5e1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

