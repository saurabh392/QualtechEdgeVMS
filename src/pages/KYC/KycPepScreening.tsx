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
  ShieldCheck,
  UserPlus
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
import styles from './KycPepScreening.module.css';

interface ScreeningDetails {
  personName: string;
  pepMatch: 'Clear' | 'Potential' | 'Confirmed';
  pepCategory: string | null;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  pepRiskScore: number;
}

interface ScreeningResults {
  directorScreening: ScreeningDetails;
  beneficialOwnerScreening: ScreeningDetails;
  shareholderScreening: ScreeningDetails;
}

interface PepHistoryEntry {
  screeningDate: string;
  screenedBy: string;
  result: string;
  remarks: string;
  actionTaken: string;
}

interface EvidenceFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface EddRecords {
  complianceReview: boolean;
  complianceReviewNotes: string;
  fundsVerification: boolean;
  fundsVerificationNotes: string;
  wealthVerification: boolean;
  wealthVerificationNotes: string;
  executiveApproval: boolean;
  executiveApprovalNotes: string;
  periodicMonitoring: boolean;
}

interface PepAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

interface PepVendor {
  vendorId: string;
  vendorName: string;
  country: string;
  pan?: string;
  gstin?: string;
  screeningResults: ScreeningResults;
  overallStatus: 'Cleared' | 'Under Review' | 'PEP Identified';
  dueDiligenceLevel: 'Standard Due Diligence' | 'Enhanced Due Diligence' | 'Executive Approval Required';
  lastScreenedOn: string;
  nextReviewDate: string;
  workflow: {
    analyst: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    complianceManager: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    riskOfficer: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    procurementHead: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    executiveApproval: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required';
  };
  pepHistory: PepHistoryEntry[];
  evidenceFiles: EvidenceFile[];
  eddRecords: EddRecords;
  alerts?: PepAlert[];
}

