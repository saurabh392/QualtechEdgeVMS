import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Download, 
  Eye, 
  Layers, 
  Calendar, 
  X, 
  RefreshCw, 
  UserCheck,
  FileText,
  Sparkles,
  Upload
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
import styles from './KycBlacklistCheck.module.css';

interface BlacklistChecks {
  internalBlacklist: string;
  governmentDebarred: string;
  industryWatchlist: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface BlacklistHistoryEntry {
  actionDate: string;
  action: string;
  reason: string;
  performedBy: string;
}

interface BlacklistAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface BlacklistVendor {
  vendorId: string;
  vendorName: string;
  category: string;
  pan?: string;
  gstin?: string;
  blacklistChecks: BlacklistChecks;
  blacklistStatus: 'Clear' | 'Under Review' | 'Blacklisted';
  reason: string | null;
  blacklistedTill: string | null;
  checkedOn: string;
  nextReviewDate: string;
  status: 'Approved' | 'Under Review' | 'Rejected' | 'Pending';
  workflow: {
    analyst: 'Pending' | 'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back';
    complianceManager: 'Pending' | 'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back';
    procurementHead: 'Pending' | 'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back';
    legalTeam: 'Pending' | 'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back';
  };
  blacklistHistory: BlacklistHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  alerts?: BlacklistAlert[];
}

export const KycBlacklistCheck: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<BlacklistVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Clear' | 'Under Review' | 'Blacklisted'
  const [sourceFilter, setSourceFilter] = useState('All'); // 'All' | 'Internal' | 'Government' | 'Industry'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'due'
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<BlacklistVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'check' | 'files' | 'workflow' | 'history'>('profile');

  // Interactive Blacklist Checklist Form States
  const [internalMatch, setInternalMatch] = useState('No Match');
  const [governmentMatch, setGovernmentMatch] = useState('No Match');
  const [industryMatch, setIndustryMatch] = useState('No Match');
  const [blacklistStatusInput, setBlacklistStatusInput] = useState<'Clear' | 'Under Review' | 'Blacklisted'>('Clear');
  const [blacklistReason, setBlacklistReason] = useState('');
  const [blacklistedTillDate, setBlacklistedTillDate] = useState('');
  const [nextReviewDateInput, setNextReviewDateInput] = useState('');
  const [checklistComments, setChecklistComments] = useState('');
  const [updatingChecklist, setUpdatingChecklist] = useState(false);

