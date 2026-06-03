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
  Check,
  AlertOctagon,
  FileText,
  MessageSquare
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
import styles from './KycApprovals.module.css';

interface WorkflowStageDetails {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back' | 'On Hold';
  approver?: string;
  actionDate?: string;
}

interface WorkflowData {
  requester: WorkflowStageDetails;
  procurement: WorkflowStageDetails;
  compliance: WorkflowStageDetails;
  legal: WorkflowStageDetails;
  finalApproval: WorkflowStageDetails;
}

interface ApprovalComment {
  stage: string;
  comment: string;
  commentedBy: string;
  commentDate: string;
}

interface ApprovalHistoryEntry {
  stage: string;
  action: string;
  performedBy: string;
  actionDate: string;
  comments?: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface AuditHistoryEntry {
  action: string;
  performedBy: string;
  actionDate: string;
  remarks?: string;
}

interface ApprovalRequest {
  requestId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  submittedDate: string;
  currentStage: 'Requester' | 'Procurement' | 'Compliance' | 'Legal' | 'Final Approval' | 'Completed';
  overallStatus: 'Pending' | 'Approved' | 'Vendor Approved' | 'Rejected' | 'Sent Back' | 'On Hold' | 'Overdue';
  pendingWith: string;
  slaDueDate: string;
  workflow: WorkflowData;
  comments: ApprovalComment[];
  approvalHistory: ApprovalHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  auditHistory: AuditHistoryEntry[];
  alert?: string;
}

export const KycApprovals: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeCard, setActiveCard] = useState('total');

  // Selected Request Drawer States
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [drawerTab, setDrawerTab] = useState<'workflow' | 'profile' | 'history'>('workflow');

  // Form states
  const [actionDecision, setActionDecision] = useState<'Approve' | 'Reject' | 'Send Back' | 'Put On Hold' | 'Request Clarification'>('Approve');
  const [actionComments, setActionComments] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchApprovalsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/approvals');
      setRequests(res.data.approvalRequests || []);
    } catch (err) {
      console.error('Error fetching approvals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, []);

  // Sync state from URL params
  useEffect(() => {
    const riskParam = searchParams.get('risk') || '';
    const statusParam = searchParams.get('status') || '';
    const stageParam = searchParams.get('stage') || '';
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setCategoryFilter(categoryParam);
    if (stageParam) setStageFilter(stageParam);

    if (statusParam === 'pending') {
      setStatusFilter('Pending');
      setActiveCard('pending');
    } else if (statusParam === 'approved') {
      setStatusFilter('Vendor Approved');
      setActiveCard('approved');
    } else if (statusParam === 'rejected') {
      setStatusFilter('Rejected');
      setActiveCard('rejected');
    } else if (statusParam === 'sentback') {
      setStatusFilter('Sent Back');
      setActiveCard('sentback');
    } else if (statusParam === 'overdue') {
      setStatusFilter('Overdue');
      setActiveCard('overdue');
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
  const updateUrlParams = (newActiveCard: string, riskVal: string, statusVal: string, stageVal: string) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'All') params.category = categoryFilter;
    if (stageVal !== 'All') params.stage = stageVal;

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

    if (card === 'pending') s = 'Pending';
    else if (card === 'approved') s = 'Vendor Approved';
    else if (card === 'rejected') s = 'Rejected';
    else if (card === 'sentback') s = 'Sent Back';
    else if (card === 'overdue') s = 'Overdue';

    setStatusFilter(s);
    setRiskFilter(r);
    updateUrlParams(card, r, s, stageFilter);
  };

  // Filters logic
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pendingWith.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' ? true : r.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' ? true : r.overallStatus === statusFilter;
    const matchesStage = stageFilter === 'All' ? true : r.currentStage === stageFilter;
    const matchesCategory = categoryFilter === 'All' ? true : r.category === categoryFilter;

    return matchesSearch && matchesRisk && matchesStatus && matchesStage && matchesCategory;
  });

  // KPI Calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.overallStatus === 'Pending').length;
  const approvedCount = requests.filter(r => r.overallStatus === 'Vendor Approved').length;
  const rejectedCount = requests.filter(r => r.overallStatus === 'Rejected').length;
  const sentbackCount = requests.filter(r => r.overallStatus === 'Sent Back').length;
  const overdueCount = requests.filter(r => r.overallStatus === 'Overdue').length;

  const fetchSingleRequest = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/approvals/${id}`);
      setSelectedRequest(res.data);
      setActionComments('');
      setActionDecision('Approve');
    } catch (err) {
      console.error('Error fetching single approval profile:', err);
    }
  };

  useEffect(() => {
    if (selectedRequestId) {
      fetchSingleRequest(selectedRequestId);
    } else {
      setSelectedRequest(null);
    }
  }, [selectedRequestId]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmittingAction(true);
      const res = await axios.post('/api/kyc/approvals/action', {
        requestId: selectedRequest.requestId,
        action: actionDecision,
        comments: actionComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchApprovalsData();
        await fetchSingleRequest(selectedRequest.requestId);
      }
    } catch (err) {
      console.error('Error submitting workflow action:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedRequest) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');

      const uploadRes = await axios.post('/api/kyc/approvals/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const attachRes = await axios.post('/api/kyc/approvals/attach-file', {
          requestId: selectedRequest.requestId,
          fileMetadata: uploadRes.data.file
        });

        if (attachRes.data.success) {
          await fetchSingleRequest(selectedRequest.requestId);
        }
      }
    } catch (err) {
      console.error('Error uploading evidence file:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  // Recharts Data Mapping
  // 1. Approval Status Distribution (Pie)
  const statusDistData = [
    { name: 'Pending', value: requests.filter(r => r.overallStatus === 'Pending').length, color: '#3b82f6' },
    { name: 'Approved', value: requests.filter(r => r.overallStatus === 'Vendor Approved').length, color: '#16a34a' },
    { name: 'Rejected', value: requests.filter(r => r.overallStatus === 'Rejected').length, color: '#dc2626' },
    { name: 'Sent Back', value: requests.filter(r => r.overallStatus === 'Sent Back').length, color: '#f59e0b' },
    { name: 'On Hold', value: requests.filter(r => r.overallStatus === 'On Hold').length, color: '#8b5cf6' },
    { name: 'Overdue', value: requests.filter(r => r.overallStatus === 'Overdue').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // 2. Stage-wise Pending requests (Bar)
  const stagePendingData = [
    { stage: 'Requester', count: requests.filter(r => r.currentStage === 'Requester' && r.overallStatus !== 'Vendor Approved' && r.overallStatus !== 'Rejected').length },
    { stage: 'Procurement', count: requests.filter(r => r.currentStage === 'Procurement' && r.overallStatus !== 'Vendor Approved' && r.overallStatus !== 'Rejected').length },
    { stage: 'Compliance', count: requests.filter(r => r.currentStage === 'Compliance' && r.overallStatus !== 'Vendor Approved' && r.overallStatus !== 'Rejected').length },
    { stage: 'Legal', count: requests.filter(r => r.currentStage === 'Legal' && r.overallStatus !== 'Vendor Approved' && r.overallStatus !== 'Rejected').length },
    { stage: 'Final Approval', count: requests.filter(r => r.currentStage === 'Final Approval' && r.overallStatus !== 'Vendor Approved' && r.overallStatus !== 'Rejected').length }
  ];

  // 3. Monthly Approval Trends
  const monthlyTrendData = [
    { month: 'Jan', approved: 2, rejected: 0, pending: 1 },
    { month: 'Feb', approved: 4, rejected: 1, pending: 2 },
    { month: 'Mar', approved: 5, rejected: 0, pending: 3 },
    { month: 'Apr', approved: 7, rejected: 2, pending: 2 },
    { month: 'May', approved: approvedCount, rejected: rejectedCount, pending: pendingCount }
  ];

  // 4. SLA Compliance Trend
  const slaComplianceData = [
    { month: 'Mar', compliant: 90, breached: 10 },
    { month: 'Apr', compliant: 95, breached: 5 },
    { month: 'May', compliant: Math.round(((totalCount - overdueCount) / (totalCount || 1)) * 100), breached: Math.round((overdueCount / (totalCount || 1)) * 100) }
  ];

  // 5. Risk Level vs Approval Status
  const riskStatusData = ['Low', 'Medium', 'High', 'Critical'].map(level => ({
    risk: level,
    Approved: requests.filter(r => r.riskLevel === level && r.overallStatus === 'Vendor Approved').length,
    Pending: requests.filter(r => r.riskLevel === level && ['Pending', 'Overdue', 'On Hold'].includes(r.overallStatus)).length,
    Rejected: requests.filter(r => r.riskLevel === level && r.overallStatus === 'Rejected').length
  }));

  // CSV Export utility
  const exportToCSV = () => {
    const headers = [
      'Request ID', 'Vendor ID', 'Vendor Name', 'Category', 'Risk Level', 
      'Submitted Date', 'Current Stage', 'Overall Status', 'Pending With', 'SLA Due Date'
    ];

    const rows = filteredRequests.map(r => [
      r.requestId,
      r.vendorId,
      r.vendorName,
      r.category,
      r.riskLevel,
      r.submittedDate,
      r.currentStage,
      r.overallStatus,
      r.pendingWith,
      r.slaDueDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_KYC_Approvals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableColumns: Column<ApprovalRequest>[] = [
    {
      header: 'Request Details',
      accessor: (row: ApprovalRequest) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.requestId}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Vendor: {row.vendorName} ({row.vendorId})</div>
        </div>
      )
    },
    { header: 'Category', accessor: (row: ApprovalRequest) => row.category },
    {
      header: 'Risk Level',
      accessor: (row: ApprovalRequest) => (
        <Badge variant={row.riskLevel === 'Low' ? 'success' : row.riskLevel === 'Medium' ? 'warning' : 'danger'}>
          {row.riskLevel}
        </Badge>
      )
    },
    { header: 'Submitted Date', accessor: (row: ApprovalRequest) => row.submittedDate },
    { header: 'Current Stage', accessor: (row: ApprovalRequest) => row.currentStage },
    {
      header: 'Overall Status',
      accessor: (row: ApprovalRequest) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
        if (row.overallStatus === 'Vendor Approved') variant = 'success';
        else if (row.overallStatus === 'Pending') variant = 'info';
        else if (row.overallStatus === 'On Hold') variant = 'warning';
        else if (row.overallStatus === 'Sent Back' || row.overallStatus === 'Rejected' || row.overallStatus === 'Overdue') variant = 'danger';
        return (
          <Badge variant={variant}>
            {row.overallStatus === 'Overdue' ? '🔴 Overdue' : row.overallStatus}
          </Badge>
        );
      }
    },
    { header: 'Pending With', accessor: (row: ApprovalRequest) => row.pendingWith },
    {
      header: 'SLA Due Date',
      accessor: (row: ApprovalRequest) => {
        const isOverdue = row.overallStatus === 'Overdue';
        return (
          <span style={{ fontWeight: 600, color: isOverdue ? '#dc2626' : 'var(--color-text-primary)' }}>
            {row.slaDueDate}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: ApprovalRequest) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            title="View Details"
            onClick={() => {
              setSelectedRequestId(row.requestId);
              setDrawerTab('workflow');
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
          <h2 className={styles.title}>Vendor KYC Due Diligence & Approvals</h2>
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Final Gatekeeper Approvals</div>
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
          onClick={() => handleKpiClick('total')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Requests</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{totalCount}</span>
          <span className={styles.kpiFooter}>Lifetime Workflow Runs</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'pending' ? styles.kpiCardActive : ''}`} 
          onClick={() => handleKpiClick('pending')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Approvals</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#2563eb' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{pendingCount}</span>
          <span className={styles.kpiFooter}>Awaiting Decision</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'approved' ? styles.kpiCardActive : ''}`} 
          onClick={() => handleKpiClick('approved')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Approved Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{approvedCount}</span>
          <span className={styles.kpiFooter}>Activated for Business</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'rejected' ? styles.kpiCardActive : ''}`} 
          onClick={() => handleKpiClick('rejected')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Rejected Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ffe4e6', color: '#dc2626' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{rejectedCount}</span>
          <span className={styles.kpiFooter}>Blocked Onboards</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'sentback' ? styles.kpiCardActive : ''}`} 
          onClick={() => handleKpiClick('sentback')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Sent Back Requests</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <RefreshCw size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{sentbackCount}</span>
          <span className={styles.kpiFooter}>Clarifications Requested</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'overdue' ? styles.kpiCardActive : ''}`} 
          onClick={() => handleKpiClick('overdue')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Overdue Approvals</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{overdueCount}</span>
          <span className={styles.kpiFooter}>SLA Breached Outreaches</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Side: Advanced Filters & Table */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.filters}>
                <div className={styles.searchWrap}>
                  <Input
                    className={styles.searchInput}
                    placeholder="Search requestId, name or ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      updateUrlParams(activeCard, riskFilter, statusFilter, stageFilter);
                    }}
                  />
                </div>

                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value);
                    updateUrlParams(activeCard, e.target.value, statusFilter, stageFilter);
                  }}
                >
                  <option value="All">Risk: All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    let card = 'total';
                    if (e.target.value === 'Pending') card = 'pending';
                    else if (e.target.value === 'Vendor Approved') card = 'approved';
                    else if (e.target.value === 'Rejected') card = 'rejected';
                    else if (e.target.value === 'Sent Back') card = 'sentback';
                    else if (e.target.value === 'Overdue') card = 'overdue';
                    updateUrlParams(card, riskFilter, e.target.value, stageFilter);
                  }}
                >
                  <option value="All">Status: All</option>
                  <option value="Pending">Pending</option>
                  <option value="Vendor Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Sent Back">Sent Back</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Overdue">Overdue</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={stageFilter}
                  onChange={(e) => {
                    setStageFilter(e.target.value);
                    updateUrlParams(activeCard, riskFilter, statusFilter, e.target.value);
                  }}
                >
                  <option value="All">Stage: All</option>
                  <option value="Requester">Requester</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Legal">Legal</option>
                  <option value="Final Approval">Final Approval</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    updateUrlParams(activeCard, riskFilter, statusFilter, stageFilter);
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

                {(riskFilter !== 'All' || statusFilter !== 'All' || stageFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setRiskFilter('All');
                      setStatusFilter('All');
                      setStageFilter('All');
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
                Loading approvals queue...
              </div>
            ) : (
              <DataTable
                columns={tableColumns as any}
                data={filteredRequests}
                keyExtractor={(row) => row.requestId}
              />
            )}
          </Card>
        </div>

        {/* Right Side: Recharts widgets */}
        <div className={styles.sideSection}>
          {/* Chart 1: Status Dist */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Approval Status Distribution</div>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} Requests`, 'Volume']} />
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

          {/* Chart 2: Stage Pending Barchart */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Stage-wise Pending Requests</div>
            <div style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stagePendingData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Risk Level Stacked Barchart */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Risk Profile vs Approval Status</div>
            <div style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskStatusData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="risk" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="Approved" stackId="a" fill="#16a34a" />
                  <Bar dataKey="Pending" stackId="a" fill="#eab308" />
                  <Bar dataKey="Rejected" stackId="a" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Completion Trend */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Monthly Approvals Trend</div>
            <div style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="approved" name="Approved" stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" name="Awaiting" stroke="#eab308" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: SLA Compliance */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>SLA Compliance Rate (%)</div>
            <div style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaComplianceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="compliant" name="Compliant" fill="#22c55e" />
                  <Bar dataKey="breached" name="Breached" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Details View side-drawer */}
      {selectedRequest && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedRequestId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3>{selectedRequest.vendorName}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  Request: {selectedRequest.requestId} | Vendor ID: {selectedRequest.vendorId} | Risk: {selectedRequest.riskLevel}
                </div>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedRequestId(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerTabs}>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'workflow' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Approval Workflow
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'profile' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('profile')}
              >
                Due Diligence Details
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'history' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit & Comment Log
              </button>
            </div>

            <div className={styles.drawerBody}>
              {drawerTab === 'workflow' && (
                <>
                  {selectedRequest.overallStatus === 'Overdue' && (
                    <div className={styles.restrictionBanner}>
                      <ShieldAlert size={18} />
                      <span>⚠ SLA Exceeded: Approval Pending Beyond Limit</span>
                    </div>
                  )}

                  {selectedRequest.overallStatus === 'Vendor Approved' && (
                    <div className={styles.successBanner}>
                      <CheckCircle2 size={18} />
                      <span>✅ Vendor Approved for Business Transactions</span>
                    </div>
                  )}

                  {selectedRequest.overallStatus === 'Rejected' && (
                    <div className={styles.restrictionBanner} style={{ backgroundColor: '#fee2e2', borderColor: '#fecdd3', color: '#991b1b' }}>
                      <AlertOctagon size={18} />
                      <span>❌ Vendor Approval Rejected</span>
                    </div>
                  )}

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Clock size={14} />
                      Multi-Level Stage Tracker
                    </div>

                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <div className={`${styles.stageDot} ${selectedRequest.workflow.requester.status === 'Approved' ? styles.stageDotApproved : styles.stageDotPending}`} />
                        <span className={styles.stageName}>Requester Onboarding Request</span>
                        <Badge variant={selectedRequest.workflow.requester.status === 'Approved' ? 'success' : 'warning'}>
                          {selectedRequest.workflow.requester.status === 'Approved' ? 'Submitted' : 'Pending'}
                        </Badge>
                      </div>

                      <div className={styles.workflowStage}>
                        <div className={`${styles.stageDot} ${selectedRequest.workflow.procurement.status === 'Approved' ? styles.stageDotApproved : (selectedRequest.currentStage === 'Procurement' ? styles.stageDotPending : '')}`} />
                        <span className={styles.stageName}>Procurement Manager Approval</span>
                        <Badge variant={selectedRequest.workflow.procurement.status === 'Approved' ? 'success' : (selectedRequest.currentStage === 'Procurement' ? 'warning' : 'default')}>
                          {selectedRequest.workflow.procurement.status === 'Approved' ? 'Approved' : (selectedRequest.currentStage === 'Procurement' ? 'Active' : 'Awaiting')}
                        </Badge>
                      </div>

                      <div className={styles.workflowStage}>
                        <div className={`${styles.stageDot} ${selectedRequest.workflow.compliance.status === 'Approved' ? styles.stageDotApproved : (selectedRequest.currentStage === 'Compliance' ? styles.stageDotPending : '')}`} />
                        <span className={styles.stageName}>Compliance Team Clearance</span>
                        <Badge variant={selectedRequest.workflow.compliance.status === 'Approved' ? 'success' : (selectedRequest.currentStage === 'Compliance' ? 'warning' : 'default')}>
                          {selectedRequest.workflow.compliance.status === 'Approved' ? 'Approved' : (selectedRequest.currentStage === 'Compliance' ? 'Active' : 'Awaiting')}
                        </Badge>
                      </div>

                      <div className={styles.workflowStage}>
                        <div className={`${styles.stageDot} ${selectedRequest.workflow.legal.status === 'Approved' ? styles.stageDotApproved : (selectedRequest.currentStage === 'Legal' ? styles.stageDotPending : '')}`} />
                        <span className={styles.stageName}>Legal Review Resolution</span>
                        <Badge variant={selectedRequest.workflow.legal.status === 'Approved' ? 'success' : (selectedRequest.currentStage === 'Legal' ? 'warning' : 'default')}>
                          {selectedRequest.workflow.legal.status === 'Approved' ? 'Approved' : (selectedRequest.currentStage === 'Legal' ? 'Active' : 'Awaiting')}
                        </Badge>
                      </div>

                      <div className={styles.workflowStage}>
                        <div className={`${styles.stageDot} ${selectedRequest.workflow.finalApproval.status === 'Approved' ? styles.stageDotApproved : (selectedRequest.currentStage === 'Final Approval' ? styles.stageDotPending : '')}`} />
                        <span className={styles.stageName}>Final Executive Approver Signoff</span>
                        <Badge variant={selectedRequest.workflow.finalApproval.status === 'Approved' ? 'success' : (selectedRequest.currentStage === 'Final Approval' ? 'warning' : 'default')}>
                          {selectedRequest.workflow.finalApproval.status === 'Approved' ? 'Approved' : (selectedRequest.currentStage === 'Final Approval' ? 'Active' : 'Awaiting')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Decision action controls */}
                  {["Pending", "Sent Back", "On Hold", "Overdue"].includes(selectedRequest.overallStatus) && (
                    <div className={styles.drawerCard}>
                      <div className={styles.drawerSectionTitle}>
                        <Check size={14} />
                        checker Stage Decision Controls
                      </div>

                      <form onSubmit={handleActionSubmit} className={styles.actionForm}>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Action Decision</label>
                            <select 
                              className={styles.formSelect}
                              value={actionDecision}
                              onChange={(e) => setActionDecision(e.target.value as any)}
                            >
                              <option value="Approve">Approve Stage</option>
                              <option value="Reject">Reject Vendor</option>
                              <option value="Send Back">Send Back to Requester</option>
                              <option value="Put On Hold">Put On Hold</option>
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Stage Owner Signature</label>
                            <Input value={user?.fullName || 'Saurabh Anand'} disabled />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Decision Comments (Required for Reject/Send Back)</label>
                          <textarea 
                            className={styles.formTextarea} 
                            placeholder="Provide assessment comments or feedback guidelines..."
                            value={actionComments}
                            onChange={(e) => setActionComments(e.target.value)}
                            required={["Reject", "Send Back"].includes(actionDecision)}
                          />
                        </div>

                        <div className={styles.submitBtnGroup}>
                          <Button 
                            type="submit" 
                            disabled={submittingAction} 
                            style={{ 
                              backgroundColor: actionDecision === 'Reject' ? '#dc2626' : (actionDecision === 'Send Back' ? '#f59e0b' : '#2563eb'),
                              borderColor: actionDecision === 'Reject' ? '#dc2626' : (actionDecision === 'Send Back' ? '#f59e0b' : '#2563eb'),
                              color: 'white'
                            }}
                          >
                            {submittingAction ? 'Processing...' : 'Submit Action'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}

              {drawerTab === 'profile' && (
                <>
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Building size={14} />
                      Vendor Baseline Identification
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Legal Entity Name</span>
                        <span className={styles.overviewVal}>{selectedRequest.vendorName}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Vendor Identification Code</span>
                        <span className={styles.overviewVal}>{selectedRequest.vendorId}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Sourcing Category</span>
                        <span className={styles.overviewVal}>{selectedRequest.category}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Onboarding Requestor</span>
                        <span className={styles.overviewVal}>Saurabh Anand (Procurement Dept)</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Initial Submission Date</span>
                        <span className={styles.overviewVal}>{selectedRequest.submittedDate}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>SLA Resolution Target</span>
                        <span className={styles.overviewVal}>{selectedRequest.slaDueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <ShieldAlert size={14} />
                      Due Diligence Results & Compliance Checklist
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.kycRow}>
                        <span>1. Baseline AML/KYC Verifications</span>
                        <Badge variant="success">Passed</Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>2. Enterprise Risk Assessment Scorecard</span>
                        <Badge variant={selectedRequest.riskLevel === 'Low' ? 'success' : 'warning'}>
                          {selectedRequest.riskLevel === 'Low' ? 'Low Risk' : `${selectedRequest.riskLevel} Risk`}
                        </Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>3. Sanctions Lists Screening (OFAC/UN)</span>
                        <Badge variant="success">Clean (No Matches)</Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>4. Global Regulators Blacklist Check</span>
                        <Badge variant="success">Clean</Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>5. PEP Screening Outreaches</span>
                        <Badge variant="success">Negative Match</Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>6. Reputational & Adverse Media Scan</span>
                        <Badge variant="success">Low Exposure</Badge>
                      </div>
                      <div className={styles.kycRow}>
                        <span>7. Global Shell Company Registers Checklist</span>
                        <Badge variant="success">Passed</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {drawerTab === 'history' && (
                <>
                  {/* File uploads section */}
                  {["Pending", "Sent Back", "On Hold", "Overdue"].includes(selectedRequest.overallStatus) && (
                    <div className={styles.drawerCard}>
                      <div className={styles.drawerSectionTitle}>
                        <Upload size={14} />
                        Attach Supporting Evidence
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                      />
                      <div 
                        className={styles.fileUploadContainer} 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={20} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto' }} />
                        <span>
                          {uploadingFile ? 'Uploading file...' : 'Click to upload and attach audit file (PDF/JPG)'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attached files list */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <FileText size={14} />
                      Verification Documents & Attachments ({selectedRequest.evidenceFiles?.length || 0})
                    </div>
                    <div className={styles.fileList}>
                      {selectedRequest.evidenceFiles?.map((file, idx) => (
                        <div key={idx} className={styles.fileItem}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <a href="#" className={styles.fileName}>
                              <FileText size={12} /> {file.fileName}
                            </a>
                            <span className={styles.fileMeta}>Uploaded by: {file.uploadedBy} on {file.uploadedOn}</span>
                          </div>
                          <button 
                            className={styles.actionBtn} 
                            title="Download File"
                            onClick={() => window.open(file.filePath, '_blank')}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      ))}
                      {(!selectedRequest.evidenceFiles || selectedRequest.evidenceFiles.length === 0) && (
                        <div style={{ padding: '10px 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                          No files attached to this approval request.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Timeline */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <MessageSquare size={14} />
                      Approver Comment Threads
                    </div>
                    <div className={styles.timeline}>
                      {selectedRequest.comments?.map((c, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={styles.timelineDot} />
                          <div className={styles.timelineHeader}>
                            <span className={styles.timelineTitle}>{c.commentedBy} ({c.stage})</span>
                            <span className={styles.timelineDate}>{c.commentDate}</span>
                          </div>
                          <p className={styles.timelineBody}>"{c.comment}"</p>
                        </div>
                      ))}
                      {(!selectedRequest.comments || selectedRequest.comments.length === 0) && (
                        <div style={{ padding: '10px 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                          No comments posted yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Users size={14} />
                      Assessment Audit History Trail
                    </div>
                    <div className={styles.timeline}>
                      {selectedRequest.auditHistory?.map((trail, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={styles.timelineDot} style={{ backgroundColor: '#22c55e' }} />
                          <div className={styles.timelineHeader}>
                            <span className={styles.timelineTitle}>{trail.action}</span>
                            <span className={styles.timelineDate}>{trail.actionDate}</span>
                          </div>
                          <p className={styles.timelineBody}>
                            Performed by: <strong>{trail.performedBy}</strong> {trail.remarks ? ` - ${trail.remarks}` : ''}
                          </p>
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
