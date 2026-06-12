import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Shield, CheckCircle2, Clock, XCircle,
  AlertTriangle, MessageSquare, ThumbsUp, ThumbsDown,
  RotateCcw, ShieldAlert, Info
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { getApprovalDetail, submitApprovalAction } from '../../services/reviewService';
import type { ApprovalDetailData } from '../../services/reviewService';
import styles from './ApprovalDetail.module.css';
import { toast } from 'sonner';

const kycStatusVariant = (s: string): 'success' | 'warning' | 'info' | 'danger' | 'default' => {
  switch (s) {
    case 'Verified':    return 'success';
    case 'Pending':     return 'warning';
    case 'In Progress': return 'info';
    case 'Rejected':    return 'danger';
    default:            return 'default';
  }
};

const riskVariant = (r: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (r) {
    case 'Low':      return 'success';
    case 'Medium':   return 'warning';
    case 'High':     return 'danger';
    case 'Critical': return 'danger';
    default:         return 'default';
  }
};

const checkStatusIcon = (status: string) => {
  switch (status) {
    case 'Verified':
    case 'Approved':
    case 'Clear':
    case 'No Findings':
    case 'Low Risk':
      return <CheckCircle2 size={16} className={styles.iconGreen} />;
    case 'Pending':
    case 'Pending Verification':
    case 'Review Required':
    case 'Medium Risk':
      return <Clock size={16} className={styles.iconAmber} />;
    case 'Rejected':
    case 'High Risk':
    case 'Investigation Required':
    case 'Blacklisted':
    case 'Match Found':
      return <XCircle size={16} className={styles.iconRed} />;
    default:
      return <AlertTriangle size={16} className={styles.iconGray} />;
  }
};

