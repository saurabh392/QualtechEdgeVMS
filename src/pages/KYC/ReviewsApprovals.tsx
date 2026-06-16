import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, ThumbsUp
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './ReviewsApprovals.module.css';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';

type StatusFilterKey = 'All' | 'Pending' | 'Conditional' | 'Approved' | 'Rejected';

const riskVariant = (r: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (r) {
    case 'Low':      return 'success';
    case 'Medium':   return 'warning';
    case 'High':     return 'danger';
    case 'Critical': return 'danger';
    default:         return 'default';
  }
};

const getRiskScoreStyle = (score: number) => {
  if (score === 0) return { backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 30) return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 60) return { backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  if (score <= 80) return { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
  return { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, fontSize: '0.75rem' };
};

export const ReviewsApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vendors, kycData, submitDecision, loading } = useVendors();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('All');

  // Expanded row ID
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  // Decision Form state
  const [decision, setDecision] = useState<string>('Approve');
  const [authority, setAuthority] = useState<string>('Procurement Manager');
  const [remarks, setRemarks] = useState<string>('Vendor KYC verified and cleared. Approved and empanelled.');

  // Aliases for compatibility with existing layout code
  const kycStore = kycData;
  const masterVendors = vendors;



  const getVendorDetail = (vendorId: string) => {
    const master = masterVendors.find(v => v.vendorId === vendorId);
    return {
      pan: master?.basicDetails?.panNumber || 'N/A',
      gstin: master?.basicDetails?.gstin || 'N/A',
      docCount: master?.documents?.length || 0
    };
  };

  // Filter reviews
  const filteredApprovals = useMemo(() => {
    if (!kycStore) return [];
    
    return kycStore.approvals.filter((app: any) => {
      const vendor = kycStore.vendors.find((v: any) => v.vendorId === app.vendorId);
      const name = vendor ? vendor.vendorName : '';
      
      // Search filter (Vendor Name or ID)
      if (search) {
        const q = search.toLowerCase();
        const matchesName = name.toLowerCase().includes(q);
        const matchesId = app.vendorId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending') {
          return app.approvalStatus === 'Pending';
        }
        if (statusFilter === 'Conditional') {
          return app.approvalStatus === 'Conditional' || app.approvalStatus === 'Conditional Approval';
        }
        if (statusFilter === 'Approved') {
          return app.approvalStatus === 'Approved';
        }
        if (statusFilter === 'Rejected') {
          return app.approvalStatus === 'Rejected';
        }
      }

      return true;
    });
  }, [kycStore, search, statusFilter]);

  const handleDecisionChange = (val: string) => {
    setDecision(val);
    if (val === 'Approve') {
      setRemarks('Vendor KYC verified and cleared. Approved and empanelled.');
    } else if (val === 'Conditional Approval') {
      setRemarks('Vendor KYC approved conditionally subject to annual re-verification.');
    } else if (val === 'Hold') {
      setRemarks('Vendor KYC held pending clarification on adverse media audit trail.');
    } else if (val === 'Reject') {
      setRemarks('Vendor KYC checks failed. Debarred from onboarding.');
    }
  };

  const toggleExpandRow = (vendorId: string) => {
    if (expandedVendorId === vendorId) {
      setExpandedVendorId(null);
    } else {
      setExpandedVendorId(vendorId);
      // Pre-fill initial form
      setDecision('Approve');
      setAuthority('Procurement Manager');
      setRemarks('Vendor KYC verified and cleared. Approved and empanelled.');
    }
  };

  const handleSubmitDecision = async (actionType: 'Approve' | 'Reject') => {
    if (!expandedVendorId || !kycStore) return;

    const vendor = kycStore.vendors.find((v: any) => v.vendorId === expandedVendorId);
    if (!vendor) return;

    try {
      if (actionType === 'Approve') {
        await submitDecision(expandedVendorId, decision as any, remarks, authority);
        toast.success(`${vendor.vendorName} approved and empanelled successfully.`);
      } else {
        await submitDecision(expandedVendorId, 'Reject', remarks, authority);
        toast.success(`${vendor.vendorName} rejected.`);
      }
    } catch (e) {
      console.error("Failed to submit decision:", e);
      toast.error("An error occurred while submitting the decision.");
    }

    setExpandedVendorId(null);
  };

  if (loading || !kycStore) {
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
          <p className={styles.breadcrumbs}>Home / Vendor Onboarding & KYC / Reviews & Approvals</p>
          <p className={styles.subtitle}>Unified workflow queue for KYC verification checks, risk compliance approvals, and final decisioning</p>
        </div>
      </header>

      {/* Main Reviews Queue Workspace */}
      <Card className={styles.tableCard}>
        {/* Toolbar with Filters */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Vendor Name or ID..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarRight}>
            {/* Status Filter */}
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Status:</span>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilterKey)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Conditional">Conditional</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Workspace */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Risk Score</th>
                <th>Risk Tier</th>
                <th>Screening Result</th>
                <th>Submitted By</th>
                <th>Submitted On</th>
                <th>Decision</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((app: any) => {
                const vendor = kycStore.vendors.find((v: any) => v.vendorId === app.vendorId) || {
                  vendorName: 'Unknown Vendor',
                  riskScore: 0,
                  riskLevel: 'Low',
                  category: 'IT Services'
                };

                const screening = kycStore.screeningResults.find((s: any) => s.vendorId === app.vendorId);
                let screeningText = 'Not yet screened';
                if (screening && screening.completed) {
                  const clearCount = screening.checks.filter((c: any) => c.status === 'Clear').length;
                  const advisoryCount = screening.checks.filter((c: any) => c.status === 'Advisory').length;
                  if (advisoryCount === 0) {
                    screeningText = 'All clear';
                  } else {
                    screeningText = `${clearCount}/8 Clear + ${advisoryCount} advisory`;
                  }
                }

                const vendorDetail = getVendorDetail(app.vendorId);
                const isExpanded = expandedVendorId === app.vendorId;
                const isPending = app.approvalStatus === 'Pending';

                return (
                  <React.Fragment key={app.vendorId}>
                    <tr>
                      <td className={styles.idCell}>{app.vendorId}</td>
                      <td>
                        <div className={styles.vendorCell}>
                          <span className={styles.vendorName}>{vendor.vendorName}</span>
                        </div>
                      </td>
                      <td>
                        <span style={getRiskScoreStyle(vendor.riskScore)}>
                          {vendor.riskScore > 0 ? vendor.riskScore : '——'}
                        </span>
                      </td>
                      <td>
                        <Badge variant={riskVariant(vendor.riskLevel)}>
                          {vendor.riskLevel}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={
                          screeningText === 'All clear' ? 'success' : 
                          screeningText === 'Not yet screened' ? 'default' : 'warning'
                        }>
                          {screeningText}
                        </Badge>
                      </td>
                      <td>{app.submittedBy}</td>
                      <td>{app.submittedOn}</td>
                      <td>
                        <Badge variant={
                          app.approvalStatus === 'Approved' ? 'success' :
                          app.approvalStatus === 'Rejected' ? 'danger' :
                          app.approvalStatus === 'Conditional' || app.approvalStatus === 'Conditional Approval' ? 'warning' : 'info'
                        }>
                          {app.approvalStatus === 'Pending' ? 'Pending Review' : app.approvalStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          {isPending ? (
                            <button
                              className={styles.reviewBtn}
                              onClick={() => toggleExpandRow(app.vendorId)}
                            >
                              <ThumbsUp size={12} /> Review & Decide
                            </button>
                          ) : (
                            <button
                              className={styles.viewBtn}
                              onClick={() => navigate(`/kyc/screening?vendor=${app.vendorId}`)}
                            >
                              <Eye size={12} /> View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline expanded Row */}
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={9}>
                          <div className={styles.expandedContainer}>
                            <div className={styles.summaryCard}>
                              <h4 className={styles.cardSectionTitle}>Vendor Summary</h4>
                              <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Vendor Name</span>
                                  <span className={styles.summaryValue}>{vendor.vendorName}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Category</span>
                                  <span className={styles.summaryValue}>{vendor.category || 'IT Services'}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>PAN</span>
                                  <span className={styles.summaryValue}>{vendorDetail.pan}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>GSTIN</span>
                                  <span className={styles.summaryValue}>{vendorDetail.gstin}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Risk Score</span>
                                  <span className={styles.summaryValue}>
                                    <span style={getRiskScoreStyle(vendor.riskScore)}>
                                      {vendor.riskScore > 0 ? vendor.riskScore : '——'}
                                    </span>
                                  </span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Risk Tier</span>
                                  <span className={styles.summaryValue}>
                                    <Badge variant={riskVariant(vendor.riskLevel)}>
                                      {vendor.riskLevel}
                                    </Badge>
                                  </span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Screening Result</span>
                                  <span className={styles.summaryValue}>
                                    <Badge variant={
                                      screeningText === 'All clear' ? 'success' : 
                                      screeningText === 'Not yet screened' ? 'default' : 'warning'
                                    }>
                                      {screeningText}
                                    </Badge>
                                  </span>
                                </div>
                                <div className={styles.summaryItem}>
                                  <span className={styles.summaryLabel}>Document Count</span>
                                  <span className={styles.summaryValue}>{vendorDetail.docCount} Documents</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                                <Button 
                                  variant="outline" 
                                  onClick={() => navigate(`/kyc/screening?vendor=${app.vendorId}`)}
                                >
                                  View Screening
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => navigate(`/vendors/add?id=${app.vendorId}&view=true`)}
                                >
                                  View Vendor
                                </Button>
                              </div>
                            </div>

                            <div className={styles.decisionCard}>
                              {/* Final Approver Badge */}
                              <div style={{
                                marginBottom: '16px',
                                padding: '12px 16px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
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

                              <h4 className={styles.cardSectionTitle}>
                                {user?.role === 'ADMIN' ? 'Decision Form (Final Approver)' : 'Recommendation Form (Maker/Reviewer)'}
                              </h4>
                              
                              <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Decision</label>
                                  {user?.role === 'ADMIN' ? (
                                    <select
                                      className={styles.formSelect}
                                      value={decision}
                                      onChange={(e) => handleDecisionChange(e.target.value)}
                                    >
                                      <option value="Approve">Approve</option>
                                      <option value="Conditional Approval">Conditional Approval</option>
                                      <option value="Hold">Hold</option>
                                      <option value="Reject">Reject</option>
                                    </select>
                                  ) : (
                                    <select
                                      className={styles.formSelect}
                                      value={decision === 'Approve' ? 'Recommend Approve' : decision}
                                      onChange={(e) => setDecision(e.target.value)}
                                    >
                                      <option value="Recommend Approve">Recommend Approval</option>
                                      <option value="Hold">Hold / Clarification Required</option>
                                    </select>
                                  )}
                                </div>

                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Approving Authority</label>
                                  <select
                                    className={styles.formSelect}
                                    value={user?.role === 'ADMIN' ? authority : 'Admin'}
                                    onChange={(e) => setAuthority(e.target.value)}
                                    disabled={user?.role !== 'ADMIN'}
                                  >
                                    <option value="Procurement Manager">Procurement Manager</option>
                                    <option value="Compliance Officer">Compliance Officer</option>
                                    <option value="Admin">Admin</option>
                                  </select>
                                </div>
                              </div>

                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Remarks</label>
                                <textarea
                                  className={styles.formTextarea}
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div className={styles.btnGroup}>
                                {user?.role === 'ADMIN' ? (
                                  <>
                                    <Button
                                      onClick={() => handleSubmitDecision('Approve')}
                                      variant="primary"
                                      style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
                                    >
                                      Approve & Empanel
                                    </Button>
                                    <Button
                                      onClick={() => handleSubmitDecision('Reject')}
                                      variant="outline"
                                      style={{ color: '#dc2626', borderColor: '#dc2626' }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => {
                                        toast.success("Recommendation submitted to Tenant Admin (Saurabh Anand) successfully.");
                                        setExpandedVendorId(null);
                                      }}
                                      variant="primary"
                                      style={{ backgroundColor: '#185FA5', borderColor: '#185FA5', color: '#fff' }}
                                    >
                                      Recommend Approval
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        toast.success("Clarification request sent to maker.");
                                        setExpandedVendorId(null);
                                      }}
                                      variant="outline"
                                    >
                                      Request Clarification
                                    </Button>
                                  </>
                                )}
                              </div>

                              {/* Workflow Trail */}
                              <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
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
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredApprovals.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.emptyRow}>No reviews match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing {filteredApprovals.length} of {kycStore.approvals.length} total approvals</span>
        </div>
      </Card>
    </div>
  );
};
