import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Send, X } from 'lucide-react';
import { submitVendorInvoice } from '../../services/vendorPortalService';
import type { VendorPO } from '../../services/vendorPortalService';
import s from './vendor.module.css';

interface Props {
  po: VendorPO | null;
  allPOs: VendorPO[];
  onClose: () => void;
  onSuccess: () => void;
}

export const VendorInvoiceModal: React.FC<Props> = ({ po, allPOs, onClose, onSuccess }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    invoiceNo: '',
    poId: po?.poId ?? '',
    amount: po ? String(po.value) : '',
    gstAmount: '',
    tdsSection: '194J',
    tdsRate: '10',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.invoiceNo.trim()) e.invoiceNo = 'Invoice number is required';
    if (!form.poId) e.poId = 'Please select a PO reference';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount';
    if (!fileRef.current?.files?.[0]) e.file = 'Please attach the invoice file';
    return e;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      setFileName(file.name);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await submitVendorInvoice(form.invoiceNo, form.poId, parseFloat(form.amount), parseFloat(form.gstAmount) || 0, form.tdsSection, parseFloat(form.tdsRate) || 0);
      toast.success(`Invoice ${form.invoiceNo} submitted. OCR pipeline processing started.`);
      onSuccess();
    } catch {
      toast.error('Invoice submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgedPOs = allPOs.filter(p => p.status === 'Acknowledged');

  return (
    <div className={s.modalBackdrop}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <div className={s.modalTitle}>Submit Invoice</div>
          <button className={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={s.modalBody}>
            <div className={s.formGroup}>
              <label className={s.label}>Invoice Number</label>
              <input
                className={[s.input, errors.invoiceNo ? s.inputError : ''].join(' ')}
                placeholder="e.g. INV-2026-0089"
                value={form.invoiceNo}
                onChange={e => { setForm(f => ({ ...f, invoiceNo: e.target.value })); setErrors(p => ({ ...p, invoiceNo: '' })); }}
              />
              {errors.invoiceNo && <div className={s.fieldError}>{errors.invoiceNo}</div>}
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>PO Reference</label>
              <select
                className={[s.select, errors.poId ? s.inputError : ''].join(' ')}
                value={form.poId}
                onChange={e => { setForm(f => ({ ...f, poId: e.target.value })); setErrors(p => ({ ...p, poId: '' })); }}
              >
                <option value="">Select acknowledged PO</option>
                {acknowledgedPOs.map(p => (
                  <option key={p.poId} value={p.poId}>{p.poId} — ₹{p.value.toLocaleString('en-IN')}</option>
                ))}
              </select>
              {errors.poId && <div className={s.fieldError}>{errors.poId}</div>}
            </div>

            <div className={s.formGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={s.formGroup}>
                <label className={s.label}>Base Amount (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="number"
                  className={[s.input, errors.amount ? s.inputError : ''].join(' ')}
                  placeholder="e.g. 450000"
                  value={form.amount}
                  onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(p => ({ ...p, amount: '' })); }}
                />
                {errors.amount && <div className={s.fieldError}>{errors.amount}</div>}
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>GST Amount (₹)</label>
                <input
                  type="number"
                  className={s.input}
                  placeholder="e.g. 81000"
                  value={form.gstAmount}
                  onChange={e => setForm(f => ({ ...f, gstAmount: e.target.value }))}
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>TDS Section</label>
                <select className={s.select} value={form.tdsSection} onChange={e => setForm(f => ({ ...f, tdsSection: e.target.value }))}>
                  <option value="194C">194C — Works Contract (2%)</option>
                  <option value="194J">194J — Professional Fees (10%)</option>
                  <option value="194I">194I — Rent (10%)</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>TDS Rate (%)</label>
                <input
                  type="number"
                  className={s.input}
                  placeholder="e.g. 10"
                  value={form.tdsRate}
                  onChange={e => setForm(f => ({ ...f, tdsRate: e.target.value }))}
                />
              </div>
            </div>

            {/* Real drag-and-drop file upload */}
            <div className={s.formGroup}>
              <label className={s.label}>Attach Invoice File</label>
              <div
                className={[s.dropZone, dragging ? s.dropZoneActive : ''].join(' ')}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <Upload size={22} style={{ color: 'var(--color-primary)', marginBottom: 4 }} />
                {fileName ? (
                  <>
                    <div className={s.dropZoneText} style={{ color: 'var(--color-success)' }}>✓ {fileName}</div>
                    <div className={s.dropZoneHint}>Click to replace</div>
                  </>
                ) : (
                  <>
                    <div className={s.dropZoneText}>Drag & drop or click to browse</div>
                    <div className={s.dropZoneHint}>PDF, JPG, PNG — max 10 MB</div>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => {
                  const name = e.target.files?.[0]?.name ?? '';
                  setFileName(name);
                  setErrors(p => ({ ...p, file: '' }));
                }}
              />
              {errors.file && <div className={s.fieldError}>{errors.file}</div>}
            </div>
          </div>

          <div className={s.modalFooter}>
            <button type="button" className={s.btnOutline} onClick={onClose}>Cancel</button>
            <button type="submit" className={s.btnPrimary} disabled={loading}>
              <Send size={14} />
              {loading ? 'Submitting…' : 'Submit Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
