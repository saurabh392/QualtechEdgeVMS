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
  Calendar, 
  X, 
  RefreshCw, 
  Upload,
  Globe,
  AlertTriangle,
  Building,
  Users,
  ExternalLink
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
import styles from './KycShellCheck.module.css';

interface ValidationItem {
  status: 'Passed' | 'Failed' | 'Unverified' | 'Missing';
  addressSharedWith?: number;
  employeeCount?: number;
  websiteAvailable?: boolean;
  remarks?: string;
}

interface ShellValidations {
  physicalAddress: ValidationItem;
  employeeCount: ValidationItem;
  websitePresence: ValidationItem;
  financialFilings: ValidationItem;
  businessOperations: ValidationItem;
}

interface AuditHistoryEntry {
  assessmentDate: string;
  performedBy: string;
  riskScore: number;
  result: string;
  actionTaken: string;
  remarks: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface ShellAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ShellVendor {
  vendorId: string;
  vendorName: string;
  country: string;
  pan: string;
  gstin: string;
  validations: ShellValidations;
  shellRiskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  shellCompanyStatus: 'Verified' | 'Additional Verification Required' | 'High Risk' | 'Potential Shell Company';
  lastCheckedOn: string;
  nextReviewDate: string;
  workflow: {
    analyst: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
    riskManager: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
    fraudTeam: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
    legalTeam: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
    procurementHead: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
    final: 'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed';
  };
  assessmentHistory: AuditHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  alerts?: ShellAlert[];
}

export const KycShellCheck: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<ShellVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'Low' | 'Medium' | 'High' | 'Critical'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Verified' | 'Additional Verification Required' ...
  const [countryFilter, setCountryFilter] = useState('All');
  const [reviewDueFilter, setReviewDueFilter] = useState(false);
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<ShellVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'validation' | 'workflow' | 'history'>('profile');

  // Form Fields for Updates
  const [addrStatus, setAddrStatus] = useState<'Passed' | 'Failed' | 'Unverified'>('Passed');
  const [addrShared, setAddrShared] = useState<number>(1);
  const [addrRemarks, setAddrRemarks] = useState('');

  const [empStatus, setEmpStatus] = useState<'Passed' | 'Failed' | 'Unverified'>('Passed');
  const [empCount, setEmpCount] = useState<number>(10);
  const [empRemarks, setEmpRemarks] = useState('');

  const [webStatus, setWebStatus] = useState<'Passed' | 'Failed' | 'Unverified'>('Passed');
  const [webAvail, setWebAvail] = useState<boolean>(true);
  const [webRemarks, setWebRemarks] = useState('');

  const [finStatus, setFinStatus] = useState<'Passed' | 'Failed' | 'Missing' | 'Unverified'>('Passed');
  const [finRemarks, setFinRemarks] = useState('');

  const [opsStatus, setOpsStatus] = useState<'Passed' | 'Failed' | 'Unverified'>('Passed');
  const [opsRemarks, setOpsRemarks] = useState('');

  const [nextReviewDateInput, setNextReviewDateInput] = useState('');
  const [assessmentComments, setAssessmentComments] = useState('');
  const [updatingAssessment, setUpdatingAssessment] = useState(false);

