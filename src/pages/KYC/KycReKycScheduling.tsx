import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock,
  Download, 
  Eye, 
  Layers, 
  X, 
  RefreshCw, 
  Upload,
  AlertTriangle,
  Building,
  Users,
  ExternalLink,
  Check
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Badge } from '../../components/Badge/Badge';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import styles from './KycReKycScheduling.module.css';

interface ReviewHistoryEntry {
  reviewDate: string;
  reviewer: string;
  result: string;
  comments: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface ReKycAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ReKycVendor {
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastKycDate: string;
  nextReKycDate: string;
  daysRemaining: number;
  reKycStatus: 'Active' | 'Due Soon' | 'Action Required' | 'Overdue' | 'Completed';
  assignedTo: string;
  lastReviewResult: string;
  autoReminderEnabled: boolean;
  workflow: {
    status: 'Pending' | 'Under Investigation' | 'Completed';
    stage: 'Vendor Selected' | 'Document Collection' | 'Verification' | 'Risk Assessment' | 'Compliance Review' | 'Approval' | 'Re-KYC Completed';
    comments: string;
  };
  reviewHistory: ReviewHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  alerts?: ReKycAlert[];
}

interface ReKycReminder {
  reminderId: string;
  vendorId: string;
  vendorName: string;
  reminderType: string;
  scheduledDate: string;
  status: 'Pending' | 'Sent';
}

export const KycReKycScheduling: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<ReKycVendor[]>([]);
  const [reminders, setReminders] = useState<ReKycReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'Low' | 'Medium' | 'High'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Due Soon' ...
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<ReKycVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'workflow' | 'reminders' | 'history'>('profile');

  // Form comments
  const [submissionComments, setSubmissionComments] = useState('');
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Evidence file upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow decisions
  const [workflowStage, setWorkflowStage] = useState<'Vendor Selected' | 'Document Collection' | 'Verification' | 'Risk Assessment' | 'Compliance Review' | 'Approval' | 'Re-KYC Completed'>('Document Collection');
  const [workflowStatus, setWorkflowStatus] = useState<'Pending' | 'Under Investigation' | 'Completed'>('Under Investigation');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchReKycData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/rekyc');
      setVendors(res.data.vendors || []);

