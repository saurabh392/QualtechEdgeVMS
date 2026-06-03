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
import styles from './KycSanctionsScreening.module.css';

interface Watchlists {
  unList: string;
  ofacList: string;
  euList: string;
  rbiRestricted: string;
  sebiBlacklist: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface ScreeningHistoryEntry {
  screenedBy: string;
  screeningDate: string;
  result: string;
  comments: string;
}

interface ScreeningAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface SanctionsVendor {
  vendorId: string;
  vendorName: string;
  country: string;
  pan?: string;
  gstin?: string;
  screeningResult: Watchlists;
  matchScore: number;
  screeningStatus: 'Cleared' | 'Under Review' | 'Blocked';
  lastScreenedOn: string;
  nextScreeningDate: string;
  status: 'Approved' | 'Under Review' | 'Rejected' | 'Pending';
  workflow: {
    analyst: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Sent Back';
    complianceManager: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Sent Back';
    legalTeam: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Sent Back';
    procurementHead: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Sent Back';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Sent Back';
  };
  screeningHistory: ScreeningHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  alerts?: ScreeningAlert[];
}

export const KycSanctionsScreening: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<SanctionsVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Cleared' | 'Under Review' | 'Blocked'
  const [watchlistFilter, setWatchlistFilter] = useState('All'); // 'All' | 'UN' | 'OFAC' | 'EU' | 'RBI' | 'SEBI'
  const [countryFilter, setCountryFilter] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'potential' | 'due'
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<SanctionsVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'screen' | 'files' | 'workflow' | 'history'>('profile');

  // Interactive Screening Checklist Form States
  const [unListMatch, setUnListMatch] = useState('No Match');
  const [ofacListMatch, setOfacListMatch] = useState('No Match');
  const [euListMatch, setEuListMatch] = useState('No Match');
  const [rbiRestrictedMatch, setRbiRestrictedMatch] = useState('No Match');
  const [sebiBlacklistMatch, setSebiBlacklistMatch] = useState('No Match');
  const [matchScoreSlider, setMatchScoreSlider] = useState(0);
  const [screeningComments, setScreeningComments] = useState('');
  const [updatingChecklist, setUpdatingChecklist] = useState(false);

