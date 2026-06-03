import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Clock, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Eye,
  Download,
  X,
  Upload,
  ShieldCheck,
  FileText,
  FileDown
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Badge } from '../../components/Badge/Badge';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import styles from './KycDashboard.module.css';

interface KYCFile {
  fileId: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
}

interface KYCDocument {
  number: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'In Progress';
  verifiedOn: string | null;
  file: KYCFile | null;
}

interface KYCVendor {
  vendorId: string;
  vendorName: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  kycStatus: 'Verified' | 'Pending' | 'In Progress' | 'Rejected' | 'Re-KYC Due';
  documents: {
    pan?: KYCDocument;
    gstin?: KYCDocument;
    aadhaar?: KYCDocument;
    cin?: KYCDocument;
    msme?: KYCDocument;
    bankAccount?: {
      accountNumber: string;
      ifsc: string;
      status: 'Verified' | 'Pending' | 'Rejected' | 'In Progress';
      verifiedOn: string | null;
      file: KYCFile | null;
    };
  };
  lastVerifiedOn: string;
  reKycDueDate: string;
  completionPercentage?: number;
  workflow: {
    procurement: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    compliance: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    legal: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
    final: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
  };
  verificationHistory: Array<{
    verifiedBy: string;
    action: string;
    comments: string;
    timestamp: string;
  }>;
}

