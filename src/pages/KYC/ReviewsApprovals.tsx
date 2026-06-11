import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ChevronRight, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './ReviewsApprovals.module.css';
import { getReviewsAndApprovals } from '../../services/reviewService';
import type { Review, Approval, CompletedReview } from '../../services/reviewService';

type TabKey = 'Schedule' | 'Approvals' | 'Completed';

const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const priorityVariant = (p: string): 'danger' | 'warning' | 'info' | 'default' => {
  if (p === 'Critical') return 'danger';
  if (p === 'High')     return 'warning';
  if (p === 'Medium')   return 'info';
  return 'default';
};

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'info' | 'default' => {
  if (s === 'Scheduled')  return 'info';
  if (s === 'In Review')  return 'warning';
  if (s === 'Overdue')    return 'danger';
  if (s === 'Completed')  return 'success';
  return 'default';
};

const workflowSteps = ['procurement', 'compliance', 'legal', 'final'] as const;
const stepLabel: Record<typeof workflowSteps[number], string> = {
  procurement: 'Procurement', compliance: 'Compliance', legal: 'Legal', final: 'Final',
};

export const ReviewsApprovals: React.FC = () => {
  const { hasActionPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('Schedule');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [completed, setCompleted] = useState<CompletedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviewsAndApprovals()
      .then(data => {
        setReviews(data.reviews || []);
        setApprovals(data.pendingApprovals || []);
        setCompleted(data.completedReviews || []);
      })
      .catch(err => {
        console.error('Failed to load reviews and approvals data', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading Reviews & Approvals...</p>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'Schedule',  label: 'Review Schedule',   count: reviews.length   },
    { key: 'Approvals', label: 'Pending Approvals',  count: approvals.length },
    { key: 'Completed', label: 'Completed Reviews',  count: completed.length },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Reviews & Approvals</h1>
          <p className={styles.subtitle}>Re-KYC scheduling, vendor approval workflows, and completed review history</p>
        </div>
        <div className={styles.headerActions}>
          {hasActionPermission('INITIATE_RE_KYC') && (
            <Button icon={<Calendar size={16} />} variant="outline">Schedule Review</Button>
          )}
        </div>
      </header>

      {/* Summary KPIs */}
      <div className={styles.kpiRow}>
        <Card
          className={`${styles.kpiCard} ${activeTab === 'Schedule' && !showOverdueOnly ? styles.kpiCardActive : ''}`}
          onClick={() => { setActiveTab('Schedule'); setShowOverdueOnly(false); }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Scheduled Reviews</span>
            <div className={styles.kpiIcon} style={{ background: '#eff6ff', color: '#1d4ed8' }}><Calendar size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{reviews.length}</div>
          <div className={styles.kpiFooter}>Upcoming due dates</div>
        </Card>
        <Card
          className={`${styles.kpiCard} ${activeTab === 'Approvals' ? styles.kpiCardActive : ''}`}
          onClick={() => { setActiveTab('Approvals'); setShowOverdueOnly(false); }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Approvals</span>
            <div className={styles.kpiIcon} style={{ background: '#fffbeb', color: '#f59e0b' }}><Clock size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{approvals.length}</div>
          <div className={styles.kpiFooter}>Awaiting decision</div>
        </Card>
        <Card
          className={`${styles.kpiCard} ${activeTab === 'Schedule' && showOverdueOnly ? styles.kpiCardActive : ''}`}
          onClick={() => { setActiveTab('Schedule'); setShowOverdueOnly(true); }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Overdue Reviews</span>
            <div className={styles.kpiIcon} style={{ background: '#fee2e2', color: '#dc2626' }}><AlertTriangle size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{reviews.filter(r => r.status === 'Overdue').length}</div>
          <div className={styles.kpiFooterRed}>Needs immediate action</div>
        </Card>
        <Card
          className={`${styles.kpiCard} ${activeTab === 'Completed' ? styles.kpiCardActive : ''}`}
          onClick={() => { setActiveTab('Completed'); setShowOverdueOnly(false); }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Completed Reviews</span>
            <div className={styles.kpiIcon} style={{ background: '#dcfce7', color: '#16a34a' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{completed.length}</div>
          <div className={styles.kpiFooterGreen}>This quarter</div>
        </Card>
      </div>

      {/* Tab Panel */}
      <Card className={styles.tabCard}>
        <div className={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab(t.key); setShowOverdueOnly(false); }}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Active Filter Pill */}
        {activeTab === 'Schedule' && showOverdueOnly && (
          <div className={styles.filterPillRow}>
            <span className={styles.filterPill}>
              Overdue Reviews Only
              <button className={styles.pillClear} onClick={() => setShowOverdueOnly(false)}>×</button>
            </span>
          </div>
        )}

        {/* ── Review Schedule Tab ── */}
        {activeTab === 'Schedule' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Vendor</th>
                  <th>Review Type</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.filter(r => !showOverdueOnly || r.status === 'Overdue').map(r => {
                  const days = daysUntil(r.dueDate);
                  return (
                    <tr key={r.reviewId}>
                      <td className={styles.idCell}>{r.reviewId}</td>
                      <td>
                        <div className={styles.vendorCell}>
                          <span className={styles.vendorName}>{r.vendorName}</span>
                          <span className={styles.vendorId}>{r.vendorId}</span>
                        </div>
                      </td>
                      <td>{r.reviewType}</td>
                      <td>
                        <div className={styles.dueDateCell}>
                          <span>{r.dueDate}</span>
                          {days <= 30 && (
                            <span className={days < 0 ? styles.overdueTag : styles.dueTag}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{r.assignedTo}</td>
                      <td><Badge variant={priorityVariant(r.priority)}>{r.priority}</Badge></td>
                      <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                      <td>
                        <div className={styles.actionsCell}>
                          {hasActionPermission('RUN_SCREENING') && (
                            <button className={styles.actionBtn}>Start Review</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pending Approvals Tab ── */}
        {activeTab === 'Approvals' && (
          <div className={styles.approvalGrid}>
            {approvals.map(a => (
              <Card key={a.approvalId} className={styles.approvalCard}>
                <div className={styles.approvalHeader}>
                  <div>
                    <div className={styles.approvalVendorName}>{a.vendorName}</div>
                    <div className={styles.approvalMeta}>{a.category} · {a.vendorId}</div>
                  </div>
                  <Badge variant={a.riskLevel === 'Critical' ? 'danger' : a.riskLevel === 'Medium' ? 'warning' : 'success'}>
                    {a.riskLevel} Risk
                  </Badge>
                </div>

                <div className={styles.approvalInfo}>
                  <span>Submitted by <strong>{a.submittedBy}</strong> on {a.submittedOn}</span>
                  <span className={styles.stageTag}>{a.stage}</span>
                </div>

                {/* Workflow stepper */}
                <div className={styles.workflowRow}>
                  {workflowSteps.map((step, i) => (
                    <React.Fragment key={step}>
                      <div className={styles.workflowStep}>
                        <div className={`${styles.workflowDot} ${
                          a.workflow[step] === 'Approved' ? styles.dotApproved :
                          a.workflow[step] === 'Pending'  ? styles.dotPending  : styles.dotRejected
                        }`}>
                          {a.workflow[step] === 'Approved' ? <CheckCircle2 size={12} /> : (i + 1)}
                        </div>
                        <span className={styles.workflowLabel}>{stepLabel[step]}</span>
                      </div>
                      {i < workflowSteps.length - 1 && (
                        <ChevronRight size={14} className={styles.workflowArrow} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Actions */}
                {hasActionPermission('APPROVE_KYC') && (
                  <div className={styles.approvalActions}>
                    <button className={styles.approveBtn}><ThumbsUp size={14} /> Approve</button>
                    <button className={styles.rejectBtn}><ThumbsDown size={14} /> Reject</button>
                    <button className={styles.sendBackBtn}><RotateCcw size={14} /> Send Back</button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* ── Completed Reviews Tab ── */}
        {activeTab === 'Completed' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Vendor</th>
                  <th>Review Type</th>
                  <th>Completed Date</th>
                  <th>Reviewed By</th>
                  <th>Outcome</th>
                  <th>Next Review</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(c => (
                  <tr key={c.reviewId}>
                    <td className={styles.idCell}>{c.reviewId}</td>
                    <td>
                      <div className={styles.vendorCell}>
                        <span className={styles.vendorName}>{c.vendorName}</span>
                        <span className={styles.vendorId}>{c.vendorId}</span>
                      </div>
                    </td>
                    <td>{c.reviewType}</td>
                    <td>{c.completedDate}</td>
                    <td>{c.reviewedBy}</td>
                    <td><Badge variant="success">{c.outcome}</Badge></td>
                    <td>{c.nextReviewDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
