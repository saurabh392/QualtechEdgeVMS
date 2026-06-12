import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle,
  Search, Filter, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './ReviewsApprovals.module.css';
import { getReviews, submitApprovalAction } from '../../services/reviewService';
import type { Review, ReviewsSummary } from '../../services/reviewService';
import { toast } from 'sonner';

type RiskFilterKey = 'All' | 'Low' | 'Medium' | 'High' | 'Critical';
type StatusFilterKey = 'All' | 'Pending Review' | 'Ready For Approval' | 'Approved' | 'Rejected';

const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

const kycStatusVariant = (s: string): 'success' | 'warning' | 'info' | 'danger' | 'default' => {
  switch (s) {
    case 'Verified':    return 'success';
    case 'Pending':     return 'warning';
    case 'In Progress': return 'info';
    case 'Rejected':    return 'danger';
    default:            return 'default';
  }
};

const screeningStatusVariant = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  switch (s) {
    case 'Cleared':                return 'success';
    case 'Review Required':         return 'warning';
    case 'Investigation Required': return 'info';
    case 'High Risk':              return 'danger';
    default:                       return 'default';
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

export const ReviewsApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { hasActionPermission } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary>({
    pendingReviews: 0,
    inProgress: 0,
    readyForApproval: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilterKey>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const loadData = () => {
    getReviews()
      .then(data => {
        setReviews(data.reviews || []);
        setSummary(data.summary || {
          pendingReviews: 0,
          inProgress: 0,
          readyForApproval: 0,
          approved: 0,
          rejected: 0
        });
      })
      .catch(err => {
        console.error('Failed to load reviews data', err);
        toast.error('Failed to load work queue data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const list = new Set<string>();
    reviews.forEach(r => {
      if (r.category) list.add(r.category);
    });
    return Array.from(list);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Vendor name or ID search
      if (search) {
        const q = search.toLowerCase();
        const matchesName = (r.vendorName || '').toLowerCase().includes(q);
        const matchesId = (r.vendorId || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      // Risk Level filter
      if (riskFilter !== 'All' && r.riskLevel !== riskFilter) {
        return false;
      }

      // Approval Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending Review' && r.approvalStatus !== 'Pending Review' && r.approvalStatus !== 'Pending') {
          return false;
        }
        if (statusFilter !== 'Pending Review' && r.approvalStatus !== statusFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'All' && r.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [reviews, search, riskFilter, statusFilter, categoryFilter]);

  const handleAction = async (vendorId: string, action: 'Approve' | 'Reject', outcomeMsg: string) => {
    setActionInProgress(vendorId);
    try {
      const res = await submitApprovalAction(vendorId, action, `${outcomeMsg} from work queue.`);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit approval workflow action.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <p>Loading Reviews & Approvals Work Queue...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Reviews & Approvals</h1>
          <p className={styles.subtitle}>Unified workflow queue for KYC verification checks, risk compliance approvals, and final decisioning</p>
        </div>
      </header>

      {/* Dynamic KPI Cards */}
      <div className={styles.kpiGrid}>
        <Card
          className={`${styles.kpiCard} ${statusFilter === 'Pending Review' ? styles.kpiCardActive : ''}`}
          onClick={() => setStatusFilter('Pending Review')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Reviews</span>
            <div className={styles.kpiIcon} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}><Clock size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{summary.pendingReviews}</div>
          <div className={styles.kpiFooter}>Awaiting compliance audit</div>
        </Card>

        <Card
          className={`${styles.kpiCard} ${statusFilter === 'All' ? styles.kpiCardActive : ''}`}
          onClick={() => { setStatusFilter('All'); setRiskFilter('All'); setCategoryFilter('All'); setSearch(''); }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Reviews In Progress</span>
            <div className={styles.kpiIcon} style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><Users size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{summary.inProgress}</div>
          <div className={styles.kpiFooter}>Under active investigation</div>
        </Card>

        <Card
          className={`${styles.kpiCard} ${statusFilter === 'Ready For Approval' ? styles.kpiCardActive : ''}`}
          onClick={() => setStatusFilter('Ready For Approval')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Ready For Approval</span>
            <div className={styles.kpiIcon} style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{summary.readyForApproval}</div>
          <div className={styles.kpiFooter}>Verified, ready for sign-off</div>
        </Card>

        <Card
          className={`${styles.kpiCard} ${statusFilter === 'Approved' ? styles.kpiCardActive : ''}`}
          onClick={() => setStatusFilter('Approved')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Approved Vendors</span>
            <div className={styles.kpiIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><ThumbsUp size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{summary.approved}</div>
          <div className={styles.kpiFooterGreen}>Cleared onboarding check</div>
        </Card>

        <Card
          className={`${styles.kpiCard} ${statusFilter === 'Rejected' ? styles.kpiCardActive : ''}`}
          onClick={() => setStatusFilter('Rejected')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Rejected Vendors</span>
            <div className={styles.kpiIcon} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><XCircle size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{summary.rejected}</div>
          <div className={styles.kpiFooterRed}>Debarred or failed KYC</div>
        </Card>
      </div>

      {/* Main Reviews Queue Workspace */}
      <Card className={styles.tableCard}>
        {/* Toolbar with Filters */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vendor name or ID..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarRight}>
            {/* Risk Filter */}
            <select
              className={styles.filterSelect}
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as RiskFilterKey)}
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Status Filter */}
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilterKey)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Ready For Approval">Ready For Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <Button variant="ghost" icon={<Filter size={16} />}>Filters</Button>
          </div>
        </div>

        {/* Filters Active Pill Row */}
        {(riskFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || search !== '') && (
          <div className={styles.filterPillRow}>
            {search && (
              <span className={styles.filterPill}>
                Search: {search}
                <button className={styles.pillClear} onClick={() => setSearch('')}>×</button>
              </span>
            )}
            {riskFilter !== 'All' && (
              <span className={styles.filterPill}>
                Risk: {riskFilter}
                <button className={styles.pillClear} onClick={() => setRiskFilter('All')}>×</button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className={styles.filterPill}>
                Status: {statusFilter}
                <button className={styles.pillClear} onClick={() => setStatusFilter('All')}>×</button>
              </span>
            )}
            {categoryFilter !== 'All' && (
              <span className={styles.filterPill}>
                Category: {categoryFilter}
                <button className={styles.pillClear} onClick={() => setCategoryFilter('All')}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Table Workspace */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>KYC Status</th>
                <th>Screening Status</th>
                <th>Due Date</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(r => {
                const days = daysUntil(r.dueDate);
                const isActionDisabled = actionInProgress !== null;
                const showInlineButtons = r.approvalStatus !== 'Approved' && r.approvalStatus !== 'Rejected';

                return (
                  <tr key={r.reviewId}>
                    <td className={styles.idCell}>{r.reviewId}</td>
                    <td>
                      <div className={styles.vendorCell}>
                        <span className={styles.vendorName}>{r.vendorName}</span>
                        <span className={styles.vendorId}>{r.vendorId}</span>
                      </div>
                    </td>
                    <td>{r.category}</td>
                    <td>
                      <span style={getRiskScoreStyle(r.riskScore)}>
                        {r.riskScore}
                      </span>
                    </td>
                    <td>{getRiskBadge(r.riskLevel)}</td>
                    <td>
                      <Badge variant={kycStatusVariant(r.kycStatus)}>
                        {r.kycStatus}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={screeningStatusVariant(r.screeningStatus)}>
                        {r.screeningStatus}
                      </Badge>
                    </td>
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
                    <td>
                      <Badge variant={
                        r.approvalStatus === 'Approved' ? 'success' :
                        r.approvalStatus === 'Rejected' ? 'danger' :
                        r.approvalStatus === 'Ready For Approval' ? 'success' : 'warning'
                      }>
                        {r.approvalStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/kyc/approval/${r.vendorId}`)}
                          title="View detailed approval summary"
                        >
                          <Eye size={14} /> View Review
                        </button>
                        
                        {showInlineButtons && hasActionPermission('APPROVE_KYC') && (
                          <>
                            <button
                              className={styles.approveBtn}
                              disabled={isActionDisabled}
                              onClick={() => handleAction(r.vendorId, 'Approve', 'Quick approved')}
                              title="Directly Approve"
                            >
                              <ThumbsUp size={12} />
                            </button>
                            <button
                              className={styles.rejectBtn}
                              disabled={isActionDisabled}
                              onClick={() => handleAction(r.vendorId, 'Reject', 'Quick rejected')}
                              title="Directly Reject"
                            >
                              <ThumbsDown size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={10} className={styles.emptyRow}>No reviews match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing {filteredReviews.length} of {reviews.length} total reviews</span>
        </div>
      </Card>
    </div>
  );
};