export const KycPepScreening: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<PepVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Cleared' | 'Under Review' | 'PEP Identified'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'Low' | 'Medium' | 'High' | 'Critical'
  const [eddOnlyFilter, setEddOnlyFilter] = useState(false);
  const [reviewDueFilter, setReviewDueFilter] = useState(false);
  const [activeCard, setActiveCard] = useState('total');

  // Selected Vendor Drawer States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<PepVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'screening' | 'edd' | 'workflow' | 'history'>('profile');

  // Checklist / Screening Updater State Variables
  const [directorName, setDirectorName] = useState('');
  const [directorMatch, setDirectorMatch] = useState<'Clear' | 'Potential' | 'Confirmed'>('Clear');
  const [directorCategory, setDirectorCategory] = useState('');
  const [directorRisk, setDirectorRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');

  const [boName, setBoName] = useState('');
  const [boMatch, setBoMatch] = useState<'Clear' | 'Potential' | 'Confirmed'>('Clear');
  const [boCategory, setBoCategory] = useState('');
  const [boRisk, setBoRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');

  const [shName, setShName] = useState('');
  const [shMatch, setShMatch] = useState<'Clear' | 'Potential' | 'Confirmed'>('Clear');
  const [shCategory, setShCategory] = useState('');
  const [shRisk, setShRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');

  const [overallStatusInput, setOverallStatusInput] = useState<'Cleared' | 'Under Review' | 'PEP Identified'>('Cleared');
  const [dueDiligenceLevelInput, setDueDiligenceLevelInput] = useState<'Standard Due Diligence' | 'Enhanced Due Diligence' | 'Executive Approval Required'>('Standard Due Diligence');
  const [nextReviewDateInput, setNextReviewDateInput] = useState('');
  const [screeningComments, setScreeningComments] = useState('');
  const [updatingScreening, setUpdatingScreening] = useState(false);

  // EDD records states
  const [eddComplianceReview, setEddComplianceReview] = useState(false);
  const [eddComplianceNotes, setEddComplianceNotes] = useState('');
  const [eddFundsVerification, setEddFundsVerification] = useState(false);
  const [eddFundsNotes, setEddFundsNotes] = useState('');
  const [eddWealthVerification, setEddWealthVerification] = useState(false);
  const [eddWealthNotes, setEddWealthNotes] = useState('');
  const [eddExecApproval, setEddExecApproval] = useState(false);
  const [eddExecNotes, setEddExecNotes] = useState('');
  const [eddPeriodicMonitoring, setEddPeriodicMonitoring] = useState(false);

  // Evidence file upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow decisions
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'complianceManager' | 'riskOfficer' | 'procurementHead' | 'executiveApproval' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'EDD Required'>('Approved');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchPepVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/pep');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching PEP screening vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPepVendors();
  }, []);

  // Sync state from URL search params
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const eddParam = searchParams.get('edd') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    const riskParam = searchParams.get('risk') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setCategoryFilter(categoryParam);
    if (riskParam) setRiskFilter(riskParam);

    if (statusParam === 'cleared') {
      setStatusFilter('Cleared');
      setEddOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('clear');
    } else if (statusParam === 'potential') {
      setStatusFilter('Under Review');
      setEddOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('potential');
    } else if (statusParam === 'confirmed') {
      setStatusFilter('PEP Identified');
      setEddOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('confirmed');
    } else if (eddParam === 'true') {
      setStatusFilter('All');
      setEddOnlyFilter(true);
      setReviewDueFilter(false);
      setActiveCard('edd');
    } else if (filterParam === 'reviewdue') {
      setStatusFilter('All');
      setEddOnlyFilter(false);
      setReviewDueFilter(true);
      setActiveCard('reviewdue');
    } else {
      setStatusFilter('All');
      setEddOnlyFilter(false);
      setReviewDueFilter(false);
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, statusVal: string, eddVal: boolean, filterVal: boolean) => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'All') params.category = categoryFilter;
    if (riskFilter !== 'All') params.risk = riskFilter;

    if (statusVal !== 'All') {
      if (statusVal === 'Cleared') params.status = 'cleared';
      if (statusVal === 'Under Review') params.status = 'potential';
      if (statusVal === 'PEP Identified') params.status = 'confirmed';
    }
    if (eddVal) {
      params.edd = 'true';
    }
    if (filterVal) {
      params.filter = 'reviewdue';
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let s = 'All';
    let edd = false;
    let due = false;

    if (card === 'clear') s = 'Cleared';
    else if (card === 'potential') s = 'Under Review';
    else if (card === 'confirmed') s = 'PEP Identified';
    else if (card === 'edd') edd = true;
    else if (card === 'reviewdue') due = true;

    setStatusFilter(s);
    setEddOnlyFilter(edd);
    setReviewDueFilter(due);
    updateUrlParams(card, s, edd, due);
  };

  const isReviewDue = (dateStr: string) => {
    const nextReview = new Date(dateStr);
    const today = new Date("2026-06-01");
    const diffTime = nextReview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // Assign PEP Risk Score helper
  const getPepRiskScore = (match: string, category: string | null) => {
    if (match === 'Clear' || !match) return 0;
    if (match === 'Potential') return 40;
    
    // Confirmed Matches
    if (!category) return 70;
    if (category === 'Foreign Government Official') return 95;
    if (category === 'Politically Connected Family Member') return 80;
    if (category === 'Politically Connected Associate') return 75;
    if (category === 'Current Minister') return 85;
    if (category === 'Member of Parliament' || category === 'MLA / State Legislator') return 80;
    if (category === 'Former Minister' || category === 'Former State Minister') return 70;
    return 70; // Default Confirmed Local PEP
  };

  // Filter selection implementation
  const filteredVendors = vendors.filter(v => {
    const director = v.screeningResults?.directorScreening || {};
    const bo = v.screeningResults?.beneficialOwnerScreening || {};
    const sh = v.screeningResults?.shareholderScreening || {};

    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.overallStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (director.personName && director.personName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bo.personName && bo.personName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sh.personName && sh.personName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (director.pepCategory && director.pepCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bo.pepCategory && bo.pepCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sh.pepCategory && sh.pepCategory.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' ? true : v.overallStatus === statusFilter;

    // Filter by category
    let matchesCategory = true;
    if (categoryFilter !== 'All') {
      matchesCategory = 
        director.pepCategory === categoryFilter ||
        bo.pepCategory === categoryFilter ||
        sh.pepCategory === categoryFilter;
    }

    // Filter by risk level
    let matchesRisk = true;
    if (riskFilter !== 'All') {
      matchesRisk = 
        director.riskLevel === riskFilter ||
        bo.riskLevel === riskFilter ||
        sh.riskLevel === riskFilter;
    }

    let matchesEdd = true;
    if (eddOnlyFilter) {
      matchesEdd = v.dueDiligenceLevel === 'Enhanced Due Diligence' || v.dueDiligenceLevel === 'Executive Approval Required';
    }

    let matchesDue = true;
    if (reviewDueFilter) {
      matchesDue = isReviewDue(v.nextReviewDate);
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesRisk && matchesEdd && matchesDue;
  });

  // Calculate dynamic KPI card numbers
  const totalChecked = vendors.length;
  const clearCount = vendors.filter(v => v.overallStatus === 'Cleared').length;
  const potentialCount = vendors.filter(v => v.overallStatus === 'Under Review').length;
  const confirmedCount = vendors.filter(v => v.overallStatus === 'PEP Identified').length;
  const eddCount = vendors.filter(v => v.dueDiligenceLevel === 'Enhanced Due Diligence' || v.dueDiligenceLevel === 'Executive Approval Required').length;
  const reviewsDueCount = vendors.filter(v => isReviewDue(v.nextReviewDate)).length;

  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/pep/${id}`);
      const v = res.data;
      setSelectedVendor(v);

      // Load form bindings
      const d = v.screeningResults?.directorScreening || {};
      setDirectorName(d.personName || '');
      setDirectorMatch(d.pepMatch || 'Clear');
      setDirectorCategory(d.pepCategory || '');
      setDirectorRisk(d.riskLevel || 'Low');

      const b = v.screeningResults?.beneficialOwnerScreening || {};
      setBoName(b.personName || '');
      setBoMatch(b.pepMatch || 'Clear');
      setBoCategory(b.pepCategory || '');
      setBoRisk(b.riskLevel || 'Low');

      const s = v.screeningResults?.shareholderScreening || {};
      setShName(s.personName || '');
      setShMatch(s.pepMatch || 'Clear');
      setShCategory(s.pepCategory || '');
      setShRisk(s.riskLevel || 'Low');

      setOverallStatusInput(v.overallStatus || 'Cleared');
      setDueDiligenceLevelInput(v.dueDiligenceLevel || 'Standard Due Diligence');
      setNextReviewDateInput(v.nextReviewDate || '');
      setScreeningComments('');

      // Load EDD bindings
      const edd = v.eddRecords || {};
      setEddComplianceReview(!!edd.complianceReview);
      setEddComplianceNotes(edd.complianceReviewNotes || '');
      setEddFundsVerification(!!edd.fundsVerification);
      setEddFundsNotes(edd.fundsVerificationNotes || '');
      setEddWealthVerification(!!edd.wealthVerification);
      setEddWealthNotes(edd.wealthVerificationNotes || '');
      setEddExecApproval(!!edd.executiveApproval);
      setEddExecNotes(edd.executiveApprovalNotes || '');
      setEddPeriodicMonitoring(!!edd.periodicMonitoring);
    } catch (err) {
      console.error('Error fetching single vendor PEP profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Save PEP Screening results Form
  const handleSaveScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setUpdatingScreening(true);

      const computedDirScore = getPepRiskScore(directorMatch, directorCategory);
      const computedBoScore = getPepRiskScore(boMatch, boCategory);
      const computedShScore = getPepRiskScore(shMatch, shCategory);

      const screeningResultsPayload = {
        directorScreening: {
          personName: directorName,
          pepMatch: directorMatch,
          pepCategory: directorMatch !== 'Clear' ? directorCategory : null,
          riskLevel: directorMatch !== 'Clear' ? directorRisk : 'Low',
          pepRiskScore: computedDirScore
        },
        beneficialOwnerScreening: {
          personName: boName,
          pepMatch: boMatch,
          pepCategory: boMatch !== 'Clear' ? boCategory : null,
          riskLevel: boMatch !== 'Clear' ? boRisk : 'Low',
          pepRiskScore: computedBoScore
        },
        shareholderScreening: {
          personName: shName,
          pepMatch: shMatch,
          pepCategory: shMatch !== 'Clear' ? shCategory : null,
          riskLevel: shMatch !== 'Clear' ? shRisk : 'Low',
          pepRiskScore: computedShScore
        }
      };

      const res = await axios.post('/api/kyc/pep/screen', {
        vendorId: selectedVendor.vendorId,
        screeningResults: screeningResultsPayload,
        overallStatus: overallStatusInput,
        dueDiligenceLevel: dueDiligenceLevelInput,
        nextReviewDate: nextReviewDateInput,
        comments: screeningComments,
        eddRecords: {
          complianceReview: eddComplianceReview,
          complianceReviewNotes: eddComplianceNotes,
          fundsVerification: eddFundsVerification,
          fundsVerificationNotes: eddFundsNotes,
          wealthVerification: eddWealthVerification,
          wealthVerificationNotes: eddWealthNotes,
          executiveApproval: eddExecApproval,
          executiveApprovalNotes: eddExecNotes,
          periodicMonitoring: eddPeriodicMonitoring
        },
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchPepVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error saving PEP screening results checklist:', err);
    } finally {
      setUpdatingScreening(false);
    }
  };

  // Save EDD records separately
  const handleSaveEdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    
    // Calls screen endpoint with current state parameters
    await handleSaveScreening(e);
  };

  // Handle Workflow Status updates
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/pep/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });

      if (res.data.success) {
        await fetchPepVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error transitioning PEP approval workflow stage:', err);
    } finally {
      setSubmittingWorkflow(false);
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

      const res = await axios.post('/api/kyc/pep/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        await axios.post('/api/kyc/pep/attach-file', {
          vendorId: selectedVendor.vendorId,
          fileMetadata: res.data.file
        });
        
        await fetchPepVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
      }
    } catch (err) {
      console.error('Error uploading PEP investigation report:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Country',
      'Overall PEP Status',
      'Due Diligence Level',
      'Director Match',
      'Director PEP Category',
      'BO Match',
      'BO PEP Category',
      'Shareholder Match',
      'Shareholder PEP Category',
      'Last Screened',
      'Next Review Date'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.country,
      v.overallStatus,
      v.dueDiligenceLevel,
      v.screeningResults?.directorScreening?.pepMatch,
      v.screeningResults?.directorScreening?.pepCategory || 'None',
      v.screeningResults?.beneficialOwnerScreening?.pepMatch,
      v.screeningResults?.beneficialOwnerScreening?.pepCategory || 'None',
      v.screeningResults?.shareholderScreening?.pepMatch,
      v.screeningResults?.shareholderScreening?.pepCategory || 'None',
      v.lastScreenedOn,
      v.nextReviewDate
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMS_PEP_Screening_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Computations
  const statusDistributionData = [
    { name: 'Cleared', value: clearCount, color: '#16a34a' },
    { name: 'Under Review', value: potentialCount, color: '#d97706' },
    { name: 'PEP Identified', value: confirmedCount, color: '#dc2626' }
  ].filter(e => e.value > 0);

  const getCategoryDistributionData = () => {
    const categories: Record<string, number> = {};
    vendors.forEach(v => {
      ['directorScreening', 'beneficialOwnerScreening', 'shareholderScreening'].forEach(role => {
        const sr = (v.screeningResults as any)?.[role] || {};
        if (sr.pepMatch === 'Confirmed' && sr.pepCategory) {
          categories[sr.pepCategory] = (categories[sr.pepCategory] || 0) + 1;
        }
      });
    });

    return Object.keys(categories).map(k => ({
      Category: k,
      Matches: categories[k]
    }));
  };

  const categoryDistributionData = getCategoryDistributionData();

  const getCountryExposureData = () => {
    const countries: Record<string, number> = {};
    vendors.forEach(v => {
      if (v.overallStatus === 'PEP Identified') {
        countries[v.country] = (countries[v.country] || 0) + 1;
      }
    });

    return Object.keys(countries).map(k => ({
      Country: k,
      'Confirmed PEPs': countries[k]
    })).sort((a,b) => b['Confirmed PEPs'] - a['Confirmed PEPs']);
  };

  const countryExposureData = getCountryExposureData();

  const getMonthlyTrendData = () => {
    const months: Record<string, number> = {};
    vendors.forEach(v => {
      const date = v.lastScreenedOn || '2026-05-15';
      const monthStr = date.substring(0, 7); // YYYY-MM
      months[monthStr] = (months[monthStr] || 0) + 1;
    });

    return Object.keys(months).sort().map(m => ({
      Month: m,
      Screened: months[m]
    }));
  };

  const monthlyTrendData = getMonthlyTrendData();

  const getEddPipelineData = () => {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    vendors.forEach(v => {
      if (v.dueDiligenceLevel === 'Enhanced Due Diligence' || v.dueDiligenceLevel === 'Executive Approval Required') {
        const edd = v.eddRecords || {};
        const completedCount = 
          (edd.complianceReview ? 1 : 0) + 
          (edd.fundsVerification ? 1 : 0) + 
          (edd.wealthVerification ? 1 : 0) + 
          (edd.executiveApproval ? 1 : 0);

        if (completedCount === 4) {
          completed++;
        } else if (completedCount > 0) {
          inProgress++;
        } else {
          pending++;
        }
      }
    });

    return [
      { name: 'Pending Review', Count: pending, fill: '#ef4444' },
      { name: 'In Progress', Count: inProgress, fill: '#f59e0b' },
      { name: 'EDD Completed', Count: completed, fill: '#10b981' }
    ];
  };

  const eddPipelineData = getEddPipelineData();

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
  const tableColumns: Column<PepVendor>[] = [
    { header: 'Vendor ID', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Country', accessor: (row) => row.country || 'N/A' },
    { 
      header: 'Director Screening', 
      accessor: (row) => {
        const ds = row.screeningResults?.directorScreening || {};
        let varStyle: 'success' | 'warning' | 'danger' = 'success';
        if (ds.pepMatch === 'Potential') varStyle = 'warning';
        if (ds.pepMatch === 'Confirmed') varStyle = 'danger';
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs text-gray-700">{ds.personName || 'N/A'}</span>
            <Badge variant={varStyle}>{ds.pepMatch || 'Clear'}</Badge>
          </div>
        );
      } 
    },
    { 
      header: 'Beneficial Owner', 
      accessor: (row) => {
        const bo = row.screeningResults?.beneficialOwnerScreening || {};
        let varStyle: 'success' | 'warning' | 'danger' = 'success';
        if (bo.pepMatch === 'Potential') varStyle = 'warning';
        if (bo.pepMatch === 'Confirmed') varStyle = 'danger';
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs text-gray-700">{bo.personName || 'N/A'}</span>
            <Badge variant={varStyle}>{bo.pepMatch || 'Clear'}</Badge>
          </div>
        );
      } 
    },
    { 
      header: 'Shareholder', 
      accessor: (row) => {
        const sh = row.screeningResults?.shareholderScreening || {};
        let varStyle: 'success' | 'warning' | 'danger' = 'success';
        if (sh.pepMatch === 'Potential') varStyle = 'warning';
        if (sh.pepMatch === 'Confirmed') varStyle = 'danger';
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs text-gray-700">{sh.personName || 'N/A'}</span>
            <Badge variant={varStyle}>{sh.pepMatch || 'Clear'}</Badge>
          </div>
        );
      } 
    },
    { 
      header: 'Risk Level', 
      accessor: (row) => {
        const ds = row.screeningResults?.directorScreening || {};
        const bo = row.screeningResults?.beneficialOwnerScreening || {};
        const sh = row.screeningResults?.shareholderScreening || {};
        
        let maxRisk = 'Low';
        const risks = [ds.riskLevel, bo.riskLevel, sh.riskLevel];
        if (risks.includes('Critical')) maxRisk = 'Critical';
        else if (risks.includes('High')) maxRisk = 'High';
        else if (risks.includes('Medium')) maxRisk = 'Medium';
        
        let badgeVar: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (maxRisk === 'Low') badgeVar = 'success';
        if (maxRisk === 'Medium') badgeVar = 'warning';
        if (maxRisk === 'High') badgeVar = 'danger';
        if (maxRisk === 'Critical') badgeVar = 'danger';
        
        return <Badge variant={badgeVar}>{maxRisk}</Badge>;
      } 
    },
    { 
      header: 'Due Diligence Level', 
      accessor: (row) => {
        let variant: 'info' | 'warning' | 'danger' = 'info';
        if (row.dueDiligenceLevel === 'Enhanced Due Diligence') variant = 'warning';
        if (row.dueDiligenceLevel === 'Executive Approval Required') variant = 'danger';
        return <Badge variant={variant}>{row.dueDiligenceLevel}</Badge>;
      }
    },
    { 
      header: 'Overall Status', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (row.overallStatus === 'Under Review') variant = 'warning';
        if (row.overallStatus === 'PEP Identified') variant = 'danger';
        return <Badge variant={variant}>{row.overallStatus}</Badge>;
      } 
    },
    { header: 'Next Review Date', accessor: (row) => row.nextReviewDate || '-' },
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
          <div className={styles.breadcrumbs}>Vendor Onboarding & KYC &gt; PEP Screening</div>
          <h2 className={styles.title}>Politically Exposed Person (PEP) Screening Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} className="mr-2 inline" /> Export Filtered CSV
          </Button>
          <Button variant="primary" onClick={fetchPepVendors}>
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
          <span className={styles.kpiValue}>{loading ? '...' : totalChecked}</span>
          <span className={styles.kpiFooter}>Vendors in PEP Scope</span>
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
          <span className={styles.kpiFooter}>No PEP Matches</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'potential' ? styles.kpiCardActive : ''}`} 
          data-card="potential"
          onClick={() => handleKpiClick('potential')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Potential Matches</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : potentialCount}</span>
          <span className={styles.kpiFooter}>Under Compliance Review</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'confirmed' ? styles.kpiCardActive : ''}`} 
          data-card="confirmed"
          onClick={() => handleKpiClick('confirmed')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Confirmed PEPs</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : confirmedCount}</span>
          <span className={styles.kpiFooter}>Enhanced Due Diligence</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'edd' ? styles.kpiCardActive : ''}`} 
          data-card="edd"
          onClick={() => handleKpiClick('edd')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>EDD Required</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : eddCount}</span>
          <span className={styles.kpiFooter}>High-Risk Exposure Check</span>
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
                  placeholder="Search by vendor, director, code..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const statusVal = statusFilter !== 'All' ? statusFilter : 'All';
                    updateUrlParams(activeCard, statusVal, eddOnlyFilter, reviewDueFilter);
                  }}
                />
              </div>

              <div className={styles.filters}>
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatusFilter(val);
                    let card = 'total';
                    if (val === 'Cleared') card = 'clear';
                    if (val === 'Under Review') card = 'potential';
                    if (val === 'PEP Identified') card = 'confirmed';
                    updateUrlParams(card, val, eddOnlyFilter, reviewDueFilter);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Under Review">Potential Match (Under Review)</option>
                  <option value="PEP Identified">PEP Identified (Confirmed)</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="Current Minister">Current Minister</option>
                  <option value="Former Minister">Former Minister</option>
                  <option value="Member of Parliament">Member of Parliament (MP)</option>
                  <option value="MLA / State Legislator">MLA / State Legislator</option>
                  <option value="Government Official">Government Official</option>
                  <option value="Senior Bureaucrat">Senior Bureaucrat</option>
                  <option value="State-Owned Enterprise Executive">State-Owned Enterprise Executive</option>
                  <option value="Politically Connected Family Member">Family Member</option>
                  <option value="Politically Connected Associate">Associate</option>
                  <option value="Foreign Government Official">Foreign Government Official</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value);
                  }}
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading PEP records...</div>
            ) : (
              <DataTable
                columns={tableColumns}
                data={filteredVendors}
                keyExtractor={(row) => row.vendorId}
              />
            )}
          </Card>
        </div>

        {/* Recharts visualizations & Alerts */}
        <div className={styles.sideSection}>
          {/* Compliance Alerts Panel */}
          {overallAlertList.length > 0 && (
            <div className={styles.alertsCard}>
              <h4 className={styles.sectionTitle} style={{ color: '#be123c', borderBottomColor: '#fecdd3' }}>
                <AlertTriangle size={16} className="inline mr-2" /> High-Risk PEP Alerts
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

          {/* PEP Status Distribution */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <Activity size={16} className="inline mr-2" /> PEP Status Breakdown
            </h4>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Vendors`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.donutLegend}>
                {statusDistributionData.map((entry, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: entry.color }} />
                    <span className={styles.legendLabel}>{entry.name}</span>
                    <span className={styles.legendValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PEP Category Matches */}
          {categoryDistributionData.length > 0 && (
            <div className={styles.chartCard}>
              <h4 className={styles.sectionTitle}>
                <UserCheck size={16} className="inline mr-2" /> Matches by PEP Category
              </h4>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistributionData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="Category" tick={{ fontSize: 9 }} interval={0} height={40} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="Matches" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* EDD Pipeline status */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <ShieldCheck size={16} className="inline mr-2" /> EDD Checklist Pipeline
            </h4>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eddPipelineData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Country-wise Exposure */}
          {countryExposureData.length > 0 && (
            <div className={styles.chartCard}>
              <h4 className={styles.sectionTitle}>
                <Globe size={16} className="inline mr-2" /> Exposure by Country
              </h4>
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryExposureData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="Country" type="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="Confirmed PEPs" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly Trend Timeline */}
          <div className={styles.chartCard}>
            <h4 className={styles.sectionTitle}>
              <Calendar size={16} className="inline mr-2" /> Screening Volume Trend
            </h4>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="Month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Screened" stroke="#9333ea" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Side-Drawer Details Panel Overlay */}
      {selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className="font-semibold text-lg">{selectedVendor.vendorName}</h3>
                <span className="text-xs text-gray-500">ID: {selectedVendor.vendorId} | {selectedVendor.country}</span>
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
                className={`${styles.drawerTab} ${drawerTab === 'screening' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('screening')}
              >
                PEP screening Detail
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'edd' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('edd')}
              >
                Enhanced Due Diligence (EDD)
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'workflow' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Workflow Tracker
              </button>
              <button 
                className={`${styles.drawerTab} ${drawerTab === 'history' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit Timeline & Files
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Profile Summary Tab */}
              {drawerTab === 'profile' && (
                <>
                  {selectedVendor.overallStatus === 'PEP Identified' && (
                    <div className={styles.restrictionBanner}>
                      <AlertTriangle size={18} />
                      <span>Politically Exposed Person Identified – Enhanced Due Diligence Required</span>
                    </div>
                  )}

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <UserCheck size={14} /> Compliance Overview
                    </div>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Overall PEP Status</span>
                        <span className={styles.overviewVal}>
                          <Badge variant={selectedVendor.overallStatus === 'PEP Identified' ? 'danger' : selectedVendor.overallStatus === 'Under Review' ? 'warning' : 'success'}>
                            {selectedVendor.overallStatus}
                          </Badge>
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Due Diligence Level</span>
                        <span className={styles.overviewVal}>
                          <Badge variant={selectedVendor.dueDiligenceLevel === 'Standard Due Diligence' ? 'info' : 'warning'}>
                            {selectedVendor.dueDiligenceLevel}
                          </Badge>
                        </span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Country of Jurisdiction</span>
                        <span className={styles.overviewVal}>{selectedVendor.country}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>PAN card / Tax registration</span>
                        <span className={styles.overviewVal}>{selectedVendor.pan || 'N/A'}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>GSTIN / Business Registration</span>
                        <span className={styles.overviewVal}>{selectedVendor.gstin || 'N/A'}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Screened Date</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastScreenedOn}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Next Scheduled Review</span>
                        <span className={styles.overviewVal}>{selectedVendor.nextReviewDate}</span>
                      </div>
                    </div>
                  </div>

                  {selectedVendor.alerts && selectedVendor.alerts.length > 0 && (
                    <div className={styles.drawerCard}>
                      <div className={styles.drawerSectionTitle}>
                        <AlertTriangle size={14} /> Active Compliance Flags
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

              {/* PEP Screening Detail Tab */}
              {drawerTab === 'screening' && (
                <form onSubmit={handleSaveScreening} className="flex flex-col gap-5">
                  <div className={styles.screeningGrid}>
                    {/* Director screening Card */}
                    <div className={styles.screenerCard}>
                      <div className={styles.screenerTitle}>
                        <span>1. Director Screening</span>
                        <Badge variant={directorMatch === 'Clear' ? 'success' : directorMatch === 'Potential' ? 'warning' : 'danger'}>
                          {directorMatch}
                        </Badge>
                      </div>
                      <div className={styles.checklistGroup}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Director Full Name</label>
                          <Input 
                            className={styles.formInput} 
                            value={directorName} 
                            onChange={(e) => setDirectorName(e.target.value)} 
                            placeholder="Enter Director Name"
                          />
                        </div>
                        <div className={styles.checkFieldRow}>
                          <span className={styles.checkFieldLabel}>PEP Match Status</span>
                          <div className={styles.checkFieldOptions}>
                            {(['Clear', 'Potential', 'Confirmed'] as const).map(op => (
                              <label key={op} className={styles.checkRadioOption}>
                                <input 
                                  type="radio" 
                                  name="dirMatch" 
                                  value={op} 
                                  checked={directorMatch === op} 
                                  onChange={() => setDirectorMatch(op)} 
                                /> {op}
                              </label>
                            ))}
                          </div>
                        </div>
                        {directorMatch !== 'Clear' && (
                          <div className={styles.grid2Col}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>PEP Watchlist Category</label>
                              <select 
                                className={styles.filterSelect} 
                                value={directorCategory} 
                                onChange={(e) => setDirectorCategory(e.target.value)}
                              >
                                <option value="">Select Category</option>
                                <option value="Current Minister">Current Minister</option>
                                <option value="Former Minister">Former Minister</option>
                                <option value="Member of Parliament">Member of Parliament</option>
                                <option value="MLA / State Legislator">MLA / State Legislator</option>
                                <option value="Government Official">Government Official</option>
                                <option value="Senior Bureaucrat">Senior Bureaucrat</option>
                                <option value="State-Owned Enterprise Executive">State-Owned Enterprise Executive</option>
                                <option value="Politically Connected Family Member">Family Member</option>
                                <option value="Politically Connected Associate">Associate</option>
                                <option value="Foreign Government Official">Foreign Government Official</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Political Exposure Risk</label>
                              <select 
                                className={styles.filterSelect} 
                                value={directorRisk} 
                                onChange={(e) => setDirectorRisk(e.target.value as any)}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Beneficial Owner screening Card */}
                    <div className={styles.screenerCard}>
                      <div className={styles.screenerTitle}>
                        <span>2. Beneficial Owner Screening</span>
                        <Badge variant={boMatch === 'Clear' ? 'success' : boMatch === 'Potential' ? 'warning' : 'danger'}>
                          {boMatch}
                        </Badge>
                      </div>
                      <div className={styles.checklistGroup}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Beneficial Owner Name</label>
                          <Input 
                            className={styles.formInput} 
                            value={boName} 
                            onChange={(e) => setBoName(e.target.value)} 
                            placeholder="Enter Owner Name"
                          />
                        </div>
                        <div className={styles.checkFieldRow}>
                          <span className={styles.checkFieldLabel}>PEP Match Status</span>
                          <div className={styles.checkFieldOptions}>
                            {(['Clear', 'Potential', 'Confirmed'] as const).map(op => (
                              <label key={op} className={styles.checkRadioOption}>
                                <input 
                                  type="radio" 
                                  name="boMatch" 
                                  value={op} 
                                  checked={boMatch === op} 
                                  onChange={() => setBoMatch(op)} 
                                /> {op}
                              </label>
                            ))}
                          </div>
                        </div>
                        {boMatch !== 'Clear' && (
                          <div className={styles.grid2Col}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>PEP Watchlist Category</label>
                              <select 
                                className={styles.filterSelect} 
                                value={boCategory} 
                                onChange={(e) => setBoCategory(e.target.value)}
                              >
                                <option value="">Select Category</option>
                                <option value="Current Minister">Current Minister</option>
                                <option value="Former Minister">Former Minister</option>
                                <option value="Member of Parliament">Member of Parliament</option>
                                <option value="MLA / State Legislator">MLA / State Legislator</option>
                                <option value="Government Official">Government Official</option>
                                <option value="Senior Bureaucrat">Senior Bureaucrat</option>
                                <option value="State-Owned Enterprise Executive">State-Owned Enterprise Executive</option>
                                <option value="Politically Connected Family Member">Family Member</option>
                                <option value="Politically Connected Associate">Associate</option>
                                <option value="Foreign Government Official">Foreign Government Official</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Political Exposure Risk</label>
                              <select 
                                className={styles.filterSelect} 
                                value={boRisk} 
                                onChange={(e) => setBoRisk(e.target.value as any)}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shareholder Screening Card */}
                    <div className={styles.screenerCard}>
                      <div className={styles.screenerTitle}>
                        <span>3. Shareholder Screening</span>
                        <Badge variant={shMatch === 'Clear' ? 'success' : shMatch === 'Potential' ? 'warning' : 'danger'}>
                          {shMatch}
                        </Badge>
                      </div>
                      <div className={styles.checklistGroup}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Major Shareholder Name</label>
                          <Input 
                            className={styles.formInput} 
                            value={shName} 
                            onChange={(e) => setShName(e.target.value)} 
                            placeholder="Enter Shareholder Name"
                          />
                        </div>
                        <div className={styles.checkFieldRow}>
                          <span className={styles.checkFieldLabel}>PEP Match Status</span>
                          <div className={styles.checkFieldOptions}>
                            {(['Clear', 'Potential', 'Confirmed'] as const).map(op => (
                              <label key={op} className={styles.checkRadioOption}>
                                <input 
                                  type="radio" 
                                  name="shMatch" 
                                  value={op} 
                                  checked={shMatch === op} 
                                  onChange={() => setShMatch(op)} 
                                /> {op}
                              </label>
                            ))}
                          </div>
                        </div>
                        {shMatch !== 'Clear' && (
                          <div className={styles.grid2Col}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>PEP Watchlist Category</label>
                              <select 
                                className={styles.filterSelect} 
                                value={shCategory} 
                                onChange={(e) => setShCategory(e.target.value)}
                              >
                                <option value="">Select Category</option>
                                <option value="Current Minister">Current Minister</option>
                                <option value="Former Minister">Former Minister</option>
                                <option value="Member of Parliament">Member of Parliament</option>
                                <option value="MLA / State Legislator">MLA / State Legislator</option>
                                <option value="Government Official">Government Official</option>
                                <option value="Senior Bureaucrat">Senior Bureaucrat</option>
                                <option value="State-Owned Enterprise Executive">State-Owned Enterprise Executive</option>
                                <option value="Politically Connected Family Member">Family Member</option>
                                <option value="Politically Connected Associate">Associate</option>
                                <option value="Foreign Government Official">Foreign Government Official</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Political Exposure Risk</label>
                              <select 
                                className={styles.filterSelect} 
                                value={shRisk} 
                                onChange={(e) => setShRisk(e.target.value as any)}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <ShieldCheck size={14} /> Screen Results Decision
                    </div>
                    <div className={styles.grid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Overall PEP Screening Status</label>
                        <select 
                          className={styles.filterSelect} 
                          value={overallStatusInput} 
                          onChange={(e) => setOverallStatusInput(e.target.value as any)}
                        >
                          <option value="Cleared">Cleared (No PEP match)</option>
                          <option value="Under Review">Under Review (Potential PEP match)</option>
                          <option value="PEP Identified">PEP Identified (Confirmed PEP match)</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Assigned Due Diligence Level</label>
                        <select 
                          className={styles.filterSelect} 
                          value={dueDiligenceLevelInput} 
                          onChange={(e) => setDueDiligenceLevelInput(e.target.value as any)}
                        >
                          <option value="Standard Due Diligence">Standard Due Diligence</option>
                          <option value="Enhanced Due Diligence">Enhanced Due Diligence (EDD)</option>
                          <option value="Executive Approval Required">Executive Approval Required</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.grid2Col} style={{ marginTop: '12px' }}>
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
                    <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                      <label className={styles.formLabel}>Compliance Comments / Rationale</label>
                      <textarea 
                        className={styles.formTextarea} 
                        value={screeningComments} 
                        onChange={(e) => setScreeningComments(e.target.value)} 
                        placeholder="Log screening investigation details here..."
                      />
                    </div>
                  </div>

                  <div className={styles.btnGroup}>
                    <Button type="submit" variant="primary" disabled={updatingScreening}>
                      {updatingScreening ? 'Saving Checks...' : 'Save Screening Checklist'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setDrawerTab('profile')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Enhanced Due Diligence (EDD) Tab */}
              {drawerTab === 'edd' && (
                <form onSubmit={handleSaveEdd} className="flex flex-col gap-4">
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <ShieldCheck size={14} /> EDD Compliance Requirements Checklists
                    </div>
                    <div className={styles.checklistGroup}>
                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                        <label className="flex items-center gap-2 font-semibold text-sm">
                          <input 
                            type="checkbox" 
                            checked={eddComplianceReview} 
                            onChange={(e) => setEddComplianceReview(e.target.checked)} 
                          /> Additional Compliance Review Required
                        </label>
                        <textarea 
                          className={styles.formTextarea}
                          value={eddComplianceNotes}
                          onChange={(e) => setEddComplianceNotes(e.target.value)}
                          placeholder="Log notes about compliance review audit..."
                        />
                      </div>

                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                        <label className="flex items-center gap-2 font-semibold text-sm">
                          <input 
                            type="checkbox" 
                            checked={eddFundsVerification} 
                            onChange={(e) => setEddFundsVerification(e.target.checked)} 
                          /> Source of Funds Verification
                        </label>
                        <textarea 
                          className={styles.formTextarea}
                          value={eddFundsNotes}
                          onChange={(e) => setEddFundsNotes(e.target.value)}
                          placeholder="Verify routing bank account details, funding country, transactions history..."
                        />
                      </div>

                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                        <label className="flex items-center gap-2 font-semibold text-sm">
                          <input 
                            type="checkbox" 
                            checked={eddWealthVerification} 
                            onChange={(e) => setEddWealthVerification(e.target.checked)} 
                          /> Wealth Verification Audit
                        </label>
                        <textarea 
                          className={styles.formTextarea}
                          value={eddWealthNotes}
                          onChange={(e) => setEddWealthNotes(e.target.value)}
                          placeholder="Log beneficial owner wealth audit results, asset declarations..."
                        />
                      </div>

                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                        <label className="flex items-center gap-2 font-semibold text-sm">
                          <input 
                            type="checkbox" 
                            checked={eddExecApproval} 
                            onChange={(e) => setEddExecApproval(e.target.checked)} 
                          /> Board level / Executive Approval Received
                        </label>
                        <textarea 
                          className={styles.formTextarea}
                          value={eddExecNotes}
                          onChange={(e) => setEddExecNotes(e.target.value)}
                          placeholder="Reference executive board resolution number, approval dates..."
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 font-semibold text-sm">
                          <input 
                            type="checkbox" 
                            checked={eddPeriodicMonitoring} 
                            onChange={(e) => setEddPeriodicMonitoring(e.target.checked)} 
                          /> Enable Continuous Political Exposure Monitoring
                        </label>
                        <span className="text-xs text-gray-500 ml-6">
                          If checked, system runs automated daily search queries sweeps.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.btnGroup}>
                    <Button type="submit" variant="primary" disabled={updatingScreening}>
                      {updatingScreening ? 'Saving EDD...' : 'Save EDD Records'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setDrawerTab('profile')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Workflow Tab */}
              {drawerTab === 'workflow' && (
                <div className="flex flex-col gap-4">
                  <div className={styles.drawerCard}>
                    <div className={styles.drawerSectionTitle}>
                      <UserCheck size={14} /> Multi-Stage Approvals Track
                    </div>
                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>1. Compliance Analyst Review</span>
                        <Badge variant={selectedVendor.workflow?.analyst === 'Approved' ? 'success' : selectedVendor.workflow?.analyst === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.analyst || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>2. Compliance Manager Check</span>
                        <Badge variant={selectedVendor.workflow?.complianceManager === 'Approved' ? 'success' : selectedVendor.workflow?.complianceManager === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.complianceManager || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>3. Risk Officer Assessment</span>
                        <Badge variant={selectedVendor.workflow?.riskOfficer === 'Approved' ? 'success' : selectedVendor.workflow?.riskOfficer === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.riskOfficer || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>4. Procurement Head Review</span>
                        <Badge variant={selectedVendor.workflow?.procurementHead === 'Approved' ? 'success' : selectedVendor.workflow?.procurementHead === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.procurementHead || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>5. Executive Panel Board Approval</span>
                        <Badge variant={selectedVendor.workflow?.executiveApproval === 'Approved' ? 'success' : selectedVendor.workflow?.executiveApproval === 'Pending' ? 'warning' : 'danger'}>
                          {selectedVendor.workflow?.executiveApproval || 'Pending'}
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
                      <UserPlus size={14} /> Submit Stage Decision
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
                          <option value="complianceManager">Compliance Manager</option>
                          <option value="riskOfficer">Risk Officer</option>
                          <option value="procurementHead">Procurement Head</option>
                          <option value="executiveApproval">Executive Approval</option>
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
                          <option value="EDD Required">Require EDD Investigation</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: '12px' }}>
                      <label className={styles.formLabel}>Workflow Review Comments</label>
                      <textarea 
                        className={styles.formTextarea}
                        value={workflowComments}
                        onChange={(e) => setWorkflowComments(e.target.value)}
                        placeholder="Log approval or escalation notes details here..."
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" style={{ marginTop: '14px' }} disabled={submittingWorkflow}>
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
                        <span className="font-semibold text-xs text-blue-600 block">Click to upload audit file</span>
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
                      <Sparkles size={14} /> Compliance Audit History Trail
                    </div>
                    <div className={styles.historyList}>
                      {selectedVendor.pepHistory && selectedVendor.pepHistory.length > 0 ? (
                        selectedVendor.pepHistory.map((item, index) => (
                          <div key={index} className={styles.historyItem}>
                            <div className="font-semibold text-sm flex justify-between">
                              <span className="text-gray-800">{item.result}</span>
                              <Badge variant="info">{item.actionTaken}</Badge>
                            </div>
                            <p className="text-gray-600 mt-1">{item.remarks}</p>
                            <div className={styles.historyMeta}>
                              <span>Officer: {item.screenedBy}</span>
                              <span>Date: {item.screeningDate}</span>
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
