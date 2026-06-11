import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, XCircle, Send, Bot, Scale } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './InvoiceApprovals.module.css';

const pendingInvoices = [
  { id: 'INV-2026-9908', vendor: 'ABC Infotech Pvt Ltd', value: '₹14,75,000', poRef: 'PO-2026-000789', date: '12 May 2026', active: true },
  { id: 'INV-2026-9907', vendor: 'Secure Facilities Ltd', value: '₹5,31,000', poRef: 'PO-2026-000788', date: '10 May 2026', active: false },
  { id: 'INV-2026-9904', vendor: 'Tech Solutions', value: '₹4,01,200', poRef: 'PO-2026-000785', date: '01 May 2026', active: false },
];

export const InvoiceApprovals: React.FC = () => {
  const { hasActionPermission } = useAuth();
  const [remarks, setRemarks] = useState('');

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
            <Badge variant="info">38</Badge>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search invoices..." className={styles.searchInput} />
          </div>
          
          <div className={styles.listContainer}>
            {pendingInvoices.map(item => (
              <div key={item.id} className={`${styles.listItem} ${item.active ? styles.listActive : ''}`}>
                <div className={styles.itemContent}>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemId}>{item.id}</span>
                    <span className={styles.itemDate}>{item.date}</span>
                  </div>
                  <span className={styles.itemName}>{item.vendor}</span>
                  <span className={styles.itemValue}>{item.value} • Ref: {item.poRef}</span>
                </div>
                {item.active && <ChevronRight size={18} color="#1d4ed8" />}
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <span>Showing 1 to 3 of 38</span>
          </div>
        </Card>

        {/* Right Pane - Detail */}
        <div className={styles.detailPane}>
          <Card className={styles.detailCard}>
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

            {hasActionPermission('APPROVE_INVOICE') && (
              <>
                <h3 className={styles.actionTitle}>Authorized AP Action</h3>
                <div className={styles.actionButtons}>
                  <Button className={styles.approveBtn} icon={<CheckCircle2 size={16} />}>Approve & Release Payment</Button>
                  <Button className={styles.rejectBtn} icon={<XCircle size={16} />}>Reject Invoice</Button>
                  <Button className={styles.sendBackBtn} icon={<Send size={16} />}>Send Back to Vendor Portal</Button>
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
          </Card>
        </div>
      </div>
    </div>
  );
};
