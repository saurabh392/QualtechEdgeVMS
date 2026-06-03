import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
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
  Upload,
  Globe,
  Activity,
  Plus,
  Trash2
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
import styles from './KycAdverseMedia.module.css';

interface MediaFinding {
  incidentId: string;
  incidentType: 'Fraud' | 'Corruption' | 'Cyber Crime' | 'Regulatory Violation' | 'Bankruptcy';
  incidentTitle: string;
  incidentDate: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  source: string;
  status: 'Open' | 'Resolved' | 'Under Investigation' | 'Closed';
  details: string;
}

interface MediaHistoryEntry {
  incidentDate: string;
  incidentType: string;
  severity: string;
  recordedBy: string;
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

interface MediaAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface MediaVendor {
  vendorId: string;
  vendorName: string;
  industry: string;
  country: string;
  mediaFindings: MediaFinding[];
  mediaRiskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  screeningStatus: 'Cleared' | 'Alert' | 'Blocked';
  lastScreenedOn: string;
  nextReviewDate: string;
  workflow: {
    analyst: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    riskManager: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    legalTeam: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    procurementHead: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    executiveReview: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
  };
  mediaHistory: MediaHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  alerts?: MediaAlert[];
}

export const KycAdverseMedia: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<MediaVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'Low' | 'Medium' | 'High' | 'Critical'
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Fraud' | 'Corruption' ...
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Open' | 'Resolved' ...
  const [countryFilter, setCountryFilter] = useState('All');
  const [openOnlyFilter, setOpenOnlyFilter] = useState(false);
  const [reviewDueFilter, setReviewDueFilter] = useState(false);
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<MediaVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'incidents' | 'workflow' | 'history'>('profile');

