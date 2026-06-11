import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { 
  getAllMatches, 
  getAllPOs, 
  getAllGRNs, 
  processThreeWayMatch
} from '../../services/purchaseOrderService';
import type { 
  MatchRecord, 
  PurchaseOrderRecord,
  GRNRecord
} from '../../services/purchaseOrderService';
import styles from './POThreeWayMatch.module.css';

export const POThreeWayMatch: React.FC = () => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [pos, setPos] = useState<PurchaseOrderRecord[]>([]);
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [selectedPoId, setSelectedPoId] = useState('');
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [invoiceQuantity, setInvoiceQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchList, poList, grnList] = await Promise.all([
        getAllMatches(),
        getAllPOs(),
        getAllGRNs()
      ]);
      setMatches(matchList);
      setPos(poList);
      setGrns(grnList);

      const openPOs = poList.filter(po => po.invoiceMatchStatus !== 'Matched' && po.status === 'Approved');
      if (openPOs.length > 0) {
        const firstPo = openPOs[0];
        setSelectedPoId(firstPo.poId);
        setInvoiceAmount(firstPo.poValue);
        
        // Find matching GRN
        const linkedGrn = grnList.find(g => g.poId === firstPo.poId);
        if (linkedGrn) {
          setSelectedGrnId(linkedGrn.grnId || '');
          setInvoiceQuantity(linkedGrn.acceptedQuantity);
        }
      }
    } catch (err) {
      console.error('Failed to load 3-Way Match data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update form values on PO selection change
  useEffect(() => {
    if (!selectedPoId) return;
    const po = pos.find(p => p.poId === selectedPoId);
    if (po) {
      setInvoiceAmount(po.poValue);
      const linkedGrn = grns.find(g => g.poId === selectedPoId);
      if (linkedGrn) {
        setSelectedGrnId(linkedGrn.grnId || '');
        setInvoiceQuantity(linkedGrn.acceptedQuantity);
      } else {
        setSelectedGrnId('');
        setInvoiceQuantity(1);
      }
    }
  }, [selectedPoId, pos, grns]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoId) return;

    setSubmitting(true);
    const matchPayload: MatchRecord = {
      poId: selectedPoId,
      invoiceId: invoiceId || `INV-2026-00${Math.floor(100 + Math.random() * 900)}`,
      grnId: selectedGrnId,
      poAmount: pos.find(p => p.poId === selectedPoId)?.poValue || invoiceAmount,
      invoiceAmount: Number(invoiceAmount),
      grnQuantity: grns.find(g => g.grnId === selectedGrnId)?.acceptedQuantity || invoiceQuantity,
      invoiceQuantity: Number(invoiceQuantity),
      amountMatched: false,
      quantityMatched: false,
      matchStatus: 'Pending',
      remarks: ''
    };

    try {
      const res = await processThreeWayMatch(matchPayload);
      if (res.success) {
        toast.success(`3-Way Match completed — Status: ${res.match.matchStatus}`);
        setShowModal(false);
        setInvoiceId('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to run 3-Way Match:', err);
      toast.error('Action failed. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMatches = matches.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.matchId?.toLowerCase().includes(q) ||
      item.poId.toLowerCase().includes(q) ||
      item.invoiceId.toLowerCase().includes(q)
    );
  });

  const activePOs = pos.filter(po => po.invoiceMatchStatus !== 'Matched' && (po.status === 'Approved' || po.status === 'Sent'));

  const columns = [
    { header: 'Match ID', accessor: 'matchId' as keyof MatchRecord },
    { header: 'PO Number', accessor: 'poId' as keyof MatchRecord },
    { header: 'Invoice ID', accessor: 'invoiceId' as keyof MatchRecord },
    { header: 'GRN Number', accessor: 'grnId' as keyof MatchRecord },
    { 
      header: 'PO vs Invoice Value', 
      accessor: (row: MatchRecord) => `₹${row.poAmount.toLocaleString('en-IN')} / ₹${row.invoiceAmount.toLocaleString('en-IN')}`
    },
    { 
      header: 'GRN vs Invoice Qty', 
      accessor: (row: MatchRecord) => `${row.grnQuantity} / ${row.invoiceQuantity}`
    },
    { 
      header: 'Match Status', 
      accessor: (row: MatchRecord) => {
        let className = styles.statusBadge;
        if (row.matchStatus === 'Matched') className = styles.statusSuccess;
        if (row.matchStatus === 'Partial Match') className = styles.statusWarning;
        if (row.matchStatus === 'Mismatch') className = styles.statusDanger;
        return <span className={className}>{row.matchStatus}</span>;
      } 
    },
    { 
      header: 'Remarks', 
      accessor: (row: MatchRecord) => row.remarks || row.mismatchReason || '-'
    },
    { 
      header: 'Actions', 
      align: 'center' as const,
      accessor: () => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="View Match Audit Trail"><Eye size={16} /></button>
        </div>
      ) 
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>3-Way Match Engine</h1>
          <p className={styles.breadcrumbs}>Home / Purchase Orders / 3-Way Match</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Run 3-Way Match</Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input 
                placeholder="Search Match ID, PO, Invoice..." 
                fullWidth={false} 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            Loading 3-Way Match Ledger...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredMatches} 
            keyExtractor={(row) => row.matchId || row.poId} 
          />
        )}
      </Card>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Execute 3-Way Match check</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMatch}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Select Purchase Order <span style={{ color: 'red' }}>*</span></label>
                  <select 
                    className={styles.select} 
                    value={selectedPoId} 
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    required
                  >
                    {activePOs.length === 0 ? (
                      <option value="">No pending PO matches available</option>
                    ) : (
                      activePOs.map(po => (
                        <option key={po.poId} value={po.poId}>
                          {po.poId} - {po.vendorName} (Value: ₹{po.poValue.toLocaleString('en-IN')})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Select Goods Receipt Note (GRN)</label>
                  <select 
                    className={styles.select} 
                    value={selectedGrnId} 
                    onChange={(e) => setSelectedGrnId(e.target.value)}
                    required
                  >
                    <option value="">Choose GRN slip...</option>
                    {grns.filter(g => g.poId === selectedPoId).map(grn => (
                      <option key={grn.grnId} value={grn.grnId}>
                        {grn.grnId} (Accepted: {grn.acceptedQuantity}, Condition: {grn.deliveryCondition})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Invoice ID / Reference</label>
                  <Input 
                    placeholder="INV-2026-XXXX" 
                    value={invoiceId} 
                    onChange={(e) => setInvoiceId(e.target.value)}
                    required 
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Invoice Amount (₹)</label>
                    <Input 
                      type="number" 
                      value={invoiceAmount} 
                      onChange={(e) => setInvoiceAmount(Number(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Invoice Quantity</label>
                    <Input 
                      type="number" 
                      value={invoiceQuantity} 
                      onChange={(e) => setInvoiceQuantity(Number(e.target.value))} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !selectedPoId}>{submitting ? 'Matching...' : 'Run Match Verification'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
