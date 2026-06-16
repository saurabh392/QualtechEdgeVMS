import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, XCircle, Send, ShieldAlert, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { 
  getPendingApprovals, 
  getContractById, 
  approveContract, 
  rejectContract 
} from '../../services/contractService';
import type { 
  ApprovalQueueItem, 
  ContractRecord 
} from '../../services/contractService';
import styles from './ContractApprovals.module.css';
import { useAuth } from '../../context/AuthContext';

export const ContractApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lists and selected item states
  const [approvalsQueue, setApprovalsQueue] = useState<ApprovalQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);

  // Form states
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch pending queue on load
  const loadApprovalsQueue = async (autoSelectId?: string | null) => {
    try {
      setListLoading(true);
      const queue = await getPendingApprovals();
      setApprovalsQueue(queue);

      if (queue.length > 0) {
        // Auto-select item if specified, or default to first item
        const selectItem = autoSelectId ? queue.find(q => q.approvalId === autoSelectId) || queue[0] : queue[0];
        setSelectedApprovalId(selectItem.approvalId);
        loadContractDetails(selectItem.contractId);
      } else {
        setSelectedApprovalId(null);
        setSelectedContract(null);
      }
    } catch (err) {
      console.error('Failed to load approvals queue:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadApprovalsQueue();
  }, []);

  const loadContractDetails = async (contractId: string) => {
    setDetailLoading(true);
    try {
      const contract = await getContractById(contractId);
      setSelectedContract(contract);
      setRemarks('');
    } catch (err) {
      console.error('Failed to load contract details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectApproval = (item: ApprovalQueueItem) => {
    setSelectedApprovalId(item.approvalId);
    loadContractDetails(item.contractId);
  };

  // Action handlers
  const handleResolution = async (action: 'Approve' | 'Reject' | 'Send Back') => {
    if (!selectedContract) return;

    if ((action === 'Reject' || action === 'Send Back') && !remarks.trim()) {
      toast.warning('Please enter remarks for this rejection or revision request.');
      return;
    }

    setActionLoading(true);
    try {
      let res;
      if (action === 'Approve') {
        res = await approveContract(selectedContract.contractId!, remarks, 'Saurabh Anand');
      } else {
        res = await rejectContract(
          selectedContract.contractId!, 
          remarks, 
          'Saurabh Anand', 
          action === 'Send Back' ? 'Send Back' : 'Reject'
        );
      }

      if (res.success) {
        toast.success(`Contract ${selectedContract.contractId} ${action === 'Approve' ? 'approved' : action === 'Send Back' ? 'sent back' : 'rejected'} successfully.`);
        // Refresh queue
        await loadApprovalsQueue();
      }
    } catch (err) {
      toast.error('Error resolving contract: ' + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Local UI search filtering
  const filteredQueue = approvalsQueue.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.contractId.toLowerCase().includes(q) ||
      item.vendorName.toLowerCase().includes(q) ||
      item.currentStage.toLowerCase().includes(q)
    );
  });

  const getWorkflowStepLabel = (step?: number) => {
    if (!step) return 'Step 1 of 4 (Procurement Review)';
    if (step === 1) return 'Step 1 of 4 (Procurement Review)';
    if (step === 2) return 'Step 2 of 4 (Compliance Review)';
    if (step === 3) return 'Step 3 of 4 (Legal Review)';
    if (step === 4) return 'Step 4 of 4 (Final Approval)';
    return 'Approved';
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Contract Approvals</h1>
          <p className={styles.subtitle}>Review and sign off on new contracts and amendments.</p>
        </div>
      </header>

      <div className={styles.splitLayout}>
        {/* Left Pane - List */}
        <Card className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3>Pending Reviews</h3>
            <Badge variant="info">{approvalsQueue.length}</Badge>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search contracts..." 
              className={styles.searchInput} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.listContainer}>
            {listLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Loading approvals queue...
              </div>
            ) : filteredQueue.length > 0 ? (
              filteredQueue.map(item => (
                <div 
                  key={item.approvalId} 
                  className={`${styles.listItem} ${item.approvalId === selectedApprovalId ? styles.listActive : ''}`}
                  onClick={() => handleSelectApproval(item)}
                >
                  <div className={styles.itemContent}>
                    <span className={styles.itemName}>{item.vendorName}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemId}>{item.contractId} • {item.currentStage}</span>
                    </div>
                  </div>
                  {item.approvalId === selectedApprovalId && <ChevronRight size={18} color="#1d4ed8" />}
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No pending approval reviews.
              </div>
            )}
          </div>
          <div className={styles.pagination}>
            <span>Showing {filteredQueue.length} items</span>
          </div>
        </Card>

        {/* Right Pane - Detail */}
        <div className={styles.detailPane}>
          {detailLoading ? (
            <Card className={styles.detailCard}>
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                Fetching contract details...
              </div>
            </Card>
          ) : selectedContract ? (
            <Card className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>Contract Summary</h3>
                <Badge variant="warning">{selectedContract.status}</Badge>
              </div>
              
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Contract ID</span>
                  <span className={styles.infoValue}>{selectedContract.contractId}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Vendor Name</span>
                  <span className={styles.infoValue}>{selectedContract.vendor?.vendorName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Contract Type</span>
                  <span className={styles.infoValue}>{selectedContract.contractType}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Contract Value</span>
                  <span className={styles.infoValue}>
                    {selectedContract.commercialTerms?.currency} {selectedContract.commercialTerms?.contractValue?.toLocaleString()}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Approval Stage</span>
                  <span className={styles.infoValue}>
                    {getWorkflowStepLabel(selectedContract.approvalWorkflow?.workflowStep)}
                  </span>
                </div>
              </div>

              {selectedContract.riskInsights && (
                <div className={styles.aiRiskPanel}>
                  <div className={styles.aiRiskHeader}>
                    <ShieldAlert size={18} />
                    <h4>AI Risk Highlights ({selectedContract.riskInsights.portfolioRisk} Risk)</h4>
                  </div>
                  <ul className={styles.aiRiskList}>
                    {selectedContract.riskInsights.aiAlerts && selectedContract.riskInsights.aiAlerts.length > 0 ? (
                      selectedContract.riskInsights.aiAlerts.map((alert, idx) => (
                        <li key={idx}>
                          <span className={styles.riskHigh}>AI Flag:</span> {alert}
                        </li>
                      ))
                    ) : (
                      <li>No critical risks flags raised by AI copilot.</li>
                    )}
                  </ul>
                </div>
              )}

              {selectedContract.uploadedDocuments && selectedContract.uploadedDocuments.length > 0 ? (
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Uploaded Document File
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <FileText size={16} color="#64748b" />
                    <span style={{ fontSize: '12px', fontWeight: '500', flex: 1 }}>{selectedContract.uploadedDocuments[0].fileName}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedContract.uploadedDocuments[0].filePath;
                        link.setAttribute('download', selectedContract.uploadedDocuments[0].fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download File
                    </Button>
                  </div>
                </div>
              ) : (
                <button className={styles.viewFullLink} onClick={() => navigate(`/contracts/dashboard`)}>
                  Go to Contract Repository &rarr;
                </button>
              )}

              {/* Final Approver Badge */}
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
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

              <h3 className={styles.actionTitle}>
                {user?.role === 'ADMIN' ? 'Review Action (Final Approver)' : 'Review Action (Maker/Reviewer)'}
              </h3>

              <div className={styles.actionButtons}>
                {user?.role === 'ADMIN' ? (
                  <>
                    <Button 
                      className={styles.approveBtn} 
                      icon={<CheckCircle2 size={16} />}
                      onClick={() => handleResolution('Approve')}
                      disabled={actionLoading}
                    >
                      Approve Contract
                    </Button>
                    <Button 
                      className={styles.rejectBtn} 
                      icon={<XCircle size={16} />}
                      onClick={() => handleResolution('Reject')}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                    <Button 
                      className={styles.sendBackBtn} 
                      icon={<Send size={16} />}
                      onClick={() => handleResolution('Send Back')}
                      disabled={actionLoading}
                    >
                      Send Back for Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className={styles.approveBtn} 
                      icon={<CheckCircle2 size={16} />}
                      onClick={() => {
                        toast.success("Contract recommendation submitted to Tenant Admin successfully.");
                        setRemarks('');
                        loadApprovalsQueue();
                      }}
                    >
                      Recommend Approval
                    </Button>
                    <Button 
                      className={styles.sendBackBtn} 
                      icon={<Send size={16} />}
                      onClick={() => {
                        toast.success("Contract sent back for revisions.");
                        setRemarks('');
                        loadApprovalsQueue();
                      }}
                    >
                      Send Back for Changes
                    </Button>
                  </>
                )}
              </div>

              <div className={styles.remarksSection}>
                <label className={styles.remarksLabel}>Legal Notes / Remarks</label>
                <textarea 
                  className={styles.remarksInput} 
                  placeholder="Enter remarks required for rejection or revision..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>

              {/* Workflow Trail */}
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '100%'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 600, color: '#334155', textTransform: 'uppercase' }}>Workflow Trail</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Created By:</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Rahul Verma (Vendor Onboarding Officer)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Reviewed By:</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Priya Sharma (Procurement Manager)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Approved By:</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>Saurabh Anand (Tenant Admin)</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className={styles.detailCard}>
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                Please select a pending contract request from the left pane to view details and review.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
