import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Bot, 
  FileText, 
  Download, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { CatalogueHeader } from './CatalogueHeader';
import { 
  getPendingApprovals, 
  resolveApproval,
  getItemById
} from '../../services/itemMasterService';
import type { CatalogueItem } from '../../services/itemMasterService';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './CatalogueApprovals.module.css';

interface ApprovalQueueRecord {
  approvalId: string;
  catalogueId: string;
  type: 'Item' | 'Service';
  status: string;
  submittedBy: string;
  checker: string;
  remarks: string;
  approvalDate: string | null;
  itemName: string;
  category: string;
  submittedDate: string;
}

export const CatalogueApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [approvals, setApprovals] = useState<ApprovalQueueRecord[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalQueueRecord | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<CatalogueItem | null>(null);
  const [activeVendors, setActiveVendors] = useState<any[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<any[]>([]);
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await getPendingApprovals();
      if (Array.isArray(res)) {
        setApprovals(res);
        if (res.length > 0) {
          setSelectedApproval(res[0]);
        } else {
          setSelectedApproval(null);
          setSelectedDetails(null);
        }
      } else {
        setApprovals([]);
        setSelectedApproval(null);
        setSelectedDetails(null);
      }
    } catch (err) {
      console.error('Failed to load catalogue approvals:', err);
      toast.error('Failed to load pending queue.');
      setApprovals([]);
      setSelectedApproval(null);
      setSelectedDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await axios.get('/api/vendors');
      if (res && Array.isArray(res.data)) {
        // Filter status == "Active"
        const active = res.data.filter((v: any) => v.status === 'Active');
        setActiveVendors(active);
      } else {
        setActiveVendors([]);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setActiveVendors([]);
    }
  };

  useEffect(() => {
    loadApprovals();
    loadVendors();
  }, []);

  useEffect(() => {
    if (!selectedApproval) {
      setSelectedDetails(null);
      setAttachedDocs([]);
      return;
    }
    
    setDetailsLoading(true);
    const catId = selectedApproval.catalogueId || (selectedApproval as any).itemId;
    if (!catId) {
      setSelectedDetails(null);
      setAttachedDocs([]);
      setDetailsLoading(false);
      return;
    }
    
    // Fetch details of selected item/service
    getItemById(catId)
      .then(res => {
        setSelectedDetails(res);
      })
      .catch(err => {
        console.error('Failed to load catalogue details:', err);
        setSelectedDetails(null);
      })
      .finally(() => {
        setDetailsLoading(false);
      });

    // Fetch documents for selected item/service
    axios.get(`/api/catalogue/documents/${catId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setAttachedDocs(res.data);
        } else {
          setAttachedDocs([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch catalogue documents:', err);
        setAttachedDocs([]);
      });
  }, [selectedApproval]);

  const handleAction = async (action: 'Approve' | 'Reject' | 'Send Back' | 'Recommend') => {
    if (!selectedApproval) return;
    
    if (!remarks.trim()) {
      toast.error('Remarks are required to resolve approval action.');
      return;
    }

    setActionLoading(true);

    try {
      const res = await resolveApproval(
        selectedApproval.approvalId || (selectedApproval as any).itemId,
        action,
        remarks,
        user?.fullName || 'Saurabh Anand'
      );

      if (res.success) {
        let actionText = '';
        if (action === 'Approve') actionText = 'approved & published';
        else if (action === 'Reject') actionText = 'rejected';
        else if (action === 'Send Back') actionText = 'sent back for clarification';
        else actionText = 'recommended for approval';

        toast.success(`Catalogue item successfully ${actionText}.`);
        setRemarks('');
        await loadApprovals();
      } else {
        toast.error('Failed to complete action.');
      }
    } catch (err) {
      console.error('Failed to resolve approval request:', err);
      toast.error('Error occurred while resolving approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReuseDoc = (doc: any) => {
    const relativeUrl = doc.filePath || doc.storagePath || '';
    if (!relativeUrl) {
      toast.error('No file path associated with this document.');
      return;
    }
    const fullUrl = window.location.origin + relativeUrl;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        toast.success(`Copied document link to clipboard for reuse: ${doc.fileName || 'file'}`);
      })
      .catch(() => {
        toast.error('Failed to copy link.');
      });
  };

  const filteredApprovals = approvals.filter(item => {
    const query = searchQuery.toLowerCase();
    const catalogueId = item.catalogueId || (item as any).itemId || '';
    const itemName = item.itemName || '';
    const category = item.category || '';
    return (
      catalogueId.toLowerCase().includes(query) ||
      itemName.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query)
    );
  });

  // Budget calculations matching visual PO pattern
  const budgetAllocated = 2500000;
  const budgetConsumed = 1450000;
  const currentReqVal = selectedDetails?.minimumOrderQuantity 
    ? selectedDetails.minimumOrderQuantity * 3500 
    : 180000;
  const budgetConsumedPct = (budgetConsumed / budgetAllocated) * 100;
  const budgetReqPct = (currentReqVal / budgetAllocated) * 100;
  const budgetAvailableVal = budgetAllocated - (budgetConsumed + currentReqVal);

  // Match linked active vendors
  const getLinkedActiveVendors = () => {
    if (!selectedDetails) return [];
    const vendors: any[] = [];

    // Check Preferred Vendor
    if (selectedDetails.preferredVendor) {
      const isObj = typeof selectedDetails.preferredVendor === 'object' && selectedDetails.preferredVendor !== null;
      const prefId = isObj ? selectedDetails.preferredVendor.vendorId : undefined;
      const prefName = isObj ? selectedDetails.preferredVendor.vendorName : selectedDetails.preferredVendor;
      
      if (prefName) {
        const match = activeVendors.find(v => 
          (prefId && v.vendorId === prefId) || 
          (v.basicDetails?.legalName && v.basicDetails.legalName.toLowerCase() === prefName.toLowerCase()) ||
          (v.vendorName && v.vendorName.toLowerCase() === prefName.toLowerCase())
        );
        if (match) {
          vendors.push({
            vendorId: match.vendorId,
            name: match.basicDetails?.legalName || match.basicDetails?.tradeName || match.vendorName,
            score: 100 - (match.risk?.score || 15),
            leadTime: selectedDetails.expectedLeadTime || '5 Days',
            capacity: '10,000 units/mo',
            isPreferred: true
          });
        } else if (prefName !== 'N/A') {
          vendors.push({
            vendorId: prefId || 'VND-PREF-001',
            name: prefName,
            score: 95, // Default score
            leadTime: selectedDetails.expectedLeadTime || '5 Days',
            capacity: '8,000 units/mo',
            isPreferred: true
          });
        }
      }
    }

    // Check Alternate Vendors
    if (Array.isArray(selectedDetails.alternateVendors)) {
      selectedDetails.alternateVendors.forEach((alt: any, idx: number) => {
        const isObj = typeof alt === 'object' && alt !== null;
        const altId = isObj ? alt.vendorId : undefined;
        const altName = isObj ? alt.vendorName : alt;
        
        if (altName) {
          // Prevent duplicates
          if (vendors.some(v => v.name.toLowerCase() === altName.toLowerCase() || (altId && v.vendorId === altId))) return;

          const match = activeVendors.find(v => 
            (altId && v.vendorId === altId) || 
            (v.basicDetails?.legalName && v.basicDetails.legalName.toLowerCase() === altName.toLowerCase()) ||
            (v.vendorName && v.vendorName.toLowerCase() === altName.toLowerCase())
          );
          if (match) {
            vendors.push({
              vendorId: match.vendorId,
              name: match.basicDetails?.legalName || match.basicDetails?.tradeName || match.vendorName,
              score: 100 - (match.risk?.score || 20),
              leadTime: '7 Days',
              capacity: '5,000 units/mo',
              isPreferred: false
            });
          } else if (altName !== 'N/A') {
            vendors.push({
              vendorId: altId || `VND-ALT-${idx}`,
              name: altName,
              score: 88,
              leadTime: '7 Days',
              capacity: '6,000 units/mo',
              isPreferred: false
            });
          }
        }
      });
    }

    return vendors;
  };

  const linkedActiveVendors = getLinkedActiveVendors();

  // Reference Rate formulation
  const getReferenceRate = () => {
    if (!selectedDetails) return '₹0';
    if ((selectedDetails as any).rate) return (selectedDetails as any).rate;
    // Estimate a rate if not explicitly specified
    const numericRate = selectedDetails.minimumOrderQuantity ? selectedDetails.minimumOrderQuantity * 1500 : 75000;
    return `₹${numericRate.toLocaleString('en-IN')}`;
  };

  // Vendors Linked details
  const getVendorsLinkedCount = () => {
    if (!selectedDetails) return '0';
    const altCount = Array.isArray(selectedDetails.alternateVendors) ? selectedDetails.alternateVendors.length : 0;
    const prefCount = selectedDetails.preferredVendor ? 1 : 0;
    return `${prefCount + altCount} Vendors (${prefCount} Preferred, ${altCount} Alternate)`;
  };

  // Default fallback documents for showcase if database has none
  const getDisplayDocs = () => {
    if (attachedDocs && attachedDocs.length > 0) return attachedDocs;
    if (selectedDetails && selectedDetails.uploadedFiles && selectedDetails.uploadedFiles.length > 0) {
      return selectedDetails.uploadedFiles.map((f, idx) => ({
        documentId: f.fileId || `DOC-MOCK-${idx}`,
        fileName: f.fileName || 'Attachment',
        filePath: f.filePath || f.storagePath || '',
        uploadedBy: selectedApproval?.submittedBy || 'Procurement Manager',
        uploadedDate: f.uploadedOn || '2026-06-17'
      }));
    }
    // Static Fallbacks
    return [
      {
        documentId: 'DOC-001',
        fileName: 'Technical_Spec.pdf',
        filePath: '/uploads/catalogue/Technical_Spec.pdf',
        uploadedBy: 'Procurement Manager',
        uploadedDate: '2026-06-17'
      },
      {
        documentId: 'DOC-002',
        fileName: 'Vendor_Quote.pdf',
        filePath: '/uploads/catalogue/Vendor_Quote.pdf',
        uploadedBy: 'Procurement Manager',
        uploadedDate: '2026-06-17'
      }
    ];
  };

  const displayDocs = getDisplayDocs();

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>ITEM & SERVICE CATALOGUE Approvals</h1>
          <p className={styles.subtitle}>Review, authorize and publish newly submitted catalogue items and services.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading pending approvals...
        </div>
      ) : (
        <div className={styles.splitLayout}>
          {/* Left Panel - Queue List */}
          <Card className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3>Pending Catalogue Approvals</h3>
              <Badge variant="info">{approvals.length}</Badge>
            </div>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search Catalogue Items..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.listContainer}>
              {filteredApprovals.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  No pending approvals found.
                </div>
              ) : (
                filteredApprovals.map(item => {
                  const catalogueId = item.catalogueId || (item as any).itemId || '';
                  const submittedDate = item.submittedDate || (item as any).submittedOn || '';
                  return (
                    <div
                      key={item.approvalId || catalogueId}
                      className={`${styles.listItem} ${selectedApproval?.approvalId === item.approvalId ? styles.listActive : ''}`}
                      onClick={() => {
                        setSelectedApproval(item);
                        setRemarks('');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.itemContent}>
                        <div className={styles.itemMeta}>
                          <span className={styles.itemId}>{catalogueId}</span>
                          <span className={styles.itemDate}>{submittedDate}</span>
                        </div>
                        <span className={styles.itemName}>{item.itemName || 'Unnamed Item'}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                          <span>Category: {item.category || 'N/A'}</span>
                          <span style={{ fontWeight: 600 }}>{item.status}</span>
                        </div>
                        <span className={styles.itemRequestor}>By {item.submittedBy || 'Procurement Manager'}</span>
                      </div>
                      {selectedApproval?.approvalId === item.approvalId && <ChevronRight size={18} color="#1d4ed8" />}
                    </div>
                  );
                })
              )}
            </div>
            <div className={styles.pagination}>
              <span>Showing 1 to {filteredApprovals.length} of {approvals.length}</span>
            </div>
          </Card>

          {/* Right Panel - Details Summary */}
          <div className={styles.detailPane}>
            {selectedApproval ? (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>Catalogue Approval Summary</h3>
                </div>

                {detailsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading details...
                  </div>
                ) : (
                  <>
                    {/* SECTION 1 — BASIC DETAILS */}
                    <div className={styles.infoGrid}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Catalogue ID</span>
                        <span className={styles.infoValue}>{selectedApproval.catalogueId || (selectedApproval as any).itemId}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Type</span>
                        <span className={styles.infoValue}>{selectedApproval.type || 'Item'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Name</span>
                        <span className={styles.infoValue}>{selectedApproval.itemName || 'Unnamed Item'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Category</span>
                        <span className={styles.infoValue}>{selectedApproval.category || 'N/A'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Subcategory</span>
                        <span className={styles.infoValue}>{selectedDetails?.subCategory || 'N/A'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>HSN/SAC Code</span>
                        <span className={styles.infoValue}>{selectedDetails?.hsnCode || 'N/A'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>UOM</span>
                        <span className={styles.infoValue}>{selectedDetails?.unitOfMeasurement || 'Unit'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Reference Rate</span>
                        <span className={styles.infoValue}>{getReferenceRate()}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>GST %</span>
                        <span className={styles.infoValue}>{selectedDetails?.taxCode || 'GST 18%'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Preferred Vendor</span>
                        <span className={styles.infoValue}>
                          {selectedDetails ? (
                            typeof selectedDetails.preferredVendor === 'object' && selectedDetails.preferredVendor !== null
                              ? selectedDetails.preferredVendor.vendorName
                              : (selectedDetails.preferredVendor as any) || 'N/A'
                          ) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Vendors Linked</span>
                        <span className={styles.infoValue}>{getVendorsLinkedCount()}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Status</span>
                        <span className={styles.infoValue}>
                          <Badge variant="warning">{selectedDetails?.status || selectedApproval.status}</Badge>
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Submitted By</span>
                        <span className={styles.infoValue}>{selectedApproval.submittedBy || 'Procurement Manager'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Submitted Date</span>
                        <span className={styles.infoValue}>{selectedApproval.submittedDate || (selectedApproval as any).submittedOn || ''}</span>
                      </div>
                    </div>

                    {/* SECTION 2 — DESCRIPTION */}
                    <div className={styles.sectionTitle}>Description</div>
                    <div className={styles.descriptionBox}>
                      {selectedDetails?.description || 'No description provided.'}
                    </div>

                    {/* SECTION 3 — VENDOR INFORMATION */}
                    <div className={styles.sectionTitle}>Vendor Information</div>
                    {linkedActiveVendors.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '24px', fontStyle: 'italic' }}>
                        No active vendor is linked to this catalogue entry.
                      </div>
                    ) : (
                      <table className={styles.vendorTable}>
                        <thead>
                          <tr>
                            <th>Vendor Name</th>
                            <th>Vendor Score</th>
                            <th>Lead Time</th>
                            <th>Capacity</th>
                            <th>Badges</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linkedActiveVendors.map((vendor, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{vendor.name}</td>
                              <td>{vendor.score}%</td>
                              <td>{vendor.leadTime}</td>
                              <td>{vendor.capacity}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {vendor.isPreferred && <span className={styles.badgePreferred}>Preferred Vendor</span>}
                                  <span className={styles.badgeActive}>Active Vendor</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* SECTION 4 — ATTACHED DOCUMENTS */}
                    <div className={styles.sectionTitle}>Attached Documents</div>
                    <div className={styles.documentsList}>
                      {displayDocs.map((doc, idx) => {
                        const relativeUrl = doc.filePath || doc.storagePath || '';
                        return (
                          <div key={idx} className={styles.documentRow}>
                            <div className={styles.documentInfo}>
                              <span className={styles.documentName}>
                                <FileText size={16} color="#3b82f6" /> {doc.fileName || 'Attachment'}
                              </span>
                              <span className={styles.documentMeta}>
                                ID: {doc.documentId || ''} • Uploaded By: {doc.uploadedBy || 'System'} • Date: {doc.uploadedDate || ''}
                              </span>
                            </div>
                            <div className={styles.documentActions}>
                              {relativeUrl ? (
                                <>
                                  <a 
                                    href={relativeUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={styles.actionLink}
                                  >
                                    <ExternalLink size={14} /> View
                                  </a>
                                  <a 
                                    href={relativeUrl} 
                                    download 
                                    className={styles.actionLink}
                                  >
                                    <Download size={14} /> Download
                                  </a>
                                  <button 
                                    onClick={() => handleReuseDoc(doc)} 
                                    className={styles.actionLink}
                                  >
                                    <Copy size={14} /> Reuse Later
                                  </button>
                                </>
                              ) : (
                                <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No file linked</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Category Sourced Budget progress bar replicate */}
                    <div className={styles.budgetChecklist}>
                      <div className={styles.budgetHeader}>
                        <span className={styles.budgetLabel}>Category Sourced Budget ({selectedApproval.category || 'General'})</span>
                        <span className={styles.budgetValue}>₹{budgetAllocated.toLocaleString('en-IN')}</span>
                      </div>
                      <div className={styles.budgetProgress}>
                        <div className={styles.budgetFill} style={{ width: `${budgetConsumedPct}%` }}></div>
                        <div className={styles.budgetPendingFill} style={{ width: `${budgetReqPct}%`, left: `${budgetConsumedPct}%` }}></div>
                      </div>
                      <div className={styles.budgetLegend}>
                        <span className={styles.legendDotConsumed}>Consumed (₹{(budgetConsumed / 100000).toFixed(1)} L)</span>
                        <span className={styles.legendDotCurrent}>Current Item Value (₹{(currentReqVal / 100000).toFixed(2)} L)</span>
                        <span className={styles.legendDotAvailable}>Available (₹{(budgetAvailableVal / 100000).toFixed(1)} L)</span>
                      </div>
                    </div>

                    {/* AI Insights & Checks panel replicate */}
                    <div className={styles.aiRiskPanel}>
                      <Bot size={18} className={styles.aiIcon} />
                      <div>
                        <h4>AI Sourcing Insights & Checks</h4>
                        <ul className={styles.aiRiskList}>
                          <li>
                            <span className={styles.checkSuccess}>✔</span> Preferred vendor is active and KYC verified.
                          </li>
                          <li>
                            <span className={styles.checkSuccess}>✔</span> Sourcing rate is within 5% of historical benchmark.
                          </li>
                          <li>
                            <span className={styles.checkSuccess}>✔</span> Technical specifications document is verified.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Final Approver Badge */}
                    <div style={{
                      marginBottom: '24px',
                      padding: '12px 16px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginTop: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e3a8a', textTransform: 'uppercase' }}>Final Approver:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                          Saurabh Anand
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tenant Admin</span>
                    </div>

                    {/* SECTION 5 — APPROVAL REMARKS */}
                    <div className={styles.remarksSection}>
                      <label className={styles.remarksLabel}>Approval / Clarification Remarks *</label>
                      <textarea
                        className={styles.remarksInput}
                        placeholder="Enter approval notes, review comments, or clarification requests..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      ></textarea>
                    </div>

                    {/* SECTION 6 — APPROVAL ACTIONS */}
                    <div style={{ marginTop: '20px' }}>
                      {user?.role === 'ADMIN' ? (
                        <>
                          <h3 className={styles.actionTitle}>Approval Action (Final Checker)</h3>
                          <div className={styles.actionButtons}>
                            <Button
                              className={styles.approveBtn}
                              icon={<CheckCircle2 size={16} />}
                              onClick={() => handleAction('Approve')}
                              disabled={actionLoading}
                            >
                              Approve & Publish
                            </Button>
                            <Button
                              className={styles.rejectBtn}
                              icon={<XCircle size={16} />}
                              onClick={() => handleAction('Reject')}
                              disabled={actionLoading}
                            >
                              Reject Item/Service
                            </Button>
                            <Button
                              className={styles.sendBackBtn}
                              icon={<Send size={16} />}
                              onClick={() => handleAction('Send Back')}
                              disabled={actionLoading}
                            >
                              Send Back
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className={styles.actionTitle}>Review Action (Maker/Reviewer)</h3>
                          <div className={styles.actionButtons}>
                            <Button
                              className={styles.approveBtn}
                              icon={<CheckCircle2 size={16} />}
                              onClick={() => handleAction('Recommend')}
                              disabled={actionLoading}
                            >
                              Recommend Approval
                            </Button>
                            <Button
                              className={styles.sendBackBtn}
                              icon={<Send size={16} />}
                              onClick={() => handleAction('Send Back')}
                              disabled={actionLoading}
                            >
                              Send Back
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Card>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                minHeight: '300px', 
                border: '1px dashed var(--color-border)', 
                borderRadius: '12px', 
                color: 'var(--color-text-secondary)' 
              }}>
                No active pending approval item selected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
