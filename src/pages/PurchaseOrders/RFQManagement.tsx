import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Eye, Edit2, X, Download, RefreshCw,
  FileText, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, ChevronRight, Upload, Trash2,
  Send, Users, Tag, Calendar, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import { useAuth } from '../../context/AuthContext';
import styles from './RFQManagement.module.css';

interface RFQ {
  rfqId: string;
  rfqNumber: string;
  title: string;
  department: string;
  costCenter: string;
  category: string;
  itemService: string;
  description: string;
  quantity: number;
  uom: string;
  budget: number;
  deliveryLocation: string;
  requiredDeliveryDate: string;
  vendorsInvited: number;
  vendorIds: string[];
  quotesReceived: number;
  closingDate: string;
  status: 'Draft' | 'Open' | 'Closed' | 'Awarded' | 'Cancelled';
  publishedOn: string;
  createdBy: string;
  attachments: AttachmentFile[];
}

interface AttachmentFile {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  path: string;
}

interface EligibleVendor {
  vendorId: string;
  vendorName: string;
  category: string;
  riskRating: string;
  kycStatus: string;
  isPreferred: boolean;
  status: string;
}

const DEPARTMENTS = ['IT', 'HR', 'Facilities', 'Finance', 'Security', 'Operations', 'Legal', 'Marketing'];
const CATEGORIES = ['IT Hardware', 'IT Services', 'Facility Services', 'Consulting', 'Security', 'Marketing', 'Legal', 'Logistics'];
const UOMS = ['Units', 'Months', 'Hours', 'Project', 'Litres', 'Sq.Ft', 'Kg'];
const COST_CENTERS = ['CC-IT-OPS', 'CC-FAC-OPS', 'CC-SEC-OPS', 'CC-MGT-CON'];

const STATUS_STEPS = ['Draft', 'Open', 'Closed', 'Awarded'];