export const KycDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vendors, setVendors] = useState<KYCVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [activeCard, setActiveCard] = useState('all');

  // Selected Vendor Drawer State
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<KYCVendor | null>(null);
  const [drawerTab, setDrawerTab] = useState<'documents' | 'workflow' | 'history'>('documents');
  
  // Verification Form Inline State
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [docNumberInput, setDocNumberInput] = useState('');
  const [docIfscInput, setDocIfscInput] = useState('');
  const [verificationComment, setVerificationComment] = useState('');
  const [uploadedFile, setUploadedFile] = useState<KYCFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow assessment comments
  const [workflowComment, setWorkflowComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch from Express Server
  const fetchKycVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/kyc/vendors');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching VMS KYC vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycVendors();
  }, []);

  // Sync state with URL search params
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const riskParam = searchParams.get('risk') || '';
    const searchParam = searchParams.get('search') || '';

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    let card = 'all';
    let status = 'All';
    let risk = 'All';

    // Parse status
    if (statusParam === 'pending') {
      card = 'pending';
      status = 'Pending';
    } else if (statusParam === 'inprogress') {
      card = 'inprogress';
      status = 'In Progress';
    } else if (statusParam === 'verified') {
      card = 'verified';
      status = 'Verified';
    } else if (statusParam === 'rekycdue') {
      card = 'rekycdue';
      status = 'Re-KYC Due';
    } else if (statusParam === 'rejected') {
      status = 'Rejected';
    }

    // Parse risk
    if (riskParam === 'high') {
      card = 'highrisk';
      risk = 'High';
    } else if (riskParam === 'critical') {
      risk = 'Critical';
    } else if (riskParam === 'medium') {
      risk = 'Medium';
    } else if (riskParam === 'low') {
      risk = 'Low';
    }

    setActiveCard(card);
    setStatusFilter(status);
    setRiskFilter(risk);
  }, [searchParams]);

  // Fetch individual vendor details for Drawer when selected
  useEffect(() => {
    if (selectedVendorId) {
      const getDetails = async () => {
        try {
          const res = await axios.get(`/api/kyc/vendors/${selectedVendorId}`);
          setSelectedVendor(res.data);
        } catch (err) {
          console.error('Error fetching vendor KYC detail:', err);
        }
      };
      getDetails();
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId]);

  // Helper: Card Clicking -> URL search parameter synchronization
  const handleCardClick = (cardType: string) => {
    const params: Record<string, string> = {};
    if (cardType === 'pending') {
      params.status = 'pending';
    } else if (cardType === 'inprogress') {
      params.status = 'inprogress';
    } else if (cardType === 'verified') {
      params.status = 'verified';
    } else if (cardType === 'highrisk') {
      params.risk = 'high';
    } else if (cardType === 'rekycdue') {
      params.status = 'rekycdue';
    } else {
      params.filter = 'all';
    }
    setSearchParams(params, { replace: true });
  };

  // Dropdown changes sync back to search parameters
  const handleStatusFilterChange = (val: string) => {
    const params: Record<string, string> = {};
    if (val === 'Pending') params.status = 'pending';
    else if (val === 'In Progress') params.status = 'inprogress';
    else if (val === 'Verified') params.status = 'verified';
    else if (val === 'Re-KYC Due') params.status = 'rekycdue';
    else if (val === 'Rejected') params.status = 'rejected';

    if (riskFilter !== 'All') {
      params.risk = riskFilter.toLowerCase();
    }
    setSearchParams(params, { replace: true });
  };

  const handleRiskFilterChange = (val: string) => {
    const params: Record<string, string> = {};
    if (val !== 'All') {
      params.risk = val.toLowerCase();
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') params.status = 'pending';
      else if (statusFilter === 'In Progress') params.status = 'inprogress';
      else if (statusFilter === 'Verified') params.status = 'verified';
      else if (statusFilter === 'Re-KYC Due') params.status = 'rekycdue';
      else if (statusFilter === 'Rejected') params.status = 'rejected';
    }
    setSearchParams(params, { replace: true });
  };

  // Re-KYC calculation function inside component
  const isReKycDueSoon = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  };

  // Dynamic Metrics counts based on JSON data
  const totalCount = vendors.length;
  const pendingCount = vendors.filter(v => v.kycStatus === 'Pending').length;
  const inProgressCount = vendors.filter(v => v.kycStatus === 'In Progress').length;
  const verifiedCount = vendors.filter(v => v.kycStatus === 'Verified').length;
  const highRiskCount = vendors.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length;
  const reKycDueCount = vendors.filter(v => isReKycDueSoon(v.reKycDueDate)).length;

  const kycOverviewData = [
    { name: 'Verified', value: verifiedCount, color: '#16A34A' },
    { name: 'Pending', value: pendingCount, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressCount, color: '#0EA5E9' },
    { name: 'Re-KYC Due', value: reKycDueCount, color: '#9333EA' },
    { name: 'Rejected', value: vendors.filter(v => v.kycStatus === 'Rejected').length, color: '#DC2626' }
  ].filter(item => item.value > 0);

  // Client-side filtering logic
  const filteredVendors = vendors.filter(v => {
    // Search fields
    const code = v.vendorId || '';
    const name = v.vendorName || '';
    const cat = v.category || '';
    const panNum = v.documents?.pan?.number || '';
    const gstinNum = v.documents?.gstin?.number || '';

    const matchesSearch = 
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gstinNum.toLowerCase().includes(searchQuery.toLowerCase());

    // Status mapping
    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else {
      matchesStatus = v.kycStatus === statusFilter;
    }

    // Risk mapping
    let matchesRisk = false;
    if (riskFilter === 'All') {
      matchesRisk = true;
    } else {
      matchesRisk = v.riskLevel === riskFilter;
    }

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Client-Side CSV Exporter
  const handleExportCSV = () => {
    if (filteredVendors.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['Vendor Code', 'Vendor Name', 'Category', 'Risk Level', 'KYC Status', 'Last Verified On', 'Re-KYC Due Date'];
    const rows = filteredVendors.map(v => [
      v.vendorId,
      `"${v.vendorName}"`,
      v.category,
      v.riskLevel,
      v.kycStatus,
      v.lastVerifiedOn || '-',
      v.reKycDueDate || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kyc_verification_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle document upload via Multer API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');

    try {
      setUploading(true);
      const res = await axios.post('/api/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFile({
        fileId: res.data.fileId,
        fileName: res.data.fileName,
        filePath: res.data.filePath,
        uploadedBy: res.data.uploadedBy,
        uploadedOn: res.data.uploadedOn
      });
      alert('File uploaded successfully.');
    } catch (err) {
      console.error('File upload failed:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle inline document verification submission
  const handleDocumentVerify = async (docKey: string, status: 'Verified' | 'Rejected') => {
    if (!selectedVendor) return;
    if (!docNumberInput && docKey !== 'aadhaar' && docKey !== 'msme' && docKey !== 'bankAccount') {
      alert('Please enter the document identifier number.');
      return;
    }

    const payload = {
      vendorId: selectedVendor.vendorId,
      documentKey: docKey,
      number: docNumberInput,
      status: status,
      comment: verificationComment,
      verifiedBy: user?.fullName || 'Saurabh Anand',
      details: {
        file: uploadedFile || selectedVendor.documents[docKey as keyof typeof selectedVendor.documents]?.file || null,
        ...(docKey === 'bankAccount' ? { ifsc: docIfscInput } : {})
      }
    };

    try {
      setActionLoading(true);
      const res = await axios.post('/api/kyc/verify', payload);
      setSelectedVendor(res.data.vendor);
      
      // Reset verification form inputs
      setVerificationComment('');
      setDocNumberInput('');
      setDocIfscInput('');
      setUploadedFile(null);
      setExpandedDoc(null);
      
      // Refresh list
      fetchKycVendors();
      alert(`Document marked as ${status} successfully.`);
    } catch (err) {
      console.error('Verification submission failed:', err);
      alert('Failed to submit verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle approval workflow transitions
  const handleWorkflowAction = async (stage: string, action: 'Approved' | 'Rejected' | 'Sent Back') => {
    if (!selectedVendor) return;

    try {
      setActionLoading(true);
      const res = await axios.post('/api/kyc/workflow', {
        vendorId: selectedVendor.vendorId,
        stage,
        action,
        comment: workflowComment,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      setSelectedVendor(res.data.vendor);
      setWorkflowComment('');
      
      // Refresh list
      fetchKycVendors();
      alert(`Workflow stage ${stage} updated to ${action}.`);
    } catch (err) {
      console.error('Workflow submission failed:', err);
      alert('Failed to submit workflow status update.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle checklist drawer expand
  const handleToggleDocExpand = (docKey: string) => {
    if (expandedDoc === docKey) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(docKey);
      const currentDoc = selectedVendor?.documents ? selectedVendor.documents[docKey as keyof typeof selectedVendor.documents] : undefined;
      setDocNumberInput(
        docKey === 'bankAccount'
          ? (currentDoc as any)?.accountNumber || ''
          : (currentDoc as any)?.number || ''
      );
      if (docKey === 'bankAccount') {
        setDocIfscInput((currentDoc as any)?.ifsc || '');
      } else {
        setDocIfscInput('');
      }
      setVerificationComment('');
      setUploadedFile(null);
    }
  };

  const columns: Column<KYCVendor>[] = [
    { header: 'Vendor Code', accessor: (row) => row.vendorId || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row.vendorName || 'N/A' },
    { header: 'Category', accessor: (row) => row.category || 'N/A' },
    { 
      header: 'Risk Level', 
      accessor: (row) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
        if (row.riskLevel === 'Low') variant = 'success';
        if (row.riskLevel === 'Medium') variant = 'warning';
        if (row.riskLevel === 'High' || row.riskLevel === 'Critical') variant = 'danger';
        return <Badge variant={variant}>{row.riskLevel}</Badge>;
      } 
    },
    { 
      header: 'KYC Status', 
      accessor: (row) => {
        let className = styles.statusText;
        if (row.kycStatus === 'Verified') className = styles.statusVerified;
        if (row.kycStatus === 'Pending') className = styles.statusPending;
        if (row.kycStatus === 'In Progress') className = styles.statusInProgress;
        if (row.kycStatus === 'Rejected') className = styles.statusRejected;
        if (row.kycStatus === 'Re-KYC Due') className = styles.statusPending;

        const isDue = isReKycDueSoon(row.reKycDueDate);

        return (
          <div className="flex items-center gap-2">
            <span className={className}>{row.kycStatus}</span>
            {isDue && (
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" title="Re-KYC Due Soon!" />
            )}
          </div>
        );
      } 
    },
    { header: 'Last Verified On', accessor: (row) => row.lastVerifiedOn || '-' },
    { 
      header: 'Re-KYC Due On', 
      accessor: (row) => {
        const isDue = isReKycDueSoon(row.reKycDueDate);
        return (
          <span style={isDue ? { color: '#dc2626', fontWeight: 600 } : {}}>
            {row.reKycDueDate || '-'}
          </span>
        );
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
            title="Open KYC Profile Drawer"
          >
            <Eye size={16} />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>KYC Verification</h1>
          <p className={styles.breadcrumbs}>Due Diligence & KYC / KYC Verification</p>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <Card 
          className={`${styles.kpiCard} ${activeCard === 'all' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('all')}
          data-card="all"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Vendors</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <Users size={18} />
            </div>
          </div>
          <div className={styles.kpiValue}>{totalCount}</div>
          <div className={styles.kpiFooter}>VMS onboarding records</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${activeCard === 'pending' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('pending')}
          data-card="pending"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending KYC</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>{pendingCount}</div>
          <div className={styles.kpiFooter}>Requires action</div>
        </Card>
        
        <Card 
          className={`${styles.kpiCard} ${activeCard === 'inprogress' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('inprogress')}
          data-card="inprogress"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>In Progress</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
              <RefreshCcw size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#0ea5e9' }}>{inProgressCount}</div>
          <div className={styles.kpiFooter}>In verification</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${activeCard === 'verified' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('verified')}
          data-card="verified"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>KYC Verified</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#16a34a' }}>{verifiedCount}</div>
          <div className={styles.kpiFooter}>Compliant status</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${activeCard === 'highrisk' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('highrisk')}
          data-card="highrisk"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>High Risk</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#dc2626' }}>{highRiskCount}</div>
          <div className={styles.kpiFooter}>Requires review</div>
        </Card>

        <Card 
          className={`${styles.kpiCard} ${activeCard === 'rekycdue' ? styles.kpiCardActive : ''}`}
          onClick={() => handleCardClick('rekycdue')}
          data-card="rekycdue"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Re-KYC Due</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#9333ea' }}>{reKycDueCount}</div>
          <div className={styles.kpiFooter}>Next 30 days</div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.filters}>
                <div className={styles.searchWrap}>
                  <Input 
                    placeholder="Search vendor, code, PAN, GST..." 
                    fullWidth={false} 
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchParams({ search: e.target.value }, { replace: true });
                    }}
                  />
                </div>
                
                <select 
                  className={styles.filterSelect}
                  value={riskFilter}
                  onChange={(e) => handleRiskFilterChange(e.target.value)}
                >
                  <option value="All">Risk Level: All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <option value="All">KYC Status: All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Re-KYC Due">Re-KYC Due</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" icon={<Download size={16} />} onClick={handleExportCSV}>
                  CSV
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading KYC records...</div>
            ) : (
              <DataTable 
                columns={columns} 
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

        {/* Dynamic Charts sidebar */}
        <div className={styles.sideSection}>
          <Card className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>KYC Verification Overview</h3>
            <div className={styles.pieContainer}>
              <div className={styles.pieChartWrapper}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={kycOverviewData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {kycOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className={styles.pieCenterText}>
                  <span>{vendors.length}</span>
                  <p>Total</p>
                </div>
              </div>
              
              <div className={styles.pieLegend}>
                {kycOverviewData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: item.color }}></div>
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className={styles.actionsCard}>
            <h3 className={styles.sectionTitle}>KYC Quick Actions</h3>
            <div className={styles.actionGrid}>
              <div className={styles.quickActionBox} onClick={() => alert('Sanction screening run for all active vendors.')}>
                <div className={styles.qaIcon}><ShieldCheck size={20} color="#1d4ed8" /></div>
                <div>
                  <h4>Sanctions Screening</h4>
                  <p>Bulk compliance check</p>
                </div>
              </div>
              
              <div className={styles.quickActionBox} onClick={handleExportCSV}>
                <div className={styles.qaIcon}><FileDown size={20} color="#16a34a" /></div>
                <div>
                  <h4>Download Report</h4>
                  <p>Export filter set</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* KYC Profile Side Drawer */}
      {selectedVendorId && selectedVendor && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedVendorId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>KYC Verification Profile</h3>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedVendorId(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.drawerBody}>
              {/* Alert for Re-KYC Due */}
              {isReKycDueSoon(selectedVendor.reKycDueDate) && (
                <div className={styles.reKycAlertBadge}>
                  <AlertTriangle size={16} />
                  <span>Re-KYC is Due Soon! Deadline: {selectedVendor.reKycDueDate}</span>
                </div>
              )}

              {/* Vendor Basic overview */}
              <div className={styles.drawerCard}>
                <h4 className={styles.drawerSectionTitle}>Vendor Information</h4>
                <div className={styles.vendorOverview}>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewLabel}>Legal Name</span>
                    <strong className={styles.overviewVal}>{selectedVendor.vendorName}</strong>
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
                    <span className={styles.overviewLabel}>Risk Rating</span>
                    <span className={styles.overviewVal}>
                      <Badge variant={selectedVendor.riskLevel === 'Low' ? 'success' : selectedVendor.riskLevel === 'Medium' ? 'warning' : 'danger'}>
                        {selectedVendor.riskLevel}
                      </Badge>
                    </span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewLabel}>overall KYC Status</span>
                    <span className={styles.overviewVal}>
                      <Badge variant={selectedVendor.kycStatus === 'Verified' ? 'success' : selectedVendor.kycStatus === 'Rejected' ? 'danger' : 'warning'}>
                        {selectedVendor.kycStatus}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress and Completion */}
              <div className={styles.drawerCard}>
                <div className={styles.completionContainer}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>KYC Checklist Completion</span>
                    <span>{selectedVendor.completionPercentage || 0}%</span>
                  </div>
                  <div className={styles.progressBarOuter}>
                    <div 
                      className={styles.progressBarInner} 
                      style={{ 
                        width: `${selectedVendor.completionPercentage || 0}%`,
                        backgroundColor: selectedVendor.kycStatus === 'Verified' ? '#16A34A' : selectedVendor.kycStatus === 'Rejected' ? '#DC2626' : '#F59E0B'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Tabs */}
              <div className={styles.tabs} style={{ padding: 0, marginBottom: '16px' }}>
                <div 
                  className={`${styles.tab} ${drawerTab === 'documents' ? styles.activeTab : ''}`}
                  onClick={() => setDrawerTab('documents')}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Document Verification
                </div>
                <div 
                  className={`${styles.tab} ${drawerTab === 'workflow' ? styles.activeTab : ''}`}
                  onClick={() => setDrawerTab('workflow')}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Workflows
                </div>
                <div 
                  className={`${styles.tab} ${drawerTab === 'history' ? styles.activeTab : ''}`}
                  onClick={() => setDrawerTab('history')}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Audit History ({selectedVendor.verificationHistory?.length || 0})
                </div>
              </div>

              {/* Tab: Documents */}
              {drawerTab === 'documents' && (
                <div className="flex flex-col gap-3">
                  <div className={styles.docGrid}>
                    {[
                      { key: 'pan', title: 'PAN Verification (Mandatory)' },
                      { key: 'gstin', title: 'GSTIN Verification (Mandatory)' },
                      { key: 'cin', title: 'CIN / Corp Registration (Mandatory)' },
                      { key: 'bankAccount', title: 'Bank Account Details (Mandatory)' },
                      { key: 'aadhaar', title: 'Aadhaar Card Check (Optional)' },
                      { key: 'msme', title: 'MSME Registration (Optional)' }
                    ].map(doc => {
                      const docVal = selectedVendor.documents ? selectedVendor.documents[doc.key as keyof typeof selectedVendor.documents] : undefined;
                      const isExpanded = expandedDoc === doc.key;
                      
                      let badgeVar: 'success' | 'warning' | 'danger' | 'info' = 'warning';
                      if (docVal?.status === 'Verified') badgeVar = 'success';
                      if (docVal?.status === 'Rejected') badgeVar = 'danger';
                      if (docVal?.status === 'In Progress') badgeVar = 'info';

                      const getDocNumberDisplay = (key: string, docObj: any) => {
                        if (!docObj) return 'Not provided';
                        if (key === 'bankAccount') return docObj.accountNumber ? `${docObj.accountNumber}` : 'Not provided';
                        return docObj.number ? `${docObj.number}` : 'Not provided';
                      };

                      return (
                        <div key={doc.key} className={`${styles.docItem} ${isExpanded ? styles.docItemActive : ''}`}>
                          <div className={styles.docItemHeader} onClick={() => handleToggleDocExpand(doc.key)}>
                            <div>
                              <span className={styles.docTitle}>{doc.title}</span>
                              <div className="text-xs text-slate-500 mt-1">
                                {getDocNumberDisplay(doc.key, docVal)}
                                {doc.key === 'bankAccount' && (docVal as any)?.ifsc && ` | IFSC: ${(docVal as any).ifsc}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={badgeVar}>{docVal?.status || 'Pending'}</Badge>
                            </div>
                          </div>

                          {/* Expanded verification form */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-200 text-xs">
                              {docVal?.status === 'Verified' ? (
                                <div className="bg-emerald-50 text-emerald-800 p-3 rounded border border-emerald-100 flex flex-col gap-2">
                                  <div className="font-semibold flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Document Verified
                                  </div>
                                  <div>Verified on {docVal.verifiedOn || 'N/A'}</div>
                                  {docVal.file && (
                                    <a 
                                      href={docVal.file.filePath} 
                                      download={docVal.file.fileName}
                                      className={styles.fileBadge}
                                    >
                                      <FileText size={12} /> {docVal.file.fileName}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  {/* Document Input */}
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                      {doc.key === 'bankAccount' ? 'Bank Account Number' : `${doc.key.toUpperCase()} Identifier Number`}
                                    </label>
                                    <input 
                                      className={styles.formInput}
                                      value={docNumberInput}
                                      onChange={(e) => setDocNumberInput(e.target.value)}
                                      placeholder={`Enter ${doc.key} ID`}
                                    />
                                  </div>

                                  {doc.key === 'bankAccount' && (
                                    <div className={styles.formGroup}>
                                      <label className={styles.formLabel}>Bank IFSC Code</label>
                                      <input 
                                        className={styles.formInput}
                                        value={docIfscInput}
                                        onChange={(e) => setDocIfscInput(e.target.value)}
                                        placeholder="IFSC Code"
                                      />
                                    </div>
                                  )}

                                  {/* Upload Section */}
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Attached File Upload</label>
                                    <input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      className="hidden" 
                                      onChange={handleFileUpload} 
                                    />
                                    
                                    {uploadedFile ? (
                                      <div className="flex items-center justify-between bg-slate-100 p-2 rounded border">
                                        <span className="truncate">{uploadedFile.fileName}</span>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => setUploadedFile(null)}>
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        className={styles.uploadArea} 
                                        onClick={() => fileInputRef.current?.click()}
                                      >
                                        <Upload size={18} className="mx-auto text-slate-400" />
                                        <span className={styles.uploadText}>
                                          {uploading ? 'Uploading...' : 'Click to select and upload document'}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Comments */}
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Auditor Comments / Verification Remarks</label>
                                    <textarea 
                                      className={styles.formTextarea}
                                      value={verificationComment}
                                      onChange={(e) => setVerificationComment(e.target.value)}
                                      placeholder="Auditor matching verification results..."
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className={styles.btnGroup}>
                                    <Button 
                                      variant="outline" 
                                      className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                      disabled={actionLoading}
                                      onClick={() => handleDocumentVerify(doc.key, 'Rejected')}
                                    >
                                      Reject document
                                    </Button>
                                    <Button 
                                      className="flex-1"
                                      disabled={actionLoading}
                                      onClick={() => handleDocumentVerify(doc.key, 'Verified')}
                                    >
                                      Verify document
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: Workflows */}
              {drawerTab === 'workflow' && (
                <div className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Vendor KYC Approval Workflow</h4>
                  <div className={styles.workflowBoard}>
                    {[
                      { key: 'procurement', label: 'Procurement Check Review' },
                      { key: 'compliance', label: 'Compliance Due Diligence' },
                      { key: 'legal', label: 'Legal Register Screening' },
                      { key: 'final', label: 'Final Compliance Approval' }
                    ].map((wf) => {
                      const status = selectedVendor.workflow[wf.key as keyof typeof selectedVendor.workflow] || 'Pending';
                      let statusBadge = <Badge variant="warning">{status}</Badge>;
                      if (status === 'Approved') statusBadge = <Badge variant="success">{status}</Badge>;
                      if (status === 'Rejected') statusBadge = <Badge variant="danger">{status}</Badge>;
                      if (status === 'Sent Back') statusBadge = <Badge variant="info">{status}</Badge>;

                      return (
                        <div key={wf.key} className="flex flex-col gap-2 p-3 bg-slate-50 border rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{wf.label}</span>
                            {statusBadge}
                          </div>
                          
                          {/* If pending, let auditor action it */}
                          {status !== 'Approved' && status !== 'Rejected' && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <textarea 
                                className="w-full text-xs p-2 border rounded outline-none min-h-[50px] mb-2"
                                value={workflowComment}
                                onChange={(e) => setWorkflowComment(e.target.value)}
                                placeholder={`Workflow transition comments for ${wf.label}...`}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 bg-red-50 hover:bg-red-100"
                                  disabled={actionLoading}
                                  onClick={() => handleWorkflowAction(wf.key, 'Rejected')}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleWorkflowAction(wf.key, 'Sent Back')}
                                >
                                  Send Back
                                </Button>
                                <Button 
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleWorkflowAction(wf.key, 'Approved')}
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: History */}
              {drawerTab === 'history' && (
                <div className={styles.drawerCard}>
                  <h4 className={styles.drawerSectionTitle}>Auditor Review History</h4>
                  <div className={styles.historyList}>
                    {selectedVendor.verificationHistory?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No audit trail recorded.</p>
                    ) : (
                      selectedVendor.verificationHistory.slice().reverse().map((log, idx) => (
                        <div key={idx} className={styles.historyItem}>
                          <div className="font-semibold text-slate-800">{log.action}</div>
                          <p className="text-slate-600 italic bg-slate-50 p-2 border rounded mt-1">
                            {log.comments || 'No remarks provided.'}
                          </p>
                          <div className={styles.historyMeta}>
                            <span>By: {log.verifiedBy}</span>
                            <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))
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