  // Evidence file upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow decisions
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'complianceManager' | 'procurementHead' | 'legalTeam' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Approved' | 'Rejected' | 'Reinstated' | 'Blacklisted' | 'Sent Back' | 'Pending'>('Approved');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchBlacklistVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/blacklist');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching blacklist check vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklistVendors();
  }, []);

  // Sync state from URL
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const sourceParam = searchParams.get('source') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setCategoryFilter(categoryParam);

    if (statusParam === 'clear') {
      setStatusFilter('Clear');
      setSourceFilter('All');
      setFilterType('All');
      setActiveCard('clear');
    } else if (statusParam === 'underreview') {
      setStatusFilter('Under Review');
      setSourceFilter('All');
      setFilterType('All');
      setActiveCard('underreview');
    } else if (statusParam === 'blacklisted') {
      setStatusFilter('Blacklisted');
      setSourceFilter('All');
      setFilterType('All');
      setActiveCard('blacklisted');
    } else if (sourceParam === 'government') {
      setStatusFilter('All');
      setSourceFilter('Government');
      setFilterType('All');
      setActiveCard('government');
    } else if (filterParam === 'reviewdue') {
      setStatusFilter('All');
      setSourceFilter('All');
      setFilterType('due');
      setActiveCard('reviewdue');
    } else {
      setStatusFilter('All');
      setSourceFilter('All');
      setFilterType('All');
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, statusVal: string, sourceVal: string, filterVal: string) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'All') params.category = categoryFilter;

    if (statusVal !== 'All') {
      params.status = statusVal.toLowerCase().replace(' ', '');
    }
    if (sourceVal === 'Government') {
      params.source = 'government';
    }
    if (filterVal !== 'All') {
      params.filter = filterVal;
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let s = 'All';
    let src = 'All';
    let f = 'All';

    if (card === 'clear') s = 'Clear';
    else if (card === 'underreview') s = 'Under Review';
    else if (card === 'blacklisted') s = 'Blacklisted';
    else if (card === 'government') src = 'Government';
    else if (card === 'reviewdue') f = 'reviewdue';

    setStatusFilter(s);
    setSourceFilter(src);
    setFilterType(f);
    updateUrlParams(card, s, src, f);
  };

  const isReviewDue = (dateStr: string) => {
    const nextReview = new Date(dateStr);
    const today = new Date("2026-06-01");
    const diffTime = nextReview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // Filter selection implementation
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.pan && v.pan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.gstin && v.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.blacklistStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.reason && v.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' ? true : v.blacklistStatus === statusFilter;
    const matchesCategory = categoryFilter === 'All' ? true : v.category === categoryFilter;

    let matchesSource = true;
    if (sourceFilter === 'Internal') {
      matchesSource = v.blacklistChecks?.internalBlacklist === 'Match Found';
    } else if (sourceFilter === 'Government') {
      matchesSource = v.blacklistChecks?.governmentDebarred === 'Match Found';
    } else if (sourceFilter === 'Industry') {
      matchesSource = v.blacklistChecks?.industryWatchlist === 'Match Found';
    }

    let matchesSpecial = true;
    if (filterType === 'due') {
      matchesSpecial = isReviewDue(v.nextReviewDate);
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesSource && matchesSpecial;
  });

  // Calculate dynamic KPI card numbers
  const totalChecked = vendors.length;
  const clearCount = vendors.filter(v => v.blacklistStatus === 'Clear').length;
  const underReviewCount = vendors.filter(v => v.blacklistStatus === 'Under Review').length;
  const blacklistedCount = vendors.filter(v => v.blacklistStatus === 'Blacklisted').length;
  const governmentCount = vendors.filter(v => v.blacklistChecks?.governmentDebarred === 'Match Found').length;
  const reviewsDueCount = vendors.filter(v => isReviewDue(v.nextReviewDate)).length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/blacklist/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      const bc = v.blacklistChecks || {};
      setInternalMatch(bc.internalBlacklist || 'No Match');
      setGovernmentMatch(bc.governmentDebarred || 'No Match');
      setIndustryMatch(bc.industryWatchlist || 'No Match');
      setBlacklistStatusInput(v.blacklistStatus || 'Clear');
      setBlacklistReason(v.reason || '');
      setBlacklistedTillDate(v.blacklistedTill || '');
      setNextReviewDateInput(v.nextReviewDate || '');
      setChecklistComments('');
    } catch (err) {
      console.error('Error fetching single vendor blacklist check profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Handle Blacklist screening form submit
  const handleSaveChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      setUpdatingChecklist(true);
      const res = await axios.post('/api/kyc/blacklist/check', {
        vendorId: selectedVendor.vendorId,
        blacklistChecks: {
          internalBlacklist: internalMatch,
          governmentDebarred: governmentMatch,
          industryWatchlist: industryMatch
        },
        blacklistStatus: blacklistStatusInput,
        reason: blacklistReason || null,
        blacklistedTill: blacklistedTillDate || null,
        nextReviewDate: nextReviewDateInput,
        comments: checklistComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        await fetchBlacklistVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error saving blacklist debarment checklist:', err);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVendor) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');
      formData.append('vendorId', selectedVendor.vendorId);

      const res = await axios.post('/api/kyc/blacklist/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        await axios.post('/api/kyc/blacklist/attach-file', {
          vendorId: selectedVendor.vendorId,
          fileMetadata: res.data.file
        });
        
        await fetchBlacklistVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error uploading blacklist check evidence report:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle Workflow Stages Transitions
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/blacklist/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        await fetchBlacklistVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error submitting blacklist workflow transition:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Category',
      'Internal Blacklist',
      'Government Debarred',
      'Industry Watchlist',
      'Blacklist Status',
      'Reason',
      'Blacklisted Till',
      'Checked On',
      'Next Review Date'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.category,
      v.blacklistChecks?.internalBlacklist,
      v.blacklistChecks?.governmentDebarred,
      v.blacklistChecks?.industryWatchlist,
      v.blacklistStatus,
      v.reason || '',
      v.blacklistedTill || '',
      v.checkedOn,
      v.nextReviewDate
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMS_Blacklist_Check_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Pre-computation
  const statusOverviewData = [
    { name: 'Clear', value: clearCount, color: '#16a34a' },
    { name: 'Under Review', value: underReviewCount, color: '#d97706' },
    { name: 'Blacklisted', value: blacklistedCount, color: '#dc2626' }
  ].filter(e => e.value > 0);

  // Blacklist Source distribution counts
  const getSourceDistributionData = () => {
    let internalMatches = 0;
    let govtMatches = 0;
    let indMatches = 0;

    vendors.forEach(v => {
      const bc = v.blacklistChecks || {};
      if (bc.internalBlacklist === 'Match Found') internalMatches++;
      if (bc.governmentDebarred === 'Match Found') govtMatches++;
      if (bc.industryWatchlist === 'Match Found') indMatches++;
    });

    return [
      { name: 'Internal Blacklist', Count: internalMatches },
      { name: 'Govt Debarment', Count: govtMatches },
      { name: 'Industry Watchlist', Count: indMatches }
    ];
  };

  const sourceDistributionData = getSourceDistributionData();

  // Vendor category risk distribution debarred counts
  const getCategoryRiskData = () => {
    const categories = Array.from(new Set(vendors.map(v => v.category)));
    return categories.map(cat => {
      const debarredCount = vendors.filter(v => v.category === cat && v.blacklistStatus === 'Blacklisted').length;
      return {
        Category: cat,
        'Debarred Count': debarredCount
      };
    }).sort((a, b) => b['Debarred Count'] - a['Debarred Count']);
  };

  const categoryRiskData = getCategoryRiskData();

  // Monthly Blacklist Trend timeline
  const getMonthlyTrendData = () => {
    const monthGroups: Record<string, number> = {};
    vendors.forEach(v => {
      if (v.blacklistStatus === 'Blacklisted') {
        const dateStr = v.checkedOn || "2026-05-15";
        const parts = dateStr.split('-');
        const monthYear = parts[0] + '-' + parts[1]; // YYYY-MM
        monthGroups[monthYear] = (monthGroups[monthYear] || 0) + 1;
      }
    });

    return Object.keys(monthGroups)
      .sort()
      .map(k => ({
        Month: k,
        Debarments: monthGroups[k]
      }));
  };

  const monthlyTrendData = getMonthlyTrendData();

  // Dynamic alerts
  const generateDynamicAlerts = () => {
    const alerts: string[] = [];

    const debarredGovt = vendors.filter(v => v.blacklistChecks?.governmentDebarred === 'Match Found');
    if (debarredGovt.length > 0) {
      alerts.push(`Critical: ${debarredGovt.length} vendors identified on Government Debarred Registries.`);
    }

    const blacklisted = vendors.filter(v => v.blacklistStatus === 'Blacklisted');
    if (blacklisted.length > 0) {
      alerts.push(`Transaction Restriction: ${blacklisted.length} vendors are blacklisted. Procurement operations blocked.`);
    }

    const reviewDue = vendors.filter(v => isReviewDue(v.nextReviewDate));
    if (reviewDue.length > 0) {
      alerts.push(`Validation: Blacklist checks review schedule due for ${reviewDue.length} vendors.`);
    }

    return alerts;
  };

  const systemAlerts = generateDynamicAlerts();

  // Specific vendor compliance insights
  const generateVendorInsights = (v: BlacklistVendor) => {
    const insights: string[] = [];
    const bc = v.blacklistChecks || {};

    if (v.blacklistStatus === 'Blacklisted') {
      insights.push(`❌ Blacklisted due to: ${v.reason || 'SLA Milestones delivery failure'}.`);
      if (v.blacklistedTill) {
        insights.push(`Debarred until: ${v.blacklistedTill}. All new contracts and POs blocked.`);
      }
    }
    if (bc.internalBlacklist === 'Match Found') {
      insights.push("Flagged: Match found in Internal Procurement Blacklist.");
    }
    if (bc.governmentDebarred === 'Match Found') {
      insights.push("Critical Match: Match found in Government Debarred Vendor lists.");
    }
    if (bc.industryWatchlist === 'Match Found') {
      insights.push("Flagged: Match found in Industry Warning watchlist register.");
    }
    if (v.blacklistStatus === 'Clear') {
      insights.push("✅ No matches detected on internal or external blacklist debarment registries.");
    }

    return insights;
  };

  // DataTable column definitions
  const tableColumns: Column<BlacklistVendor>[] = [
    { header: 'Vendor ID', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Category', accessor: (row) => row.category || 'N/A' },
    { 
      header: 'Internal Blacklist', 
      accessor: (row) => (
        <Badge variant={row.blacklistChecks?.internalBlacklist === 'Match Found' ? 'danger' : 'success'}>
          {row.blacklistChecks?.internalBlacklist}
        </Badge>
      ) 
    },
    { 
      header: 'Government Debarred', 
      accessor: (row) => (
        <Badge variant={row.blacklistChecks?.governmentDebarred === 'Match Found' ? 'danger' : 'success'}>
          {row.blacklistChecks?.governmentDebarred}
        </Badge>
      ) 
    },
    { 
      header: 'Industry Watch', 
      accessor: (row) => (
        <Badge variant={row.blacklistChecks?.industryWatchlist === 'Match Found' ? 'danger' : 'success'}>
          {row.blacklistChecks?.industryWatchlist}
        </Badge>
      ) 
    },
    { 
      header: 'Blacklist Status', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.blacklistStatus === 'Clear') variant = 'success';
        if (row.blacklistStatus === 'Under Review') variant = 'warning';
        if (row.blacklistStatus === 'Blacklisted') variant = 'danger';
        return <Badge variant={variant}>{row.blacklistStatus}</Badge>;
      } 
    },
    { header: 'Reason', accessor: (row) => row.reason || '-' },
    { header: 'Blacklisted Till', accessor: (row) => row.blacklistedTill || '-' },
    { header: 'Checked On', accessor: (row) => row.checkedOn || '-' },
    { 
      header: 'Actions', 
      align: 'center',
      accessor: (row) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            onClick={() => setSelectedVendorId(row.vendorId)}
            title="View Details"
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
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Blacklist Check</div>
          <h2 className={styles.title}>Vendor Blacklist Screening Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} className="mr-2 inline" /> Export Filtered CSV
          </Button>
          <Button variant="primary" onClick={fetchBlacklistVendors}>
            <RefreshCw size={16} className="mr-2 inline" /> Rescreen All
          </Button>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
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
          <span className={styles.kpiValue}>{loading ? '...' : totalChecked}</span>
          <span className={styles.kpiFooter}>Vendors in scope</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'clear' ? styles.kpiCardActive : ''}`} 
          data-card="clear"
          onClick={() => handleKpiClick('clear')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Cleared Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : clearCount}</span>
          <span className={styles.kpiFooter}>Status: Eligible</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'underreview' ? styles.kpiCardActive : ''}`} 
          data-card="underreview"
          onClick={() => handleKpiClick('underreview')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Under Review</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : underReviewCount}</span>
          <span className={styles.kpiFooter}>Requires compliance review</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'blacklisted' ? styles.kpiCardActive : ''}`} 
          data-card="blacklisted"
          onClick={() => handleKpiClick('blacklisted')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Blacklisted Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : blacklistedCount}</span>
          <span className={styles.kpiFooter}>Confirmed watchlists match</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'government' ? styles.kpiCardActive : ''}`} 
          data-card="government"
          onClick={() => handleKpiClick('government')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Government Debarred</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : governmentCount}</span>
          <span className={styles.kpiFooter}>Govt match list</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'reviewdue' ? styles.kpiCardActive : ''}`} 
          data-card="reviewdue"
          onClick={() => handleKpiClick('reviewdue')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Reviews Due</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
              <Calendar size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : reviewsDueCount}</span>
          <span className={styles.kpiFooter}>Next 30 Days</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Table & filter list controls */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchWrap}>
                <Input
                  className={styles.searchInput}
                  placeholder="Search by vendor, code, category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const statusVal = statusFilter !== 'All' ? statusFilter.toLowerCase() : '';
                    const sourceVal = sourceFilter !== 'All' ? sourceFilter.toLowerCase() : '';
                    const filterVal = filterType !== 'All' ? filterType : '';
                    const params: Record<string, string> = {};
                    if (e.target.value) params.search = e.target.value;
                    if (statusVal) params.status = statusVal;
                    if (sourceVal) params.source = sourceVal;
                    if (filterVal) params.filter = filterVal;
                    if (categoryFilter !== 'All') params.category = categoryFilter;
                    setSearchParams(params);
                  }}
                />
              </div>

              <div className={styles.filters}>
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    const s = e.target.value;
                    setStatusFilter(s);
                    let card = 'total';
                    if (s === 'Clear') card = 'clear';
                    if (s === 'Under Review') card = 'underreview';
                    if (s === 'Blacklisted') card = 'blacklisted';
                    updateUrlParams(card, s, sourceFilter, filterType);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Clear">Clear</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={sourceFilter}
                  onChange={(e) => {
                    const src = e.target.value;
                    setSourceFilter(src);
                    let card = 'total';
                    if (src === 'Government') card = 'government';
                    updateUrlParams(card, statusFilter, src, filterType);
                  }}
                >
                  <option value="All">All Sources</option>
                  <option value="Internal">Internal Blacklist</option>
                  <option value="Government">Government Debarred</option>
                  <option value="Industry">Industry Watchlist</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCategoryFilter(c);
                    const statusVal = statusFilter !== 'All' ? statusFilter.toLowerCase() : '';
                    const sourceVal = sourceFilter !== 'All' ? sourceFilter.toLowerCase() : '';
                    const filterVal = filterType !== 'All' ? filterType : '';
                    const params: Record<string, string> = {};
                    if (searchQuery) params.search = searchQuery;
                    if (statusVal) params.status = statusVal;
                    if (sourceVal) params.source = sourceVal;
                    if (filterVal) params.filter = filterVal;
                    if (c !== 'All') params.category = c;
                    setSearchParams(params);
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Security">Security Services</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading Blacklist records...</div>
            ) : (
              <DataTable 
                columns={tableColumns} 
                data={filteredVendors} 
                keyExtractor={(row) => row.vendorId} 
              />
            )}

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Showing {filteredVendors.length} of {vendors.length} vendors
              </span>
            </div>
          </Card>
        </div>

        {/* Charts & Alerts Sidebar */}
        <div className={styles.sideSection}>
          {/* Status Distribution Donut */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Blacklist Status Distribution</h3>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusOverviewData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute top-[35%] left-[50%] translate-x-[-50%] text-center">
                  <span className="text-xl font-bold text-slate-800">{vendors.length}</span>
                  <p className="text-[10px] text-slate-400">Checked</p>
                </div>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#16a34a' }} />
                  <span className={styles.legendLabel}>Clear</span>
                  <span className={styles.legendValue}>{clearCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#d97706' }} />
                  <span className={styles.legendLabel}>Review</span>
                  <span className={styles.legendValue}>{underReviewCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#dc2626' }} />
                  <span className={styles.legendLabel}>Debarred</span>
                  <span className={styles.legendValue}>{blacklistedCount}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Blacklist Source Distribution Bar Chart */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Blacklist Source Distribution</h3>
            <div className="w-full h-[220px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceDistributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" fontSize={10} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={90} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Count" fill="#e53e3e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Category Risk Distribution Bar Chart */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Category Debarment Risk</h3>
            <div className="w-full h-[200px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRiskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Category" fontSize={9} interval={0} angle={-10} textAnchor="end" />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Debarred Count" fill="#dd6b20">
                      {categoryRiskData.map((entry, index) => {
                        let color = '#22c55e';
                        if (entry['Debarred Count'] > 1) color = '#ef4444';
                        else if (entry['Debarred Count'] === 1) color = '#f59e0b';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Monthly Trend Line Chart */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Monthly Blacklist Trend</h3>
            <div className="w-full h-[180px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Month" fontSize={9} />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Debarments" stroke="#b83280" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Alert system panel */}
          <Card className={styles.alertsCard}>
            <h3 className={styles.sectionTitle} style={{ borderBottomColor: 'rgba(229, 62, 62, 0.1)' }}>
              <AlertOctagon size={16} className="inline mr-2 text-red-600" /> Compliance Alert Engine
            </h3>
            <div className={styles.alertList}>
              {systemAlerts.map((alt, idx) => (
                <div key={idx} className={styles.alertItem}>
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className={styles.alertText}>{alt}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Selected vendor drawer overlay */}
      {selectedVendorId && selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedVendor.vendorName}</h3>
                <span className="text-xs text-slate-400">{selectedVendor.vendorId} | {selectedVendor.category}</span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedVendorId(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs inside drawer */}
            <div className="flex border-b border-slate-200 px-4 bg-slate-50">
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('profile')}
              >
                Blacklist Profile
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'check' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('check')}
              >
                Adjust Blacklist Status
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'files' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('files')}
              >
                Evidence Reports ({selectedVendor.evidenceFiles?.length || 0})
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'workflow' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Review Workflow
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit Trail ({selectedVendor.blacklistHistory?.length || 0})
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Tab 1: Profile View */}
              {drawerTab === 'profile' && (
                <>
                  {/* Transaction Restricted Banner if status is Blacklisted */}
                  {selectedVendor.blacklistStatus === 'Blacklisted' && (
                    <div className={styles.restrictionBanner}>
                      <AlertOctagon size={16} />
                      <span>❌ Vendor Blacklisted – Transactions Restricted</span>
                    </div>
                  )}

                  {/* Vendor debarment details */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Blacklist Screening Summary</h4>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Legal Name</span>
                        <span className={styles.overviewVal}>{selectedVendor.vendorName}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Vendor Code</span>
                        <span className={styles.overviewVal}>{selectedVendor.vendorId}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Category</span>
                        <span className={styles.overviewVal}>{selectedVendor.category}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Blacklist Status</span>
                        <Badge variant={selectedVendor.blacklistStatus === 'Clear' ? 'success' : selectedVendor.blacklistStatus === 'Under Review' ? 'warning' : 'danger'}>
                          {selectedVendor.blacklistStatus}
                        </Badge>
                      </div>
                      {selectedVendor.reason && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>Reason for Debarment</span>
                          <span className="font-semibold text-slate-800 max-w-[280px] text-right leading-snug">{selectedVendor.reason}</span>
                        </div>
                      )}
                      {selectedVendor.blacklistedTill && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>Blacklisted Till</span>
                          <span className="font-bold text-red-600">{selectedVendor.blacklistedTill}</span>
                        </div>
                      )}
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Screened On</span>
                        <span className={styles.overviewVal}>{selectedVendor.checkedOn}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Next Periodic Review</span>
                        <span className="font-semibold text-slate-800" style={isReviewDue(selectedVendor.nextReviewDate) ? { color: '#dc2626', fontWeight: 700 } : {}}>{selectedVendor.nextReviewDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sources checklist results */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Debarment Source Validation</h4>
                    <div className={styles.screeningSourcesList}>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>Internal Procurement Blacklist</span>
                        <Badge variant={selectedVendor.blacklistChecks?.internalBlacklist === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.blacklistChecks?.internalBlacklist}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>Government Debarred Vendor Lists</span>
                        <Badge variant={selectedVendor.blacklistChecks?.governmentDebarred === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.blacklistChecks?.governmentDebarred}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>Industry Warning Watchlists</span>
                        <Badge variant={selectedVendor.blacklistChecks?.industryWatchlist === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.blacklistChecks?.industryWatchlist}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Compliance comments */}
                  <div className={styles.drawerCard} style={{ backgroundColor: '#fff5f5', borderStyle: 'dashed', borderColor: '#feb2b2' }}>
                    <h4 className={styles.drawerSectionTitle} style={{ color: '#9b2c2c' }}>
                      <Sparkles size={14} className="inline mr-1 text-red-700" /> Debarment Governance Insights
                    </h4>
                    <div className="flex flex-col gap-2">
                      {generateVendorInsights(selectedVendor).map((ins, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-slate-700">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Adjust Blacklist Status */}
              {drawerTab === 'check' && (
                <form onSubmit={handleSaveChecklist} className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Adjust Blacklist Status Checklist</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Update watchlist matches to manually adjust vendor eligibility.
                  </p>

                  <div className={styles.checklistGroup}>
                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>Internal Blacklist</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="internal" value="No Match" checked={internalMatch === 'No Match'} onChange={() => setInternalMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="internal" value="Match Found" checked={internalMatch === 'Match Found'} onChange={() => setInternalMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>Government Debarred</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="government" value="No Match" checked={governmentMatch === 'No Match'} onChange={() => setGovernmentMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="government" value="Match Found" checked={governmentMatch === 'Match Found'} onChange={() => setGovernmentMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>Industry Watchlist</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="industry" value="No Match" checked={industryMatch === 'No Match'} onChange={() => setIndustryMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="industry" value="Match Found" checked={industryMatch === 'Match Found'} onChange={() => setIndustryMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Target Blacklist Status</label>
                      <select 
                        className="border border-slate-200 rounded-md p-2 text-xs bg-white outline-none"
                        value={blacklistStatusInput}
                        onChange={(e: any) => setBlacklistStatusInput(e.target.value)}
                      >
                        <option value="Clear">Clear (Eligible)</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Blacklisted">Blacklisted (Blocked)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Reason for Status</label>
                      <input 
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Contract SLA Violation, Govt Registry Flag..."
                        value={blacklistReason}
                        onChange={(e) => setBlacklistReason(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Blacklisted Till (Optional)</label>
                      <input 
                        type="date"
                        className={styles.formInput}
                        value={blacklistedTillDate}
                        onChange={(e) => setBlacklistedTillDate(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Next Validation Review Date</label>
                      <input 
                        type="date"
                        className={styles.formInput}
                        value={nextReviewDateInput}
                        onChange={(e) => setNextReviewDateInput(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Governance Audit Remarks</label>
                      <textarea 
                        className={styles.formTextarea}
                        placeholder="Explain reason for blacklist status adjustment..."
                        value={checklistComments}
                        onChange={(e) => setChecklistComments(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.btnGroup}>
                    <Button type="submit" variant="primary" disabled={updatingChecklist}>
                      {updatingChecklist ? 'Saving...' : 'Save Blacklist Details'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setDrawerTab('profile')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Tab 3: Evidence Files */}
              {drawerTab === 'files' && (
                <div className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Blacklist Evidence Reports</h4>
                  <div className={styles.fileUploadContainer}>
                    <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                      <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                      <span className="block font-semibold text-xs text-slate-700">Click to Upload Debarment Report</span>
                      <span className={styles.uploadText}>Supports PDF, DOCX, PNG up to 10MB</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </div>

                    {uploadingFile && <div className="text-xs text-center text-slate-500">Uploading evidence file...</div>}

                    <div className={styles.evidenceFileList}>
                      {selectedVendor.evidenceFiles && selectedVendor.evidenceFiles.length > 0 ? (
                        selectedVendor.evidenceFiles.map((file, idx) => (
                          <div key={idx} className={styles.evidenceFileItem}>
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-red-600" />
                              <div>
                                <span className={styles.fileNameText} title={file.fileName}>{file.fileName}</span>
                                <div className={styles.fileMetaText}>Uploaded by: {file.uploadedBy} on {file.uploadedOn}</div>
                              </div>
                            </div>
                            <a 
                              href={file.filePath} 
                              download 
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No debarment reports uploaded for this vendor profile.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Review Workflow */}
              {drawerTab === 'workflow' && (
                <>
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Compliance Workflow Progress</h4>
                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>1. Compliance Analyst Review</span>
                        <Badge variant={selectedVendor.workflow?.analyst === 'Approved' || selectedVendor.workflow?.analyst === 'Reinstated' ? 'success' : selectedVendor.workflow?.analyst === 'Rejected' || selectedVendor.workflow?.analyst === 'Blacklisted' ? 'danger' : selectedVendor.workflow?.analyst === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.analyst || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>2. Compliance Manager Review</span>
                        <Badge variant={selectedVendor.workflow?.complianceManager === 'Approved' || selectedVendor.workflow?.complianceManager === 'Reinstated' ? 'success' : selectedVendor.workflow?.complianceManager === 'Rejected' || selectedVendor.workflow?.complianceManager === 'Blacklisted' ? 'danger' : selectedVendor.workflow?.complianceManager === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.complianceManager || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>3. Procurement Head Review</span>
                        <Badge variant={selectedVendor.workflow?.procurementHead === 'Approved' || selectedVendor.workflow?.procurementHead === 'Reinstated' ? 'success' : selectedVendor.workflow?.procurementHead === 'Rejected' || selectedVendor.workflow?.procurementHead === 'Blacklisted' ? 'danger' : selectedVendor.workflow?.procurementHead === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.procurementHead || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>4. Legal Team Review</span>
                        <Badge variant={selectedVendor.workflow?.legalTeam === 'Approved' || selectedVendor.workflow?.legalTeam === 'Reinstated' ? 'success' : selectedVendor.workflow?.legalTeam === 'Rejected' || selectedVendor.workflow?.legalTeam === 'Blacklisted' ? 'danger' : selectedVendor.workflow?.legalTeam === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.legalTeam || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>5. Final Approver Decision</span>
                        <Badge variant={selectedVendor.workflow?.final === 'Approved' || selectedVendor.workflow?.final === 'Reinstated' ? 'success' : selectedVendor.workflow?.final === 'Rejected' || selectedVendor.workflow?.final === 'Blacklisted' ? 'danger' : selectedVendor.workflow?.final === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.final || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleWorkflowSubmit} className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Compliance Decision Board</h4>
                    <div className={styles.workflowForm}>
                      <div className={styles.formRow}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Workflow Stage</label>
                          <select 
                            className="border border-slate-200 rounded-md p-2 text-xs bg-white"
                            value={workflowStage}
                            onChange={(e: any) => setWorkflowStage(e.target.value)}
                          >
                            <option value="analyst">1. Compliance Analyst</option>
                            <option value="complianceManager">2. Compliance Manager</option>
                            <option value="procurementHead">3. Procurement Head</option>
                            <option value="legalTeam">4. Legal Team</option>
                            <option value="final">5. Final Approver</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Workflow Action</label>
                          <select 
                            className="border border-slate-200 rounded-md p-2 text-xs bg-white"
                            value={workflowAction}
                            onChange={(e: any) => setWorkflowAction(e.target.value)}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Reinstated">Reinstated</option>
                            <option value="Blacklisted">Blacklisted</option>
                            <option value="Sent Back">Sent Back</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Decision Remarks</label>
                        <textarea 
                          className="border border-slate-200 rounded-md p-2 text-xs h-16 outline-none focus:border-indigo-500"
                          placeholder="Type reason for workflow decision..."
                          value={workflowComments}
                          onChange={(e) => setWorkflowComments(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.btnGroup}>
                        <Button type="submit" variant="primary" disabled={submittingWorkflow}>
                          {submittingWorkflow ? 'Submitting...' : 'Submit Decision'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {/* Tab 5: Audit Trail */}
              {drawerTab === 'history' && (
                <div className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Debarment History Log</h4>
                  <div className={styles.historyList}>
                    {selectedVendor.blacklistHistory && selectedVendor.blacklistHistory.length > 0 ? (
                      [...selectedVendor.blacklistHistory].reverse().map((hist, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <UserCheck size={14} className="text-slate-400" />
                            <span>{hist.action}</span>
                          </div>
                          <p className="text-slate-600 leading-snug">{hist.reason}</p>
                          <div className={styles.historyMeta}>
                            <span>By: {hist.performedBy}</span>
                            <span>{hist.actionDate}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No blacklist logs recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
