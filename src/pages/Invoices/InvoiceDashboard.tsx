import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Upload,
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter,
  CreditCard,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import styles from './InvoiceDashboard.module.css';

const steps = [
  'Invoice Upload',
  'OCR & AI Extraction',
  'Invoice Validation',
  '3-Way Matching',
  'GST & Tax Validation',
  'Approval Workflow',
  'Exception Handling',
  'Payment Processing',
  'Reconciliation',
  'Analytics & Closure'
];

interface Invoice {
  invoiceId: string;
  vendorName: string;
  poRef: string;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  riskScore: number;
  riskLevel: string;
  status: string;
  vendorType: string;
}

export const InvoiceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice List Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/invoices')
      .then(r => setInvoices(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleKpiClick = (tabName: string, status: string = 'All', risk: string = 'All') => {
    setActiveTab(tabName);
    setStatusFilter(status);
    setRiskFilter(risk);
  };

  const tabCounts = {
    All: invoices.length,
    'Pending Match': invoices.filter(inv => inv.status === 'Pending Match').length,
    Exceptions: invoices.filter(inv => inv.status === 'Exception').length,
    Approved: invoices.filter(inv => inv.status === 'Approved').length,
    Paid: invoices.filter(inv => inv.status === 'Paid').length
  };

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'Pending Match' && inv.status !== 'Pending Match') return false;
    if (activeTab === 'Exceptions' && inv.status !== 'Exception') return false;
    if (activeTab === 'Approved' && inv.status !== 'Approved') return false;
    if (activeTab === 'Paid' && inv.status !== 'Paid') return false;
    if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
    if (riskFilter !== 'All') {
      const rf = riskFilter.toLowerCase();
      if (rf === 'low risk' && inv.riskLevel !== 'Low') return false;
      if (rf === 'medium risk' && inv.riskLevel !== 'Medium') return false;
      if (rf === 'high risk' && inv.riskLevel !== 'High') return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return inv.invoiceId.toLowerCase().includes(q) ||
        inv.vendorName.toLowerCase().includes(q) ||
        inv.poRef.toLowerCase().includes(q);
    }
    return true;
  });

  const formatAmount = (amt: number) =>
    '₹' + amt.toLocaleString('en-IN');

  const columns = [
    { header: 'Invoice Number', accessor: (row: Invoice) => row.invoiceId },
    { header: 'Vendor Name', accessor: (row: Invoice) => row.vendorName },
    { header: 'PO Ref', accessor: (row: Invoice) => row.poRef },
    { header: 'Grand Total', accessor: (row: Invoice) => formatAmount(row.totalAmount) },
    { header: 'Created Date', accessor: (row: Invoice) => row.invoiceDate },
    { header: 'Due Date', accessor: (row: Invoice) => row.dueDate },
    {
      header: 'Risk Score',
      accessor: (row: Invoice) => {
        let style = { color: '#16a34a', fontWeight: '600' };
        if (row.riskLevel === 'High') style = { color: '#dc2626', fontWeight: '600' };
        if (row.riskLevel === 'Medium') style = { color: '#d97706', fontWeight: '600' };
        return <span style={style}>{row.riskLevel} ({row.riskScore}%)</span>;
      }
    },
    {
      header: 'Status',
      accessor: (row: Invoice) => {
        let className = styles.statusBadge;
        if (row.status === 'Approved' || row.status === 'Paid') className = styles.statusSuccess;
        if (row.status === 'Pending Match') className = styles.statusWarning;
        if (row.status === 'Draft') className = styles.statusDraft;
        if (row.status === 'Rejected') className = styles.statusDanger;
        if (row.status === 'Exception') className = styles.statusPurple;
        return <span className={className}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      align: 'center' as const,
      accessor: (row: Invoice) => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} onClick={() => navigate(`/invoices/approvals?id=${row.invoiceId}`)} title="View details"><Eye size={16} /></button>
          <button className={styles.actionBtn} title="More Options"><MoreVertical size={16} /></button>
        </div>
      )
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Invoice Management</h1>
          <p className={styles.subtitle}>Automate Accounts Payable processing and compliance</p>
        </div>
        <div className={styles.headerActions}>

          <Button icon={<Upload size={16} />} onClick={() => navigate('/invoices/upload')}>Upload Invoice</Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {([
          { tab: 'All', label: 'Total Invoices', icon: <FileText size={16} />, bg: '#eff6ff', color: '#1d4ed8', sub: '+8.2% vs last month', onClick: () => handleKpiClick('All', 'All', 'All') },
          { tab: 'Pending Match', label: 'Pending Match', icon: <Clock size={16} />, bg: '#fffbeb', color: '#f59e0b', sub: 'Requires 3-Way Match', onClick: () => handleKpiClick('Pending Match', 'Pending Match') },
          { tab: 'Exceptions', label: 'Exceptions', icon: <AlertTriangle size={16} />, bg: '#f3e8ff', color: '#7c3aed', sub: 'Tax & compliance mismatches', onClick: () => handleKpiClick('Exceptions', 'Exception') },
          { tab: 'Approved', label: 'Approved Invoices', icon: <CheckCircle2 size={16} />, bg: '#dcfce7', color: '#16a34a', sub: 'Ready for disbursement', onClick: () => handleKpiClick('Approved', 'Approved') },
          { tab: 'Paid', label: 'Paid Invoices', icon: <CreditCard size={16} />, bg: '#ffedd5', color: '#f97316', sub: 'Settled & reconciled', onClick: () => handleKpiClick('Paid', 'Paid') },
        ] as const).map(k => (
          <Card key={k.tab} className={`${styles.kpiCard} ${activeTab === k.tab ? styles.kpiCardActive : ''}`} onClick={k.onClick}>
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{tabCounts[k.tab].toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Invoice List */}
      <Card className={styles.tableCard} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input
                placeholder="Search Invoice number, vendor..."
                fullWidth={false}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>

            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Draft">Draft</option>
              <option value="Pending Match">Pending Match</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
              <option value="Exception">Exception</option>
            </select>

            <select className={styles.filterSelect} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="All">Risk Level: All</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
            </select>
            {/* <Button variant="ghost" icon={<Filter size={16} />}>More Filters</Button> */}
          </div>

          <Button variant="outline" icon={<Download size={16} />}>Export</Button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={32} className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredInvoices}
            keyExtractor={(row) => row.invoiceId}
          />
        )}

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtnNext}>&gt;</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