  // Evidence upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow Decision States
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'complianceManager' | 'legalTeam' | 'procurementHead' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Approved' | 'Rejected' | 'Blocked' | 'Sent Back' | 'Pending'>('Approved');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchSanctionsVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/sanctions');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching VMS sanctions screening vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanctionsVendors();
  }, []);

  // Sync state from URL
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const watchlistParam = searchParams.get('watchlist') || '';
    const countryParam = searchParams.get('country') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (watchlistParam) setWatchlistFilter(watchlistParam);
    if (countryParam) setCountryFilter(countryParam);

    if (statusParam === 'cleared') {
      setStatusFilter('Cleared');
      setFilterType('All');
      setActiveCard('cleared');
    } else if (statusParam === 'underreview') {
      setStatusFilter('Under Review');
      setFilterType('All');
      setActiveCard('underreview');
    } else if (statusParam === 'blocked') {
      setStatusFilter('Blocked');
      setFilterType('All');
      setActiveCard('blocked');
    } else if (filterParam === 'potential') {
      setStatusFilter('All');
      setFilterType('potential');
      setActiveCard('potential');
    } else if (filterParam === 'due') {
      setStatusFilter('All');
      setFilterType('due');
      setActiveCard('due');
    } else {
      setStatusFilter('All');
      setFilterType('All');
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, statusVal: string, filterVal: string) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (watchlistFilter !== 'All') params.watchlist = watchlistFilter;
    if (countryFilter !== 'All') params.country = countryFilter;

    if (statusVal !== 'All') {
      params.status = statusVal.toLowerCase().replace(' ', '');
    }
    if (filterVal !== 'All') {
      params.filter = filterVal;
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let s = 'All';
    let f = 'All';

    if (card === 'cleared') s = 'Cleared';
    else if (card === 'underreview') s = 'Under Review';
    else if (card === 'blocked') s = 'Blocked';
    else if (card === 'potential') f = 'potential';
    else if (card === 'due') f = 'due';

    setStatusFilter(s);
    setFilterType(f);
    updateUrlParams(card, s, f);
  };

  const isScreeningDue = (dateStr: string) => {
    const nextScreen = new Date(dateStr);
    const today = new Date("2026-06-01");
    const diffTime = nextScreen.getTime() - today.getTime();
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
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.screeningStatus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : v.screeningStatus === statusFilter;
    const matchesCountry = countryFilter === 'All' ? true : v.country === countryFilter;

    // Watchlist checklist matches
    let matchesWatchlist = true;
    if (watchlistFilter !== 'All') {
      const res = v.screeningResult || {};
      if (watchlistFilter === 'UN') matchesWatchlist = res.unList === 'Match Found';
      else if (watchlistFilter === 'OFAC') matchesWatchlist = res.ofacList === 'Match Found';
      else if (watchlistFilter === 'EU') matchesWatchlist = res.euList === 'Match Found';
      else if (watchlistFilter === 'RBI') matchesWatchlist = res.rbiRestricted === 'Match Found';
      else if (watchlistFilter === 'SEBI') matchesWatchlist = res.sebiBlacklist === 'Match Found';
    }

    let matchesSpecial = true;
    if (filterType === 'potential') {
      matchesSpecial = v.matchScore > 50;
    } else if (filterType === 'due') {
      matchesSpecial = isScreeningDue(v.nextScreeningDate);
    }

    return matchesSearch && matchesStatus && matchesCountry && matchesWatchlist && matchesSpecial;
  });

  // Calculate dynamic KPI card numbers
  const totalScreened = vendors.length;
  const clearedCount = vendors.filter(v => v.screeningStatus === 'Cleared').length;
  const underReviewCount = vendors.filter(v => v.screeningStatus === 'Under Review').length;
  const blockedCount = vendors.filter(v => v.screeningStatus === 'Blocked').length;
  const potentialCount = vendors.filter(v => v.matchScore > 50).length;
  const dueCount = vendors.filter(v => isScreeningDue(v.nextScreeningDate)).length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/sanctions/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      const sr = v.screeningResult || {};
      setUnListMatch(sr.unList || 'No Match');
      setOfacListMatch(sr.ofacList || 'No Match');
      setEuListMatch(sr.euList || 'No Match');
      setRbiRestrictedMatch(sr.rbiRestricted || 'No Match');
      setSebiBlacklistMatch(sr.sebiBlacklist || 'No Match');
      setMatchScoreSlider(v.matchScore || 0);
      setScreeningComments('');
    } catch (err) {
      console.error('Error fetching single sanctions vendor profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Handle Screening Checklist adjustments
  const handleSaveScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      setUpdatingChecklist(true);
      const res = await axios.post('/api/kyc/sanctions/screen', {
        vendorId: selectedVendor.vendorId,
        screeningResult: {
          unList: unListMatch,
          ofacList: ofacListMatch,
          euList: euListMatch,
          rbiRestricted: rbiRestrictedMatch,
          sebiBlacklist: sebiBlacklistMatch
        },
        matchScore: matchScoreSlider,
        comments: screeningComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        await fetchSanctionsVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error updating sanctions screening check:', err);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  // Handle Document Uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVendor) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');
      formData.append('vendorId', selectedVendor.vendorId);

      const res = await axios.post('/api/kyc/sanctions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        // Attach report metadata to vendor sanctions file list
        await axios.post('/api/kyc/sanctions/attach-file', {
          vendorId: selectedVendor.vendorId,
          fileMetadata: res.data.file
        });
        
        await fetchSanctionsVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error uploading sanctions screening report evidence:', err);
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
      const res = await axios.post('/api/kyc/sanctions/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        await fetchSanctionsVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error submitting sanctions workflow transition:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Country',
      'UN List',
      'OFAC List',
      'EU List',
      'RBI Restricted',
      'SEBI Blacklist',
      'Match Score',
      'Screening Status',
      'Last Screened'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.country,
      v.screeningResult?.unList,
      v.screeningResult?.ofacList,
      v.screeningResult?.euList,
      v.screeningResult?.rbiRestricted,
      v.screeningResult?.sebiBlacklist,
      v.matchScore,
      v.screeningStatus,
      v.lastScreenedOn
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMS_Sanctions_Screening_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Pre-computation
  const statusOverviewData = [
    { name: 'Cleared', value: clearedCount, color: '#16a34a' },
    { name: 'Under Review', value: underReviewCount, color: '#d97706' },
    { name: 'Blocked', value: blockedCount, color: '#dc2626' }
  ].filter(e => e.value > 0);

  // Watchlist Match Breakdown (calculate counts)
  const getWatchlistMatchBreakdown = () => {
    let unMatches = 0;
    let ofacMatches = 0;
    let euMatches = 0;
    let rbiMatches = 0;
    let sebiMatches = 0;

    vendors.forEach(v => {
      const sr = v.screeningResult || {};
      if (sr.unList === 'Match Found') unMatches++;
      if (sr.ofacList === 'Match Found') ofacMatches++;
      if (sr.euList === 'Match Found') euMatches++;
      if (sr.rbiRestricted === 'Match Found') rbiMatches++;
      if (sr.sebiBlacklist === 'Match Found') sebiMatches++;
    });

    return [
      { name: 'UN Sanctions', Matches: unMatches },
      { name: 'OFAC SDN', Matches: ofacMatches },
      { name: 'EU Watch', Matches: euMatches },
      { name: 'RBI Restr.', Matches: rbiMatches },
      { name: 'SEBI Black.', Matches: sebiMatches }
    ];
  };

  const watchlistMatchBreakdown = getWatchlistMatchBreakdown();

  // Country screening risk
  const getCountryRiskData = () => {
    const countries = Array.from(new Set(vendors.map(v => v.country)));
    return countries.map(c => {
      const cv = vendors.filter(v => v.country === c);
      const totalScore = cv.reduce((sum, v) => sum + v.matchScore, 0);
      const avgScore = cv.length ? Math.round(totalScore / cv.length) : 0;
      return {
        Country: c,
        'Avg Match Score': avgScore,
        Count: cv.length
      };
    }).sort((a, b) => b['Avg Match Score'] - a['Avg Match Score']);
  };

  const countryRiskData = getCountryRiskData();

  // Monthly screening trend (historical chart logs)
  const getMonthlyTrendData = () => {
    const monthGroups: Record<string, number[]> = {};
    vendors.forEach(v => {
      const dateStr = v.lastScreenedOn || "2026-05-15";
      const parts = dateStr.split('-');
      const monthYear = parts[0] + '-' + parts[1]; // YYYY-MM
      if (!monthGroups[monthYear]) monthGroups[monthYear] = [];
      monthGroups[monthYear].push(v.matchScore);
    });

    return Object.keys(monthGroups)
      .sort()
      .map(k => {
        const scores = monthGroups[k];
        const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        return {
          Month: k,
          'Avg Score': avg
        };
      });
  };

  const monthlyTrendData = getMonthlyTrendData();

  // Alert Rules Engine
  const generateDynamicAlerts = () => {
    const alerts: string[] = [];

    const blocked = vendors.filter(v => v.screeningStatus === 'Blocked');
    if (blocked.length > 0) {
      alerts.push(`Critical: ${blocked.length} vendors have confirmed watchlists matches and are BLOCKED.`);
    }

    const underReview = vendors.filter(v => v.screeningStatus === 'Under Review');
    if (underReview.length > 0) {
      alerts.push(`Alert: ${underReview.length} potential matches require Compliance Investigation.`);
    }

    const rescreenDue = vendors.filter(v => isScreeningDue(v.nextScreeningDate));
    if (rescreenDue.length > 0) {
      alerts.push(`Schedule: Periodic sanctions re-screening is due for ${rescreenDue.length} vendors.`);
    }

    const globalOfacSDNMatches = vendors.filter(v => v.screeningResult?.ofacList === 'Match Found');
    if (globalOfacSDNMatches.length > 0) {
      alerts.push(`OFAC Match Warning: Potential matches detected in OFAC SDN registry.`);
    }

    return alerts;
  };

  const systemAlerts = generateDynamicAlerts();

  // Specific vendor compliance insights
  const generateVendorInsights = (v: SanctionsVendor) => {
    const insights: string[] = [];
    const sr = v.screeningResult || {};
    
    if (v.screeningStatus === 'Blocked') {
      insights.push("❌ confirmed sanctions watchlists matches. Vendor is blocked from contract signing and PO creation.");
    }
    if (sr.unList === 'Match Found') {
      insights.push("Listed on UN Security Council Consolidated Sanctions List.");
    }
    if (sr.ofacList === 'Match Found') {
      insights.push("Listed on OFAC SDN watchlists or foreign assets control registry.");
    }
    if (sr.euList === 'Match Found') {
      insights.push("Listed on EU consolidated list of financial sanctions targets.");
    }
    if (sr.rbiRestricted === 'Match Found') {
      insights.push("Alert: Matches domestic RBI restricted entities guidelines.");
    }
    if (sr.sebiBlacklist === 'Match Found') {
      insights.push("Warning: Entity found on SEBI Blacklisted Companies register.");
    }
    if (v.screeningStatus === 'Cleared') {
      insights.push("✅ No matches detected on global sanctions, restricted, or blacklisted registers.");
    }

    return insights;
  };

  // DataTable column definitions
  const tableColumns: Column<SanctionsVendor>[] = [
    { header: 'Vendor ID', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Country', accessor: (row) => row.country || 'N/A' },
    { 
      header: 'UN List', 
      accessor: (row) => (
        <Badge variant={row.screeningResult?.unList === 'Match Found' ? 'danger' : 'success'}>
          {row.screeningResult?.unList}
        </Badge>
      ) 
    },
    { 
      header: 'OFAC List', 
      accessor: (row) => (
        <Badge variant={row.screeningResult?.ofacList === 'Match Found' ? 'danger' : 'success'}>
          {row.screeningResult?.ofacList}
        </Badge>
      ) 
    },
    { 
      header: 'EU List', 
      accessor: (row) => (
        <Badge variant={row.screeningResult?.euList === 'Match Found' ? 'danger' : 'success'}>
          {row.screeningResult?.euList}
        </Badge>
      ) 
    },
    { 
      header: 'RBI Restr.', 
      accessor: (row) => (
        <Badge variant={row.screeningResult?.rbiRestricted === 'Match Found' ? 'danger' : 'success'}>
          {row.screeningResult?.rbiRestricted}
        </Badge>
      ) 
    },
    { 
      header: 'SEBI Black.', 
      accessor: (row) => (
        <Badge variant={row.screeningResult?.sebiBlacklist === 'Match Found' ? 'danger' : 'success'}>
          {row.screeningResult?.sebiBlacklist}
        </Badge>
      ) 
    },
    { 
      header: 'Score', 
      accessor: (row) => (
        <span className={`font-bold ${row.matchScore > 80 ? 'text-red-600' : row.matchScore > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {row.matchScore}%
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.screeningStatus === 'Cleared') variant = 'success';
        if (row.screeningStatus === 'Under Review') variant = 'warning';
        if (row.screeningStatus === 'Blocked') variant = 'danger';
        return <Badge variant={variant}>{row.screeningStatus}</Badge>;
      } 
    },
    { header: 'Last Screened', accessor: (row) => row.lastScreenedOn || '-' },
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
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Sanctions Screening</div>
          <h2 className={styles.title}>Vendor Sanctions Screening Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} className="mr-2 inline" /> Export Filtered CSV
          </Button>
          <Button variant="primary" onClick={fetchSanctionsVendors}>
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
            <span className={styles.kpiLabel}>Total Screened</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : totalScreened}</span>
          <span className={styles.kpiFooter}>Vendors in scope</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'cleared' ? styles.kpiCardActive : ''}`} 
          data-card="cleared"
          onClick={() => handleKpiClick('cleared')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Cleared Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : clearedCount}</span>
          <span className={styles.kpiFooter}>Status: Cleared</span>
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
          className={`${styles.kpiCard} ${activeCard === 'blocked' ? styles.kpiCardActive : ''}`} 
          data-card="blocked"
          onClick={() => handleKpiClick('blocked')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Blocked Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : blockedCount}</span>
          <span className={styles.kpiFooter}>Watchlist match confirmed</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'potential' ? styles.kpiCardActive : ''}`} 
          data-card="potential"
          onClick={() => handleKpiClick('potential')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Potential Matches</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : potentialCount}</span>
          <span className={styles.kpiFooter}>Match score &gt; 50%</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'due' ? styles.kpiCardActive : ''}`} 
          data-card="due"
          onClick={() => handleKpiClick('due')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Screening Due</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
              <Calendar size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : dueCount}</span>
          <span className={styles.kpiFooter}>Next 30 Days</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Table list & controls */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchWrap}>
                <Input
                  className={styles.searchInput}
                  placeholder="Search by vendor, code, country, PAN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const statusVal = statusFilter !== 'All' ? statusFilter.toLowerCase().replace(' ', '') : '';
                    const filterVal = filterType !== 'All' ? filterType : '';
                    const params: Record<string, string> = {};
                    if (e.target.value) params.search = e.target.value;
                    if (statusVal) params.status = statusVal;
                    if (filterVal) params.filter = filterVal;
                    if (watchlistFilter !== 'All') params.watchlist = watchlistFilter;
                    if (countryFilter !== 'All') params.country = countryFilter;
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
                    if (s === 'Cleared') card = 'cleared';
                    if (s === 'Under Review') card = 'underreview';
                    if (s === 'Blocked') card = 'blocked';
                    updateUrlParams(card, s, filterType);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Blocked">Blocked</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={watchlistFilter}
                  onChange={(e) => {
                    const w = e.target.value;
                    setWatchlistFilter(w);
                    const statusVal = statusFilter !== 'All' ? statusFilter.toLowerCase().replace(' ', '') : '';
                    const filterVal = filterType !== 'All' ? filterType : '';
                    const params: Record<string, string> = {};
                    if (searchQuery) params.search = searchQuery;
                    if (statusVal) params.status = statusVal;
                    if (filterVal) params.filter = filterVal;
                    if (w !== 'All') params.watchlist = w;
                    if (countryFilter !== 'All') params.country = countryFilter;
                    setSearchParams(params);
                  }}
                >
                  <option value="All">All Watchlists</option>
                  <option value="UN">UN Sanctions List</option>
                  <option value="OFAC">OFAC watchlists</option>
                  <option value="EU">EU Sanctions List</option>
                  <option value="RBI">RBI Restricted</option>
                  <option value="SEBI">SEBI Blacklist</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={countryFilter}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCountryFilter(c);
                    const statusVal = statusFilter !== 'All' ? statusFilter.toLowerCase().replace(' ', '') : '';
                    const filterVal = filterType !== 'All' ? filterType : '';
                    const params: Record<string, string> = {};
                    if (searchQuery) params.search = searchQuery;
                    if (statusVal) params.status = statusVal;
                    if (filterVal) params.filter = filterVal;
                    if (watchlistFilter !== 'All') params.watchlist = watchlistFilter;
                    if (c !== 'All') params.country = c;
                    setSearchParams(params);
                  }}
                >
                  <option value="All">All Countries</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Russia">Russia</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading Screening records...</div>
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
            <h3 className={styles.sectionTitle}>Screening Status Distribution</h3>
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
                  <p className="text-[10px] text-slate-400">Screened</p>
                </div>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#16a34a' }} />
                  <span className={styles.legendLabel}>Cleared</span>
                  <span className={styles.legendValue}>{clearedCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#d97706' }} />
                  <span className={styles.legendLabel}>Review</span>
                  <span className={styles.legendValue}>{underReviewCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#dc2626' }} />
                  <span className={styles.legendLabel}>Blocked</span>
                  <span className={styles.legendValue}>{blockedCount}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Watchlists match breakdown bar chart */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Watchlist Match Breakdown</h3>
            <div className="w-full h-[220px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={watchlistMatchBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" fontSize={10} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Matches" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Country-wise risk */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Country-wise Screening Risk</h3>
            <div className="w-full h-[200px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryRiskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Country" fontSize={9} interval={0} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Avg Match Score" fill="#3b82f6">
                      {countryRiskData.map((entry, index) => {
                        let color = '#22c55e';
                        if (entry['Avg Match Score'] > 80) color = '#ef4444';
                        else if (entry['Avg Match Score'] > 40) color = '#f59e0b';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Monthly Screening Trend */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Monthly Screening Trend</h3>
            <div className="w-full h-[180px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Month" fontSize={9} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Avg Score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Screening alerts panels */}
          <Card className={styles.alertsCard}>
            <h3 className={styles.sectionTitle} style={{ borderBottomColor: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle size={16} className="inline mr-2 text-red-600" /> Watchlist Alert Engine
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
                <span className="text-xs text-slate-400">{selectedVendor.vendorId} | {selectedVendor.country}</span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedVendorId(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 px-4 bg-slate-50">
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('profile')}
              >
                Screening Summary
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'screen' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('screen')}
              >
                Adjust Screening
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
                Compliance Workflow
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit trail ({selectedVendor.screeningHistory?.length || 0})
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Tab 1: Profile View */}
              {drawerTab === 'profile' && (
                <>
                  {/* Score circle & badge */}
                  <div className={styles.drawerCard}>
                    <div className={styles.riskScoreBoard}>
                      <div className={styles.riskMeterContainer} style={{ borderColor: selectedVendor.screeningStatus === 'Cleared' ? '#bbf7d0' : selectedVendor.screeningStatus === 'Under Review' ? '#fde68a' : '#fca5a5' }}>
                        <span className={styles.riskMeterScore}>{selectedVendor.matchScore}%</span>
                        <span className={styles.riskMeterLabel}>Match</span>
                      </div>
                      <div className={styles.riskRatingSection}>
                        <div className={`${styles.riskRatingBadge} ${selectedVendor.screeningStatus === 'Cleared' ? styles.riskCleared : selectedVendor.screeningStatus === 'Under Review' ? styles.riskReview : styles.riskBlocked}`}>
                          {selectedVendor.screeningStatus === 'Cleared' ? <CheckCircle2 size={16} /> : selectedVendor.screeningStatus === 'Under Review' ? <Clock size={16} /> : <AlertOctagon size={16} />}
                          <span>{selectedVendor.screeningStatus} status</span>
                        </div>
                        <p className={styles.riskRatingSummary}>
                          Screening classification computed dynamically from OFAC Consolidated, EU Consolidated watchlists, and domestic regulators.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor metadata details */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Vendor Information</h4>
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
                        <span className={styles.overviewLabel}>Country / Origin</span>
                        <span className={styles.overviewVal}>{selectedVendor.country}</span>
                      </div>
                      {selectedVendor.pan && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>PAN card</span>
                          <span className={styles.overviewVal}>{selectedVendor.pan}</span>
                        </div>
                      )}
                      {selectedVendor.gstin && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>GST register</span>
                          <span className={styles.overviewVal}>{selectedVendor.gstin}</span>
                        </div>
                      )}
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Screened On</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastScreenedOn}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Periodic screening due</span>
                        <span className={styles.overviewVal} style={isScreeningDue(selectedVendor.nextScreeningDate) ? { color: '#dc2626', fontWeight: 700 } : {}}>{selectedVendor.nextScreeningDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Source watchlist results */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Source-by-Source Watchlists Results</h4>
                    <div className={styles.screeningSourcesList}>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>UN Sanctions List</span>
                        <Badge variant={selectedVendor.screeningResult?.unList === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.screeningResult?.unList}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>OFAC SDN Watchlist</span>
                        <Badge variant={selectedVendor.screeningResult?.ofacList === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.screeningResult?.ofacList}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>EU Consolidated Sanctions List</span>
                        <Badge variant={selectedVendor.screeningResult?.euList === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.screeningResult?.euList}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>RBI Restricted Entities register</span>
                        <Badge variant={selectedVendor.screeningResult?.rbiRestricted === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.screeningResult?.rbiRestricted}
                        </Badge>
                      </div>
                      <div className={styles.screeningSourceRow}>
                        <span className={styles.sourceLabel}>SEBI Blacklisted Companies</span>
                        <Badge variant={selectedVendor.screeningResult?.sebiBlacklist === 'Match Found' ? 'danger' : 'success'}>
                          {selectedVendor.screeningResult?.sebiBlacklist}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* AI Alerts compliance insights */}
                  <div className={styles.drawerCard} style={{ backgroundColor: '#faf5ff', borderStyle: 'dashed', borderColor: '#c084fc' }}>
                    <h4 className={styles.drawerSectionTitle} style={{ color: '#6b21a8' }}>
                      <Sparkles size={14} className="inline mr-1 text-purple-700" /> Compliance Screening Insights
                    </h4>
                    <div className="flex flex-col gap-2">
                      {generateVendorInsights(selectedVendor).map((ins, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-slate-700">
                          <span className="text-purple-600 mt-0.5">•</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Adjust / Run Screening */}
              {drawerTab === 'screen' && (
                <form onSubmit={handleSaveScreening} className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Adjust Watchlists Results</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Modify watchlist matches to recalculate screening status and confidence match score.
                  </p>

                  <div className={styles.checklistGroup}>
                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>UN Sanctions List</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="unList" value="No Match" checked={unListMatch === 'No Match'} onChange={() => setUnListMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="unList" value="Match Found" checked={unListMatch === 'Match Found'} onChange={() => setUnListMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>OFAC SDN watchlist</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="ofacList" value="No Match" checked={ofacListMatch === 'No Match'} onChange={() => setOfacListMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="ofacList" value="Match Found" checked={ofacListMatch === 'Match Found'} onChange={() => setOfacListMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>EU Sanctions List</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="euList" value="No Match" checked={euListMatch === 'No Match'} onChange={() => setEuListMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="euList" value="Match Found" checked={euListMatch === 'Match Found'} onChange={() => setEuListMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>RBI Restricted Entities</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="rbiRestricted" value="No Match" checked={rbiRestrictedMatch === 'No Match'} onChange={() => setRbiRestrictedMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="rbiRestricted" value="Match Found" checked={rbiRestrictedMatch === 'Match Found'} onChange={() => setRbiRestrictedMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>

                    <div className={styles.checkFieldRow}>
                      <span className={styles.checkFieldLabel}>SEBI Blacklist registry</span>
                      <div className={styles.checkFieldOptions}>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="sebiBlacklist" value="No Match" checked={sebiBlacklistMatch === 'No Match'} onChange={() => setSebiBlacklistMatch('No Match')} /> No Match
                        </label>
                        <label className={styles.checkRadioOption}>
                          <input type="radio" name="sebiBlacklist" value="Match Found" checked={sebiBlacklistMatch === 'Match Found'} onChange={() => setSebiBlacklistMatch('Match Found')} /> Match Found
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderLabelRow}>
                      <span className={styles.sliderLabel}>Match Confidence Score</span>
                      <span className="text-xs text-slate-400">Max: 100%</span>
                    </div>
                    <div className={styles.sliderControlRow}>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className={styles.sliderRangeInput}
                        value={matchScoreSlider}
                        onChange={(e) => setMatchScoreSlider(Number(e.target.value))}
                      />
                      <span className={styles.sliderValueBox}>{matchScoreSlider}%</span>
                    </div>
                  </div>

                  {/* Real-time status mapping display */}
                  <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Live Derived Screening Status:</span>
                    <strong className={`font-bold uppercase ${matchScoreSlider >= 81 ? 'text-red-600' : matchScoreSlider >= 1 ? 'text-amber-600' : 'text-green-600'}`}>
                      {matchScoreSlider >= 81 ? 'Blocked' : matchScoreSlider >= 1 ? 'Under Review' : 'Cleared'}
                    </strong>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">Compliance Audit Comments</label>
                    <textarea 
                      className="border border-slate-200 rounded-lg p-2 text-xs h-20 outline-none focus:border-indigo-500"
                      placeholder="Explain reasons for match adjustments or screening comments..."
                      value={screeningComments}
                      onChange={(e) => setScreeningComments(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.btnGroup}>
                    <Button type="submit" variant="primary" disabled={updatingChecklist}>
                      {updatingChecklist ? 'Saving...' : 'Save Screening Checklist'}
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
                  <h4 className={styles.drawerSectionTitle}>Evidence Reports & Documents</h4>
                  <div className={styles.fileUploadContainer}>
                    <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                      <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                      <span className="block font-semibold text-xs text-slate-700">Click to Upload Screening Report</span>
                      <span className={styles.uploadText}>Supports PDF, DOCX up to 10MB</span>
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
                              <FileText size={16} className="text-indigo-600" />
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
                          No evidence reports uploaded for this screening profile.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Compliance Workflow */}
              {drawerTab === 'workflow' && (
                <>
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Compliance Workflow Progress</h4>
                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>1. Compliance Analyst Review</span>
                        <Badge variant={selectedVendor.workflow?.analyst === 'Approved' ? 'success' : selectedVendor.workflow?.analyst === 'Rejected' || selectedVendor.workflow?.analyst === 'Blocked' ? 'danger' : selectedVendor.workflow?.analyst === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.analyst || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>2. Compliance Manager Review</span>
                        <Badge variant={selectedVendor.workflow?.complianceManager === 'Approved' ? 'success' : selectedVendor.workflow?.complianceManager === 'Rejected' || selectedVendor.workflow?.complianceManager === 'Blocked' ? 'danger' : selectedVendor.workflow?.complianceManager === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.complianceManager || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>3. Legal Team Review</span>
                        <Badge variant={selectedVendor.workflow?.legalTeam === 'Approved' ? 'success' : selectedVendor.workflow?.legalTeam === 'Rejected' || selectedVendor.workflow?.legalTeam === 'Blocked' ? 'danger' : selectedVendor.workflow?.legalTeam === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.legalTeam || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>4. Procurement Head Review</span>
                        <Badge variant={selectedVendor.workflow?.procurementHead === 'Approved' ? 'success' : selectedVendor.workflow?.procurementHead === 'Rejected' || selectedVendor.workflow?.procurementHead === 'Blocked' ? 'danger' : selectedVendor.workflow?.procurementHead === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.procurementHead || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>5. Final Review & Approval</span>
                        <Badge variant={selectedVendor.workflow?.final === 'Approved' ? 'success' : selectedVendor.workflow?.final === 'Rejected' || selectedVendor.workflow?.final === 'Blocked' ? 'danger' : selectedVendor.workflow?.final === 'Sent Back' ? 'warning' : 'info'}>
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
                            <option value="legalTeam">3. Legal Team</option>
                            <option value="procurementHead">4. Procurement Head</option>
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
                            <option value="Approved">Approved / Cleared</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Sent Back">Sent Back</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Compliance Remarks</label>
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
                  <h4 className={styles.drawerSectionTitle}>Screening Log History</h4>
                  <div className={styles.historyList}>
                    {selectedVendor.screeningHistory && selectedVendor.screeningHistory.length > 0 ? (
                      [...selectedVendor.screeningHistory].reverse().map((hist, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <UserCheck size={14} className="text-slate-400" />
                            <span>{hist.result}</span>
                          </div>
                          <p className="text-slate-600 leading-snug">{hist.comments}</p>
                          <div className={styles.historyMeta}>
                            <span>By: {hist.screenedBy}</span>
                            <span>{hist.screeningDate}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No screening logs recorded yet.
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