      const remindersRes = await axios.get('/api/kyc/rekyc/reminders');
      setReminders(remindersRes.data.reminders || []);
    } catch (err) {
      console.error('Error fetching Re-KYC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReKycData();
  }, []);

  // Sync state from URL params
  useEffect(() => {
    const riskParam = searchParams.get('risk') || '';
    const statusParam = searchParams.get('status') || '';
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setCategoryFilter(categoryParam);

    if (statusParam === 'active') {
      setStatusFilter('Active');
      setRiskFilter('All');
      setActiveCard('active');
    } else if (statusParam === 'duesoon') {
      setStatusFilter('Due Soon');
      setRiskFilter('All');
      setActiveCard('duesoon');
    } else if (statusParam === 'actionrequired') {
      setStatusFilter('Action Required');
      setRiskFilter('All');
      setActiveCard('actionrequired');
    } else if (statusParam === 'overdue') {
      setStatusFilter('Overdue');
      setRiskFilter('All');
      setActiveCard('overdue');
    } else if (statusParam === 'completed') {
      setStatusFilter('Completed');
      setRiskFilter('All');
      setActiveCard('completed');
    } else if (riskParam) {
      const formattedRisk = riskParam.charAt(0).toUpperCase() + riskParam.slice(1);
      setRiskFilter(formattedRisk);
      setStatusFilter('All');
      setActiveCard('total');
    } else {
      setRiskFilter('All');
      setStatusFilter('All');
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, riskVal: string, statusVal: string) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'All') params.category = categoryFilter;

    if (riskVal !== 'All') {
      params.risk = riskVal.toLowerCase();
    }
    if (statusVal !== 'All') {
      params.status = statusVal.replace(/\s+/g, '').toLowerCase();
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let r = 'All';
    let s = 'All';

    if (card === 'active') s = 'Active';
    else if (card === 'duesoon') s = 'Due Soon';
    else if (card === 'actionrequired') s = 'Action Required';
    else if (card === 'overdue') s = 'Overdue';
    else if (card === 'completed') s = 'Completed';

    setRiskFilter(r);
    setStatusFilter(s);
    updateUrlParams(card, r, s);
  };

  // Filters logic
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' ? true : v.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' ? true : v.reKycStatus === statusFilter;
    const matchesCategory = categoryFilter === 'All' ? true : v.vendorCategory === categoryFilter;

    return matchesSearch && matchesRisk && matchesStatus && matchesCategory;
  });

  // KPI Calculations
  const totalCount = vendors.length;
  const activeCount = vendors.filter(v => v.reKycStatus === 'Active').length;
  const dueSoonCount = vendors.filter(v => v.reKycStatus === 'Due Soon').length;
  const actionRequiredCount = vendors.filter(v => v.reKycStatus === 'Action Required').length;
  const overdueCount = vendors.filter(v => v.reKycStatus === 'Overdue').length;
  const completedCount = vendors.filter(v => v.reKycStatus === 'Completed').length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/rekyc/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      if (v.workflow) {
        setWorkflowStage(v.workflow.stage || 'Document Collection');
        setWorkflowStatus(v.workflow.status || 'Under Investigation');
      }
      setWorkflowComments('');
      setSubmissionComments('');
    } catch (err) {
      console.error('Error fetching single vendor profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  const handleTriggerReKyc = async () => {
    if (!selectedVendor) return;

    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/rekyc/trigger', {
        vendorId: selectedVendor.vendorId,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchReKycData();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error initiating Re-KYC:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  const handleWorkflowUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/rekyc/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        status: workflowStatus,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchReKycData();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
      }
    } catch (err) {
      console.error('Error updating workflow stage:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  const handleSubmitFinalReKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setSubmittingKyc(true);
      const res = await axios.post('/api/kyc/rekyc/submit', {
        vendorId: selectedVendor.vendorId,
        comments: submissionComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchReKycData();
        await fetchSingleVendor(selectedVendor.vendorId);
        setSubmissionComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error submitting completed Re-KYC:', err);
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedVendor) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');

      const uploadRes = await axios.post('/api/kyc/rekyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const attachRes = await axios.post('/api/kyc/rekyc/attach-file', {
          vendorId: selectedVendor.vendorId,
          fileMetadata: uploadRes.data.file
        });

        if (attachRes.data.success) {
          await fetchSingleVendor(selectedVendor.vendorId);
        }
      }
    } catch (err) {
      console.error('Error uploading evidence file:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  // Recharts charts data mappings
  // 1. Re-KYC Status Distribution (Pie)
  const statusDistData = [
    { name: 'Active', value: vendors.filter(v => v.reKycStatus === 'Active').length, color: '#16a34a' },
    { name: 'Due Soon', value: vendors.filter(v => v.reKycStatus === 'Due Soon').length, color: '#d97706' },
    { name: 'Action Required', value: vendors.filter(v => v.reKycStatus === 'Action Required').length, color: '#be123c' },
    { name: 'Overdue', value: vendors.filter(v => v.reKycStatus === 'Overdue').length, color: '#dc2626' },
    { name: 'Completed', value: vendors.filter(v => v.reKycStatus === 'Completed').length, color: '#0d9488' }
  ].filter(d => d.value > 0);

  // 2. Risk Level Distribution (Pie)
  const riskDistData = [
    { name: 'Low Risk', value: vendors.filter(v => v.riskLevel === 'Low').length, color: '#22c55e' },
    { name: 'Medium Risk', value: vendors.filter(v => v.riskLevel === 'Medium').length, color: '#eab308' },
    { name: 'High Risk', value: vendors.filter(v => v.riskLevel === 'High').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // 3. Upcoming Reviews timeline
  const upcomingReviewsData = vendors
    .filter(v => v.reKycStatus !== 'Completed')
    .map(v => ({
      name: v.vendorName.slice(0, 10) + '...',
      days: v.daysRemaining
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  // 4. Monthly Trend
  const completionTrendData = [
    { month: 'Jan 2026', count: 4 },
    { month: 'Feb 2026', count: 6 },
    { month: 'Mar 2026', count: 9 },
    { month: 'Apr 2026', count: 11 },
    { month: 'May 2026', count: completedCount }
  ];

  // 5. Overdue Vendor Analysis
  const overdueAnalysisData = vendors
    .filter(v => v.reKycStatus === 'Overdue')
    .map(v => ({
      name: v.vendorName.slice(0, 10) + '...',
      overdueDays: Math.abs(v.daysRemaining)
    }))
    .sort((a, b) => b.overdueDays - a.overdueDays);

  const colors = ['#3b82f6', '#10b981', '#ef4444', '#d97706', '#8b5cf6'];

  // CSV Export utility
  const exportToCSV = () => {
    const headers = [
      'Vendor ID', 'Vendor Name', 'Category', 'Risk Level', 
      'Last KYC Date', 'Next Re-KYC Date', 'Days Remaining', 
      'Assigned To', 'Status', 'Last Review Result'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.vendorCategory,
      v.riskLevel,
      v.lastKycDate,
      v.nextReKycDate,
      v.daysRemaining,
      v.assignedTo,
      v.reKycStatus,
      v.lastReviewResult
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ReKYC_Scheduling_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableColumns: Column<ReKycVendor>[] = [
    {
      header: 'Vendor Name',
      accessor: (row: ReKycVendor) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.vendorName}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{row.vendorId}</div>
        </div>
      )
    },
    { header: 'Category', accessor: (row: ReKycVendor) => row.vendorCategory },
    {
      header: 'Risk Level',
      accessor: (row: ReKycVendor) => (
        <Badge variant={row.riskLevel === 'Low' ? 'success' : row.riskLevel === 'Medium' ? 'warning' : 'danger'}>
          {row.riskLevel}
        </Badge>
      )
    },
    { header: 'Last KYC', accessor: (row: ReKycVendor) => row.lastKycDate },
    { header: 'Next Re-KYC', accessor: (row: ReKycVendor) => row.nextReKycDate },
    {
      header: 'Days Remaining',
      accessor: (row: ReKycVendor) => {
        const isOverdue = row.daysRemaining <= 0;
        return (
          <span style={{ fontWeight: 600, color: isOverdue ? '#dc2626' : 'var(--color-text-primary)' }}>
            {isOverdue ? `Overdue by ${Math.abs(row.daysRemaining)} days` : `${row.daysRemaining} days`}
          </span>
        );
      }
    },
    { header: 'Assigned To', accessor: (row: ReKycVendor) => row.assignedTo },
    {
      header: 'Status',
      accessor: (row: ReKycVendor) => {
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (row.reKycStatus === 'Due Soon') variant = 'warning';
        else if (row.reKycStatus === 'Action Required' || row.reKycStatus === 'Overdue') variant = 'danger';
        return (
          <Badge variant={variant}>
            {row.reKycStatus === 'Overdue' ? '🔴 Overdue' : row.reKycStatus}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: ReKycVendor) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            title="View Details"
            onClick={() => {
              setSelectedVendorId(row.vendorId);
              setDrawerTab('profile');
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Re-KYC Scheduling & Periodic Reviews</h2>
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Re-KYC Scheduling</div>
        </div>
        <div>
          <Button onClick={exportToCSV} variant="secondary" size="md">
            <Download size={16} style={{ marginRight: '6px' }} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Dashboard */}
      <div className={styles.kpiGrid}>
        <div 
          className={`${styles.kpiCard} ${activeCard === 'total' ? styles.kpiCardActive : ''}`} 
          data-card="total"
          onClick={() => handleKpiClick('total')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{totalCount}</span>
          <span className={styles.kpiFooter}>Compliance Directory</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'active' ? styles.kpiCardActive : ''}`} 
          data-card="active"
          onClick={() => handleKpiClick('active')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Re-KYC</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{activeCount}</span>
          <span className={styles.kpiFooter}>Valid Compliance</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'duesoon' ? styles.kpiCardActive : ''}`} 
          data-card="duesoon"
          onClick={() => handleKpiClick('duesoon')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Due Soon</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{dueSoonCount}</span>
          <span className={styles.kpiFooter}>Within 90 Days</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'actionrequired' ? styles.kpiCardActive : ''}`} 
          data-card="actionrequired"
          onClick={() => handleKpiClick('actionrequired')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Action Required</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ffe4e6', color: '#be123c' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{actionRequiredCount}</span>
          <span className={styles.kpiFooter}>Within 30 Days</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'overdue' ? styles.kpiCardActive : ''}`} 
          data-card="overdue"
          onClick={() => handleKpiClick('overdue')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Overdue Reviews</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{overdueCount}</span>
          <span className={styles.kpiFooter}>Escalation Triggered</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'completed' ? styles.kpiCardActive : ''}`} 
          data-card="completed"
          onClick={() => handleKpiClick('completed')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Completed</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ccfbf1', color: '#0d9488' }}>
              <Check size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{completedCount}</span>
          <span className={styles.kpiFooter}>Renewed This Month</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Side: Search, Filters, Data Grid */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.filters}>
                <div className={styles.searchWrap}>
                  <Input
                    className={styles.searchInput}
                    placeholder="Search vendor..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      updateUrlParams(activeCard, riskFilter, statusFilter);
                    }}
                  />
                </div>

                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value);
                    updateUrlParams(activeCard, e.target.value, statusFilter);
                  }}
                >
                  <option value="All">Risk: All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    let card = 'total';
                    if (e.target.value === 'Active') card = 'active';
                    else if (e.target.value === 'Due Soon') card = 'duesoon';
                    else if (e.target.value === 'Action Required') card = 'actionrequired';
                    else if (e.target.value === 'Overdue') card = 'overdue';
                    else if (e.target.value === 'Completed') card = 'completed';
                    updateUrlParams(card, riskFilter, e.target.value);
                  }}
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    updateUrlParams(activeCard, riskFilter, statusFilter);
                  }}
                >
                  <option value="All">Category: All</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Security">Security</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Others">Others</option>
                </select>

                {(riskFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setRiskFilter('All');
                      setStatusFilter('All');
                      setCategoryFilter('All');
                      setSearchQuery('');
                      setSearchParams({});
                      setActiveCard('total');
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                Loading scheduling timeline records...
              </div>
            ) : (
              <DataTable
                columns={tableColumns as any}
                data={filteredVendors}
                keyExtractor={(row) => row.vendorId}
              />
            )}
          </Card>
        </div>

        {/* Right Side: Charts & Alert Panel */}
        <div className={styles.sideSection}>
          {/* Chart 1: Re-KYC Status Distribution */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Re-KYC Status Distribution</div>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Vendors`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {statusDistData.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: item.color }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Risk Levels */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Risk Profile Breakdown</div>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Vendors`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {riskDistData.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: item.color }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Overdue Vendor Analysis */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Overdue Reviews Analysis (Days)</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overdueAnalysisData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="overdueDays" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Upcoming Reviews Timeline */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Upcoming Reviews Timeline (Days Remaining)</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={upcomingReviewsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Monthly Re-KYC Completion Trend */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Monthly Re-KYC Completion Trend</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={colors[0]} strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active alerts panel */}
          <div className={styles.alertsCard}>
            <div className={styles.sectionTitle} style={{ borderBottomColor: '#fecdd3', color: '#991b1b' }}>
              Compliance Alerts feed
            </div>
            <div className={styles.alertList}>
              {vendors.flatMap(v => (v.alerts || []).map(al => ({ ...al, vendorName: v.vendorName, vendorId: v.vendorId }))).slice(0, 5).map((al, idx) => (
                <div key={idx} className={styles.alertItem} style={{ borderLeftColor: al.severity === 'critical' ? '#dc2626' : al.severity === 'high' ? '#ea580c' : '#d97706' }}>
                  <div className={styles.alertText}>
                    <strong>{al.vendorName} ({al.vendorId})</strong>: {al.message}
                  </div>
                </div>
              ))}
              {vendors.flatMap(v => v.alerts || []).length === 0 && (
                <div style={{ fontSize: '0.75rem', color: '#991b1b', textAlign: 'center' }}>
                  All scheduled Re-KYC parameters are currently active and compliant.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Re-KYC Profile Screen Side-Drawer */}
      {selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3>{selectedVendor.vendorName}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  ID: {selectedVendor.vendorId} | Category: {selectedVendor.vendorCategory} | Risk: {selectedVendor.riskLevel}
                </div>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedVendorId(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerTabs}>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'profile' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('profile')}
              >
                Re-KYC Profile
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'workflow' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Verification Workflow
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'reminders' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('reminders')}
              >
                Notifications & Reminders
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'history' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                Audits & Evidence Files
              </button>
            </div>

            <div className={styles.drawerBody}>
              {drawerTab === 'profile' && (
                <>
                  {selectedVendor.reKycStatus === 'Overdue' && (
                    <div className={styles.restrictionBanner}>
                      <ShieldAlert size={20} />
                      <span>⚠ Re-KYC Overdue – Compliance Action Required</span>
                    </div>
                  )}

                  {selectedVendor.daysRemaining <= -90 && (
                    <div className={styles.restrictionBanner} style={{ backgroundColor: '#fee2e2', borderColor: '#fecdd3', color: '#991b1b' }}>
                      <ShieldAlert size={20} />
                      <span>🔴 Vendor Suspended Due To Overdue Re-KYC</span>
                    </div>
                  )}

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Building size={14} />
                      Validation Schedule Summary
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Compliance KYC Date</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastKycDate}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Risk-Based Frequency</span>
                        <span className={styles.overviewVal}>
                          {selectedVendor.riskLevel === 'Low' ? 'Every 3 Years' : selectedVendor.riskLevel === 'Medium' ? 'Every 2 Years' : 'Every 1 Year'}
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Next Re-KYC Deadline</span>
                        <span className={styles.overviewVal}>{selectedVendor.nextReKycDate}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Timeline Days Remaining</span>
                        <span className={styles.overviewVal} style={{ color: selectedVendor.daysRemaining <= 0 ? '#dc2626' : '#16a34a' }}>
                          {selectedVendor.daysRemaining <= 0 ? `Overdue by ${Math.abs(selectedVendor.daysRemaining)} days` : `${selectedVendor.daysRemaining} days`}
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Assigned Reviewer</span>
                        <span className={styles.overviewVal}>{selectedVendor.assignedTo}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Auto Reminders Status</span>
                        <span className={styles.overviewVal}>{selectedVendor.autoReminderEnabled ? 'Active/Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Users size={14} />
                      Risk & Review Alignment
                    </div>
                    <div className={styles.grid2Col}>
                      <div style={{ textAlign: 'center', padding: '12px', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                          Assessed Risk
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0', color: selectedVendor.riskLevel === 'High' ? '#dc2626' : '#16a34a' }}>
                          {selectedVendor.riskLevel}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                          Risk-based Review
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', padding: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          Status: <strong>{selectedVendor.reKycStatus}</strong>
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                          {selectedVendor.reKycStatus === 'Overdue' 
                            ? '⚠ Scheduled Re-KYC deadlines have been breached. Restrict contract renewals and onboarding activities.'
                            : '✅ Scheduled cycle remains active. Regular reminders will propagate.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedVendor.workflow?.status === 'Pending' && (
                    <Button onClick={handleTriggerReKyc} style={{ width: '100%' }}>
                      Trigger Re-KYC Outreaches
                    </Button>
                  )}
                </>
              )}

              {drawerTab === 'workflow' && (
                <div className={styles.drawerCard}>
                  <div className={styles.drawerSectionTitle}>Re-Verification Workflow</div>
                  {selectedVendor.workflow?.status === 'Pending' ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      Re-KYC Outreaches have not been triggered yet. Click "Trigger Re-KYC" in the profile tab to start.
                    </div>
                  ) : (
                    <>
                      <div className={styles.workflowBoard}>
                        <div className={styles.workflowStage}>
                          <span className={styles.stageName}>Document Collection</span>
                          <Badge variant={selectedVendor.workflow.stage === 'Document Collection' ? 'warning' : 'success'}>
                            {selectedVendor.workflow.stage === 'Document Collection' ? 'Active' : 'Passed'}
                          </Badge>
                        </div>
                        <div className={styles.workflowStage}>
                          <span className={styles.stageName}>KYC Verification</span>
                          <Badge variant={selectedVendor.workflow.stage === 'Verification' ? 'warning' : (selectedVendor.workflow.stage === 'Document Collection' ? 'default' : 'success')}>
                            {selectedVendor.workflow.stage === 'Verification' ? 'Active' : (selectedVendor.workflow.stage === 'Document Collection' ? 'Pending' : 'Passed')}
                          </Badge>
                        </div>
                        <div className={styles.workflowStage}>
                          <span className={styles.stageName}>Risk Assessment</span>
                          <Badge variant={selectedVendor.workflow.stage === 'Risk Assessment' ? 'warning' : (['Document Collection', 'Verification'].includes(selectedVendor.workflow.stage) ? 'default' : 'success')}>
                            {selectedVendor.workflow.stage === 'Risk Assessment' ? 'Active' : (['Document Collection', 'Verification'].includes(selectedVendor.workflow.stage) ? 'Pending' : 'Passed')}
                          </Badge>
                        </div>
                        <div className={styles.workflowStage}>
                          <span className={styles.stageName}>Compliance Review</span>
                          <Badge variant={selectedVendor.workflow.stage === 'Compliance Review' ? 'warning' : (['Document Collection', 'Verification', 'Risk Assessment'].includes(selectedVendor.workflow.stage) ? 'default' : 'success')}>
                            {selectedVendor.workflow.stage === 'Compliance Review' ? 'Active' : (['Document Collection', 'Verification', 'Risk Assessment'].includes(selectedVendor.workflow.stage) ? 'Pending' : 'Passed')}
                          </Badge>
                        </div>
                        <div className={styles.workflowStage}>
                          <span className={styles.stageName}>Workflow Approvals</span>
                          <Badge variant={selectedVendor.workflow.stage === 'Approval' ? 'warning' : (['Document Collection', 'Verification', 'Risk Assessment', 'Compliance Review'].includes(selectedVendor.workflow.stage) ? 'default' : 'success')}>
                            {selectedVendor.workflow.stage === 'Approval' ? 'Active' : (['Document Collection', 'Verification', 'Risk Assessment', 'Compliance Review'].includes(selectedVendor.workflow.stage) ? 'Pending' : 'Passed')}
                          </Badge>
                        </div>
                      </div>

                      {selectedVendor.workflow.stage !== 'Re-KYC Completed' && (
                        <form className={styles.workflowForm} onSubmit={handleWorkflowUpdate}>
                          <div className={styles.drawerSectionTitle} style={{ marginTop: '12px' }}>Update Stage Decision</div>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Stage</label>
                              <select 
                                className={styles.formSelect}
                                value={workflowStage}
                                onChange={(e) => setWorkflowStage(e.target.value as any)}
                              >
                                <option value="Document Collection">Document Collection</option>
                                <option value="Verification">KYC Verification</option>
                                <option value="Risk Assessment">Risk Assessment</option>
                                <option value="Compliance Review">Compliance Review</option>
                                <option value="Approval">Approval</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Workflow Status</label>
                              <select 
                                className={styles.formSelect}
                                value={workflowStatus}
                                onChange={(e) => setWorkflowStatus(e.target.value as any)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Under Investigation">Under Investigation</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Review Comments</label>
                            <textarea
                              className={styles.formTextarea}
                              placeholder="Review details..."
                              value={workflowComments}
                              onChange={(e) => setWorkflowComments(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={submittingWorkflow}>
                            {submittingWorkflow ? 'Updating stage...' : 'Update Stage'}
                          </Button>
                        </form>
                      )}

                      {selectedVendor.workflow.stage === 'Approval' && (
                        <form className={styles.workflowForm} style={{ marginTop: '20px', borderTop: '2px dashed var(--color-border)', paddingTop: '16px' }} onSubmit={handleSubmitFinalReKyc}>
                          <div className={styles.drawerSectionTitle}>Complete Re-KYC Renewals</div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Final Audit Comments</label>
                            <input 
                              type="text" 
                              className={styles.formInput} 
                              placeholder="Ex. Vendor remains compliant. Scheduling next periodic review..."
                              value={submissionComments} 
                              onChange={(e) => setSubmissionComments(e.target.value)} 
                              required
                            />
                          </div>
                          <Button type="submit" disabled={submittingKyc} style={{ backgroundColor: '#0d9488' }}>
                            {submittingKyc ? 'Renewing KYC cycle...' : 'Complete & Renew Re-KYC Cycle'}
                          </Button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}

              {drawerTab === 'reminders' && (
                <div className={styles.drawerCard}>
                  <div className={styles.drawerSectionTitle}>Reminder Outreach Timeline</div>
                  <div className={styles.reminderList}>
                    {reminders.filter(r => r.vendorId === selectedVendor.vendorId).map((rem, idx) => (
                      <div key={idx} className={styles.reminderItem}>
                        <div className={styles.reminderInfo}>
                          <span className={styles.reminderType}>{rem.reminderType}</span>
                          <span className={styles.reminderDate}>Outreach: {rem.scheduledDate}</span>
                        </div>
                        <Badge variant={rem.status === 'Sent' ? 'success' : 'warning'}>
                          {rem.status}
                        </Badge>
                      </div>
                    ))}
                    {reminders.filter(r => r.vendorId === selectedVendor.vendorId).length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                        No scheduled reminders found. Auto Reminders are scheduled based on deadline breaches.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerTab === 'history' && (
                <>
                  {/* File Upload Evidence */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>Supporting Evidence Uploads</div>
                    <div className={styles.fileUploadContainer}>
                      <div 
                        className={styles.uploadArea}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={24} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto' }} />
                        <span className={styles.uploadText}>
                          {uploadingFile ? 'Uploading file...' : 'Click to upload Re-KYC document (PDF/JPG)'}
                        </span>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          style={{ display: 'none' }} 
                        />
                      </div>

                      <div className={styles.evidenceFileList}>
                        {(selectedVendor.evidenceFiles || []).map((file, idx) => (
                          <div key={idx} className={styles.evidenceFileItem}>
                            <div>
                              <div className={styles.fileNameText}>{file.fileName}</div>
                              <div className={styles.fileMetaText}>
                                By: {file.uploadedBy} on {file.uploadedOn}
                              </div>
                            </div>
                            <a 
                              href={`http://localhost:5000${file.filePath}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={styles.actionBtn}
                              style={{ color: 'var(--color-primary)' }}
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ))}
                        {(selectedVendor.evidenceFiles || []).length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                            No evidence reports attached yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>Audits Trail History</div>
                    <div className={styles.historyList}>
                      {(selectedVendor.reviewHistory || []).map((log, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>{log.result}</span>
                            <span>{log.reviewer}</span>
                          </div>
                          <div>{log.comments}</div>
                          <div className={styles.historyMeta}>
                            <span>Review Date: {log.reviewDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