const getRiskScoreStyle = (score: number) => {
  if (score <= 30) return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 60) return { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 80) return { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  return { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
};

const getRiskBadge = (r: string) => {
  if (r === 'Critical') {
    return (
      <Badge 
        variant="danger" 
        style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', borderColor: '#991b1b' }}
      >
        {r}
      </Badge>
    );
  }
  return <Badge variant={riskVariant(r)}>{r}</Badge>;
};

export const ApprovalDetail: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<ApprovalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadDetail = () => {
    if (!vendorId) return;
    setLoading(true);
    getApprovalDetail(vendorId)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error('Failed to load approval detail data', err);
        toast.error('Failed to load approval details.');
        navigate('/kyc/reviews');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetail();
  }, [vendorId]);

  const handleWorkflowAction = async (action: 'Approve' | 'Reject' | 'SendBack') => {
    if (!vendorId) return;
    if (!commentText.trim()) {
      toast.warning('Please enter reviewer comments before submitting decision.');
      return;
    }
    
    setSubmittingAction(true);
    try {
      const res = await submitApprovalAction(vendorId, action, commentText.trim());
      if (res.success) {
        toast.success(res.message);
        setCommentText('');
        loadDetail();
      } else {
        toast.error(res.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to process approval action.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading Approval Summary Details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <ShieldAlert size={48} style={{ color: '#dc2626' }} />
        <p style={{ color: '#64748b' }}>Vendor Profile not found.</p>
        <Button onClick={() => navigate('/kyc/reviews')}>Back to Work Queue</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Navigation Back Action */}
      <button className={styles.backBtn} onClick={() => navigate('/kyc/reviews')}>
        <ChevronLeft size={16} /> Back to Work Queue
      </button>

      {/* Header Panel */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.vendorTitleRow}>
            <h1 className={styles.vendorName}>{data.vendorName}</h1>
            <span className={styles.vendorCode}>{data.vendorCode}</span>
          </div>
          <p className={styles.categorySub}>{data.category} · Review ID: <strong>{data.reviewId}</strong></p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerBadgeGroup}>
            <div className={styles.badgeLabelPair}>
              <span className={styles.badgeLabel}>KYC Status</span>
              <Badge variant={kycStatusVariant(data.kycStatus)}>{data.kycStatus}</Badge>
            </div>
            <div className={styles.badgeLabelPair}>
              <span className={styles.badgeLabel}>Risk Score</span>
              <span style={getRiskScoreStyle(data.riskScore)}>{data.riskScore}</span>
            </div>
            <div className={styles.badgeLabelPair}>
              <span className={styles.badgeLabel}>Risk Level</span>
              {getRiskBadge(data.riskLevel)}
            </div>
          </div>
        </div>
      </header>

      {/* 2-Column Dashboard Grid */}
      <div className={styles.dashboardGrid}>
        
        {/* Left Hand Column (KYC and AI Screening summaries) */}
        <div className={styles.gridColumn}>
          
          {/* Section 1: KYC Summary */}
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Section 1: KYC Verification Checklist</h2>
            <div className={styles.kycChecklist}>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.panStatus)}
                  <span>PAN Verification</span>
                </div>
                <Badge variant={data.kycSummary.panStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.panStatus}
                </Badge>
              </div>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.gstStatus)}
                  <span>GST Verification</span>
                </div>
                <Badge variant={data.kycSummary.gstStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.gstStatus}
                </Badge>
              </div>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.cinStatus)}
                  <span>CIN Verification</span>
                </div>
                <Badge variant={data.kycSummary.cinStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.cinStatus}
                </Badge>
              </div>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.bankStatus)}
                  <span>Bank Account Verification</span>
                </div>
                <Badge variant={data.kycSummary.bankStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.bankStatus}
                </Badge>
              </div>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.rocStatus)}
                  <span>ROC Filing Checklist</span>
                </div>
                <Badge variant={data.kycSummary.rocStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.rocStatus}
                </Badge>
              </div>
              <div className={styles.checkRow}>
                <div className={styles.checkName}>
                  {checkStatusIcon(data.kycSummary.itrStatus)}
                  <span>ITR Tax Return Status</span>
                </div>
                <Badge variant={data.kycSummary.itrStatus === 'Verified' ? 'success' : 'warning'}>
                  {data.kycSummary.itrStatus}
                </Badge>
              </div>
            </div>
            <div className={styles.sectionFooter}>
              <span>Overall Checklist Status:</span>
              <Badge variant={kycStatusVariant(data.kycSummary.status)}>{data.kycSummary.status}</Badge>
            </div>
          </Card>

          {/* Section 2: AI Screening Summary */}
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Section 2: AI Screening & Watchlists</h2>
            <div className={styles.watchlistGrid}>
              {[
                { label: 'Sanctions Check', ...data.screeningSummary.sanctions },
                { label: 'PEP Screening', ...data.screeningSummary.pep },
                { label: 'Adverse Media Scan', ...data.screeningSummary.adverseMedia },
                { label: 'Debarred/Blacklist', ...data.screeningSummary.blacklist },
                { label: 'Shell Company Probe', ...data.screeningSummary.shellCompany }
              ].map((check, idx) => (
                <div key={idx} className={styles.watchlistCard}>
                  <div className={styles.watchlistHeader}>
                    <span className={styles.watchlistLabel}>{check.label}</span>
                    <Badge variant={
                      check.status === 'Clear' || check.status === 'No Findings' || check.status === 'Low Risk' ? 'success' :
                      check.status === 'Match Found' || check.status === 'Blacklisted' || check.status === 'High Risk' ? 'danger' : 'warning'
                    }>
                      {check.status}
                    </Badge>
                  </div>
                  <div className={styles.watchlistBody}>
                    <span className={styles.watchlistScore}>Score: {check.score}</span>
                    <p className={styles.watchlistRemarks}>{check.remarks}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Hand Column (Document stats, risk radar, and workflow triggers) */}
        <div className={styles.gridColumn}>
          
          {/* Section 3: Document Summary */}
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Section 3: Documents Registry Summary</h2>
            <div className={styles.docSummaryGrid}>
              <div className={styles.docMetricCard}>
                <span className={styles.docMetricValue} style={{ color: '#1d4ed8' }}>{data.documentSummary.total}</span>
                <span className={styles.docMetricLabel}>Total Files</span>
              </div>
              <div className={styles.docMetricCard}>
                <span className={styles.docMetricValue} style={{ color: '#10b981' }}>{data.documentSummary.verified}</span>
                <span className={styles.docMetricLabel}>Verified</span>
              </div>
              <div className={styles.docMetricCard}>
                <span className={styles.docMetricValue} style={{ color: '#f59e0b' }}>{data.documentSummary.pending}</span>
                <span className={styles.docMetricLabel}>Pending</span>
              </div>
              <div className={styles.docMetricCard}>
                <span className={styles.docMetricValue} style={{ color: '#dc2626' }}>{data.documentSummary.rejected}</span>
                <span className={styles.docMetricLabel}>Rejected</span>
              </div>
            </div>
          </Card>

          {/* Section 4: Risk Assessment */}
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Section 4: Composite Risk Assessment</h2>
            <div className={styles.riskHeaderBlock}>
              <Shield size={20} className={styles.riskShieldIcon} />
              <div>
                <span className={styles.riskCompositeScore}>Composite Risk Score: <strong>{data.riskAssessment.score}</strong></span>
                <p className={styles.riskLevelText}>Assessed Level: <strong>{data.riskAssessment.level} Risk</strong></p>
              </div>
            </div>
            
            <div className={styles.riskBreakdown}>
              <span className={styles.breakdownTitle}>Risk Vectors Breakdown</span>
              {[
                { label: 'Business Risk', value: data.riskAssessment.breakdown.business, color: '#f59e0b' },
                { label: 'Financial Risk', value: data.riskAssessment.breakdown.financial, color: '#3b82f6' },
                { label: 'Compliance Risk', value: data.riskAssessment.breakdown.compliance, color: '#ef4444' },
                { label: 'Operational Risk', value: data.riskAssessment.breakdown.operational, color: '#10b981' }
              ].map((item, idx) => (
                <div key={idx} className={styles.breakdownRow}>
                  <div className={styles.breakdownLabelGroup}>
                    <span className={styles.breakdownLabel}>{item.label}</span>
                    <span className={styles.breakdownVal}>{item.value}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 5: Comments Audit Log */}
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Section 5: Reviewer Comments History</h2>
            <div className={styles.commentsList}>
              {data.comments && data.comments.length > 0 ? (
                data.comments.map((c, i) => (
                  <div key={i} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{c.author}</span>
                      <span className={styles.commentTime}>{c.timestamp || 'Recent Check'}</span>
                    </div>
                    <p className={styles.commentText}>{c.text}</p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyComments}>
                  <MessageSquare size={20} className={styles.emptyCommentsIcon} />
                  <p>No comments logged yet. Add initial compliance notes below.</p>
                </div>
              )}
            </div>
            
            {/* Notes Input Box */}
            <div className={styles.commentForm}>
              <label className={styles.commentInputLabel}>Compliance Notes / Reviewer Remarks</label>
              <textarea
                className={styles.commentTextArea}
                placeholder="Type internal remarks, clarification points, or approval justifications here..."
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
            </div>
          </Card>

          {/* Section 6: Workflow Decisions */}
          <Card className={styles.sectionCard} style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
            <h2 className={styles.sectionTitle} style={{ color: '#1e3a8a' }}>Section 6: Final Compliance Decision</h2>
            <div className={styles.decisionInfo}>
              <Info size={16} className={styles.infoIcon} />
              <p>Submitting a decision will instantly update the vendor registry status, recalculate statistics, and log audits.</p>
            </div>
            <div className={styles.decisionActions}>
              <button
                className={styles.approveActionBtn}
                disabled={submittingAction}
                onClick={() => handleWorkflowAction('Approve')}
              >
                <ThumbsUp size={16} /> Approve Vendor
              </button>
              <button
                className={styles.rejectActionBtn}
                disabled={submittingAction}
                onClick={() => handleWorkflowAction('Reject')}
              >
                <ThumbsDown size={16} /> Reject Vendor
              </button>
              <button
                className={styles.sendBackActionBtn}
                disabled={submittingAction}
                onClick={() => handleWorkflowAction('SendBack')}
              >
                <RotateCcw size={16} /> Send Back
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
