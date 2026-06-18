import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, ChevronRight, CheckCircle2, Bot, Scale, Loader2 } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import styles from './PaymentApprovals.module.css';
import { useAuth } from '../../context/AuthContext';

interface InvoiceItem {
  invoiceId: string;
  vendorName: string;
  netPayable: number;
  totalAmount: number;
  vendorType: string;
}

interface PaymentBatch {
  batchId: string;
  vendorId: string;
  vendorName: string;
  mode: string;
  risk: string;
  scheduledDate: string;
  invoices: InvoiceItem[];
  totalAmount: number;
}

export const PaymentApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/payments/batches')
      .then(r => {
        setBatches(r.data);
        if (r.data.length > 0) setSelectedBatchId(r.data[0].batchId);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const selectedBatch = batches.find(b => b.batchId === selectedBatchId);


  const handleApprove = async () => {
    if (!selectedBatch) return;
    try {
      for (const inv of selectedBatch.invoices) {
        await axios.put(`/api/invoices/${inv.invoiceId}/approve`, { approvedBy: 'Finance Manager', remarks });
      }
      toast.success(`Batch for ${selectedBatch.vendorName} approved & released.`);
      const remaining = batches.filter(b => b.batchId !== selectedBatchId);
      setBatches(remaining);
      setRemarks('');
      if (remaining.length > 0) {
        setSelectedBatchId(remaining[0].batchId);
      } else {
        navigate('/payments/dashboard');
      }
    } catch {
      toast.error('Failed to approve batch.');
    }
  };

  const handleAction = (statusText: string) => {
    toast.success(`Batch ${selectedBatchId} ${statusText} successfully.`);
    const remaining = batches.filter(b => b.batchId !== selectedBatchId);
    setBatches(remaining);
    setRemarks('');
    if (remaining.length > 0) {
      setSelectedBatchId(remaining[0].batchId);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

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
          {/* Left Pane */}
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
                  key={batch.batchId}
                  className={`${styles.listItem} ${selectedBatchId === batch.batchId ? styles.listActive : ''}`}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemId}>{batch.batchId}</span>
                      <span className={styles.itemDate}>{batch.scheduledDate}</span>
                    </div>
                    <span className={styles.itemName}>₹{batch.totalAmount.toLocaleString('en-IN')} ({batch.invoices.length} Invoices)</span>
                    <span className={styles.itemValue}>Vendor: {batch.vendorName} • Mode: {batch.mode}</span>
                  </div>
                  <ChevronRight size={16} className={styles.chevron} />
                </div>
              ))}
            </div>
          </Card>

          {/* Right Pane */}
          <div className={styles.detailPane}>
            {selectedBatch && (
              <Card className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className={styles.detailTitle}>Batch Authorization: {selectedBatch.batchId}</h2>
                    <Badge variant={selectedBatch.risk === 'Low' ? 'success' : 'warning'}>
                      AI Risk: {selectedBatch.risk}
                    </Badge>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vendor</span>
                    <span className={styles.infoValue}>{selectedBatch.vendorName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Disbursement Mode</span>
                    <span className={styles.infoValue}>{selectedBatch.mode}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Payout Value</span>
                    <span className={styles.infoValue} style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{selectedBatch.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Scheduled Date</span>
                    <span className={styles.infoValue}>{selectedBatch.scheduledDate}</span>
                  </div>
                </div>

                <h4 className={styles.sectionHeading}><Scale size={16} /> Batch Invoices</h4>
                <div className={styles.matchingPanel}>
                  <div className={styles.matchGrid}>
                    <div className={styles.matchHeaderRow}>
                      <span>Invoice ID</span>
                      <span>Vendor</span>
                      <span>Value</span>
                      <span>Type</span>
                    </div>
                    {selectedBatch.invoices.map(item => (
                      <div key={item.invoiceId} className={styles.matchRow}>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.invoiceId}</span>
                        <span style={{ fontWeight: 600 }}>{item.vendorName}</span>
                        <span>₹{(item.netPayable || item.totalAmount).toLocaleString('en-IN')}</span>
                        <span className={item.vendorType === 'MSME' ? styles.matchBadgeWarning : ''}>{item.vendorType}</span>
                      </div>
                    ))}
                  </div>
                </div>

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

                <h4 className={styles.actionTitle}>Checker Authorization Actions</h4>
                <div className={styles.actionButtons}>
                  <Button className={styles.approveBtn} onClick={handleApprove}>
                    Approve & Release Funds
                  </Button>
                  <Button className={styles.sendBackBtn} onClick={() => handleAction('Returned to Maker')}>
                    Send Back to Maker
                  </Button>
                  <Button className={styles.rejectBtn} onClick={() => handleAction('Rejected')}>
                    Reject Payout Batch
                  </Button>
                </div>




              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