export const RFQManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List state
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeKpi, setActiveKpi] = useState('all');

  // Drawer / wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editRfqId, setEditRfqId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [eligibleVendors, setEligibleVendors] = useState<EligibleVendor[]>([]);

  // Form state
  const [form, setForm] = useState({
    title: '',
    department: 'IT',
    costCenter: 'CC-IT-OPS',
    category: 'IT Hardware',
    itemService: '',
    description: '',
    quantity: 1,
    uom: 'Units',
    budget: 0,
    deliveryLocation: '',
    requiredDeliveryDate: '',
    closingDate: '',
    vendorIds: [] as string[],
    attachments: [] as AttachmentFile[],
    status: 'Draft' as RFQ['status']
  });

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/rfq');
      setRfqs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching RFQs:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleVendors = async () => {
    try {
      const res = await axios.get('/api/rfq/vendors/eligible');
      setEligibleVendors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching eligible vendors:', e);
    }
  };

  useEffect(() => {
    fetchRFQs();
    fetchEligibleVendors();
  }, []);

  const openCreateWizard = () => {
    setEditRfqId(null);
    setForm({
      title: '', department: 'IT', costCenter: 'CC-IT-OPS',
      category: 'IT Hardware', itemService: '', description: '',
      quantity: 1, uom: 'Units', budget: 0, deliveryLocation: '',
      requiredDeliveryDate: '', closingDate: '',
      vendorIds: [], attachments: [], status: 'Draft'
    });
    setWizardStep(1);
    setShowWizard(true);
  };

  const openEditWizard = (rfq: RFQ) => {
    setEditRfqId(rfq.rfqId);
    setForm({
      title: rfq.title, department: rfq.department, costCenter: rfq.costCenter,
      category: rfq.category, itemService: rfq.itemService, description: rfq.description,
      quantity: rfq.quantity, uom: rfq.uom, budget: rfq.budget,
      deliveryLocation: rfq.deliveryLocation, requiredDeliveryDate: rfq.requiredDeliveryDate,
      closingDate: rfq.closingDate, vendorIds: rfq.vendorIds || [],
      attachments: rfq.attachments || [], status: rfq.status
    });
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', user?.fullName || 'Saurabh Anand');
      const res = await axios.post('/api/rfq/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setForm(f => ({ ...f, attachments: [...f.attachments, res.data.file] }));
        toast.success('File uploaded successfully.');
      }
    } catch (e) {
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (fileId: string) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter(a => a.fileId !== fileId) }));
  };

  const handleVendorToggle = (vendorId: string) => {
    setForm(f => ({
      ...f,
      vendorIds: f.vendorIds.includes(vendorId)
        ? f.vendorIds.filter(id => id !== vendorId)
        : [...f.vendorIds, vendorId]
    }));
  };

  const handleSubmitRFQ = async (publish: boolean) => {
    if (!form.title || !form.itemService) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        vendorsInvited: form.vendorIds.length,
        status: publish ? 'Open' : 'Draft',
        createdBy: user?.fullName || 'Saurabh Anand'
      };
      if (editRfqId) {
        await axios.put(`/api/rfq/${editRfqId}`, payload);
        toast.success(`RFQ updated successfully.`);
      } else {
        await axios.post('/api/rfq', payload);
        toast.success(publish ? 'RFQ published and sent to vendors!' : 'RFQ saved as Draft.');
      }
      setShowWizard(false);
      fetchRFQs();
    } catch (e) {
      toast.error('Failed to save RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRFQ = async (rfqId: string) => {
    try {
      await axios.post(`/api/rfq/${rfqId}/close`);
      toast.success('RFQ closed successfully.');
      fetchRFQs();
    } catch (e) {
      toast.error('Failed to close RFQ.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['RFQ Number', 'Title', 'Category', 'Department', 'Budget', 'Vendors Invited', 'Quotes Received', 'Closing Date', 'Status'];
    const rows = filteredRFQs.map(r => [
      r.rfqNumber, r.title, r.category, r.department,
      r.budget, r.vendorsInvited, r.quotesReceived, r.closingDate, r.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `VMS_RFQ_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI counts
  const totalRfqs = rfqs.length;
  const openRfqs = rfqs.filter(r => r.status === 'Open').length;
  const closedRfqs = rfqs.filter(r => r.status === 'Closed').length;
  const awardedRfqs = rfqs.filter(r => r.status === 'Awarded').length;
  const totalQuotes = rfqs.reduce((sum, r) => sum + (r.quotesReceived || 0), 0);

  const filteredRFQs = rfqs.filter(r => {
    if (activeKpi === 'open' && r.status !== 'Open') return false;
    if (activeKpi === 'closed' && r.status !== 'Closed') return false;
    if (activeKpi === 'awarded' && r.status !== 'Awarded') return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.rfqNumber.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    if (status === 'Open') return 'info';
    if (status === 'Awarded') return 'success';
    if (status === 'Closed') return 'warning';
    if (status === 'Cancelled') return 'danger';
    return 'default';
  };

  const columns: Column<RFQ>[] = [
    { header: 'RFQ Number', accessor: (r) => <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.75rem' }}>{r.rfqNumber}</span> },
    { header: 'RFQ Title', accessor: (r) => <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{r.title}</span> },
    { header: 'Category', accessor: 'category' as keyof RFQ },
    { header: 'Department', accessor: 'department' as keyof RFQ },
    {
      header: 'Budget',
      accessor: (r) => <span style={{ fontWeight: 600 }}>₹{Number(r.budget).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Vendors Invited',
      align: 'center',
      accessor: (r) => <span className={styles.centerBadge}>{r.vendorsInvited}</span>
    },
    {
      header: 'Quotes Received',
      align: 'center',
      accessor: (r) => (
        <span className={styles.centerBadge} style={{ color: r.quotesReceived > 0 ? '#16a34a' : '#94a3b8' }}>
          {r.quotesReceived}
        </span>
      )
    },
    { header: 'Closing Date', accessor: 'closingDate' as keyof RFQ },
    {
      header: 'Status',
      accessor: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (r) => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="View Quotes" onClick={() => navigate(`/purchase-orders/vendor-quotations?rfqId=${r.rfqId}`)}>
            <Eye size={15} />
          </button>
          {r.status === 'Draft' && (
            <button className={styles.actionBtn} title="Edit RFQ" onClick={() => openEditWizard(r)}>
              <Edit2 size={15} />
            </button>
          )}
          {r.status === 'Open' && (
            <button className={styles.actionBtnDanger} title="Close RFQ" onClick={() => handleCloseRFQ(r.rfqId)}>
              <X size={15} />
            </button>
          )}
          {r.status === 'Closed' && (
            <button className={styles.actionBtn} title="Submit for Approval" onClick={() => navigate(`/purchase-orders/rfq-approvals?rfqId=${r.rfqId}`)}>
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      )
    }
  ];

  const WIZARD_STEPS = ['RFQ Details', 'Vendor Selection', 'Attachments', 'Publish RFQ'];

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>RFQ Management</h1>
          <p className={styles.subtitle}>Create and manage Requests for Quotation across all procurement categories</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" icon={<Download size={15} />} onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          { key: 'all', label: 'Total RFQs', value: totalRfqs, icon: <FileText size={16} />, bg: '#eff6ff', color: '#3b82f6', sub: 'All RFQs in system' },
          { key: 'open', label: 'Open RFQs', value: openRfqs, icon: <Clock size={16} />, bg: '#fffbeb', color: '#f59e0b', sub: 'Awaiting quotations' },
          { key: 'quotes', label: 'Quotations Received', value: totalQuotes, icon: <Users size={16} />, bg: '#f0fdf4', color: '#16a34a', sub: 'Total quotes received' },
          { key: 'closed', label: 'Closed RFQs', value: closedRfqs, icon: <AlertTriangle size={16} />, bg: '#fdf2f8', color: '#be185d', sub: 'Pending award decision' },
          { key: 'awarded', label: 'Awarded RFQs', value: awardedRfqs, icon: <CheckCircle2 size={16} />, bg: '#f3e8ff', color: '#8b5cf6', sub: 'PO generated' },
        ].map(k => (
          <Card
            key={k.key}
            className={`${styles.kpiCard} ${activeKpi === k.key ? styles.kpiCardActive : ''}`}
            onClick={() => setActiveKpi(prev => prev === k.key ? 'all' : k.key)}
          >
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{loading ? '…' : k.value}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search RFQ number, title, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Awarded">Awarded</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select className={styles.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button variant="ghost" icon={<Filter size={15} />} onClick={fetchRFQs}><RefreshCw size={14} /></Button>
          </div>
          <span className={styles.tableCount}>{filteredRFQs.length} RFQ{filteredRFQs.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading RFQs...</div>
        ) : (
          <DataTable columns={columns} data={filteredRFQs} keyExtractor={r => r.rfqId} />
        )}

        <div className={styles.tablePagination}>
          <span>Showing 1 to {filteredRFQs.length} of {rfqs.length} entries</span>
        </div>
      </Card>

      {/* Create/Edit Wizard Modal */}
      {showWizard && (
        <div className={styles.modalBackdrop} onClick={() => setShowWizard(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{editRfqId ? 'Edit RFQ' : 'Create New RFQ'}</h2>
                <p className={styles.modalSubtitle}>Fill in details to generate and publish an RFQ to approved vendors</p>
              </div>
              <button className={styles.modalClose} onClick={() => setShowWizard(false)}><X size={20} /></button>
            </div>

            {/* Step Indicator */}
            <div className={styles.stepperRow}>
              {WIZARD_STEPS.map((step, idx) => {
                const num = idx + 1;
                const isActive = wizardStep === num;
                const isDone = wizardStep > num;
                return (
                  <React.Fragment key={step}>
                    <div className={styles.stepItem}>
                      <div className={`${styles.stepCircle} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}>
                        {isDone ? <CheckCircle2 size={14} /> : num}
                      </div>
                      <span className={`${styles.stepLabel} ${isActive || isDone ? styles.stepLabelActive : ''}`}>{step}</span>
                    </div>
                    {idx < WIZARD_STEPS.length - 1 && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step 1 — RFQ Details */}
            {wizardStep === 1 && (
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.label}>RFQ Title <span className={styles.req}>*</span></label>
                    <input className={styles.input} placeholder="e.g. Dell Latitude Laptops – IT Refresh 2026" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Department <span className={styles.req}>*</span></label>
                    <select className={styles.select} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cost Center</label>
                    <select className={styles.select} value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))}>
                      {COST_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Category <span className={styles.req}>*</span></label>
                    <select className={styles.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Item / Service <span className={styles.req}>*</span></label>
                    <input className={styles.input} placeholder="e.g. Dell Latitude 5540 Laptops" value={form.itemService} onChange={e => setForm(f => ({ ...f, itemService: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} rows={3} placeholder="Detailed scope, specifications, and requirements..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Quantity <span className={styles.req}>*</span></label>
                    <input className={styles.input} type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>UOM</label>
                    <select className={styles.select} value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))}>
                      {UOMS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expected Budget (₹) <span className={styles.req}>*</span></label>
                    <input className={styles.input} type="number" min={0} value={form.budget} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Closing Date <span className={styles.req}>*</span></label>
                    <input className={styles.input} type="date" value={form.closingDate} onChange={e => setForm(f => ({ ...f, closingDate: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Delivery Location</label>
                    <input className={styles.input} placeholder="e.g. Head Office, Mumbai" value={form.deliveryLocation} onChange={e => setForm(f => ({ ...f, deliveryLocation: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Required Delivery Date</label>
                    <input className={styles.input} type="date" value={form.requiredDeliveryDate} onChange={e => setForm(f => ({ ...f, requiredDeliveryDate: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Vendor Selection */}
            {wizardStep === 2 && (
              <div className={styles.modalBody}>
                <div className={styles.vendorSelectionHeader}>
                  <div className={styles.vendorSelectionInfo}>
                    <Users size={16} />
                    <span>Select vendors to invite. Only <strong>Active</strong> vendors with <strong>KYC Approved</strong> status are shown.</span>
                  </div>
                  <span className={styles.selectedCount}>{form.vendorIds.length} selected</span>
                </div>
                <div className={styles.vendorGrid}>
                  {eligibleVendors.length === 0 ? (
                    <div className={styles.emptyVendors}>No eligible vendors found. Ensure vendors are Active and KYC-approved.</div>
                  ) : (
                    eligibleVendors.map(v => (
                      <div
                        key={v.vendorId}
                        className={`${styles.vendorCard} ${form.vendorIds.includes(v.vendorId) ? styles.vendorCardSelected : ''}`}
                        onClick={() => handleVendorToggle(v.vendorId)}
                      >
                        <div className={styles.vendorCardHeader}>
                          <div className={styles.vendorAvatar}>{v.vendorName.charAt(0)}</div>
                          <div>
                            <div className={styles.vendorCardName}>{v.vendorName}</div>
                            <div className={styles.vendorCardCategory}>{v.category}</div>
                          </div>
                          {form.vendorIds.includes(v.vendorId) && (
                            <div className={styles.vendorCheckmark}><CheckCircle2 size={18} /></div>
                          )}
                        </div>
                        <div className={styles.vendorCardMeta}>
                          <span className={`${styles.riskBadge} ${v.riskRating === 'Low' ? styles.riskLow : v.riskRating === 'Medium' ? styles.riskMedium : styles.riskHigh}`}>
                            Risk: {v.riskRating}
                          </span>
                          <span className={styles.kycBadge}>{v.kycStatus}</span>
                          {v.isPreferred && <span className={styles.preferredBadge}>★ Preferred</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Attachments */}
            {wizardStep === 3 && (
              <div className={styles.modalBody}>
                <div className={styles.uploadSection}>
                  <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={32} className={styles.uploadIcon} />
                    <p className={styles.uploadTitle}>Upload Attachments</p>
                    <p className={styles.uploadSubtitle}>Technical Specs, Scope of Work, Drawings, BOQ, T&C (PDF, DOCX, XLSX — max 10MB)</p>
                    <button className={styles.uploadBtn} type="button">
                      {uploading ? 'Uploading…' : 'Choose File'}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.xlsx,.doc,.xls,.png,.jpg" style={{ display: 'none' }} onChange={handleFileUpload} />
                </div>
                {form.attachments.length > 0 && (
                  <div className={styles.attachmentList}>
                    <h4 className={styles.attachmentTitle}>Uploaded Files ({form.attachments.length})</h4>
                    {form.attachments.map(a => (
                      <div key={a.fileId} className={styles.attachmentItem}>
                        <FileText size={16} className={styles.attachmentIcon} />
                        <span className={styles.attachmentName}>{a.fileName}</span>
                        <span className={styles.attachmentDate}>{a.uploadDate}</span>
                        <button className={styles.attachmentRemove} onClick={() => removeAttachment(a.fileId)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Review & Publish */}
            {wizardStep === 4 && (
              <div className={styles.modalBody}>
                <div className={styles.reviewSection}>
                  <div className={styles.reviewHeader}>
                    <h3 className={styles.reviewTitle}>RFQ Summary</h3>
                    <Badge variant="info">Ready to Publish</Badge>
                  </div>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Tag size={13} /> RFQ Number</span><span className={styles.reviewValue}>Will be auto-generated</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><FileText size={13} /> Title</span><span className={styles.reviewValue}>{form.title}</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Building2 size={13} /> Department</span><span className={styles.reviewValue}>{form.department}</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Tag size={13} /> Category</span><span className={styles.reviewValue}>{form.category}</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Tag size={13} /> Budget</span><span className={styles.reviewValue}>₹{Number(form.budget).toLocaleString('en-IN')}</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Calendar size={13} /> Closing Date</span><span className={styles.reviewValue}>{form.closingDate || 'Not set'}</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><Users size={13} /> Vendors Invited</span><span className={styles.reviewValue}>{form.vendorIds.length} vendor(s) selected</span></div>
                    <div className={styles.reviewItem}><span className={styles.reviewLabel}><FileText size={13} /> Attachments</span><span className={styles.reviewValue}>{form.attachments.length} file(s)</span></div>
                  </div>
                  <div className={styles.publishOptions}>
                    <div className={styles.publishOption} onClick={() => handleSubmitRFQ(false)} style={{ opacity: submitting ? 0.7 : 1 }}>
                      <div className={styles.publishOptionIcon} style={{ background: '#f1f5f9', color: '#64748b' }}><FileText size={20} /></div>
                      <div><strong>Save as Draft</strong><p>Save RFQ without sending to vendors</p></div>
                    </div>
                    <div className={styles.publishOption} onClick={() => handleSubmitRFQ(true)} style={{ opacity: submitting ? 0.7 : 1, borderColor: '#1d4ed8', background: '#eff6ff' }}>
                      <div className={styles.publishOptionIcon} style={{ background: '#1d4ed8', color: 'white' }}><Send size={20} /></div>
                      <div><strong>Publish & Send RFQ</strong><p>Generate RFQ number and send to {form.vendorIds.length} vendor(s)</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.btnGhost} onClick={() => setShowWizard(false)}>Cancel</button>
              {wizardStep > 1 && <button className={styles.btnOutline} onClick={() => setWizardStep(s => s - 1)}>← Back</button>}
              {wizardStep < 4 ? (
                <button className={styles.btnPrimary} onClick={() => {
                  if (wizardStep === 1 && (!form.title || !form.itemService)) {
                    toast.error('Please fill Title and Item/Service fields.');
                    return;
                  }
                  setWizardStep(s => s + 1);
                }}>
                  Next →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
