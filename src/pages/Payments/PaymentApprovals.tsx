import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, Bot, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './PaymentApprovals.module.css';
import { useAuth } from '../../context/AuthContext';

const mockBatches = [
  { 
    id: 'PAY-2026-0091', 
    date: '19 May 2026', 
    value: 2006000, 
    invoices: 2, 
    mode: 'RTGS (HDFC)', 
    risk: 'Low',
    items: [
      { id: 'INV-2026-9908', vendor: 'ABC Infotech Pvt Ltd', value: 1475000, type: 'MSME' },
      { id: 'INV-2026-9907', vendor: 'Secure Facilities Ltd', value: 531000, type: 'Non-MSME' },
    ]
  },
  { 
    id: 'PAY-2026-0092', 
    date: '19 May 2026', 
    value: 401200, 
    invoices: 1, 
    mode: 'NEFT (ICICI)', 
    risk: 'Medium',
    items: [
      { id: 'INV-2026-9904', vendor: 'Tech Solutions', value: 401200, type: 'Non-MSME' },
    ]
  }
];

export const PaymentApprovals: React.FC = () => {
  const { user } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState(mockBatches[0].id);
  const [remarks, setRemarks] = useState('');
  const [batches, setBatches] = useState(mockBatches);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  const handleAction = (statusText: string) => {
    toast.success(`Batch ${selectedBatchId} ${statusText} successfully.`);
    setBatches(prev => prev.filter(b => b.id !== selectedBatchId));
    setRemarks('');
    const remaining = batches.filter(b => b.id !== selectedBatchId);
    if (remaining.length > 0) {
      setSelectedBatchId(remaining[0].id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Payment Approvals (Checker View)</h1>
          <p className={styles.subtitle}>Execute dual-authorization release workflows for corporate treasury payouts</p>
        </div>
      </header>

      {batches.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
          <h3>All Payment Batches Authorized</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No pending payouts awaiting validation.</p>
        </Card>
      ) : (
        <div className={styles.splitLayout}>
          {/* Left Pane - Pending Batch Queue */}
          <Card className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3>Pending Payouts ({batches.length})</h3>
            </div>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input type="text" placeholder="Search batch reference..." className={styles.searchInput} />
            </div>
            <div className={styles.listContainer}>
              {batches.map(batch => (
                <div
                  key={batch.id}
                  className={`${styles.listItem} ${selectedBatchId === batch.id ? styles.listActive : ''}`}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemId}>{batch.id}</span>
                      <span className={styles.itemDate}>{batch.date}</span>
                    </div>
                    <span className={styles.itemName}>₹{batch.value.toLocaleString('en-IN')} ({batch.invoices} Invoices)</span>
                    <span className={styles.itemValue}>Mode: {batch.mode}</span>
                  </div>
                  <ChevronRight size={16} className={styles.chevron} />
                </div>
              ))}
            </div>
          </Card>

          {/* Right Pane - Batch Detail View */}
          <div className={styles.detailPane}>
            {selectedBatch && (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className={styles.detailTitle}>Batch Authorization: {selectedBatch.id}</h2>
                    <Badge variant={selectedBatch.risk === 'Low' ? 'success' : 'warning'}>
                      AI Risk: {selectedBatch.risk}
                    </Badge>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Disbursement Mode</span>
                    <span className={styles.infoValue}>{selectedBatch.mode}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Payout Value</span>
                    <span className={styles.infoValue} style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{selectedBatch.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Scheduled Date</span>
                    <span className={styles.infoValue}>{selectedBatch.date}</span>
                  </div>
                </div>

                {/* Items list */}
                <h4 className={styles.sectionHeading}><Scale size={16} /> Batch Invoices</h4>
                <div className={styles.matchingPanel}>
                  <div className={styles.matchGrid}>
                    <div className={styles.matchHeaderRow}>
                      <span>Invoice ID</span>
                      <span>Vendor</span>
                      <span>Value</span>
                      <span>Type</span>
                    </div>
                    {selectedBatch.items.map(item => (
                      <div key={item.id} className={styles.matchRow}>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.id}</span>
                        <span style={{ fontWeight: 600 }}>{item.vendor}</span>
                        <span>₹{item.value.toLocaleString('en-IN')}</span>
                        <span className={item.type === 'MSME' ? styles.matchBadgeWarning : ''}>{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Audits */}
                <div className={styles.aiRiskPanel}>
                  <Bot size={20} className={styles.aiIcon} />
                  <div>
                    <h4>AI Pre-payout Risk Check</h4>
                    <ul className={styles.aiRiskList}>
                      <li>
                        <span className={styles.checkSuccess}>✔ Beneficiary Nodes verified</span>: Active accounts confirmed at host banking portals.
                      </li>
                      <li>
                        <span className={styles.checkSuccess}>✔ MSME Compliance validated</span>: Payment scheduled within statutory 45 days.
                      </li>
                      <li>
                        <span className={styles.checkSuccess}>✔ Deductions check passed</span>: TDS withheld accurately.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
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
                  width: '100%',
                  marginTop: '20px'
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

                <h4 className={styles.actionTitle}>
                  {user?.role === 'ADMIN' ? 'Checker Authorization Actions (Final Approver)' : 'Reviewer Actions (Maker/Reviewer)'}
                </h4>

                <div className={styles.actionButtons}>
                  {user?.role === 'ADMIN' ? (
                    <>
                      <Button className={styles.approveBtn} onClick={() => handleAction('Authorized & Released')}>
                        Approve & Release Funds
                      </Button>
                      <Button className={styles.sendBackBtn} onClick={() => handleAction('Returned to Maker')}>
                        Send Back to Maker
                      </Button>
                      <Button className={styles.rejectBtn} onClick={() => handleAction('Rejected')}>
                        Reject Payout Batch
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        className={styles.approveBtn} 
                        onClick={() => {
                          toast.success("Payout recommendation submitted to Tenant Admin successfully.");
                          setRemarks('');
                          setBatches(prev => prev.filter(b => b.id !== selectedBatchId));
                          const remaining = batches.filter(b => b.id !== selectedBatchId);
                          if (remaining.length > 0) {
                            setSelectedBatchId(remaining[0].id);
                          }
                        }}
                      >
                        Recommend Payment
                      </Button>
                      <Button 
                        className={styles.sendBackBtn} 
                        onClick={() => {
                          toast.success("Payment batch returned to maker.");
                          setRemarks('');
                          setBatches(prev => prev.filter(b => b.id !== selectedBatchId));
                          const remaining = batches.filter(b => b.id !== selectedBatchId);
                          if (remaining.length > 0) {
                            setSelectedBatchId(remaining[0].id);
                          }
                        }}
                      >
                        Send Back
                      </Button>
                    </>
                  )}
                </div>

                <div className={styles.remarksSection}>
                  <label className={styles.remarksLabel}>Audit Log & Remarks (Required for Return/Rejection)</label>
                  <textarea
                    className={styles.remarksInput}
                    placeholder="Enter audit validation comments..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
