import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, XCircle, Send, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './VendorApprovals.module.css';

export const VendorApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasActionPermission } = useAuth();
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all pending vendors
  const fetchPendingVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/vendors');
      // Filter for vendors pending approval
      const pending = res.data.filter((v: any) => v.status === 'Pending Approval');
      setVendors(pending);
      if (pending.length > 0) {
        setSelectedVendor(pending[0]);
      } else {
        setSelectedVendor(null);
      }
    } catch (err) {
      console.error('Error fetching pending vendors:', err);
      toast.error('Failed to load pending approvals from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const handleSelectVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setRemarks('');
  };

  const handleAction = async (actionType: 'approve' | 'reject' | 'sendback') => {
    if (!selectedVendor) return;

    if ((actionType === 'reject' || actionType === 'sendback') && !remarks.trim()) {
      toast.warning(`Remarks are required to execute a ${actionType === 'reject' ? 'Reject' : 'Send Back'} action.`);
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        remarks: remarks.trim(),
        performedBy: 'Saurabh Anand' // Mocked log-in user from UI header
      };

      await axios.post(`/api/vendors/${selectedVendor.vendorId}/${actionType}`, payload);
      toast.success(`Vendor onboarding ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'sent back'} successfully.`);
      setRemarks('');
      await fetchPendingVendors();
    } catch (err) {
      console.error(`Error performing action ${actionType}:`, err);
      toast.error('Failed to submit approval workflow action.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter vendors list based on search box input
  const filteredVendors = vendors.filter(vendor => 
    (vendor.vendorId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vendor.basicDetails?.legalName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Approval Screen (Checker)</h1>
          <p className={styles.subtitle}>Review and approve pending vendor registrations.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <span style={{ marginLeft: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading pending approvals...</span>
        </div>
      ) : (
        <div className={styles.splitLayout}>
          {/* Left Pane - List of pending approvals */}
          <Card className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3>Pending Onboardings</h3>
              <Badge variant="info">{vendors.length}</Badge>
            </div>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search vendor name, code..." 
                className={styles.searchInput} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={styles.listContainer}>
              {filteredVendors.map(item => (
                <div 
                  key={item.vendorId} 
                  className={`${styles.listItem} ${selectedVendor?.vendorId === item.vendorId ? styles.listActive : ''}`}
                  onClick={() => handleSelectVendor(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.itemContent}>
                    <span className={styles.itemId}>{item.vendorId}</span>
                    <span className={styles.itemName}>{item.basicDetails?.legalName}</span>
                    <span className={styles.itemDate}>
                      Submitted on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  {selectedVendor?.vendorId === item.vendorId && <ChevronRight size={18} color="#1d4ed8" />}
                </div>
              ))}
              {filteredVendors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>
                  No pending onboarding requests found.
                </div>
              )}
            </div>
            <div className={styles.pagination}>
              <span>Showing 1 to {filteredVendors.length} of {vendors.length} entries</span>
            </div>
          </Card>

          {/* Right Pane - Selected Vendor Details */}
          <div className={styles.detailPane}>
            {selectedVendor ? (
              <Card className={styles.detailCard}>
                <h3 className={styles.detailTitle}>Vendor Onboarding Review</h3>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vendor Name</span>
                    <span className={styles.infoValue}>{selectedVendor.basicDetails?.legalName || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>PAN</span>
                    <span className={styles.infoValue}><code>{selectedVendor.basicDetails?.panNumber || '-'}</code></span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>GSTIN</span>
                    <span className={styles.infoValue}><code>{selectedVendor.basicDetails?.gstin || '-'}</code></span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Category</span>
                    <span className={styles.infoValue}>{selectedVendor.businessDetails?.vendorCategory || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Business Type</span>
                    <span className={styles.infoValue}>{selectedVendor.basicDetails?.businessType || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Annual Turnover</span>
                    <span className={styles.infoValue}>{formatCurrency(selectedVendor.businessDetails?.annualTurnover || 0)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Critical Status</span>
                    <span className={styles.infoValue}>
                      <Badge variant={selectedVendor.businessDetails?.criticalVendor ? 'danger' : 'default'}>
                        {selectedVendor.businessDetails?.criticalVendor ? 'High Criticality' : 'Normal'}
                      </Badge>
                    </span>
                  </div>
                </div>

                <button 
                  className={styles.viewAllLink}
                  onClick={() => navigate(`/vendors/add?id=${selectedVendor.vendorId}&view=true`)}
                >
                  View All Registration Details &gt;
                </button>

                <div className={styles.remarksSection}>
                  <label className={styles.remarksLabel}>Remarks (Required for Reject / Send Back)</label>
                  <textarea 
                    className={styles.remarksInput} 
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={actionLoading}
                  ></textarea>
                  <span className={styles.remarksHint}>Comments will be visible to maker in the vendor audit history.</span>
                </div>
                
                {hasActionPermission('APPROVE_VENDOR') && (
                  <div className={styles.actionButtons}>
                    <Button 
                      className={styles.approveBtn} 
                      icon={actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                    >
                      Approve
                    </Button>
                    <Button 
                      className={styles.rejectBtn} 
                      icon={actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                    <Button 
                      className={styles.sendBackBtn} 
                      icon={actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      onClick={() => handleAction('sendback')}
                      disabled={actionLoading}
                    >
                      Send Back
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', minHeight: '300px', color: '#64748b' }}>
                <Info size={36} style={{ marginBottom: '12px', color: '#94a3b8' }} />
                <p style={{ fontSize: '14px', fontWeight: '500' }}>No Onboarding Pending</p>
                <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '4px' }}>All maker-checker vendor registration requests have been cleared.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
