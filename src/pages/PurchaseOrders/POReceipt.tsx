import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, X, Upload, Package, CheckCircle2, XCircle, Calendar, ClipboardList, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { 
  getAllGRNs, 
  getAllPOs, 
  createGRN, 
  uploadPOFile
} from '../../services/purchaseOrderService';
import type { 
  GRNRecord, 
  PurchaseOrderRecord,
  UploadedDocument
} from '../../services/purchaseOrderService';
import styles from './POReceipt.module.css';
import pStyles from '../Payments/PaymentDashboard.module.css';

export const POReceipt: React.FC = () => {
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [pos, setPos] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewGrn, setViewGrn] = useState<GRNRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCondition, setFilterCondition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const activeFilterCount = [filterCondition, filterStatus].filter(Boolean).length;
  const clearFilters = () => { setFilterCondition(''); setFilterStatus(''); };

  // Form states
  const [selectedPoId, setSelectedPoId] = useState('');
  const [receivedQty, setReceivedQty] = useState(1);
  const [acceptedQty, setAcceptedQty] = useState(1);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [condition, setCondition] = useState('Excellent');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // File states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [grnList, poList] = await Promise.all([getAllGRNs(), getAllPOs()]);
      setGrns(grnList);
      setPos(poList);
      
      const openPOs = poList.filter(po => po.deliveryStatus !== 'Received' && po.status === 'Approved');
      if (openPOs.length > 0) {
        setSelectedPoId(openPOs[0].poId);
      }
    } catch (err) {
      console.error('Failed to load Goods Receipt data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadPOFile(file, {
        documentCategory: 'GRN File',
        uploadedBy: 'Saurabh Anand'
      });
      if (res.success) {
        setUploadedFiles(prev => [...prev, res.file]);
      }
    } catch (err) {
      console.error('GRN file upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoId) return;

    setSubmitting(true);

    const grnPayload: GRNRecord = {
      poId: selectedPoId,
      receivedQuantity: Number(receivedQty),
      acceptedQuantity: Number(acceptedQty),
      rejectedQuantity: Number(rejectedQty),
      deliveryCondition: condition,
      inspectionRemarks: remarks,
      inspectedBy: 'Saurabh Anand'
    };

    try {
      const res = await createGRN(grnPayload);
      if (res.success) {
        toast.success(`Goods Receipt Note ${res.grn.grnId} generated successfully.`);
        setShowModal(false);
        setRemarks('');
        setReceivedQty(1);
        setAcceptedQty(1);
        setRejectedQty(0);
        setUploadedFiles([]);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create Goods Receipt Note:', err);
      toast.error('Action failed. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGRNs = grns.filter(item => {
    const q = searchQuery.toLowerCase();
    if (q && !item.grnId?.toLowerCase().includes(q) && !item.poId.toLowerCase().includes(q) && !(item as any).vendorName?.toLowerCase().includes(q)) return false;
    if (filterCondition && item.deliveryCondition !== filterCondition) return false;
    if (filterStatus && item.grnStatus !== filterStatus) return false;
    return true;
  });

  const activeApprovedPOs = pos.filter(po => po.deliveryStatus !== 'Received' && (po.status === 'Approved' || po.status === 'Sent'));

  const columns = [
    { header: 'GRN Number', accessor: 'grnId' as keyof GRNRecord },
    { header: 'PO Number', accessor: 'poId' as keyof GRNRecord },
    { header: 'Vendor Name', accessor: (row: any) => row.vendorName || pos.find(p => p.poId === row.poId)?.vendorName || 'VND Secure Ltd' },
    { header: 'Received Qty', accessor: 'receivedQuantity' as keyof GRNRecord, align: 'center' as const },
    { header: 'Accepted Qty', accessor: 'acceptedQuantity' as keyof GRNRecord, align: 'center' as const },
    { header: 'Rejected Qty', accessor: 'rejectedQuantity' as keyof GRNRecord, align: 'center' as const },
    { 
      header: 'Condition', 
      accessor: (row: GRNRecord) => {
        let color = '#16a34a';
        if (row.deliveryCondition === 'Damaged') color = '#dc2626';
        if (row.deliveryCondition === 'Needs Work' || row.deliveryCondition === 'Good') color = '#b45309';
        return <span style={{ color, fontWeight: 600 }}>{row.deliveryCondition}</span>;
      }
    },
    { 
      header: 'Inspection Date', 
      accessor: (row: GRNRecord) => row.receivedDate || row.createdDate || '-'
    },
    { 
      header: 'Receipt Status', 
      accessor: (row: GRNRecord) => {
        let className = styles.statusBadge;
        if (row.grnStatus === 'Fully Accepted') className = styles.statusSuccess;
        if (row.grnStatus === 'Partially Accepted') className = styles.statusWarning;
        if (row.grnStatus === 'Pending') className = styles.statusWarning;
        return <span className={className}>{row.grnStatus || 'Accepted'}</span>;
      } 
    },
    {
      header: 'Actions',
      align: 'center' as const,
      accessor: (row: GRNRecord) => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="View inspection details" onClick={() => setViewGrn(row)}><Eye size={16} /></button>
        </div>
      )
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Goods Receipt (GRN)</h1>
          <p className={styles.breadcrumbs}>Home / Purchase Orders / Goods Receipt</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>New Goods Receipt</Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={pStyles.tableToolbar}>
          <div className={pStyles.searchWrap}>
            <Search size={16} className={pStyles.searchIcon} />
            <input type="text" placeholder="Search GRN, PO number, vendor..." className={pStyles.searchInput} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className={pStyles.toolbarActions}>
            <Button variant={showFilters || activeFilterCount > 0 ? 'primary' : 'ghost'} icon={<Filter size={16} />} onClick={() => setShowFilters(f => !f)}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <Button variant="outline" icon={<Download size={16} />}>Export</Button>
          </div>
        </div>

        {showFilters && (
          <div className={pStyles.filterPanel}>
            <div className={pStyles.filterGrid}>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Delivery Condition</label>
                <select className={pStyles.filterSelect} value={filterCondition} onChange={e => setFilterCondition(e.target.value)}>
                  <option value="">All Conditions</option>
                  {['Excellent', 'Good', 'Needs Work', 'Damaged'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={pStyles.filterGroup}>
                <label className={pStyles.filterLabel}>Receipt Status</label>
                <select className={pStyles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['Fully Accepted', 'Partially Accepted', 'Pending', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && <button className={pStyles.clearFiltersBtn} onClick={clearFilters}>Clear all filters</button>}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            Loading Goods Receipts...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredGRNs} 
            keyExtractor={(row) => row.grnId || row.poId} 
          />
        )}
      </Card>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create Goods Receipt Note (GRN)</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGRN}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Select Purchase Order <span style={{ color: 'red' }}>*</span></label>
                  <select 
                    className={styles.select} 
                    value={selectedPoId} 
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    required
                  >
                    {activeApprovedPOs.length === 0 ? (
                      <option value="">No pending approved POs</option>
                    ) : (
                      activeApprovedPOs.map(po => (
                        <option key={po.poId} value={po.poId}>
                          {po.poId} - {po.vendorName} (Value: ₹{po.poValue.toLocaleString('en-IN')})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Received Qty</label>
                    <Input 
                      type="number" 
                      value={receivedQty} 
                      onChange={(e) => {
                        setReceivedQty(Number(e.target.value));
                        setAcceptedQty(Number(e.target.value) - rejectedQty);
                      }} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rejected Qty</label>
                    <Input 
                      type="number" 
                      value={rejectedQty} 
                      onChange={(e) => {
                        setRejectedQty(Number(e.target.value));
                        setAcceptedQty(receivedQty - Number(e.target.value));
                      }} 
                      required 
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Accepted Qty (Calculated)</label>
                    <Input type="number" value={acceptedQty} disabled />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Delivery Condition</label>
                    <select 
                      className={styles.select} 
                      value={condition} 
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Needs Work">Needs Work</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Inspection Remarks</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Enter details of inspection check, deviations, or damaged units..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>GRN Document / Proof of Inspection</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', border: '1px dashed var(--color-border)', padding: '12px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      <Upload size={14} /> Upload PDF
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {uploading ? 'Uploading...' : 'Link scanned GRN slip'}
                    </span>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {uploadedFiles.map(doc => (
                        <div key={doc.fileId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.75rem' }}>
                          <span>📄 {doc.fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !selectedPoId}>{submitting ? 'Creating...' : 'Create Receipt'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRN Detail View Modal */}
      {viewGrn && (
        <div className={styles.modalOverlay} onClick={() => setViewGrn(null)}>
          <div className={styles.modalContent} style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>GRN Details — {viewGrn.grnId}</h3>
              <button className={styles.closeBtn} onClick={() => setViewGrn(null)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { icon: <Package size={14} />, label: 'PO Reference', value: viewGrn.poId },
                  { icon: <Calendar size={14} />, label: 'Receipt Date', value: viewGrn.receivedDate || viewGrn.createdDate || '—' },
                  { icon: <CheckCircle2 size={14} />, label: 'Received Qty', value: viewGrn.receivedQuantity },
                  { icon: <CheckCircle2 size={14} />, label: 'Accepted Qty', value: viewGrn.acceptedQuantity },
                  { icon: <XCircle size={14} />, label: 'Rejected Qty', value: viewGrn.rejectedQuantity },
                  { icon: <ClipboardList size={14} />, label: 'Delivery Condition', value: viewGrn.deliveryCondition },
                  { icon: <ClipboardList size={14} />, label: 'GRN Status', value: viewGrn.grnStatus || 'Accepted' },
                  { icon: <ClipboardList size={14} />, label: 'Inspected By', value: viewGrn.inspectedBy || '—' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {viewGrn.inspectionRemarks && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  <strong>Inspection Remarks:</strong> {viewGrn.inspectionRemarks}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" type="button" onClick={() => setViewGrn(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