  // Evidence file upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow decisions
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'riskManager' | 'fraudTeam' | 'legalTeam' | 'procurementHead' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Pending' | 'Under Investigation' | 'Verified' | 'Blocked' | 'Rejected' | 'Closed'>('Verified');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchShellVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/shell');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching shell company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShellVendors();
  }, []);

  // Sync state from URL params
  useEffect(() => {
    const riskParam = searchParams.get('risk') || '';
    const statusParam = searchParams.get('status') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const countryParam = searchParams.get('country') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (countryParam) setCountryFilter(countryParam);

    if (riskParam === 'low') {
      setRiskFilter('Low');
      setStatusFilter('All');
      setReviewDueFilter(false);
      setActiveCard('clear');
    } else if (riskParam === 'medium') {
      setRiskFilter('Medium');
      setStatusFilter('All');
      setReviewDueFilter(false);
      setActiveCard('medium');
    } else if (riskParam === 'high') {
      setRiskFilter('High');
      setStatusFilter('All');
      setReviewDueFilter(false);
      setActiveCard('high');
    } else if (statusParam === 'shell') {
      setRiskFilter('All');
      setStatusFilter('Potential Shell Company');
      setReviewDueFilter(false);
      setActiveCard('shell');
    } else if (filterParam === 'reviewdue') {
      setRiskFilter('All');
      setStatusFilter('All');
      setReviewDueFilter(true);
      setActiveCard('reviewdue');
    } else {
      setRiskFilter('All');
      setStatusFilter('All');
      setReviewDueFilter(false);
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, riskVal: string, statusVal: string, dueVal: boolean) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (countryFilter !== 'All') params.country = countryFilter;

    if (riskVal !== 'All') {
      params.risk = riskVal.toLowerCase();
    }
    if (statusVal === 'Potential Shell Company') {
      params.status = 'shell';
    }
    if (dueVal) {
      params.filter = 'reviewdue';
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let r = 'All';
    let s = 'All';
    let due = false;

    if (card === 'clear') r = 'Low';
    else if (card === 'medium') r = 'Medium';
    else if (card === 'high') r = 'High';
    else if (card === 'shell') s = 'Potential Shell Company';
    else if (card === 'reviewdue') due = true;

    setRiskFilter(r);
    setStatusFilter(s);
    setReviewDueFilter(due);
    updateUrlParams(card, r, s, due);
  };

  const isReviewDue = (dateStr: string) => {
    if (!dateStr) return false;
    const nextReview = new Date(dateStr);
    const today = new Date("2026-06-01");
    const diffTime = nextReview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // Filters logic
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' ? true : v.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' ? true : v.shellCompanyStatus === statusFilter;
    const matchesCountry = countryFilter === 'All' ? true : v.country === countryFilter;
    const matchesDue = reviewDueFilter ? isReviewDue(v.nextReviewDate) : true;

    return matchesSearch && matchesRisk && matchesStatus && matchesCountry && matchesDue;
  });

  // KPI Calculations
  const totalChecked = vendors.length;
  const verifiedCount = vendors.filter(v => v.riskLevel === 'Low').length;
  const verificationReqCount = vendors.filter(v => v.riskLevel === 'Medium').length;
  const highRiskCount = vendors.filter(v => v.riskLevel === 'High').length;
  const potentialShellCount = vendors.filter(v => v.shellCompanyStatus === 'Potential Shell Company').length;
  const reviewsDueCount = vendors.filter(v => isReviewDue(v.nextReviewDate)).length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/shell/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      const val = v.validations || {};
      setAddrStatus(val.physicalAddress?.status || 'Passed');
      setAddrShared(val.physicalAddress?.addressSharedWith ?? 1);
      setAddrRemarks(val.physicalAddress?.remarks || '');

      setEmpStatus(val.employeeCount?.status || 'Passed');
      setEmpCount(val.employeeCount?.employeeCount ?? 10);
      setEmpRemarks(val.employeeCount?.remarks || '');

      setWebStatus(val.websitePresence?.status || 'Passed');
      setWebAvail(val.websitePresence?.websiteAvailable ?? true);
      setWebRemarks(val.websitePresence?.remarks || '');

      setFinStatus(val.financialFilings?.status || 'Passed');
      setFinRemarks(val.financialFilings?.remarks || '');

      setOpsStatus(val.businessOperations?.status || 'Passed');
      setOpsRemarks(val.businessOperations?.remarks || '');

      setNextReviewDateInput(v.nextReviewDate || '');
      setAssessmentComments('');
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

  const handleUpdateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setUpdatingAssessment(true);
      const payload = {
        vendorId: selectedVendor.vendorId,
        validations: {
          physicalAddress: {
            status: addrStatus,
            addressSharedWith: Number(addrShared),
            remarks: addrRemarks
          },
          employeeCount: {
            status: empStatus,
            employeeCount: Number(empCount),
            remarks: empRemarks
          },
          websitePresence: {
            status: webStatus,
            websiteAvailable: webAvail,
            remarks: webRemarks
          },
          financialFilings: {
            status: finStatus,
            remarks: finRemarks
          },
          businessOperations: {
            status: opsStatus,
            remarks: opsRemarks
          }
        },
        nextReviewDate: nextReviewDateInput,
        comments: assessmentComments || 'Manual validation criteria adjustment.',
        performedBy: user?.fullName || 'Saurabh Anand'
      };

      const res = await axios.post('/api/kyc/shell/check', payload);
      if (res.data.success) {
        await fetchShellVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error saving checklist checks:', err);
    } finally {
      setUpdatingAssessment(false);
    }
  };

  const handleWorkflowAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/shell/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchShellVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
      }
    } catch (err) {
      console.error('Error submitting workflow step:', err);
    } finally {
      setSubmittingWorkflow(false);
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

      const uploadRes = await axios.post('/api/kyc/shell/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const attachRes = await axios.post('/api/kyc/shell/attach-file', {
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

  // Recharts Data Mappings
  // 1. Risk Level Distribution (Pie)
  const riskDistData = [
    { name: 'Low Risk', value: vendors.filter(v => v.riskLevel === 'Low').length, color: '#16a34a' },
    { name: 'Medium Risk', value: vendors.filter(v => v.riskLevel === 'Medium').length, color: '#d97706' },
    { name: 'High Risk', value: vendors.filter(v => v.riskLevel === 'High').length, color: '#ea580c' },
    { name: 'Critical Risk', value: vendors.filter(v => v.riskLevel === 'Critical').length, color: '#dc2626' }
  ].filter(d => d.value > 0);

  // 2. Validation Failure Breakdown
  const failureData = [
    { name: 'Address', count: vendors.filter(v => v.validations?.physicalAddress?.status === 'Failed').length },
    { name: 'Employees', count: vendors.filter(v => v.validations?.employeeCount?.status === 'Failed').length },
    { name: 'Website', count: vendors.filter(v => v.validations?.websitePresence?.status === 'Failed').length },
    { name: 'Filings', count: vendors.filter(v => v.validations?.financialFilings?.status === 'Failed' || v.validations?.financialFilings?.status === 'Missing').length },
    { name: 'Operations', count: vendors.filter(v => v.validations?.businessOperations?.status === 'Failed' || v.validations?.businessOperations?.status === 'Unverified').length }
  ];

  // 3. Country Analysis
  const countries = Array.from(new Set(vendors.map(v => v.country)));
  const countryRiskData = countries.map(c => {
    const list = vendors.filter(v => v.country === c);
    const avgScore = list.reduce((sum, v) => sum + v.shellRiskScore, 0) / list.length;
    return { name: c, avgScore: Math.round(avgScore) };
  });

  // 4. Monthly Trend
  const monthlyTrendData = [
    { month: 'Jan 2026', count: 12 },
    { month: 'Feb 2026', count: 18 },
    { month: 'Mar 2026', count: 15 },
    { month: 'Apr 2026', count: 22 },
    { month: 'May 2026', count: vendors.length }
  ];

  // 5. Investigation Workflow status distribution
  const wfStates = ['Pending', 'Under Investigation', 'Verified', 'Blocked', 'Closed'];
  const workflowDistData = wfStates.map(st => {
    const count = vendors.filter(v => v.workflow?.final === st).length;
    return { name: st, value: count };
  }).filter(d => d.value > 0);

  const colors = ['#3b82f6', '#d97706', '#10b981', '#ef4444', '#6b7280'];

  // CSV Export utility
  const exportToCSV = () => {
    const headers = [
      'Vendor ID', 'Vendor Name', 'Country', 
      'Address Status', 'Employees Status', 'Website Status', 
      'Financial Filings Status', 'Operations Status', 
      'Risk Score', 'Risk Level', 'Status', 'Last Checked'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.country,
      v.validations.physicalAddress?.status,
      v.validations.employeeCount?.status,
      v.validations.websitePresence?.status,
      v.validations.financialFilings?.status,
      v.validations.businessOperations?.status,
      v.shellRiskScore,
      v.riskLevel,
      v.shellCompanyStatus,
      v.lastCheckedOn
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shell_Company_Assessment_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns definition for DataTable
  const tableColumns: Column<ShellVendor>[] = [
    {
      header: 'Vendor Name',
      accessor: (row: ShellVendor) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.vendorName}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{row.vendorId}</div>
        </div>
      )
    },
    { header: 'Country', accessor: (row: ShellVendor) => row.country },
    {
      header: 'Address',
      accessor: (row: ShellVendor) => (
        <Badge variant={row.validations.physicalAddress?.status === 'Passed' ? 'success' : row.validations.physicalAddress?.status === 'Failed' ? 'danger' : 'warning'}>
          {row.validations.physicalAddress?.status}
        </Badge>
      )
    },
    {
      header: 'Employees',
      accessor: (row: ShellVendor) => (
        <Badge variant={row.validations.employeeCount?.status === 'Passed' ? 'success' : row.validations.employeeCount?.status === 'Failed' ? 'danger' : 'warning'}>
          {row.validations.employeeCount?.status}
        </Badge>
      )
    },
    {
      header: 'Website',
      accessor: (row: ShellVendor) => (
        <Badge variant={row.validations.websitePresence?.status === 'Passed' ? 'success' : row.validations.websitePresence?.status === 'Failed' ? 'danger' : 'warning'}>
          {row.validations.websitePresence?.status}
        </Badge>
      )
    },
    {
      header: 'Financial Filings',
      accessor: (row: ShellVendor) => (
        <Badge variant={row.validations.financialFilings?.status === 'Passed' ? 'success' : (row.validations.financialFilings?.status === 'Failed' || row.validations.financialFilings?.status === 'Missing') ? 'danger' : 'warning'}>
          {row.validations.financialFilings?.status}
        </Badge>
      )
    },
    {
      header: 'Operations',
      accessor: (row: ShellVendor) => (
        <Badge variant={row.validations.businessOperations?.status === 'Passed' ? 'success' : (row.validations.businessOperations?.status === 'Failed' || row.validations.businessOperations?.status === 'Unverified') ? 'danger' : 'warning'}>
          {row.validations.businessOperations?.status}
        </Badge>
      )
    },
    {
      header: 'Shell Score',
      accessor: (row: ShellVendor) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 600 }}>{row.shellRiskScore}</span>
          <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${row.shellRiskScore}%`, 
                background: row.riskLevel === 'Low' ? '#16a34a' : row.riskLevel === 'Medium' ? '#d97706' : row.riskLevel === 'High' ? '#ea580c' : '#dc2626'
              }} 
            />
          </div>
        </div>
      )
    },
    {
      header: 'Risk Level',
      accessor: (row: ShellVendor) => {
        let badgeVar: 'success' | 'warning' | 'danger' = 'success';
        if (row.riskLevel === 'Medium') badgeVar = 'warning';
        if (row.riskLevel === 'High' || row.riskLevel === 'Critical') badgeVar = 'danger';
        return <Badge variant={badgeVar}>{row.riskLevel}</Badge>;
      }
    },
    {
      header: 'Status',
      accessor: (row: ShellVendor) => {
        const isBlocked = row.shellCompanyStatus === 'Potential Shell Company';
        return (
          <Badge variant={isBlocked ? 'danger' : row.shellCompanyStatus === 'Verified' ? 'success' : 'warning'}>
            {isBlocked ? '🚫 Blocked' : row.shellCompanyStatus}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: ShellVendor) => (
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
          <h2 className={styles.title}>Shell Company Validation Checks</h2>
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Shell Company Checks</div>
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
            <span className={styles.kpiLabel}>Total Checked</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{totalChecked}</span>
          <span className={styles.kpiFooter}>Registered Vendors</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'clear' ? styles.kpiCardActive : ''}`} 
          data-card="clear"
          onClick={() => handleKpiClick('clear')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Verified</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{verifiedCount}</span>
          <span className={styles.kpiFooter}>Low Shell Risk</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'medium' ? styles.kpiCardActive : ''}`} 
          data-card="medium"
          onClick={() => handleKpiClick('medium')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Addl Verification</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{verificationReqCount}</span>
          <span className={styles.kpiFooter}>Medium Risk</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'high' ? styles.kpiCardActive : ''}`} 
          data-card="high"
          onClick={() => handleKpiClick('high')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>High Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{highRiskCount}</span>
          <span className={styles.kpiFooter}>Enhanced Due Diligence</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'shell' ? styles.kpiCardActive : ''}`} 
          data-card="shell"
          onClick={() => handleKpiClick('shell')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Potential Shell</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{potentialShellCount}</span>
          <span className={styles.kpiFooter}>Blocked / Suspended</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'reviewdue' ? styles.kpiCardActive : ''}`} 
          data-card="reviewdue"
          onClick={() => handleKpiClick('reviewdue')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Reviews Due</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{reviewsDueCount}</span>
          <span className={styles.kpiFooter}>Next 30 Days</span>
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
                      updateUrlParams(activeCard, riskFilter, statusFilter, reviewDueFilter);
                    }}
                  />
                </div>

                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value);
                    let card = 'total';
                    if (e.target.value === 'Low') card = 'clear';
                    else if (e.target.value === 'Medium') card = 'medium';
                    else if (e.target.value === 'High') card = 'high';
                    updateUrlParams(card, e.target.value, statusFilter, reviewDueFilter);
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
                    const card = e.target.value === 'Potential Shell Company' ? 'shell' : 'total';
                    updateUrlParams(card, riskFilter, e.target.value, reviewDueFilter);
                  }}
                >
                  <option value="All">Status: All</option>
                  <option value="Verified">Verified</option>
                  <option value="Additional Verification Required">Verification Req.</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Potential Shell Company">Potential Shell Company</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    updateUrlParams(activeCard, riskFilter, statusFilter, reviewDueFilter);
                  }}
                >
                  <option value="All">Country: All</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UAE">UAE</option>
                  <option value="Russia">Russia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="UK">UK</option>
                  <option value="Others">Others</option>
                </select>

                {(riskFilter !== 'All' || statusFilter !== 'All' || countryFilter !== 'All' || reviewDueFilter || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setRiskFilter('All');
                      setStatusFilter('All');
                      setCountryFilter('All');
                      setReviewDueFilter(false);
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
                Loading shell company check records...
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

        {/* Right Side: Recharts Charts & System Alerts */}
        <div className={styles.sideSection}>
          {/* Chart 1: Shell Risk Distribution */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Shell Risk Distribution</div>
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

          {/* Chart 2: Failure Parameters */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Validation Failure Breakdown</div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Country Risk */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Country-wise Shell Risk Index</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryRiskData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#ea580c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Volume */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Monthly Volume Trends</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Investigation Status Distribution */}
          <div className={styles.chartCard}>
            <div className={styles.sectionTitle}>Investigation Status Distribution</div>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workflowDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {workflowDistData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Vendors`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {workflowDistData.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active system-wide compliance flags */}
          <div className={styles.alertsCard}>
            <div className={styles.sectionTitle} style={{ borderBottomColor: '#fecdd3', color: '#991b1b' }}>
              Compliance Alerts Feed
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
                  No active critical shell company indicators flagged.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vendor Drawer Panel */}
      {selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3>{selectedVendor.vendorName}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  ID: {selectedVendor.vendorId} | PAN: {selectedVendor.pan} | GSTIN: {selectedVendor.gstin}
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
                Profile Summary
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'validation' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('validation')}
              >
                Validation Check Form
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'workflow' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Workflow Decisions
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'history' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit Trails & Files
              </button>
            </div>

            <div className={styles.drawerBody}>
              {drawerTab === 'profile' && (
                <>
                  {selectedVendor.shellCompanyStatus === 'Potential Shell Company' && (
                    <div className={styles.restrictionBanner}>
                      <ShieldAlert size={20} />
                      <span>🚫 Potential Shell Company Detected – Investigation Required</span>
                    </div>
                  )}

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Building size={14} />
                      Corporate Metadata
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Country / Registry Jurisdiction</span>
                        <span className={styles.overviewVal}>{selectedVendor.country}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Tax PAN Registration</span>
                        <span className={styles.overviewVal}>{selectedVendor.pan}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Tax GSTIN Registration</span>
                        <span className={styles.overviewVal}>{selectedVendor.gstin}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Compliance Verification</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastCheckedOn}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Next Scheduled Review</span>
                        <span className={styles.overviewVal}>{selectedVendor.nextReviewDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Globe size={14} />
                      KYC Verification Parameters
                    </div>
                    <div className={styles.validationGrid}>
                      <div className={styles.validationCard}>
                        <div className={styles.validationCardHeader}>
                          <span className={styles.validationCardTitle}>Physical Address</span>
                          <Badge variant={selectedVendor.validations.physicalAddress?.status === 'Passed' ? 'success' : 'danger'}>
                            {selectedVendor.validations.physicalAddress?.status}
                          </Badge>
                        </div>
                        <div className={styles.validationCardDetail}>
                          Shared Address Count: <strong>{selectedVendor.validations.physicalAddress?.addressSharedWith}</strong>
                        </div>
                        <div className={styles.validationRemarks}>
                          {selectedVendor.validations.physicalAddress?.remarks}
                        </div>
                      </div>

                      <div className={styles.validationCard}>
                        <div className={styles.validationCardHeader}>
                          <span className={styles.validationCardTitle}>Employee Count</span>
                          <Badge variant={selectedVendor.validations.employeeCount?.status === 'Passed' ? 'success' : 'danger'}>
                            {selectedVendor.validations.employeeCount?.status}
                          </Badge>
                        </div>
                        <div className={styles.validationCardDetail}>
                          Headcount: <strong>{selectedVendor.validations.employeeCount?.employeeCount}</strong>
                        </div>
                        <div className={styles.validationRemarks}>
                          {selectedVendor.validations.employeeCount?.remarks}
                        </div>
                      </div>

                      <div className={styles.validationCard}>
                        <div className={styles.validationCardHeader}>
                          <span className={styles.validationCardTitle}>Website Presence</span>
                          <Badge variant={selectedVendor.validations.websitePresence?.status === 'Passed' ? 'success' : 'danger'}>
                            {selectedVendor.validations.websitePresence?.status}
                          </Badge>
                        </div>
                        <div className={styles.validationCardDetail}>
                          Active Domain: <strong>{selectedVendor.validations.websitePresence?.websiteAvailable ? 'Yes' : 'No'}</strong>
                        </div>
                        <div className={styles.validationRemarks}>
                          {selectedVendor.validations.websitePresence?.remarks}
                        </div>
                      </div>

                      <div className={styles.validationCard}>
                        <div className={styles.validationCardHeader}>
                          <span className={styles.validationCardTitle}>Financial Filings</span>
                          <Badge variant={selectedVendor.validations.financialFilings?.status === 'Passed' ? 'success' : 'danger'}>
                            {selectedVendor.validations.financialFilings?.status}
                          </Badge>
                        </div>
                        <div className={styles.validationRemarks}>
                          {selectedVendor.validations.financialFilings?.remarks}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Users size={14} />
                      Risk Assessment
                    </div>
                    <div className={styles.grid2Col}>
                      <div style={{ textAlign: 'center', padding: '12px', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                          Overall Risk Score
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: selectedVendor.shellRiskScore >= 81 ? '#dc2626' : '#16a34a' }}>
                          {selectedVendor.shellRiskScore} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/ 100</span>
                        </div>
                        <Badge variant={selectedVendor.riskLevel === 'Low' ? 'success' : selectedVendor.riskLevel === 'Medium' ? 'warning' : 'danger'}>
                          {selectedVendor.riskLevel} Risk
                        </Badge>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', padding: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          Status: <strong>{selectedVendor.shellCompanyStatus}</strong>
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                          {selectedVendor.shellRiskScore >= 81 
                            ? '🚫 Shell indicators exceed critical thresholds. Onboarding, payment schedules, and purchase orders are blocked.'
                            : '✅ Shell company checks are clear. Entity is approved for business operations.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {drawerTab === 'validation' && (
                <form className={styles.drawerCard} onSubmit={handleUpdateChecklist}>
                  <div className={styles.drawerSectionTitle}>Assessment Parameters Update</div>

                  {/* Physical Address Verification */}
                  <div className={styles.drawerCard} style={{ marginBottom: '14px' }}>
                    <div className={styles.stageName} style={{ marginBottom: '8px' }}>Physical Address Verification</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Address Status</label>
                        <select 
                          className={styles.formSelect} 
                          value={addrStatus}
                          onChange={(e) => setAddrStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Unverified">Unverified</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Address Shared Count</label>
                        <input 
                          type="number" 
                          className={styles.formInput} 
                          value={addrShared} 
                          onChange={(e) => setAddrShared(Number(e.target.value))} 
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Remarks</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={addrRemarks} 
                        onChange={(e) => setAddrRemarks(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Employee Count Verification */}
                  <div className={styles.drawerCard} style={{ marginBottom: '14px' }}>
                    <div className={styles.stageName} style={{ marginBottom: '8px' }}>Employee Count Verification</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Employees Status</label>
                        <select 
                          className={styles.formSelect} 
                          value={empStatus}
                          onChange={(e) => setEmpStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Unverified">Unverified</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Headcount</label>
                        <input 
                          type="number" 
                          className={styles.formInput} 
                          value={empCount} 
                          onChange={(e) => setEmpCount(Number(e.target.value))} 
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Remarks</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={empRemarks} 
                        onChange={(e) => setEmpRemarks(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Website Presence Verification */}
                  <div className={styles.drawerCard} style={{ marginBottom: '14px' }}>
                    <div className={styles.stageName} style={{ marginBottom: '8px' }}>Website Presence Verification</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Website Status</label>
                        <select 
                          className={styles.formSelect} 
                          value={webStatus}
                          onChange={(e) => setWebStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Unverified">Unverified</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Website Available?</label>
                        <select 
                          className={styles.formSelect}
                          value={webAvail ? 'true' : 'false'}
                          onChange={(e) => setWebAvail(e.target.value === 'true')}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Remarks</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={webRemarks} 
                        onChange={(e) => setWebRemarks(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Financial Filings Verification */}
                  <div className={styles.drawerCard} style={{ marginBottom: '14px' }}>
                    <div className={styles.stageName} style={{ marginBottom: '8px' }}>Financial Filing Verification</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Filing Status</label>
                        <select 
                          className={styles.formSelect} 
                          value={finStatus}
                          onChange={(e) => setFinStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Missing">Missing</option>
                          <option value="Unverified">Unverified</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Remarks</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={finRemarks} 
                          onChange={(e) => setFinRemarks(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Operations Verification */}
                  <div className={styles.drawerCard} style={{ marginBottom: '14px' }}>
                    <div className={styles.stageName} style={{ marginBottom: '8px' }}>Business Operations Verification</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Operations Status</label>
                        <select 
                          className={styles.formSelect} 
                          value={opsStatus}
                          onChange={(e) => setOpsStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Unverified">Unverified</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Remarks</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={opsRemarks} 
                          onChange={(e) => setOpsRemarks(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Next Assessment Date</label>
                      <input 
                        type="date" 
                        className={styles.formInput} 
                        value={nextReviewDateInput} 
                        onChange={(e) => setNextReviewDateInput(e.target.value)} 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>General Comments / Remarks</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        placeholder="Investigation summary..." 
                        value={assessmentComments} 
                        onChange={(e) => setAssessmentComments(e.target.value)} 
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updatingAssessment} style={{ marginTop: '10px', width: '100%' }}>
                    {updatingAssessment ? 'Recalculating risk indicators...' : 'Submit Assessment Update'}
                  </Button>
                </form>
              )}

              {drawerTab === 'workflow' && (
                <div className={styles.drawerCard}>
                  <div className={styles.drawerSectionTitle}>TPRM Screening Approvals board</div>
                  <div className={styles.workflowBoard}>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Compliance Analyst</span>
                      <Badge variant={selectedVendor.workflow?.analyst === 'Verified' ? 'success' : selectedVendor.workflow?.analyst === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.analyst || 'Pending'}
                      </Badge>
                    </div>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Risk Manager</span>
                      <Badge variant={selectedVendor.workflow?.riskManager === 'Verified' ? 'success' : selectedVendor.workflow?.riskManager === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.riskManager || 'Pending'}
                      </Badge>
                    </div>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Fraud Investigation Team</span>
                      <Badge variant={selectedVendor.workflow?.fraudTeam === 'Verified' ? 'success' : selectedVendor.workflow?.fraudTeam === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.fraudTeam || 'Pending'}
                      </Badge>
                    </div>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Legal Team</span>
                      <Badge variant={selectedVendor.workflow?.legalTeam === 'Verified' ? 'success' : selectedVendor.workflow?.legalTeam === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.legalTeam || 'Pending'}
                      </Badge>
                    </div>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Procurement Head</span>
                      <Badge variant={selectedVendor.workflow?.procurementHead === 'Verified' ? 'success' : selectedVendor.workflow?.procurementHead === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.procurementHead || 'Pending'}
                      </Badge>
                    </div>
                    <div className={styles.workflowStage}>
                      <span className={styles.stageName}>Final Decision</span>
                      <Badge variant={selectedVendor.workflow?.final === 'Verified' ? 'success' : selectedVendor.workflow?.final === 'Blocked' ? 'danger' : 'warning'}>
                        {selectedVendor.workflow?.final || 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <form className={styles.workflowForm} onSubmit={handleWorkflowAction}>
                    <div className={styles.drawerSectionTitle} style={{ marginTop: '12px' }}>Update Workflow Stage</div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Approval Stage</label>
                        <select 
                          className={styles.formSelect}
                          value={workflowStage}
                          onChange={(e) => setWorkflowStage(e.target.value as any)}
                        >
                          <option value="analyst">Compliance Analyst</option>
                          <option value="riskManager">Risk Manager</option>
                          <option value="fraudTeam">Fraud Investigation</option>
                          <option value="legalTeam">Legal Team</option>
                          <option value="procurementHead">Procurement Head</option>
                          <option value="final">Final Decision</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Decision Action</label>
                        <select 
                          className={styles.formSelect}
                          value={workflowAction}
                          onChange={(e) => setWorkflowAction(e.target.value as any)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Verified">Verified</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Comments / Explanatory note</label>
                      <textarea
                        className={styles.formTextarea}
                        placeholder="Add decision notes..."
                        value={workflowComments}
                        onChange={(e) => setWorkflowComments(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submittingWorkflow}>
                      {submittingWorkflow ? 'Updating stage action...' : 'Submit Stage Decision'}
                    </Button>
                  </form>
                </div>
              )}

              {drawerTab === 'history' && (
                <>
                  {/* File Upload Evidence */}
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>Evidence Management</div>
                    <div className={styles.fileUploadContainer}>
                      <div 
                        className={styles.uploadArea}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={24} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto' }} />
                        <span className={styles.uploadText}>
                          {uploadingFile ? 'Uploading file...' : 'Click to upload shell validation report (PDF/JPG)'}
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
                    <div className={styles.drawerSectionTitle}>Audit Trails Timeline</div>
                    <div className={styles.historyList}>
                      {(selectedVendor.assessmentHistory || []).map((log, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>{log.result}</span>
                            <span style={{ color: log.actionTaken === 'Vendor Blocked' ? '#dc2626' : '#16a34a' }}>
                              {log.actionTaken}
                            </span>
                          </div>
                          <div>{log.remarks}</div>
                          <div className={styles.historyMeta}>
                            <span>By: {log.performedBy}</span>
                            <span>{log.assessmentDate}</span>
                          </div>
                        </div>
                      ))}
                      {(selectedVendor.assessmentHistory || []).length === 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                          No audit timeline recorded.
                        </div>
                      )}
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