  // Incident Adder form states
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncType, setNewIncType] = useState<'Fraud' | 'Corruption' | 'Cyber Crime' | 'Regulatory Violation' | 'Bankruptcy'>('Regulatory Violation');
  const [newIncDate, setNewIncDate] = useState('');
  const [newIncSeverity, setNewIncSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newIncSource, setNewIncSource] = useState('');
  const [newIncStatus, setNewIncStatus] = useState<'Open' | 'Resolved' | 'Under Investigation' | 'Closed'>('Open');
  const [newIncDetails, setNewIncDetails] = useState('');

  // Form comments
  const [nextReviewDateInput, setNextReviewDateInput] = useState('');
  const [screeningComments, setScreeningComments] = useState('');
  const [updatingIncidents, setUpdatingIncidents] = useState(false);

  // Evidence file upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow decisions
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'riskManager' | 'legalTeam' | 'procurementHead' | 'executiveReview' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required'>('Approved');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchMediaVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/media');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching Adverse Media vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaVendors();
  }, []);

  // Sync state from URL search params
  useEffect(() => {
    const riskParam = searchParams.get('risk') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const typeParam = searchParams.get('type') || '';
    const statusParam = searchParams.get('status') || '';
    const countryParam = searchParams.get('country') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (typeParam) setTypeFilter(typeParam);
    if (statusParam) setStatusFilter(statusParam);
    if (countryParam) setCountryFilter(countryParam);

    if (riskParam === 'low') {
      setRiskFilter('Low');
      setOpenOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('clear');
    } else if (riskParam === 'medium') {
      setRiskFilter('Medium');
      setOpenOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('medium');
    } else if (riskParam === 'high') {
      setRiskFilter('High');
      setOpenOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('high');
    } else if (filterParam === 'open') {
      setRiskFilter('All');
      setOpenOnlyFilter(true);
      setReviewDueFilter(false);
      setActiveCard('open');
    } else if (filterParam === 'reviewdue') {
      setRiskFilter('All');
      setOpenOnlyFilter(false);
      setReviewDueFilter(true);
      setActiveCard('reviewdue');
    } else {
      setRiskFilter('All');
      setOpenOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, riskVal: string, openVal: boolean, filterVal: boolean) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (typeFilter !== 'All') params.type = typeFilter;
    if (statusFilter !== 'All') params.status = statusFilter;
    if (countryFilter !== 'All') params.country = countryFilter;

    if (riskVal !== 'All') {
      params.risk = riskVal.toLowerCase();
    }
    if (openVal) {
      params.filter = 'open';
    }
    if (filterVal) {
      params.filter = 'reviewdue';
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let r = 'All';
    let open = false;
    let due = false;

    if (card === 'clear') r = 'Low';
    else if (card === 'medium') r = 'Medium';
    else if (card === 'high') r = 'High';
    else if (card === 'open') open = true;
    else if (card === 'reviewdue') due = true;

    setRiskFilter(r);
    setOpenOnlyFilter(open);
    setReviewDueFilter(due);
    updateUrlParams(card, r, open, due);
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
    const findings = v.mediaFindings || [];

    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.riskLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      findings.some(f => 
        f.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.source.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRisk = riskFilter === 'All' ? true : v.riskLevel === riskFilter;

    let matchesType = true;
    if (typeFilter !== 'All') {
      matchesType = findings.some(f => f.incidentType === typeFilter);
    }

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = findings.some(f => f.status === statusFilter);
    }

    let matchesCountry = true;
    if (countryFilter !== 'All') {
      matchesCountry = v.country === countryFilter;
    }

    let matchesOpen = true;
    if (openOnlyFilter) {
      matchesOpen = findings.some(f => f.status === 'Open');
    }

    let matchesDue = true;
    if (reviewDueFilter) {
      matchesDue = isReviewDue(v.nextReviewDate);
    }

    return matchesSearch && matchesRisk && matchesType && matchesStatus && matchesCountry && matchesOpen && matchesDue;
  });

  // KPI count parameters
  const totalScreened = vendors.length;
  const lowCount = vendors.filter(v => v.riskLevel === 'Low').length;
  const mediumCount = vendors.filter(v => v.riskLevel === 'Medium').length;
  const highCount = vendors.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length;
  const openCasesCount = vendors.filter(v => v.mediaFindings?.some(f => f.status === 'Open')).length;
  const reviewsDueCount = vendors.filter(v => isReviewDue(v.nextReviewDate)).length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/media/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      setNextReviewDateInput(v.nextReviewDate || '');
      setScreeningComments('');

      // Reset incident inputs
      setNewIncTitle('');
      setNewIncSource('');
      setNewIncDetails('');
    } catch (err) {
      console.error('Error fetching single vendor Adverse Media profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Add an incident locally and commit to API
  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setUpdatingIncidents(true);

      const newIncident: MediaFinding = {
        incidentId: `INC-${Date.now().toString().slice(-4)}`,
        incidentType: newIncType,
        incidentTitle: newIncTitle,
        incidentDate: newIncDate || new Date().toISOString().split('T')[0],
        severity: newIncSeverity,
        source: newIncSource,
        status: newIncStatus,
        details: newIncDetails
      };

      const updatedIncidents = [...(selectedVendor.mediaFindings || []), newIncident];

      const res = await axios.post('/api/kyc/media/incident', {
        vendorId: selectedVendor.vendorId,
        incidents: updatedIncidents,
        nextReviewDate: nextReviewDateInput,
        comments: `Added incident: ${newIncTitle} (${newIncType})`,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchMediaVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        
        // Reset inputs
        setNewIncTitle('');
        setNewIncSource('');
        setNewIncDetails('');
        setNewIncDate('');
      }
    } catch (err) {
      console.error('Error adding adverse media incident:', err);
    } finally {
      setUpdatingIncidents(false);
    }
  };

  // Remove an incident and commit
  const handleRemoveIncident = async (incidentId: string) => {
    if (!selectedVendor) return;

    try {
      setUpdatingIncidents(true);

      const updatedIncidents = (selectedVendor.mediaFindings || []).filter(f => f.incidentId !== incidentId);

      const res = await axios.post('/api/kyc/media/incident', {
        vendorId: selectedVendor.vendorId,
        incidents: updatedIncidents,
        nextReviewDate: nextReviewDateInput,
        comments: `Removed incident ID: ${incidentId}`,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchMediaVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error removing adverse media incident:', err);
    } finally {
      setUpdatingIncidents(false);
    }
  };

  // Save changes comments and next review date
  const handleSaveProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setUpdatingIncidents(true);

      const res = await axios.post('/api/kyc/media/incident', {
        vendorId: selectedVendor.vendorId,
        incidents: selectedVendor.mediaFindings,
        nextReviewDate: nextReviewDateInput,
        comments: screeningComments || 'Updated review date and Compliance rationale.',
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchMediaVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error updating Adverse Media screening properties:', err);
    } finally {
      setUpdatingIncidents(false);
    }
  };

  // Submit approval stage workflow
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/media/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchMediaVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error transitioning Adverse Media workflow stage:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  // Evidence file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVendor) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');
      formData.append('vendorId', selectedVendor.vendorId);

      const res = await axios.post('/api/kyc/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        await axios.post('/api/kyc/media/attach-file', {
          vendorId: selectedVendor.vendorId,
          fileMetadata: res.data.file
        });

        await fetchMediaVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error uploading adverse media document:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  // Exporter Filtered Dataset CSV
  const handleExportCSV = () => {
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Industry',
      'Country',
      'Findings Count',
      'Media Risk Score',
      'Risk Level',
      'Screening Status',
      'Last Screened On',
      'Next Review Date'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.industry,
      v.country,
      v.mediaFindings?.length || 0,
      v.mediaRiskScore,
      v.riskLevel,
      v.screeningStatus,
      v.lastScreenedOn,
      v.nextReviewDate
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMS_Adverse_Media_Screening_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Overview computations
  const riskDistributionData = [
    { name: 'Low Risk', value: vendors.filter(v => v.riskLevel === 'Low').length, color: '#16a34a' },
    { name: 'Medium Risk', value: vendors.filter(v => v.riskLevel === 'Medium').length, color: '#d97706' },
    { name: 'High Risk', value: vendors.filter(v => v.riskLevel === 'High').length, color: '#dc2626' },
    { name: 'Critical Risk', value: vendors.filter(v => v.riskLevel === 'Critical').length, color: '#9f1239' }
  ].filter(e => e.value > 0);

  const getIncidentTypeDistribution = () => {
    let fraud = 0, corruption = 0, cyber = 0, regulatory = 0, bankruptcy = 0;

    vendors.forEach(v => {
      (v.mediaFindings || []).forEach(f => {
        if (f.incidentType === 'Fraud') fraud++;
        else if (f.incidentType === 'Corruption') corruption++;
        else if (f.incidentType === 'Cyber Crime') cyber++;
        else if (f.incidentType === 'Regulatory Violation') regulatory++;
        else if (f.incidentType === 'Bankruptcy') bankruptcy++;
      });
    });

    return [
      { name: 'Fraud', Count: fraud },
      { name: 'Corruption', Count: corruption },
      { name: 'Cyber Crime', Count: cyber },
      { name: 'Regulatory', Count: regulatory },
      { name: 'Bankruptcy', Count: bankruptcy }
    ];
  };

  const incidentTypeData = getIncidentTypeDistribution();

  const getCasesStatusData = () => {
    let open = 0;
    let resolved = 0;
    let underInvestigation = 0;

    vendors.forEach(v => {
      (v.mediaFindings || []).forEach(f => {
        if (f.status === 'Open') open++;
        else if (f.status === 'Resolved' || f.status === 'Closed') resolved++;
        else if (f.status === 'Under Investigation') underInvestigation++;
      });
    });

    return [
      { name: 'Open', value: open, fill: '#ef4444' },
      { name: 'Under Investigation', value: underInvestigation, fill: '#f59e0b' },
      { name: 'Resolved / Closed', value: resolved, fill: '#10b981' }
    ];
  };

  const casesStatusData = getCasesStatusData();

  const getMonthlyTrendData = () => {
    const months: Record<string, number> = {};

    vendors.forEach(v => {
      (v.mediaFindings || []).forEach(f => {
        const date = f.incidentDate || '2024-05-15';
        const monthStr = date.substring(0, 7); // YYYY-MM
        months[monthStr] = (months[monthStr] || 0) + 1;
      });
    });

    return Object.keys(months).sort().map(m => ({
      Month: m,
      Findings: months[m]
    }));
  };

  const monthlyTrendData = getMonthlyTrendData();

  const getCountryRiskData = () => {
    const countries: Record<string, number> = {};

    vendors.forEach(v => {
      if (v.mediaRiskScore > 30) {
        countries[v.country] = (countries[v.country] || 0) + v.mediaRiskScore;
      }
    });

    return Object.keys(countries).map(k => ({
      Country: k,
      'Aggregate Risk Score': countries[k]
    })).sort((a,b) => b['Aggregate Risk Score'] - a['Aggregate Risk Score']);
  };

  const countryRiskData = getCountryRiskData();

  const getOverallAlerts = () => {
    const list: string[] = [];
    vendors.forEach(v => {
      (v.alerts || []).forEach(a => {
        const item = `[${v.vendorId}] ${v.vendorName}: ${a.type} - ${a.message}`;
        if (!list.includes(item)) {
          list.push(item);
        }
      });
    });
    return list.slice(0, 5); // display top 5 alerts
  };

  const overallAlertList = getOverallAlerts();

  // Columns definition
  const tableColumns: Column<MediaVendor>[] = [
    { header: 'Vendor ID', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Industry', accessor: (row) => row.industry || 'N/A' },
    { header: 'Country', accessor: (row) => row.country || 'N/A' },
    { 
      header: 'Findings Count', 
      align: 'center',
      accessor: (row) => (
        <Badge variant={row.mediaFindings?.length > 0 ? 'warning' : 'success'}>
          {row.mediaFindings?.length || 0}
        </Badge>
      ) 
    },
    { header: 'Risk Score', align: 'center', accessor: (row) => row.mediaRiskScore || 0 },
    { 
      header: 'Risk Level', 
      accessor: (row) => {
        let badgeVar: 'success' | 'warning' | 'danger' = 'success';
        if (row.riskLevel === 'Medium') badgeVar = 'warning';
        if (row.riskLevel === 'High' || row.riskLevel === 'Critical') badgeVar = 'danger';
        return <Badge variant={badgeVar}>{row.riskLevel}</Badge>;
      } 
    },
    { 
      header: 'Latest Incident', 
      accessor: (row) => {
        if (!row.mediaFindings || row.mediaFindings.length === 0) return '-';
        const sorted = [...row.mediaFindings].sort((a,b) => b.incidentDate.localeCompare(a.incidentDate));
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs text-gray-700">{sorted[0].incidentTitle}</span>
            <span className="text-gray-400 text-[10px]">{sorted[0].incidentDate}</span>
          </div>
        );
      }
    },
    { header: 'Last Screened', accessor: (row) => row.lastScreenedOn || '-' },
    { 
      header: 'Status', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (row.screeningStatus === 'Alert') variant = 'warning';
        if (row.screeningStatus === 'Blocked') variant = 'danger';
        return <Badge variant={variant}>{row.screeningStatus}</Badge>;
      } 
    },
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
          <div className={styles.breadcrumbs}>Due Diligence & KYC &gt; Adverse Media</div>
          <h2 className={styles.title}>Adverse Media & Reputation screening Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} className="mr-2 inline" /> Export Filtered CSV
          </Button>
          <Button variant="primary" onClick={fetchMediaVendors}>
            <RefreshCw size={16} className="mr-2 inline" /> Rescreen All
          </Button>
        </div>
      </div>

      {/* Dynamic KPI Cards Panel */}
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
          <span className={styles.kpiFooter}>Active screening scope</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'clear' ? styles.kpiCardActive : ''}`} 
          data-card="clear"
          onClick={() => handleKpiClick('clear')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>No Findings</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : lowCount}</span>
          <span className={styles.kpiFooter}>Risk: Low / Clear</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'medium' ? styles.kpiCardActive : ''}`} 
          data-card="medium"
          onClick={() => handleKpiClick('medium')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Medium Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : mediumCount}</span>
          <span className={styles.kpiFooter}>Requires Enhanced Review</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'high' ? styles.kpiCardActive : ''}`} 
          data-card="high"
          onClick={() => handleKpiClick('high')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>High Risk Alerts</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : highCount}</span>
          <span className={styles.kpiFooter}>Investigation Escalations</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'open' ? styles.kpiCardActive : ''}`} 
          data-card="open"
          onClick={() => handleKpiClick('open')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Open Incidents</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ffe4e6', color: '#be123c' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : openCasesCount}</span>
          <span className={styles.kpiFooter}>Unresolved negative news</span>
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
          <span className={styles.kpiValue}>{loading ? '...' : reviewsDueCount}</span>
          <span className={styles.kpiFooter}>Next 30 Days</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Table list grid */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchWrap}>
                <Input
                  className={styles.searchInput}
                  placeholder="Search by vendor name, source..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const riskVal = riskFilter !== 'All' ? riskFilter : 'All';
                    updateUrlParams(activeCard, riskVal, openOnlyFilter, reviewDueFilter);
                  }}
                />
              </div>

              <div className={styles.filters}>
                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRiskFilter(val);
                    let card = 'total';
                    if (val === 'Low') card = 'clear';
                    if (val === 'Medium') card = 'medium';
                    if (val === 'High') card = 'high';
                    updateUrlParams(card, val, openOnlyFilter, reviewDueFilter);
                  }}
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High / Critical Risk</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                  }}
                >
                  <option value="All">All Incident Types</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Corruption">Corruption</option>
                  <option value="Cyber Crime">Cyber Crime</option>
                  <option value="Regulatory Violation">Regulatory Violation</option>
                  <option value="Bankruptcy">Bankruptcy</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="All">All Incident Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading Adverse Media records...</div>
            ) : (
              <DataTable
                columns={tableColumns}
                data={filteredVendors}
                keyExtractor={(row) => row.vendorId}
              />
            )}
          </Card>
        </div>

        {/* Side widgets: charts & alerts list */}
        <div className={styles.sideSection}>
          {overallAlertList.length > 0 && (
            <div className={styles.alertsCard}>
              <h4 className={styles.sectionTitle} style={{ color: '#be123c', borderBottomColor: '#fecdd3' }}>
                <AlertTriangle size={16} className="inline mr-2" /> Critical Reputational Alerts
              </h4>
              <div className={styles.alertList}>
                {overallAlertList.map((alert, i) => (
                  <div key={i} className={styles.alertItem}>
                    <div className={styles.alertText}>{alert}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Level Distribution Pie */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <Activity size={16} className="inline mr-2" /> Reputation Risk Distribution
            </h4>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Vendors`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {riskDistributionData.map((entry, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: entry.color }} />
                    <span className={styles.legendLabel}>{entry.name}</span>
                    <span className={styles.legendValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Type Bar Chart */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <AlertTriangle size={16} className="inline mr-2" /> Findings by Incident Type
            </h4>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentTypeData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Open vs Resolved Cases */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <UserCheck size={16} className="inline mr-2" /> Investigation Cases Status
            </h4>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={casesStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {casesStatusData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cases`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {casesStatusData.map((entry, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: entry.fill }} />
                    <span className={styles.legendLabel}>{entry.name}</span>
                    <span className={styles.legendValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country-wise Media Risk */}
          {countryRiskData.length > 0 && (
            <div className={styles.chartCard}>
              <h4 className={styles.sectionTitle}>
                <Globe size={16} className="inline mr-2" /> Aggregate Media Risk by Country
              </h4>
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryRiskData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="Country" type="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="Aggregate Risk Score" fill="#e11d48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly Trend Timeline */}
          {monthlyTrendData.length > 0 && (
            <div className={styles.chartCard}>
              <h4 className={styles.sectionTitle}>
                <Calendar size={16} className="inline mr-2" /> Monthly Incident Findings Trend
              </h4>
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="Month" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Findings" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-Drawer Details Panel Overlay */}
      {selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className="font-semibold text-lg">{selectedVendor.vendorName}</h3>
                <span className="text-xs text-gray-500">ID: {selectedVendor.vendorId} | {selectedVendor.country} | {selectedVendor.industry}</span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedVendorId(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.drawerTabs}>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'profile' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('profile')}
              >
                Profile Summary
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'incidents' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('incidents')}
              >
                Incident Manager
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'workflow' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Investigation Workflow
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'history' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit Trails & Evidence
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Profile Summary Tab */}
              {drawerTab === 'profile' && (
                <>
                  {(selectedVendor.riskLevel === 'High' || selectedVendor.riskLevel === 'Critical') && (
                    <div className={styles.restrictionBanner}>
                      <AlertTriangle size={18} />
                      <span>⚠ Significant Adverse Media Detected – Enhanced Review Required</span>
                    </div>
                  )}

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <UserCheck size={14} /> Reputational Screening Overview
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Adverse Findings Count</span>
                        <span className={styles.overviewVal}>
                          <Badge variant={selectedVendor.mediaFindings?.length > 0 ? 'warning' : 'success'}>
                            {selectedVendor.mediaFindings?.length || 0} Incidents
                          </Badge>
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Media Risk Score</span>
                        <span className={styles.overviewVal}>{selectedVendor.mediaRiskScore} / 100</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Assessed Risk Level</span>
                        <span className={styles.overviewVal}>
                          <Badge variant={selectedVendor.riskLevel === 'Low' ? 'success' : selectedVendor.riskLevel === 'Medium' ? 'warning' : 'danger'}>
                            {selectedVendor.riskLevel} Risk
                          </Badge>
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Jurisdiction Country</span>
                        <span className={styles.overviewVal}>{selectedVendor.country}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Industry Category</span>
                        <span className={styles.overviewVal}>{selectedVendor.industry}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Screened Date</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastScreenedOn}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Next Screening Review</span>
                        <span className={styles.overviewVal}>{selectedVendor.nextReviewDate}</span>
                      </div>
                    </div>
                  </div>

                  {selectedVendor.alerts && selectedVendor.alerts.length > 0 && (
                    <div className={styles.drawerCard}>
                      <div className={styles.drawerSectionTitle}>
                        <AlertTriangle size={14} /> Active Compliance Warnings
                      </div>
                      <div className={styles.alertList}>
                        {selectedVendor.alerts.map((al, idx) => (
                          <div key={idx} className={styles.alertItem} style={{ borderLeftColor: al.severity === 'critical' ? '#dc2626' : al.severity === 'high' ? '#d97706' : '#9333ea' }}>
                            <div className={styles.alertText}>
                              <strong>{al.type}</strong>: {al.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Incidents Tab */}
              {drawerTab === 'incidents' && (
                <div className="flex flex-col gap-4">
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <AlertTriangle size={14} /> Registered Adverse Findings
                    </div>
                    <div className={styles.incidentList}>
                      {selectedVendor.mediaFindings && selectedVendor.mediaFindings.length > 0 ? (
                        selectedVendor.mediaFindings.map(inc => (
                          <div key={inc.incidentId} className={styles.incidentCard}>
                            <div className={styles.incidentTitleBar}>
                              <span className={styles.incidentName}>{inc.incidentTitle}</span>
                              <Badge variant={inc.status === 'Resolved' || inc.status === 'Closed' ? 'success' : inc.status === 'Under Investigation' ? 'warning' : 'danger'}>
                                {inc.status}
                              </Badge>
                            </div>
                            <div className={styles.incidentMeta}>
                              <span>Type: {inc.incidentType}</span>
                              <span>Date: {inc.incidentDate}</span>
                              <span>Source: {inc.source}</span>
                              <span>Severity: {inc.severity}</span>
                            </div>
                            <p className={styles.incidentDetailsText}>{inc.details}</p>
                            <button 
                              className={styles.removeBtn} 
                              onClick={() => handleRemoveIncident(inc.incidentId)}
                              title="Delete Incident"
                              disabled={updatingIncidents}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-gray-400 py-3">No adverse findings logged.</div>
                      )}
                    </div>
                  </div>

                  {/* Add Incident Form */}
                  <form onSubmit={handleAddIncident} className={styles.addIncidentForm}>
                    <div className={styles.drawerSectionTitle} style={{ borderBottom: 'none', marginBottom: 0 }}>
                      <Plus size={14} /> Log New Negative News Finding
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Incident Title</label>
                      <Input 
                        className={styles.formInput}
                        value={newIncTitle}
                        onChange={(e) => setNewIncTitle(e.target.value)}
                        placeholder="e.g. Tax Evasion Investigation"
                        required
                      />
                    </div>
                    <div className={styles.grid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Incident Category Type</label>
                        <select 
                          className={styles.filterSelect}
                          value={newIncType}
                          onChange={(e) => setNewIncType(e.target.value as any)}
                        >
                          <option value="Fraud">Fraud</option>
                          <option value="Corruption">Corruption</option>
                          <option value="Cyber Crime">Cyber Crime</option>
                          <option value="Regulatory Violation">Regulatory Violation</option>
                          <option value="Bankruptcy">Bankruptcy</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Incident Date</label>
                        <Input 
                          type="date"
                          className={styles.formInput}
                          value={newIncDate}
                          onChange={(e) => setNewIncDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.grid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Case Severity</label>
                        <select 
                          className={styles.filterSelect}
                          value={newIncSeverity}
                          onChange={(e) => setNewIncSeverity(e.target.value as any)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Media Source</label>
                        <Input 
                          className={styles.formInput}
                          value={newIncSource}
                          onChange={(e) => setNewIncSource(e.target.value)}
                          placeholder="e.g. Daily Herald, State Portal"
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Case Investigation Status</label>
                      <select 
                        className={styles.filterSelect}
                        value={newIncStatus}
                        onChange={(e) => setNewIncStatus(e.target.value as any)}
                      >
                        <option value="Open">Open</option>
                        <option value="Under Investigation">Under Investigation</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Case Details & Descriptions</label>
                      <textarea 
                        className={styles.formTextarea}
                        value={newIncDetails}
                        onChange={(e) => setNewIncDetails(e.target.value)}
                        placeholder="Log incident brief text summary details here..."
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" disabled={updatingIncidents}>
                      {updatingIncidents ? 'Adding Incident...' : 'Add Incident Finding'}
                    </Button>
                  </form>

                  {/* Other fields */}
                  <form onSubmit={handleSaveProperties} className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Calendar size={14} /> Review Schedule Settings
                    </div>
                    <div className={styles.grid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Next Screening Review Date</label>
                        <Input 
                          type="date"
                          className={styles.formInput}
                          value={nextReviewDateInput}
                          onChange={(e) => setNextReviewDateInput(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                      <label className={styles.formLabel}>Compliance Review Notes</label>
                      <textarea 
                        className={styles.formTextarea}
                        value={screeningComments}
                        onChange={(e) => setScreeningComments(e.target.value)}
                        placeholder="Log compliance analysis rationale comments here..."
                      />
                    </div>
                    <Button type="submit" variant="primary" style={{ marginTop: '12px' }} disabled={updatingIncidents}>
                      {updatingIncidents ? 'Saving...' : 'Save Schedule Changes'}
                    </Button>
                  </form>
                </div>
              )}

              {/* Workflow Tab */}
              {drawerTab === 'workflow' && (
                <div className="flex flex-col gap-4">
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <UserCheck size={14} /> Multi-Party Review Stages
                    </div>
                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>1. Compliance Analyst Review</span>
                        <Badge variant={selectedVendor.workflow?.analyst === 'Approved' ? 'success' : selectedVendor.workflow?.analyst === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.analyst || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>2. Risk Manager Assessment</span>
                        <Badge variant={selectedVendor.workflow?.riskManager === 'Approved' ? 'success' : selectedVendor.workflow?.riskManager === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.riskManager || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>3. Legal Counsel Review</span>
                        <Badge variant={selectedVendor.workflow?.legalTeam === 'Approved' ? 'success' : selectedVendor.workflow?.legalTeam === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.legalTeam || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>4. Procurement Head Oversight</span>
                        <Badge variant={selectedVendor.workflow?.procurementHead === 'Approved' ? 'success' : selectedVendor.workflow?.procurementHead === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.procurementHead || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>5. Executive Committee Review</span>
                        <Badge variant={selectedVendor.workflow?.executiveReview === 'Approved' ? 'success' : selectedVendor.workflow?.executiveReview === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.executiveReview || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>6. Final Decision Action</span>
                        <Badge variant={selectedVendor.workflow?.final === 'Approved' ? 'success' : selectedVendor.workflow?.final === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.final || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleWorkflowSubmit} className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Plus size={14} /> Submit Stage Assessment
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>My Workflow Review Stage</label>
                        <select 
                          className={styles.filterSelect}
                          value={workflowStage}
                          onChange={(e) => setWorkflowStage(e.target.value as any)}
                        >
                          <option value="analyst">Compliance Analyst</option>
                          <option value="riskManager">Risk Manager</option>
                          <option value="legalTeam">Legal Team</option>
                          <option value="procurementHead">Procurement Head</option>
                          <option value="executiveReview">Executive Review</option>
                          <option value="final">Final Decision</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Action Decision</label>
                        <select 
                          className={styles.filterSelect}
                          value={workflowAction}
                          onChange={(e) => setWorkflowAction(e.target.value as any)}
                        >
                          <option value="Approved">Approve / Clear</option>
                          <option value="Rejected">Reject / Block</option>
                          <option value="Escalated">Escalate Stage</option>
                          <option value="EDD Required">Require EDD Audit</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                      <label className={styles.formLabel}>Stage Comments</label>
                      <textarea 
                        className={styles.formTextarea}
                        value={workflowComments}
                        onChange={(e) => setWorkflowComments(e.target.value)}
                        placeholder="Log decision rationale details here..."
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" disabled={submittingWorkflow}>
                      {submittingWorkflow ? 'Submitting...' : 'Submit Decision'}
                    </Button>
                  </form>
                </div>
              )}

              {/* History & Files Tab */}
              {drawerTab === 'history' && (
                <>
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <FileText size={14} /> Evidence Documents List
                    </div>
                    <div className={styles.fileUploadContainer}>
                      <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                        <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                        <span className="font-semibold text-xs text-blue-600 block">Click to upload report file</span>
                        <span className={styles.uploadText}>Supports PDF, DOCX, ZIP files (Max 10MB)</span>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          onChange={handleFileUpload} 
                          disabled={uploadingFile}
                        />
                      </div>
                      {uploadingFile && <div className="text-center text-xs text-gray-500">Uploading evidence file...</div>}

                      <div className={styles.evidenceFileList}>
                        {selectedVendor.evidenceFiles && selectedVendor.evidenceFiles.length > 0 ? (
                          selectedVendor.evidenceFiles.map((file) => (
                            <div key={file.fileId} className={styles.evidenceFileItem}>
                              <div>
                                <span className={styles.fileNameText} title={file.fileName}>{file.fileName}</span>
                                <div className={styles.fileMetaText}>Uploaded by {file.uploadedBy} on {file.uploadedOn}</div>
                              </div>
                              <a 
                                href={file.filePath} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-600 font-semibold text-xs hover:underline flex items-center gap-1"
                              >
                                <Download size={12} /> View/Download
                              </a>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-xs text-gray-400 py-3">No compliance evidence files attached.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <Sparkles size={14} /> Compliance Audit History Timeline
                    </div>
                    <div className={styles.historyList}>
                      {selectedVendor.mediaHistory && selectedVendor.mediaHistory.length > 0 ? (
                        selectedVendor.mediaHistory.map((item, index) => (
                          <div key={index} className={item.remarks.includes('System') ? styles.historyItem : styles.historyItem}>
                            <div className="font-semibold text-sm flex justify-between">
                              <span className="text-gray-800">{item.incidentType}</span>
                              <Badge variant="info">{item.actionTaken}</Badge>
                            </div>
                            <p className="text-gray-600 mt-1">{item.remarks}</p>
                            <div className={styles.historyMeta}>
                              <span>Officer: {item.recordedBy}</span>
                              <span>Date: {item.incidentDate}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-gray-400 py-3">No historical audit events logged.</div>
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
