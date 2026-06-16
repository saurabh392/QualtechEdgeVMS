import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Eye, 
  TrendingUp, 
  Layers, 
  Sparkles,
  Calendar,
  X,
  RefreshCw,
  UserCheck
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
import styles from './KycRiskAssessment.module.css';

interface RiskFactors {
  financialStability: number;
  complianceHistory: number;
  litigationRecords: number;
  contractValue: number;
  businessCriticality: number;
  geographyRisk: number;
}

interface RiskAlert {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

interface AssessmentHistoryEntry {
  assessedBy: string;
  action: string;
  comments: string;
  timestamp: string;
}

interface RiskAssessmentVendor {
  vendorId: string;
  vendorName: string;
  category: string;
  pan?: string;
  gstin?: string;
  riskFactors: RiskFactors;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastAssessmentDate: string;
  nextReviewDate: string;
  status: 'Approved' | 'Under Review' | 'Rejected' | 'Pending';
  workflow: {
    analyst: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    complianceManager: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    legalTeam: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    procurementHead: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
  };
  assessmentHistory: AssessmentHistoryEntry[];
  alerts?: RiskAlert[];
}

export const KycRiskAssessment: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<RiskAssessmentVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'reviewdue' | 'critical'
  const [activeCard, setActiveCard] = useState('total');

  // Drawer & Assessment Form States
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<RiskAssessmentVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'sliders' | 'workflow' | 'history'>('profile');

  // Sliders values state
  const [financialSlider, setFinancialSlider] = useState(0);
  const [complianceSlider, setComplianceSlider] = useState(0);
  const [litigationSlider, setLitigationSlider] = useState(0);
  const [contractSlider, setContractSlider] = useState(0);
  const [criticalitySlider, setCriticalitySlider] = useState(0);
  const [geographySlider, setGeographySlider] = useState(0);
  const [assessmentComments, setAssessmentComments] = useState('');
  const [updatingAssessment, setUpdatingAssessment] = useState(false);

