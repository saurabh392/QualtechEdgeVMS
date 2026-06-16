import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, ChevronRight, CheckCircle2, XCircle, Send, Bot, Scale, Loader2 } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './InvoiceApprovals.module.css';
import { toast } from 'sonner';

interface Invoice {
  invoiceId: string;
  vendorName: string;
  vendorGSTIN: string;
  poRef: string;
  invoiceDate: string;
  totalAmount: number;
  tdsSection: string;
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  status: string;
  stage: string;
  threeWayMatch: string;
  gstMatch: string;
  riskLevel: string;
  vendorType: string;
  remarks: string;
}

export const InvoiceApprovals: React.FC = () => {
  const { hasActionPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/invoices?status=Approved')
      .then(r => {
        const data: Invoice[] = r.data;
        setInvoices(data);
        const paramId = searchParams.get('id');
        if (paramId && data.find(i => i.invoiceId === paramId)) {
          setSelectedId(paramId);
        } else if (data.length > 0) {
          setSelectedId(data[0].invoiceId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  const selectedInvoice = invoices.find(i => i.invoiceId === selectedId);

  const handleApprove = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`/api/invoices/${selectedId}/approve`, { approvedBy: 'Finance Manager', remarks });
      toast.success(`Invoice ${selectedId} approved for payment.`);
      const remaining = invoices.filter(i => i.invoiceId !== selectedId);
      setInvoices(remaining);
      setRemarks('');
      if (remaining.length > 0) {
        setSelectedId(remaining[0].invoiceId);
      } else {
        navigate('/payments/processing');
      }
    } catch {
      toast.error('Failed to approve invoice.');
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`/api/invoices/${selectedId}/reject`, { remarks });
      toast.success(`Invoice ${selectedId} rejected.`);
      const remaining = invoices.filter(i => i.invoiceId !== selectedId);
      setInvoices(remaining);
      setRemarks('');
      if (remaining.length > 0) setSelectedId(remaining[0].invoiceId);
    } catch {
      toast.error('Failed to reject invoice.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Invoice Approvals (Checker View)</h1>
          <p className={styles.subtitle}>Audit compliance checks and authorize payments</p>
        </div>
      </header>

      <div className={styles.splitLayout}>
        {/* Left Pane - List */}
        <Card className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3>Verification Queue</h3>
            <Badge variant="info">{invoices.length}</Badge>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search invoices..." className={styles.searchInput} />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div className={styles.listContainer}>
              {invoices.map(item => (
                <div
                  key={item.invoiceId}
                  className={`${styles.listItem} ${selectedId === item.invoiceId ? styles.listActive : ''}`}
                  onClick={() => setSelectedId(item.invoiceId)}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemId}>{item.invoiceId}</span>
                      <span className={styles.itemDate}>{item.invoiceDate}</span>
                    </div>
                    <span className={styles.itemName}>{item.vendorName}</span>
                    <span className={styles.itemValue}>₹{item.totalAmount.toLocaleString('en-IN')} • Ref: {item.poRef}</span>
                  </div>
                  {selectedId === item.invoiceId && <ChevronRight size={18} color="#1d4ed8" />}
                </div>
              ))}
              {invoices.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px' }}>
                  No invoices pending approval.
                </p>
              )}
            </div>
          )}
          <div className={styles.pagination}>
            <span>Showing 1 to {invoices.length} of {invoices.length}</span>
          </div>
        </Card>

        {/* Right Pane - Detail */}
        <div className={styles.detailPane}>
          <Card className={styles.detailCard}>
<<<<<<< HEAD
            {selectedInvoice ? (
              <>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>Invoice Audit Summary</h3>
=======
            <div className={styles.detailHeader}>
              <h3 className={styles.detailTitle}>Invoice Audit Summary</h3>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Invoice ID</span>
                <span className={styles.infoValue}>INV-2026-9908</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Vendor</span>
                <span className={styles.infoValue}>ABC Infotech Pvt Ltd (GSTIN: 27AAAAA1111A1Z1)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>PO Reference</span>
                <span className={styles.infoValue}>PO-2026-000789 (Approved)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>TDS Component</span>
                <span className={styles.infoValue}>Section 194J (withheld: ₹1,25,000 / 10%)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Invoice Total</span>
                <span className={styles.infoValue}>₹14,75,000 (inclusive of 18% GST)</span>
              </div>
            </div>

            {/* 3-Way Match Check panel */}
            <div className={styles.matchingPanel}>
              <h4 className={styles.sectionHeading}><Scale size={16} /> 3-Way Matching Verification</h4>
              <div className={styles.matchGrid}>
                <div className={styles.matchHeaderRow}>
                  <span>Item / Category</span>
                  <span>Invoice</span>
                  <span>PO Reference</span>
                  <span>GRN (Receipt)</span>
                  <span>Status</span>
                </div>
                
                <div className={styles.matchRow}>
                  <span>IT Consulting</span>
                  <span>₹12,50,000</span>
                  <span>₹12,50,000</span>
                  <span>₹12,50,000</span>
                  <span className={styles.matchBadgeSuccess}>Matched</span>
                </div>

                <div className={styles.matchRow}>
                  <span>Quantity</span>
                  <span>1 Unit</span>
                  <span>1 Unit</span>
                  <span>1 Unit</span>
                  <span className={styles.matchBadgeSuccess}>Matched</span>
                </div>
              </div>
            </div>

            {/* AI Fraud & Risk Panel */}
            <div className={styles.aiRiskPanel}>
              <Bot size={18} className={styles.aiIcon} />
              <div>
                <h4>AI AP Auditor Checks</h4>
                <ul className={styles.aiRiskList}>
                  <li><span className={styles.checkSuccess}>✔</span> No duplicates detected in the active ledger pool.</li>
                  <li><span className={styles.checkSuccess}>✔</span> GSTIN matches active registration details.</li>
                  <li><span className={styles.checkSuccess}>✔</span> Invoice date is within PO validity limits.</li>
                  <li><span className={styles.checkInfo}>i</span> Early settlement eligibility: 2% cash rebate opportunity.</li>
                </ul>
              </div>
            </div>

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

            {hasActionPermission('APPROVE_INVOICE') ? (
              <>
                <h3 className={styles.actionTitle}>Authorized AP Action (Final Approver)</h3>
                <div className={styles.actionButtons}>
                  <Button className={styles.approveBtn} icon={<CheckCircle2 size={16} />} onClick={() => { toast.success("Invoice approved & payment scheduled."); setRemarks(''); }}>Approve & Release Payment</Button>
                  <Button className={styles.rejectBtn} icon={<XCircle size={16} />} onClick={() => { toast.success("Invoice rejected."); setRemarks(''); }}>Reject Invoice</Button>
                  <Button className={styles.sendBackBtn} icon={<Send size={16} />} onClick={() => { toast.success("Invoice sent back."); setRemarks(''); }}>Send Back to Vendor Portal</Button>
>>>>>>> dc1643ef147d94ed445cab2a657fdf4ea2a3bd84
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Invoice ID</span>
                    <span className={styles.infoValue}>{selectedInvoice.invoiceId}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vendor</span>
                    <span className={styles.infoValue}>{selectedInvoice.vendorName} (GSTIN: {selectedInvoice.vendorGSTIN})</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>PO Reference</span>
                    <span className={styles.infoValue}>{selectedInvoice.poRef} (Approved)</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>TDS Component</span>
                    <span className={styles.infoValue}>
                      Section {selectedInvoice.tdsSection} (withheld: ₹{selectedInvoice.tdsAmount.toLocaleString('en-IN')} / {selectedInvoice.tdsRate}%)
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Invoice Total</span>
                    <span className={styles.infoValue}>₹{selectedInvoice.totalAmount.toLocaleString('en-IN')} (Net Payable: ₹{selectedInvoice.netPayable.toLocaleString('en-IN')})</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vendor Type</span>
                    <span className={styles.infoValue}>{selectedInvoice.vendorType}</span>
                  </div>
                </div>

                {/* 3-Way Match */}
                <div className={styles.matchingPanel}>
                  <h4 className={styles.sectionHeading}><Scale size={16} /> 3-Way Matching Verification</h4>
                  <div className={styles.matchGrid}>
                    <div className={styles.matchHeaderRow}>
                      <span>Check</span>
                      <span>Result</span>
                    </div>
                    <div className={styles.matchRow}>
                      <span>3-Way Match</span>
                      <span className={selectedInvoice.threeWayMatch === 'Matched' ? styles.matchBadgeSuccess : styles.matchBadgeDanger}>
                        {selectedInvoice.threeWayMatch}
                      </span>
                    </div>
                    <div className={styles.matchRow}>
                      <span>GST Match</span>
                      <span className={selectedInvoice.gstMatch === 'Matched' ? styles.matchBadgeSuccess : styles.matchBadgeDanger}>
                        {selectedInvoice.gstMatch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Fraud & Risk Panel */}
                <div className={styles.aiRiskPanel}>
                  <Bot size={18} className={styles.aiIcon} />
                  <div>
                    <h4>AI AP Auditor Checks</h4>
                    <ul className={styles.aiRiskList}>
                      <li><span className={styles.checkSuccess}>✔</span> No duplicates detected in the active ledger pool.</li>
                      <li><span className={styles.checkSuccess}>✔</span> GSTIN matches active registration details.</li>
                      <li><span className={styles.checkSuccess}>✔</span> Invoice date is within PO validity limits.</li>
                      <li><span className={styles.checkInfo}>i</span> Early settlement eligibility: 2% cash rebate opportunity.</li>
                    </ul>
                  </div>
                </div>

                {hasActionPermission('APPROVE_INVOICE') && (
                  <>
                    <h3 className={styles.actionTitle}>Authorized AP Action</h3>
                    <div className={styles.actionButtons}>
                      <Button className={styles.approveBtn} icon={<CheckCircle2 size={16} />} onClick={handleApprove}>
                        Approve & Release Payment
                      </Button>
                      <Button className={styles.rejectBtn} icon={<XCircle size={16} />} onClick={handleReject}>
                        Reject Invoice
                      </Button>
                      <Button className={styles.sendBackBtn} icon={<Send size={16} />}>
                        Send Back to Vendor Portal
                      </Button>
                    </div>

                    <div className={styles.remarksSection}>
                      <label className={styles.remarksLabel}>Audit Notes / remarks</label>
                      <textarea
                        className={styles.remarksInput}
                        placeholder="Enter remarks required for rejection or return..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      ></textarea>
                    </div>
                  </>
                )}
              </>
            ) : (
<<<<<<< HEAD
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Select an invoice from the queue to review.
              </div>
=======
              <>
                <h3 className={styles.actionTitle}>Review Action (Maker/Reviewer)</h3>
                <div className={styles.actionButtons}>
                  <Button className={styles.approveBtn} icon={<CheckCircle2 size={16} />} onClick={() => { toast.success("Invoice matching verified & recommended to Tenant Admin successfully."); setRemarks(''); }}>Verify & Recommend</Button>
                  <Button className={styles.sendBackBtn} icon={<Send size={16} />} onClick={() => { toast.success("Invoice returned for revisions."); setRemarks(''); }}>Send Back to Vendor</Button>
                </div>

                <div className={styles.remarksSection}>
                  <label className={styles.remarksLabel}>Audit Notes / remarks</label>
                  <textarea 
                    className={styles.remarksInput} 
                    placeholder="Enter remarks or match review comments..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
              </>
>>>>>>> dc1643ef147d94ed445cab2a657fdf4ea2a3bd84
            )}

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
        </div>
      </div>
    </div>
  );
};
