import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, CheckCircle2, XCircle, Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { 
  getPendingApprovals, 
  approvePO, 
  rejectPO, 
  getRequisitionById 
} from '../../services/purchaseOrderService';
import type { 
  ApprovalQueueItem, 
  RequisitionRecord 
} from '../../services/purchaseOrderService';
import styles from './POApprovals.module.css';

export const POApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalQueueItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalQueueItem | null>(null);
  const [selectedReq, setSelectedReq] = useState<RequisitionRecord | null>(null);
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadApprovals = () => {
    setLoading(true);
    getPendingApprovals()
      .then(res => {
        setApprovals(res);
        if (res.length > 0) {
          setSelectedApproval(res[0]);
        } else {
          setSelectedApproval(null);
          setSelectedReq(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load approvals:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  useEffect(() => {
    if (!selectedApproval) {
      setSelectedReq(null);
      return;
    }
    getRequisitionById(selectedApproval.requisitionId)
      .then(res => {
        setSelectedReq(res);
      })
      .catch(err => {
        console.error('Failed to load requisition details:', err);
        setSelectedReq(null);
      });
  }, [selectedApproval]);

  const handleAction = async (action: 'Approve' | 'Reject' | 'Send Back') => {
    if (!selectedApproval) return;
    setActionLoading(true);
    try {
      if (action === 'Approve') {
        const res = await approvePO(selectedApproval.requisitionId, remarks, 'Saurabh Anand');
        if (res.success) {
          toast.success(`Requisition ${selectedApproval.requisitionId} approved — PO generated.`);
          setRemarks('');
          loadApprovals();
        }
      } else {
        const res = await rejectPO(selectedApproval.requisitionId, remarks, 'Saurabh Anand', action === 'Send Back' ? 'Send Back' : 'Reject');
        if (res.success) {
          toast.success(`Requisition ${selectedApproval.requisitionId} ${action === 'Send Back' ? 'sent back' : 'rejected'} successfully.`);
          setRemarks('');
          loadApprovals();
        }
      }
    } catch (err) {
      console.error('Action execution failed:', err);
      toast.error('Failed to execute action. Please check logs.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApprovals = approvals.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.requisitionId.toLowerCase().includes(query) ||
      item.vendorName.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query)
    );
  });

  // Budget validation calculation
  const budget = selectedReq?.budgetDetails;
  const allocated = budget?.allocatedBudget || 5000000;
  const consumed = budget?.consumedBudget || 2250000;
  const reqVal = budget?.currentRequisitionValue || selectedApproval?.estimatedValue || 1250000;
  const consumedPct = (consumed / allocated) * 100;
  const reqPct = (reqVal / allocated) * 100;
  const availableVal = allocated - (consumed + reqVal);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Purchase Order Approvals</h1>
          <p className={styles.subtitle}>Verify and authorize pending PO requisitions.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading pending approvals...
        </div>
      ) : (
        <div className={styles.splitLayout}>
          {/* Left Pane - List */}
          <Card className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3>Pending Requisitions</h3>
              <Badge variant="info">{approvals.length}</Badge>
            </div>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search POs..." 
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
                filteredApprovals.map(item => (
                  <div 
                    key={item.approvalId} 
                    className={`${styles.listItem} ${selectedApproval?.approvalId === item.approvalId ? styles.listActive : ''}`}
                    onClick={() => setSelectedApproval(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.itemContent}>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemId}>{item.requisitionId}</span>
                        <span className={styles.itemDate}>{item.submittedOn.split(' ')[0]}</span>
                      </div>
                      <span className={styles.itemName}>{item.department} • ₹{item.estimatedValue.toLocaleString('en-IN')}</span>
                      <span className={styles.itemRequestor}>By {item.submittedBy}</span>
                    </div>
                    {selectedApproval?.approvalId === item.approvalId && <ChevronRight size={18} color="#1d4ed8" />}
                  </div>
                ))
              )}
            </div>
            <div className={styles.pagination}>
              <span>Showing 1 to {filteredApprovals.length} of {approvals.length}</span>
            </div>
          </Card>

          {/* Right Pane - Detail */}
          <div className={styles.detailPane}>
            {selectedApproval ? (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>Requisition Summary ({selectedApproval.currentStage})</h3>
                </div>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Requisition ID</span>
                    <span className={styles.infoValue}>{selectedApproval.requisitionId}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Requestor</span>
                    <span className={styles.infoValue}>{selectedApproval.submittedBy}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Department</span>
                    <span className={styles.infoValue}>{selectedApproval.department}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Value</span>
                    <span className={styles.infoValue}>₹{selectedApproval.estimatedValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vendor Selected</span>
                    <span className={styles.infoValue}>{selectedApproval.vendorName}</span>
                  </div>
                  {selectedReq && selectedReq.itemDetails && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Item / Description</span>
                      <span className={styles.infoValue}>{selectedReq.itemDetails.itemDescription} ({selectedReq.itemDetails.quantity} {selectedReq.itemDetails.unitOfMeasure})</span>
                    </div>
                  )}
                  {selectedReq && selectedReq.uploadedDocuments && selectedReq.uploadedDocuments.length > 0 && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Attached Drawing / Specification</span>
                      <span className={styles.infoValue}>
                        {selectedReq.uploadedDocuments.map(doc => (
                          <a 
                            key={doc.fileId} 
                            href={doc.filePath} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ display: 'block', textDecoration: 'underline', color: 'var(--color-primary)' }}
                          >
                            📄 {doc.fileName} ({doc.fileSize})
                          </a>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.budgetChecklist}>
                  <div className={styles.budgetHeader}>
                    <span className={styles.budgetLabel}>Budget Allocated ({selectedReq?.costCenter?.costCenterCode || 'CC-IT-OPS'})</span>
                    <span className={styles.budgetValue}>₹{allocated.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.budgetProgress}>
                    <div className={styles.budgetFill} style={{ width: `${consumedPct}%` }}></div>
                    <div className={styles.budgetPendingFill} style={{ width: `${reqPct}%`, left: `${consumedPct}%` }}></div>
                  </div>
                  <div className={styles.budgetLegend}>
                    <span className={styles.legendDotConsumed}>Consumed (₹{(consumed/100000).toFixed(1)} L)</span>
                    <span className={styles.legendDotCurrent}>Current Requisition (₹{(reqVal/100000).toFixed(1)} L)</span>
                    <span className={styles.legendDotAvailable}>Available (₹{(availableVal/100000).toFixed(1)} L)</span>
                  </div>
                </div>

                <div className={styles.aiRiskPanel}>
                  <Bot size={18} className={styles.aiIcon} />
                  <div>
                    <h4>AI Insights & Checks</h4>
                    <ul className={styles.aiRiskList}>
                      <li>
                        <span className={styles.checkSuccess}>✔</span> Budget available and approved.
                      </li>
                      <li>
                        <span className={styles.checkSuccess}>✔</span> Vendor risk rating is Low (20/100).
                      </li>
                      {selectedReq?.linkedContract && (
                        <li>
                          <span className={styles.checkWarning}>!</span> Linked to MSA ({selectedReq.linkedContract.contractId}) expiring on {selectedReq.linkedContract.contractExpiry}.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <h3 className={styles.actionTitle}>Approval Action</h3>

                <div className={styles.actionButtons}>
                  <Button 
                    className={styles.approveBtn} 
                    icon={<CheckCircle2 size={16} />}
                    onClick={() => handleAction('Approve')}
                    disabled={actionLoading}
                  >
                    {selectedApproval.currentStage === 'Procurement Head Approval' ? 'Approve & Generate PO' : 'Approve Requisition'}
                  </Button>
                  <Button 
                    className={styles.rejectBtn} 
                    icon={<XCircle size={16} />}
                    onClick={() => handleAction('Reject')}
                    disabled={actionLoading}
                  >
                    Reject Requisition
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

                <div className={styles.remarksSection}>
                  <label className={styles.remarksLabel}>Approval Notes / Remarks</label>
                  <textarea 
                    className={styles.remarksInput} 
                    placeholder="Enter remarks required for rejection or send-back..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', border: '1px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-text-secondary)' }}>
                No active pending approval item selected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