  // Workflow submission state
  const [workflowStage, setWorkflowStage] = useState<'analyst' | 'complianceManager' | 'legalTeam' | 'procurementHead' | 'final'>('analyst');
  const [workflowAction, setWorkflowAction] = useState<'Approved' | 'Rejected' | 'Sent Back' | 'Pending'>('Approved');
  const [workflowComments, setWorkflowComments] = useState('');
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const fetchRiskVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/risk');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching KYC Risk Vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskVendors();
  }, []);

  // Sync state from URL on load and changes
  useEffect(() => {
    const riskParam = searchParams.get('risk') || '';
    const filterParam = searchParams.get('filter') || '';
    const searchParam = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || '';
    const categoryParam = searchParams.get('category') || '';

    if (searchParam) setSearchQuery(searchParam);
    if (statusParam) setStatusFilter(statusParam);
    if (categoryParam) setCategoryFilter(categoryParam);

    if (riskParam === 'low') {
      setRiskFilter('Low');
      setFilterType('All');
      setActiveCard('low');
    } else if (riskParam === 'medium') {
      setRiskFilter('Medium');
      setFilterType('All');
      setActiveCard('medium');
    } else if (riskParam === 'high') {
      setRiskFilter('High');
      setFilterType('All');
      setActiveCard('high');
    } else if (filterParam === 'reviewdue') {
      setRiskFilter('All');
      setFilterType('reviewdue');
      setActiveCard('reviewdue');
    } else if (filterParam === 'critical') {
      setRiskFilter('All');
      setFilterType('critical');
      setActiveCard('critical');
    } else {
      setRiskFilter('All');
      setFilterType('All');
      setActiveCard('total');
    }
  }, [searchParams]);

  // Sync state back to URL
  const updateUrlParams = (newActiveCard: string, riskVal: string, filterVal: string) => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== 'All') params.status = statusFilter;
    if (categoryFilter !== 'All') params.category = categoryFilter;

    if (riskVal !== 'All') {
      params.risk = riskVal.toLowerCase();
    }
    if (filterVal !== 'All') {
      params.filter = filterVal.toLowerCase();
    }

    setSearchParams(params);
    setActiveCard(newActiveCard);
  };

  const handleKpiClick = (card: string) => {
    let r = 'All';
    let f = 'All';

    if (card === 'low') r = 'Low';
    else if (card === 'medium') r = 'Medium';
    else if (card === 'high') r = 'High';
    else if (card === 'reviewdue') f = 'reviewdue';
    else if (card === 'critical') f = 'critical';

    setRiskFilter(r);
    setFilterType(f);
    updateUrlParams(card, r, f);
  };

  // Helper to determine if a vendor's review is due within 30 days of June 1, 2026
  const isReviewDue = (dateStr: string) => {
    const nextReview = new Date(dateStr);
    const today = new Date("2026-06-01");
    const diffTime = nextReview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // Filtering Logic
  const filteredVendors = vendors.filter(v => {
    // Search filter
    const matchesSearch = 
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.pan && v.pan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.gstin && v.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.riskLevel.toLowerCase().includes(searchQuery.toLowerCase());

    // Dropdown filters
    const matchesRisk = riskFilter === 'All' ? true : v.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' ? true : v.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' ? true : v.category === categoryFilter;

    // Special card filters
    let matchesSpecial = true;
    if (filterType === 'reviewdue') {
      matchesSpecial = isReviewDue(v.nextReviewDate);
    } else if (filterType === 'critical') {
      matchesSpecial = v.riskScore > 80;
    }

    return matchesSearch && matchesRisk && matchesStatus && matchesCategory && matchesSpecial;
  });

  // Calculate dynamic KPI card numbers
  const totalAssessed = vendors.length;
  const lowRiskCount = vendors.filter(v => v.riskLevel === 'Low').length;
  const mediumRiskCount = vendors.filter(v => v.riskLevel === 'Medium').length;
  const highRiskCount = vendors.filter(v => v.riskLevel === 'High').length;
  const reviewsDueCount = vendors.filter(v => isReviewDue(v.nextReviewDate)).length;
  const criticalExposureCount = vendors.filter(v => v.riskScore > 80).length;

  // Drawer Vendor Fetch & Setup
  const fetchSingleVendor = async (id: string) => {
    try {
      const res = await axios.get(`/api/kyc/risk/${id}`);
      const v = res.data;
      setSelectedVendor(v);
      
      // Seed sliders with vendor values
      const rf = v.riskFactors || {};
      setFinancialSlider(rf.financialStability || 0);
      setComplianceSlider(rf.complianceHistory || 0);
      setLitigationSlider(rf.litigationRecords || 0);
      setContractSlider(rf.contractValue || 0);
      setCriticalitySlider(rf.businessCriticality || 0);
      setGeographySlider(rf.geographyRisk || 0);
      setAssessmentComments('');
    } catch (err) {
      console.error('Error fetching single vendor risk profile:', err);
    }
  };

  useEffect(() => {
    if (selectedVendorId) {
      fetchSingleVendor(selectedVendorId);
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Handle Assessment Sliders Update
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      setUpdatingAssessment(true);
      const res = await axios.post('/api/kyc/risk/assess', {
        vendorId: selectedVendor.vendorId,
        riskFactors: {
          financialStability: financialSlider,
          complianceHistory: complianceSlider,
          litigationRecords: litigationSlider,
          contractValue: contractSlider,
          businessCriticality: criticalitySlider,
          geographyRisk: geographySlider
        },
        comments: assessmentComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        // Refresh
        await fetchRiskVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error updating vendor risk assessment factors:', err);
    } finally {
      setUpdatingAssessment(false);
    }
  };

  // Handle Workflow Status Updates
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      setSubmittingWorkflow(true);
      const res = await axios.post('/api/kyc/risk/workflow', {
        vendorId: selectedVendor.vendorId,
        stage: workflowStage,
        action: workflowAction,
        comment: workflowComments,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        await fetchRiskVendors();
        await fetchSingleVendor(selectedVendor.vendorId);
        setWorkflowComments('');
        setDrawerTab('profile');
      }
    } catch (err) {
      console.error('Error submitting risk assessment workflow action:', err);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Vendor Code',
      'Vendor Name',
      'Category',
      'Risk Score',
      'Risk Level',
      'Last Assessment Date',
      'Next Review Date',
      'Status'
    ];

    const rows = filteredVendors.map(v => [
      v.vendorId,
      v.vendorName,
      v.category,
      v.riskScore,
      v.riskLevel,
      v.lastAssessmentDate,
      v.nextReviewDate,
      v.status
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMS_Risk_Assessment_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charts Pre-computation
  const riskOverviewData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#16a34a' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#d97706' },
    { name: 'High Risk', value: highRiskCount, color: '#dc2626' }
  ].filter(e => e.value > 0);

  // Top 10 highest risk vendors
  const topRiskVendorsData = [...vendors]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10)
    .map(v => ({
      name: v.vendorName.length > 15 ? v.vendorName.substring(0, 15) + '...' : v.vendorName,
      Score: v.riskScore,
      Level: v.riskLevel
    }));

  // Average risk score per category
  const categoriesList = Array.from(new Set(vendors.map(v => v.category)));
  const categoryHeatmapData = categoriesList.map(cat => {
    const catVendors = vendors.filter(v => v.category === cat);
    const totalScore = catVendors.reduce((sum, v) => sum + v.riskScore, 0);
    const avgScore = catVendors.length ? Math.round(totalScore / catVendors.length) : 0;
    return {
      Category: cat,
      'Avg Score': avgScore,
      Count: catVendors.length
    };
  }).sort((a, b) => b['Avg Score'] - a['Avg Score']);

  // Historical score movement trend (consolidated average scores over time logs or mock progression)
  // Let's build a timeline of risk score trends from the assessment histories of vendors
  const getTimelineTrendData = () => {
    const allHistory: Array<{ date: string; score: number }> = [];
    vendors.forEach(v => {
      // Starting from a base level or from actual assessmentHistory entries
      let currentScore = v.riskScore;
      allHistory.push({ date: v.lastAssessmentDate, score: currentScore });
      
      // Look at history to extract previous updates
      if (v.assessmentHistory && v.assessmentHistory.length > 1) {
        v.assessmentHistory.forEach((h, idx) => {
          if (idx > 0) {
            const match = h.comments.match(/score:\s*(\d+)/i);
            const scoreVal = match ? Number(match[1]) : currentScore - 10;
            const dateStr = h.timestamp.split('T')[0];
            allHistory.push({ date: dateStr, score: scoreVal });
          }
        });
      }
    });
    
    // Group by date and find average
    const dateGroups: Record<string, number[]> = {};
    allHistory.forEach(h => {
      if (!dateGroups[h.date]) dateGroups[h.date] = [];
      dateGroups[h.date].push(h.score);
    });

    return Object.keys(dateGroups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(d => {
        const scores = dateGroups[d];
        const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        return {
          Date: d,
          'Avg Risk Score': avg
        };
      });
  };

  const trendData = getTimelineTrendData();

  // Dynamic AI Insights Generator
  const generateGlobalInsights = () => {
    const insights: string[] = [];
    const avgScore = totalAssessed ? Math.round(vendors.reduce((sum, v) => sum + v.riskScore, 0) / totalAssessed) : 0;
    insights.push(`The average vendor risk score is currently ${avgScore}/100.`);

    // High risk litigation exposure
    const litigationAlertVendors = vendors.filter(v => v.riskFactors.litigationRecords > 12);
    if (litigationAlertVendors.length > 0) {
      insights.push(`${litigationAlertVendors.length} vendors have critical litigation and court case records.`);
    }

    // Critical exposures
    const criticalExposureVendors = vendors.filter(v => v.riskScore > 80);
    if (criticalExposureVendors.length > 0) {
      insights.push(`URGENT: ${criticalExposureVendors.length} vendors exceed the critical exposure score threshold (80+).`);
    }

    // Review schedule due
    const reviewsDue = vendors.filter(v => isReviewDue(v.nextReviewDate));
    if (reviewsDue.length > 0) {
      insights.push(`${reviewsDue.length} periodic risk reviews are due within the next 30 days.`);
    }

    // Financial Stability
    const weakFinances = vendors.filter(v => v.riskFactors.financialStability > 12);
    if (weakFinances.length > 0) {
      insights.push(`Alert: Financial stability concerns detected for ${weakFinances.length} vendors.`);
    }

    return insights;
  };

  const globalInsights = generateGlobalInsights();

  // Selected vendor specific AI insights
  const generateVendorInsights = (v: RiskAssessmentVendor) => {
    const list: string[] = [];
    const rf = v.riskFactors || {};
    
    if (v.riskScore > 80) {
      list.push("CRITICAL: Vendor risk exceeds critical tolerance threshold. Onboarding is frozen.");
    }
    if (rf.financialStability > 12) {
      list.push("Financial stability deteriorated: high debt-ratio, weak profitability, or credit score downgrade.");
    }
    if (rf.complianceHistory > 15) {
      list.push("Compliance breach: regulatory audits report multiple material non-compliances.");
    }
    if (rf.litigationRecords > 12) {
      list.push("Litigation exposure increasing: multiple active legal disputes and contract breaches in progress.");
    }
    if (rf.contractValue > 12 && v.riskScore > 60) {
      list.push("Contract value exceeds risk threshold: extreme commercial dependency on a high-risk provider.");
    }
    if (rf.geographyRisk > 7) {
      list.push("Geopolitical risk: vendor based in a country with high regulatory compliance volatility.");
    }
    
    if (list.length === 0) {
      list.push("Low risk: Financial stability and legal registers are in stable condition.");
    }

    return list;
  };

  // Table Columns Setup
  const tableColumns: Column<RiskAssessmentVendor>[] = [
    { header: 'Vendor Code', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Category', accessor: (row) => row.category || 'N/A' },
    { 
      header: 'Risk Score', 
      accessor: (row) => (
        <span className="font-bold text-slate-800">{row.riskScore}</span>
      ) 
    },
    { 
      header: 'Risk Level', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.riskLevel === 'Low') variant = 'success';
        if (row.riskLevel === 'Medium') variant = 'warning';
        if (row.riskLevel === 'High') variant = 'danger';
        return <Badge variant={variant}>{row.riskLevel}</Badge>;
      } 
    },
    { header: 'Last Assessment', accessor: (row) => row.lastAssessmentDate || '-' },
    { 
      header: 'Next Review Date', 
      accessor: (row) => {
        const isDue = isReviewDue(row.nextReviewDate);
        return (
          <span style={isDue ? { color: '#dc2626', fontWeight: 600 } : {}}>
            {row.nextReviewDate || '-'}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.status === 'Approved') variant = 'success';
        if (row.status === 'Under Review') variant = 'warning';
        if (row.status === 'Rejected') variant = 'danger';
        if (row.status === 'Pending') variant = 'info';
        return <Badge variant={variant}>{row.status}</Badge>;
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
          <div className={styles.breadcrumbs}>Vendor Onboarding & KYC &gt; Risk Assessment</div>
          <h2 className={styles.title}>Vendor Risk Assessment Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} className="mr-2 inline" /> Export Filtered CSV
          </Button>
          <Button variant="primary" onClick={fetchRiskVendors}>
            <RefreshCw size={16} className="mr-2 inline" /> Refresh
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
            <span className={styles.kpiLabel}>Total Assessed</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : totalAssessed}</span>
          <span className={styles.kpiFooter}>Vendors in scope</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'low' ? styles.kpiCardActive : ''}`} 
          data-card="low"
          onClick={() => handleKpiClick('low')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Low Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : lowRiskCount}</span>
          <span className={styles.kpiFooter}>Score 0 - 30</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'medium' ? styles.kpiCardActive : ''}`} 
          data-card="medium"
          onClick={() => handleKpiClick('medium')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Medium Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : mediumRiskCount}</span>
          <span className={styles.kpiFooter}>Score 31 - 60</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeCard === 'high' ? styles.kpiCardActive : ''}`} 
          data-card="high"
          onClick={() => handleKpiClick('high')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>High Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : highRiskCount}</span>
          <span className={styles.kpiFooter}>Score 61 - 100</span>
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

        <div 
          className={`${styles.kpiCard} ${activeCard === 'critical' ? styles.kpiCardActive : ''}`} 
          data-card="critical"
          onClick={() => handleKpiClick('critical')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Critical Exposure</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>
              <Shield size={16} />
            </div>
          </div>
          <span className={styles.kpiValue}>{loading ? '...' : criticalExposureCount}</span>
          <span className={styles.kpiFooter}>Risk Score &gt; 80</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Table & Filters */}
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchWrap}>
                <Input
                  className={styles.searchInput}
                  placeholder="Search by vendor, PAN, GSTIN, level..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const riskVal = riskFilter !== 'All' ? riskFilter.toLowerCase() : '';
                    const filterVal = filterType !== 'All' ? filterType.toLowerCase() : '';
                    const params: Record<string, string> = {};
                    if (e.target.value) params.search = e.target.value;
                    if (riskVal) params.risk = riskVal;
                    if (filterVal) params.filter = filterVal;
                    if (statusFilter !== 'All') params.status = statusFilter;
                    if (categoryFilter !== 'All') params.category = categoryFilter;
                    setSearchParams(params);
                  }}
                />
              </div>

              <div className={styles.filters}>
                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => {
                    const r = e.target.value;
                    setRiskFilter(r);
                    let card = 'total';
                    if (r === 'Low') card = 'low';
                    if (r === 'Medium') card = 'medium';
                    if (r === 'High') card = 'high';
                    updateUrlParams(card, r, filterType);
                  }}
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    const s = e.target.value;
                    setStatusFilter(s);
                    const riskVal = riskFilter !== 'All' ? riskFilter.toLowerCase() : '';
                    const filterVal = filterType !== 'All' ? filterType.toLowerCase() : '';
                    const params: Record<string, string> = {};
                    if (searchQuery) params.search = searchQuery;
                    if (riskVal) params.risk = riskVal;
                    if (filterVal) params.filter = filterVal;
                    if (s !== 'All') params.status = s;
                    if (categoryFilter !== 'All') params.category = categoryFilter;
                    setSearchParams(params);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCategoryFilter(c);
                    const riskVal = riskFilter !== 'All' ? riskFilter.toLowerCase() : '';
                    const filterVal = filterType !== 'All' ? filterType.toLowerCase() : '';
                    const params: Record<string, string> = {};
                    if (searchQuery) params.search = searchQuery;
                    if (riskVal) params.risk = riskVal;
                    if (filterVal) params.filter = filterVal;
                    if (statusFilter !== 'All') params.status = statusFilter;
                    if (c !== 'All') params.category = c;
                    setSearchParams(params);
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Security">Security</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading Risk Assessment records...</div>
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

        {/* Charts & Insights Sidebar */}
        <div className={styles.sideSection}>
          {/* Pie Chart: Risk Distribution */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Risk Distribution</h3>
            <div className={styles.donutContainer}>
              <div className={styles.donutWrapper}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskOverviewData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {riskOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute top-[35%] left-[50%] translate-x-[-50%] text-center">
                  <span className="text-xl font-bold text-slate-800">{vendors.length}</span>
                  <p className="text-[10px] text-slate-400">Assessed</p>
                </div>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#16a34a' }} />
                  <span className={styles.legendLabel}>Low</span>
                  <span className={styles.legendValue}>{lowRiskCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#d97706' }} />
                  <span className={styles.legendLabel}>Medium</span>
                  <span className={styles.legendValue}>{mediumRiskCount}</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#dc2626' }} />
                  <span className={styles.legendLabel}>High</span>
                  <span className={styles.legendValue}>{highRiskCount}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Bar Chart: Top 10 High Risk Vendors */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Top Risk Vendors</h3>
            <div className="w-full h-[220px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRiskVendorsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} fontSize={10} />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Score" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Line Chart: Risk Trend */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Risk Score Movement Trend</h3>
            <div className="w-full h-[180px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Date" fontSize={9} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Avg Risk Score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Category Risk Heatmap (represented as Category vs Avg Score) */}
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>Category Risk Heatmap</h3>
            <div className="w-full h-[200px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryHeatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Category" fontSize={9} interval={0} angle={-15} textAnchor="end" />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Avg Score" fill="#f59e0b">
                      {categoryHeatmapData.map((entry, index) => {
                        let color = '#22c55e'; // Green for low average
                        if (entry['Avg Score'] > 60) color = '#ef4444'; // Red for high average
                        else if (entry['Avg Score'] > 30) color = '#f59e0b'; // Amber for medium average
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* AI Insights Card */}
          <Card className={styles.insightsCard}>
            <h3 className={styles.sectionTitle} style={{ borderBottomColor: 'rgba(79, 70, 229, 0.1)' }}>
              <Sparkles size={16} className="inline mr-2 text-indigo-600" /> AI Risk Insights
            </h3>
            <div className={styles.insightsList}>
              {globalInsights.map((insight, idx) => (
                <div key={idx} className={styles.insightItem}>
                  <TrendingUp size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span className={styles.insightText}>{insight}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Selected Vendor Profile Drawer Overlay */}
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
                Risk Profile
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'sliders' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('sliders')}
              >
                Assess Risk Factors
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'workflow' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('workflow')}
              >
                Approval Workflow
              </button>
              <button 
                className={`py-3 px-4 text-xs font-semibold ${drawerTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
                onClick={() => setDrawerTab('history')}
              >
                Audit Trail ({selectedVendor.assessmentHistory?.length || 0})
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* TAB 1: Profile View */}
              {drawerTab === 'profile' && (
                <>
                  {/* Score Meter & Badge */}
                  <div className={styles.drawerCard}>
                    <div className={styles.riskScoreBoard}>
                      <div className={styles.riskMeterContainer} style={{ borderColor: selectedVendor.riskScore > 60 ? '#fca5a5' : selectedVendor.riskScore > 30 ? '#fde68a' : '#bbf7d0' }}>
                        <span className={styles.riskMeterScore}>{selectedVendor.riskScore}</span>
                        <span className={styles.riskMeterLabel}>Score</span>
                      </div>
                      <div className={styles.riskRatingSection}>
                        <div className={`${styles.riskRatingBadge} ${selectedVendor.riskLevel === 'Low' ? styles.riskLow : selectedVendor.riskLevel === 'Medium' ? styles.riskMedium : styles.riskHigh}`}>
                          {selectedVendor.riskLevel === 'Low' ? <CheckCircle2 size={16} /> : selectedVendor.riskLevel === 'Medium' ? <AlertTriangle size={16} /> : <AlertOctagon size={16} />}
                          <span>{selectedVendor.riskLevel} Risk Rating</span>
                        </div>
                        <p className={styles.riskRatingSummary}>
                          Overall risk classification calculated dynamically using a 6-factor enterprise procurement model.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Details */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Vendor Information</h4>
                    <div className={styles.vendorOverview}>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Legal Existence</span>
                        <span className={styles.overviewVal}>{selectedVendor.vendorName}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Vendor Code</span>
                        <span className={styles.overviewVal}>{selectedVendor.vendorId}</span>
                      </div>
                      {selectedVendor.pan && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>PAN Card Number</span>
                          <span className={styles.overviewVal}>{selectedVendor.pan}</span>
                        </div>
                      )}
                      {selectedVendor.gstin && (
                        <div className={styles.overviewRow}>
                          <span className={styles.overviewLabel}>GSTIN Register</span>
                          <span className={styles.overviewVal}>{selectedVendor.gstin}</span>
                        </div>
                      )}
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Last Assessed On</span>
                        <span className={styles.overviewVal}>{selectedVendor.lastAssessmentDate}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Periodic Review Scheduled</span>
                        <span className={styles.overviewVal} style={isReviewDue(selectedVendor.nextReviewDate) ? { color: '#dc2626', fontWeight: 700 } : {}}>{selectedVendor.nextReviewDate}</span>
                      </div>
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Workflow Status</span>
                        <span className="font-semibold text-slate-700">{selectedVendor.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI insights for selected vendor */}
                  <div className={styles.drawerCard} style={{ backgroundColor: '#faf5ff', borderStyle: 'dashed', borderColor: '#d8b4fe' }}>
                    <h4 className={styles.drawerSectionTitle} style={{ color: '#7e22ce' }}>
                      <Sparkles size={14} className="inline mr-1" /> Dynamic AI Risk Assessment Insights
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

                  {/* Active Risk Alerts */}
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Active Compliance Alerts</h4>
                    <div className={styles.alertList}>
                      {selectedVendor.alerts && selectedVendor.alerts.length > 0 ? (
                        selectedVendor.alerts.map((al, idx) => (
                          <div key={idx} className={`${styles.alertItem} ${al.severity === 'critical' ? styles.severityCritical : al.severity === 'high' ? styles.severityHigh : styles.severityMedium}`}>
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <div className={styles.alertText}>
                              <strong className="block font-bold">{al.type}</strong>
                              <span>{al.message}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No active risk alerts for this vendor.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: Factor Sliders */}
              {drawerTab === 'sliders' && (
                <form onSubmit={handleSaveAssessment} className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Adjust Risk Factors</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Modify sliders to re-calculate risk rating in real-time. Max total score is 100.
                  </p>

                  <div className={styles.slidersContainer}>
                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Financial Stability</span>
                        <span className={styles.sliderMax}>Max: 20</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          className={styles.sliderRangeInput}
                          value={financialSlider}
                          onChange={(e) => setFinancialSlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{financialSlider}</span>
                      </div>
                    </div>

                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Compliance History</span>
                        <span className={styles.sliderMax}>Max: 20</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          className={styles.sliderRangeInput}
                          value={complianceSlider}
                          onChange={(e) => setComplianceSlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{complianceSlider}</span>
                      </div>
                    </div>

                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Litigation Records</span>
                        <span className={styles.sliderMax}>Max: 20</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          className={styles.sliderRangeInput}
                          value={litigationSlider}
                          onChange={(e) => setLitigationSlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{litigationSlider}</span>
                      </div>
                    </div>

                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Contract Value</span>
                        <span className={styles.sliderMax}>Max: 15</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="15" 
                          className={styles.sliderRangeInput}
                          value={contractSlider}
                          onChange={(e) => setContractSlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{contractSlider}</span>
                      </div>
                    </div>

                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Business Criticality</span>
                        <span className={styles.sliderMax}>Max: 15</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="15" 
                          className={styles.sliderRangeInput}
                          value={criticalitySlider}
                          onChange={(e) => setCriticalitySlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{criticalitySlider}</span>
                      </div>
                    </div>

                    <div className={styles.sliderGroup}>
                      <div className={styles.sliderLabelRow}>
                        <span className={styles.sliderLabel}>Geography Risk</span>
                        <span className={styles.sliderMax}>Max: 10</span>
                      </div>
                      <div className={styles.sliderControlRow}>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          className={styles.sliderRangeInput}
                          value={geographySlider}
                          onChange={(e) => setGeographySlider(Number(e.target.value))}
                        />
                        <span className={styles.sliderValueBox}>{geographySlider}</span>
                      </div>
                    </div>
                  </div>

                  {/* Realtime sum indicator */}
                  <div className="mt-5 p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Live Computed Risk Score:</span>
                    <strong className="text-base font-bold text-slate-800">
                      {financialSlider + complianceSlider + litigationSlider + contractSlider + criticalitySlider + geographySlider}/100
                    </strong>
                  </div>

                  {/* Comments input */}
                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">Change Narrative / Comments</label>
                    <textarea 
                      className="border border-slate-200 rounded-lg p-2 text-xs h-20 outline-none focus:border-indigo-500"
                      placeholder="Explain audit reason for factor adjustment..."
                      value={assessmentComments}
                      onChange={(e) => setAssessmentComments(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.btnGroup}>
                    <Button type="submit" variant="primary" disabled={updatingAssessment}>
                      {updatingAssessment ? 'Saving...' : 'Save Risk Assessment'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setDrawerTab('profile')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 3: Approval Workflow Stages */}
              {drawerTab === 'workflow' && (
                <>
                  <div className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Stage Status Pipeline</h4>
                    <div className={styles.workflowBoard}>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>1. Risk Analyst Review</span>
                        <Badge variant={selectedVendor.workflow?.analyst === 'Approved' ? 'success' : selectedVendor.workflow?.analyst === 'Rejected' ? 'danger' : selectedVendor.workflow?.analyst === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.analyst || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>2. Compliance Manager Review</span>
                        <Badge variant={selectedVendor.workflow?.complianceManager === 'Approved' ? 'success' : selectedVendor.workflow?.complianceManager === 'Rejected' ? 'danger' : selectedVendor.workflow?.complianceManager === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.complianceManager || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>3. Legal Team Review</span>
                        <Badge variant={selectedVendor.workflow?.legalTeam === 'Approved' ? 'success' : selectedVendor.workflow?.legalTeam === 'Rejected' ? 'danger' : selectedVendor.workflow?.legalTeam === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.legalTeam || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>4. Procurement Head Review</span>
                        <Badge variant={selectedVendor.workflow?.procurementHead === 'Approved' ? 'success' : selectedVendor.workflow?.procurementHead === 'Rejected' ? 'danger' : selectedVendor.workflow?.procurementHead === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.procurementHead || 'Pending'}
                        </Badge>
                      </div>
                      <div className={styles.workflowStage}>
                        <span className={styles.stageName}>5. Final Review & Approval</span>
                        <Badge variant={selectedVendor.workflow?.final === 'Approved' ? 'success' : selectedVendor.workflow?.final === 'Rejected' ? 'danger' : selectedVendor.workflow?.final === 'Sent Back' ? 'warning' : 'info'}>
                          {selectedVendor.workflow?.final || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Action Submission Form */}
                  <form onSubmit={handleWorkflowSubmit} className={styles.drawerCard}>
                    <h4 className={styles.drawerSectionTitle}>Workflow Action Panel</h4>
                    <div className={styles.workflowForm}>
                      <div className={styles.formRow}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Reviewing Stage</label>
                          <select 
                            className="border border-slate-200 rounded-md p-2 text-xs bg-white"
                            value={workflowStage}
                            onChange={(e: any) => setWorkflowStage(e.target.value)}
                          >
                            <option value="analyst">1. Risk Analyst</option>
                            <option value="complianceManager">2. Compliance Manager</option>
                            <option value="legalTeam">3. Legal Team</option>
                            <option value="procurementHead">4. Procurement Head</option>
                            <option value="final">5. Final Approver</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Decision Action</label>
                          <select 
                            className="border border-slate-200 rounded-md p-2 text-xs bg-white"
                            value={workflowAction}
                            onChange={(e: any) => setWorkflowAction(e.target.value)}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Sent Back">Sent Back</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Decision Remarks</label>
                        <textarea 
                          className="border border-slate-200 rounded-md p-2 text-xs h-16 outline-none focus:border-indigo-500"
                          placeholder="Type reason for approval or rejection..."
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

              {/* TAB 4: Audit Trail / History */}
              {drawerTab === 'history' && (
                <div className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Assessment Log History</h4>
                  <div className={styles.historyList}>
                    {selectedVendor.assessmentHistory && selectedVendor.assessmentHistory.length > 0 ? (
                      [...selectedVendor.assessmentHistory].reverse().map((hist, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <UserCheck size={14} className="text-slate-400" />
                            <span>{hist.action}</span>
                          </div>
                          <p className="text-slate-600 leading-snug">{hist.comments}</p>
                          <div className={styles.historyMeta}>
                            <span>By: {hist.assessedBy}</span>
                            <span>{new Date(hist.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No history logs recorded yet.
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
