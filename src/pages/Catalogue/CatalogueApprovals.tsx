import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  HelpCircle, 
  User, 
  FileText,
  FileCheck
} from 'lucide-react';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import styles from './CatalogueApprovals.module.css';
import { 
  getPendingApprovals, 
  resolveApproval 
} from '../../services/itemMasterService';

interface ApprovalRequest {
  id: string;
  approvalId?: string;
  name: string;
  type: 'Item' | 'Service';
  category: string;
  preferredVendor: string;
  rate: string;
  makerName: string;
  submittedDate: string;
  moq: string;
  taxSlab: string;
  currentLevel: number;
  comments: string;
  timeline: {
    level: number;
    role: string;
    user: string;
    status: 'Approved' | 'In Progress' | 'Pending';
    date: string;
    remarks: string;
  }[];
}

export const CatalogueApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [remarksInput, setRemarksInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const pending = await getPendingApprovals();
      const mapped = pending.map((item: any) => {
        return {
          id: item.itemId,
          approvalId: item.approvalId || item.itemId,
          name: item.itemName,
          type: (item.isService || item.category === 'Professional Services' || item.category === 'Logistics' ? 'Service' : 'Item') as 'Service' | 'Item',
          category: item.category,
          preferredVendor: item.preferredVendor || 'N/A',
          rate: item.rate || '₹72,500',
          makerName: item.submittedBy || 'Rajesh Kumar (Sourcing Analyst)',
          submittedDate: item.submittedDate || '22 May 2026',
          moq: item.moq || '5 Nos',
          taxSlab: item.taxSlab || 'GST 18%',
          currentLevel: 2,
          comments: item.comments || 'SOC2 Audit Compliance or IT Hardware requirements cataloguing.',
          timeline: [
            {
              level: 1,
              role: 'Maker (Sourcing Specialist)',
              user: item.submittedBy || 'Rajesh Kumar',
              status: 'Approved' as 'Approved' | 'Pending' | 'In Progress',
              date: item.submittedDate ? `${item.submittedDate} 10:15 AM` : '22 May 2026 10:15 AM',
              remarks: 'Details and technical specifications sheets verified.'
            },
            {
              level: 2,
              role: 'Checker L1 (Procurement Manager)',
              user: 'Neha Sharma (You)',
              status: 'In Progress' as 'Approved' | 'Pending' | 'In Progress',
              date: 'Awaiting Your Review',
              remarks: ''
            },
            {
              level: 3,
              role: 'Checker L2 (Finance Audit Officer)',
              user: 'Vikram Malhotra',
              status: 'Pending' as 'Approved' | 'Pending' | 'In Progress',
              date: '--',
              remarks: 'Pending L1 sign-off.'
            }
          ]
        };
      });
      setRequests(mapped);
      if (mapped.length > 0) {
        setSelectedReq(mapped[0]);
      } else {
        setSelectedReq(null);
      }
    } catch (err) {
      console.error('Error fetching approvals queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (actionType: 'approve' | 'clarify' | 'reject') => {
    if (!selectedReq) return;

    let actionName: 'Approve' | 'Reject' | 'Send Back' = 'Approve';
    let actionText = '';
    if (actionType === 'approve') {
      actionName = 'Approve';
      actionText = 'Approved & Escalated to Level 3 Checker (Vikram Malhotra)';
    } else if (actionType === 'clarify') {
      actionName = 'Send Back';
      actionText = 'Request sent back to Maker for clarification';
    } else {
      actionName = 'Reject';
      actionText = 'Request Rejected';
    }

    try {
      const res = await resolveApproval(
        selectedReq.approvalId || selectedReq.id, 
        actionName, 
        remarksInput, 
        'Neha Sharma'
      );
      if (res.success) {
        alert(`${selectedReq.name} (${selectedReq.id}) action completed: ${actionText}.\nRemarks: "${remarksInput || 'None'}"`);
        setRemarksInput('');
        await fetchApprovals();
      } else {
        alert('Failed to resolve approval.');
      }
    } catch (err) {
      console.error('Error resolving approval:', err);
      alert('An error occurred while resolving this approval request.');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.preferredVendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="CATALOGUE MAKER-CHECKER WORKFLOW" 
        subtitle="Review, approve, reject, or request clarification on newly added items, services, rate configurations, and sourcing vendor mappings"
        actions={
          <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/catalogue/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <div className={styles.layout}>
        {/* Left Side: Pending Queue */}
        <div className={styles.leftPanel}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Pending Queue</span>
              <Badge variant="warning">{filteredRequests.length} Awaiting</Badge>
            </div>
            <input 
              type="text" 
              className={styles.searchBox} 
              placeholder="Search workflow requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.itemList}>
              {loading ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  Loading approvals...
                </div>
              ) : filteredRequests.map(req => {
                const isActive = selectedReq && req.id === selectedReq.id;
                return (
                  <div 
                    key={req.id} 
                    className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''}`}
                    onClick={() => {
                      setSelectedReq(req);
                      setRemarksInput('');
                    }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{req.name}</span>
                      <span className={styles.itemMeta}>{req.id} • {req.type}</span>
                    </div>
                    <Badge variant="warning">Level {req.currentLevel}</Badge>
                  </div>
                );
              })}
              {!loading && filteredRequests.length === 0 && (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  No pending approvals found in your queue!
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Approval console details */}
        {selectedReq ? (
          <div className={styles.mainPanel}>
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <span>Approval Details: {selectedReq.name} ({selectedReq.id})</span>
                <Badge variant="info">Level {selectedReq.currentLevel} Checker Stage</Badge>
              </div>

              {/* General details grid */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Catalogue Category</span>
                  <span className={styles.detailValue}>{selectedReq.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Proposed Reference Rate</span>
                  <span className={styles.detailValue}>{selectedReq.rate}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Preferred Vendor</span>
                  <span className={styles.detailValue}>{selectedReq.preferredVendor}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tax Standard / GST</span>
                  <span className={styles.detailValue}>{selectedReq.taxSlab}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Minimum Order Qty</span>
                  <span className={styles.detailValue}>{selectedReq.moq}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Submitted By</span>
                  <span className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> {selectedReq.makerName}
                  </span>
                </div>
              </div>

              {/* Maker justification */}
              <div style={{ marginBottom: '20px' }}>
                <span className={styles.detailLabel}>Maker Justification Note</span>
                <div style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#0b1f5f', fontStyle: 'italic', marginTop: '6px' }}>
                  "{selectedReq.comments}"
                </div>
              </div>

              {/* Maker attachments checklist */}
              <div style={{ marginBottom: '24px' }}>
                <span className={styles.detailLabel}>Attached Sourcing Documentation</span>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', backgroundColor: 'var(--color-surface)', cursor: 'pointer' }} onClick={() => alert("Previewing TechnicalSpec.pdf")}>
                    <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>Technical_Specs.pdf</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', backgroundColor: 'var(--color-surface)', cursor: 'pointer' }} onClick={() => alert("Previewing VendorQuote.pdf")}>
                    <FileCheck size={14} style={{ color: 'var(--color-success)' }} />
                    <span>Vendor_Quote_Sheet.pdf</span>
                  </div>
                </div>
              </div>

              {/* Multi-Level Workflow Timeline */}
              <div className={styles.sectionTitle}>Maker-Checker Levels Sign-Off Status</div>
              <div className={styles.timeline}>
                {selectedReq.timeline.map((step, idx) => {
                  let stepClass = styles.timelineStepPending;
                  let statusText = <span className={styles.textMuted}>Pending Stage</span>;

                  if (step.status === 'Approved') {
                    stepClass = styles.timelineStepCompleted;
                    statusText = <span className={styles.textSuccess}>Approved ✓ ({step.date})</span>;
                  } else if (step.status === 'In Progress') {
                    stepClass = styles.timelineStepActive;
                    statusText = <span className={styles.textWarning}>In Review (Awaiting Action)</span>;
                  }

                  return (
                    <div key={idx} className={`${styles.timelineStep} ${stepClass}`}>
                      <div className={styles.timelineIndicator}>
                        {step.status === 'Approved' ? '✓' : step.level}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineRole}>{step.role}</div>
                        <div className={styles.timelineUser}>{step.user}</div>
                        <div className={styles.timelineStatus}>{statusText}</div>
                        {step.remarks && (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                            <strong>Remark:</strong> {step.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive approval actions panel */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '20px' }}>
                <span className={styles.detailLabel}>Approval / Clarification Remarks *</span>
                <textarea 
                  className={styles.textareaField} 
                  style={{ width: '100%', height: '80px', marginTop: '8px', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="Enter evaluation notes, justification review comments, or clarification requests..."
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                />
              </div>

              <div className={styles.actionRow}>
                <Button 
                  variant="outline" 
                  icon={<HelpCircle size={16} />}
                  onClick={() => handleAction('clarify')}
                >
                  Send Back for Clarification
                </Button>
                <Button 
                  variant="danger" 
                  icon={<X size={16} />}
                  onClick={() => handleAction('reject')}
                >
                  Reject Item
                </Button>
                <Button 
                  variant="primary" 
                  icon={<Check size={16} />}
                  onClick={() => handleAction('approve')}
                >
                  Approve & Forward
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <h3>No Approval Selected</h3>
              <p>Select a pending item from the left queue to evaluate.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
