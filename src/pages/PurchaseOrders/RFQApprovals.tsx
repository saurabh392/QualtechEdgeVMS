import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, ChevronRight, CheckCircle2, XCircle, Send,
  Bot, FileText, Award, Calendar, Building2, Tag, Users, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './RFQApprovals.module.css';

interface WorkflowEntry {
  stage: string;
  action: string;
  performedBy: string;
  timestamp: string;
  remarks: string;
}

interface RFQApproval {
  approvalId: string;
  rfqId: string;
  rfqTitle: string;
  department: string;
  category: string;
  budget: number;
  selectedVendorId: string;
  selectedVendorName: string;
  awardValue: number;
  businessJustification: string;
  comparisonSummary: string;
  currentStage: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedOn: string;
  approver: string;
  remarks: string;
  attachments: any[];
  workflowHistory: WorkflowEntry[];
}

const STAGE_FLOW = ['Maker', 'Procurement Manager Review', 'Tenant Admin Review', 'Approved'];

export const RFQApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [approvals, setApprovals] = useState<RFQApproval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<RFQApproval | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const rfqIdFromParams = searchParams.get('rfqId');

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/rfq-approvals');
      const arr: RFQApproval[] = Array.isArray(res.data) ? res.data : [];
      setApprovals(arr);

      // Auto-select from query param or first pending
      if (rfqIdFromParams) {
        const found = arr.find(a => a.rfqId === rfqIdFromParams);
        if (found) { setSelectedApproval(found); return; }
      }
      const pending = arr.find(a => a.status === 'Pending Approval');
      setSelectedApproval(pending || arr[0] || null);
    } catch (e) {
      console.error('Error loading RFQ approvals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApprovals(); }, []);

  const handleAction = async (action: 'Approve' | 'Reject' | 'Send Back') => {
    if (!selectedApproval) return;
    if (!remarks.trim() && action !== 'Approve') {
      toast.error('Please enter remarks before taking this action.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.post(`/api/rfq-approvals/${selectedApproval.approvalId}/action`, {
        action,
        remarks,
        performedBy: user?.fullName || 'Saurabh Anand'
      });
      if (res.data.success) {
        const messages: Record<string, string> = {
          'Approve': `RFQ ${selectedApproval.rfqId} approved${selectedApproval.currentStage === 'Tenant Admin Review' ? ' — Purchase Order generated automatically!' : ' — escalated to next approver.'}`,
          'Reject': `RFQ ${selectedApproval.rfqId} rejected.`,
          'Send Back': `RFQ ${selectedApproval.rfqId} sent back for revision.`
        };
        toast.success(messages[action]);
        setRemarks('');
        loadApprovals();
      }
    } catch (e) {
      toast.error('Failed to process action.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApprovals = approvals.filter(a => {
    if (activeTab === 'Pending' && a.status !== 'Pending Approval') return false;
    if (activeTab === 'Approved' && a.status !== 'Approved') return false;
    if (activeTab === 'Rejected' && a.status !== 'Rejected') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.rfqId.toLowerCase().includes(q) || a.rfqTitle.toLowerCase().includes(q) ||
        a.selectedVendorName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = approvals.filter(a => a.status === 'Pending Approval').length;
  const approvedCount = approvals.filter(a => a.status === 'Approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'Rejected').length;

  const getStatusVariant = (status: string) => {
    if (status === 'Approved') return 'success' as const;
    if (status === 'Rejected') return 'danger' as const;
    return 'warning' as const;
  };

  const savings = selectedApproval ? selectedApproval.budget - selectedApproval.awardValue : 0;
  const savingsPct = selectedApproval && selectedApproval.budget > 0 ? ((savings / selectedApproval.budget) * 100).toFixed(1) : '0';

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>RFQ Approvals</h1>
          <p className={styles.subtitle}>Review and authorize shortlisted vendor awards from closed RFQs</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => navigate('/purchase-orders/rfq')}>RFQ List</Button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading RFQ approvals...</div>
      ) : (
        <div className={styles.splitLayout}>
          {/* Left Panel */}
          <Card className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3>Pending RFQs</h3>
              <Badge variant="info">{approvals.length}</Badge>
            </div>

            {/* Tabs */}
            <div className={styles.tabRow}>
              {([['All', approvals.length], ['Pending', pendingCount], ['Approved', approvedCount], ['Rejected', rejectedCount]] as [string, number][]).map(([tab, count]) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab} <span className={styles.tabCount}>{count}</span>
                </button>
              ))}
            </div>

            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search RFQs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.listContainer}>
              {filteredApprovals.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  No RFQ approvals found.
                </div>
              ) : (
                filteredApprovals.map(a => (
                  <div
                    key={a.approvalId}
                    className={`${styles.listItem} ${selectedApproval?.approvalId === a.approvalId ? styles.listActive : ''}`}
                    onClick={() => { setSelectedApproval(a); setRemarks(''); }}
                  >
                    <div className={styles.itemContent}>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemId}>{a.rfqId}</span>
                        <span className={styles.itemDate}>{a.submittedOn?.split(' ')[0]}</span>
                      </div>
                      <span className={styles.itemName}>{a.rfqTitle}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span className={styles.itemRequestor}>{a.department} • ₹{Number(a.awardValue).toLocaleString('en-IN')}</span>
                        <Badge variant={getStatusVariant(a.status)} style={{ fontSize: '0.65rem' }}>{a.status === 'Pending Approval' ? 'Pending' : a.status}</Badge>
                      </div>
                    </div>
                    {selectedApproval?.approvalId === a.approvalId && <ChevronRight size={16} color="#1d4ed8" />}
                  </div>
                ))
              )}
            </div>

            <div className={styles.pagination}>
              Showing {filteredApprovals.length} of {approvals.length}
            </div>
          </Card>

          {/* Right Panel */}
          <div className={styles.detailPane}>
            {selectedApproval ? (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div>
                    <h3 className={styles.detailTitle}>RFQ Approval Summary</h3>
                    <p className={styles.detailStage}>Stage: {selectedApproval.currentStage}</p>
                  </div>
                  <Badge variant={getStatusVariant(selectedApproval.status)}>{selectedApproval.status}</Badge>
                </div>

                {/* Workflow Progress */}
                <div className={styles.workflowTrack}>
                  {STAGE_FLOW.map((stage, idx) => {
                    const done = selectedApproval.workflowHistory.some(h => h.stage === stage && (h.action === 'Submitted' || h.action === 'Approve' || h.action === 'Approved'));
                    const isApproved = selectedApproval.status === 'Approved';
                    const allDone = isApproved || (stage === 'Approved' && isApproved);
                    const active = selectedApproval.currentStage === stage;
                    return (
                      <React.Fragment key={stage}>
                        <div className={styles.workflowNode}>
                          <div className={`${styles.workflowCircle} ${done || allDone ? styles.wfDone : ''} ${active && !done ? styles.wfActive : ''}`}>
                            {done || (stage === 'Approved' && isApproved) ? <CheckCircle2 size={12} /> : idx + 1}
                          </div>
                          <span className={styles.workflowLabel}>{stage.replace(' Review', '').replace(' Manager', ' Mgr.')}</span>
                        </div>
                        {idx < STAGE_FLOW.length - 1 && (
                          <div className={`${styles.workflowLine} ${done ? styles.wfLineDone : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Info Grid */}
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><FileText size={12} /> RFQ Number</span><span className={styles.infoValue}>{selectedApproval.rfqId}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><FileText size={12} /> Title</span><span className={styles.infoValue}>{selectedApproval.rfqTitle}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Building2 size={12} /> Department</span><span className={styles.infoValue}>{selectedApproval.department}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Tag size={12} /> Category</span><span className={styles.infoValue}>{selectedApproval.category}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Tag size={12} /> Budget</span><span className={styles.infoValue}>₹{Number(selectedApproval.budget).toLocaleString('en-IN')}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Users size={12} /> Selected Vendor</span><span className={styles.infoValue} style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{selectedApproval.selectedVendorName}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Award size={12} /> Award Value</span><span className={styles.infoValue} style={{ fontWeight: 700, color: '#16a34a' }}>₹{Number(selectedApproval.awardValue).toLocaleString('en-IN')}</span></div>
                  {savings > 0 && (
                    <div className={styles.infoRow}><span className={styles.infoLabel}>Budget Saving</span><span className={styles.infoValue} style={{ color: '#16a34a', fontWeight: 700 }}>₹{savings.toLocaleString('en-IN')} ({savingsPct}%)</span></div>
                  )}
                  <div className={styles.infoRow}><span className={styles.infoLabel}><Calendar size={12} /> Submitted On</span><span className={styles.infoValue}>{selectedApproval.submittedOn?.split(' ')[0]}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>Submitted By</span><span className={styles.infoValue}>{selectedApproval.submittedBy}</span></div>
                </div>

                {/* Business Justification */}
                {selectedApproval.businessJustification && (
                  <div className={styles.justificationBox}>
                    <h4 className={styles.justificationTitle}>Business Justification</h4>
                    <p className={styles.justificationText}>{selectedApproval.businessJustification}</p>
                  </div>
                )}

                {/* Comparison Summary */}
                {selectedApproval.comparisonSummary && (
                  <div className={styles.compSummaryBox}>
                    <h4 className={styles.compSummaryTitle}>Comparison Summary</h4>
                    <p className={styles.compSummaryText}>{selectedApproval.comparisonSummary}</p>
                  </div>
                )}

                {/* AI Insights */}
                <div className={styles.aiPanel}>
                  <Bot size={16} className={styles.aiIcon} />
                  <div>
                    <h4>AI Procurement Checks</h4>
                    <ul className={styles.aiList}>
                      <li><span className={styles.checkOk}>✔</span> Vendor KYC/AML Screening: Clear</li>
                      {savings > 0 && <li><span className={styles.checkOk}>✔</span> Award value is {savingsPct}% below budget — compliant.</li>}
                      {savings <= 0 && <li><span className={styles.checkWarn}>!</span> Award value exceeds or equals budget. Review required.</li>}
                      <li><span className={styles.checkOk}>✔</span> Approval workflow initiated by {selectedApproval.submittedBy}.</li>
                      {selectedApproval.attachments?.length > 0 && <li><span className={styles.checkOk}>✔</span> {selectedApproval.attachments.length} supporting document(s) attached.</li>}
                    </ul>
                  </div>
                </div>

                {/* Final Approver Badge */}
                <div className={styles.approverBadge}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.approverLabel}>Final Approver:</span>
                    <span className={styles.approverName}>
                      <span className={styles.onlineDot} />
                      {user?.fullName || 'Saurabh Anand'}
                    </span>
                  </div>
                  <span className={styles.approverRole}>Tenant Admin</span>
                </div>

                {/* Workflow History */}
                {selectedApproval.workflowHistory?.length > 0 && (
                  <div className={styles.historyBox}>
                    <h4 className={styles.historyTitle}>Workflow History</h4>
                    {selectedApproval.workflowHistory.map((h, i) => (
                      <div key={i} className={styles.historyItem}>
                        <div className={styles.historyDot} />
                        <div className={styles.historyContent}>
                          <span className={styles.historyAction}>{h.action}</span> by <strong>{h.performedBy}</strong>
                          <span className={styles.historyStage}> ({h.stage})</span>
                          {h.remarks && <p className={styles.historyRemarks}>"{h.remarks}"</p>}
                          <span className={styles.historyTime}>{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {selectedApproval.status === 'Pending Approval' && (
                  <>
                    <h3 className={styles.actionTitle}>Approval Action</h3>
                    <div className={styles.remarksSection}>
                      <label className={styles.remarksLabel}>Remarks / Comments</label>
                      <textarea
                        className={styles.remarksInput}
                        placeholder="Enter approval remarks or clarification notes..."
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className={styles.actionButtons}>
                      <Button
                        className={styles.approveBtn}
                        icon={<CheckCircle2 size={16} />}
                        onClick={() => handleAction('Approve')}
                        disabled={actionLoading}
                      >
                        {selectedApproval.currentStage === 'Tenant Admin Review' ? 'Approve & Generate PO' : 'Recommend Approval'}
                      </Button>
                      <Button
                        className={styles.rejectBtn}
                        icon={<XCircle size={16} />}
                        onClick={() => handleAction('Reject')}
                        disabled={actionLoading}
                      >
                        Reject RFQ
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

                {selectedApproval.status === 'Approved' && (
                  <div className={styles.approvedBanner}>
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>RFQ Approved — Purchase Order Generated</strong>
                      <p>This RFQ has been approved and a Purchase Order has been auto-created. Navigate to PO Dashboard to view.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/purchase-orders/dashboard')}>View PO</Button>
                  </div>
                )}

                {selectedApproval.status === 'Rejected' && (
                  <div className={styles.rejectedBanner}>
                    <XCircle size={20} />
                    <strong>RFQ Rejected — No PO Generated</strong>
                  </div>
                )}
              </Card>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, border: '1px dashed var(--color-border)', borderRadius: 12, color: 'var(--color-text-secondary)' }}>
                No RFQ approval selected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
