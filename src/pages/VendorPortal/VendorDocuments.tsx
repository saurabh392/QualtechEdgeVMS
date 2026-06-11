import React, { useRef, useState } from 'react';
import { Upload, RefreshCw, X, FileText, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useVendorDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useVendorPortal';
import type { VendorDocument } from '../../services/vendorPortalService';
import s from './vendor.module.css';

const TYPES = ['GST Certificate', 'PAN Card', 'MSME Certificate', 'Bank Statement', 'Incorporation Certificate', 'Other'];

const statusBadge = (status: string) => {
  if (status === 'Verified') return <span className={s.badgeSuccess}>Verified</span>;
  if (status === 'Rejected') return <span className={s.badgeDanger}>Rejected</span>;
  if (status === 'Expired') return <span className={s.badgeDanger}>Expired</span>;
  return <span className={s.badgeWarning}>Pending</span>;
};

/* ── Confirm Dialog ─────────────────────────────────────────────────────── */
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading,
}) => (
  <div className={s.modalBackdrop} onClick={onCancel}>
    <div
      className={s.modal}
      style={{ maxWidth: 420 }}
      onClick={e => e.stopPropagation()}
    >
      <div className={s.modalHeader}>
        <div className={s.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          {title}
        </div>
        <button className={s.modalClose} onClick={onCancel}><X size={18} /></button>
      </div>
      <div className={s.modalBody}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
      <div className={s.modalFooter}>
        <button className={s.btnOutline} onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className={s.btnPrimary}
          style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ── Upload / Renew Modal ───────────────────────────────────────────────── */
interface UploadModalProps { doc?: VendorDocument | null; onClose: () => void; }

const UploadModal: React.FC<UploadModalProps> = ({ doc, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [docType, setDocType] = useState(doc?.documentType ?? '');
  const [docName, setDocName] = useState(doc?.documentName ?? '');
  const [expiry, setExpiry] = useState(doc?.expiryDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadDoc = useUploadDocument();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!file) e.file = 'Please select a file';
    if (!docType) e.docType = 'Select a document type';
    if (!docName.trim()) e.docName = 'Document name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !file) return;
    await uploadDoc.mutateAsync({ file, type: docType, name: docName, expiry: expiry || null, docId: doc?.documentId });
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) setFile(f);
  };

  return (
    <div className={s.modalBackdrop}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <div className={s.modalTitle}>{doc ? `Renew — ${doc.documentName}` : 'Upload Document'}</div>
          <button className={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={s.modalBody}>
          <div
            className={`${s.dropZone} ${dragging ? s.dropZoneActive : ''}`}
            style={errors.file ? { borderColor: 'var(--color-danger)' } : undefined}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={26} style={{ color: 'var(--color-primary)' }} />
            <div className={s.dropZoneText}>{file ? file.name : 'Drop file here or click to browse'}</div>
            <div className={s.dropZoneHint}>PDF, JPG, PNG · Max 10 MB</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
          {errors.file && <div className={s.fieldError}>{errors.file}</div>}

          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.label}>Document Type *</label>
              <select className={`${s.select} ${errors.docType ? s.inputError : ''}`} value={docType}
                onChange={e => setDocType(e.target.value)}>
                <option value="">Select type…</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.docType && <div className={s.fieldError}>{errors.docType}</div>}
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Document Name *</label>
              <input className={`${s.input} ${errors.docName ? s.inputError : ''}`} value={docName}
                onChange={e => setDocName(e.target.value)} placeholder="E.g. GST Certificate 2024" />
              {errors.docName && <div className={s.fieldError}>{errors.docName}</div>}
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Expiry Date (optional)</label>
              <input type="date" className={s.input} value={expiry} onChange={e => setExpiry(e.target.value)} />
            </div>
          </div>
        </div>
        <div className={s.modalFooter}>
          <button className={s.btnOutline} onClick={onClose}>Cancel</button>
          <button className={s.btnPrimary} onClick={handleSubmit} disabled={uploadDoc.isPending}>
            {uploadDoc.isPending ? 'Uploading…' : doc ? 'Renew Document' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Document Preview Modal ─────────────────────────────────────────────── */
interface PreviewModalProps { doc: VendorDocument; onClose: () => void; }

const PreviewModal: React.FC<PreviewModalProps> = ({ doc, onClose }) => {
  const url = doc.filePath!;
  const isImage = /\.(png|jpe?g)$/i.test(url);

  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <div
        className={s.modal}
        style={{ width: '90vw', maxWidth: 900, height: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.modalHeader}>
          <div className={s.modalTitle}><FileText size={15} /> {doc.documentName}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={url} download className={s.btnGhost}
              style={{ padding: '5px 10px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Download size={13} /> Download
            </a>
            <button className={s.modalClose} onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', background: 'var(--color-surface-2)', borderRadius: '0 0 12px 12px' }}>
          {isImage ? (
            <img src={url} alt={doc.documentName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
          ) : (
            <iframe src={url} title={doc.documentName} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────────────── */
export const VendorDocuments: React.FC = () => {
  const { data: docs = [], isLoading } = useVendorDocuments();
  const deleteDoc = useDeleteDocument();

  const [showModal, setShowModal] = useState(false);
  const [renewDoc, setRenewDoc] = useState<VendorDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VendorDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorDocument | null>(null);

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          {[1, 2, 3].map(i => (
            <div key={i} className={s.skeleton} style={{ height: 44, marginBottom: 8, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteDoc.mutate(deleteTarget.documentId, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  return (
    <div className={s.page}>
      {(showModal || renewDoc) && (
        <UploadModal doc={renewDoc} onClose={() => { setShowModal(false); setRenewDoc(null); }} />
      )}
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Document"
          message={`Are you sure you want to delete "${deleteTarget.documentName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleteDoc.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Compliance Documents</div>
          <div className={s.pageSubtitle}>Upload and manage your KYC and compliance documents</div>
        </div>
        <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
          <Upload size={15} /> Upload Document
        </button>
      </div>

      <div className={s.card}>
        {docs.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}><FileText size={28} /></div>
            <div className={s.emptyTitle}>No documents yet</div>
            <div className={s.emptyText}>Upload your compliance documents to begin verification.</div>
            <button className={s.btnPrimary} style={{ marginTop: 10 }} onClick={() => setShowModal(true)}>
              <Upload size={14} /> Upload First Document
            </button>
          </div>
        ) : (
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.documentId}>
                    <td>{doc.documentName}</td>
                    <td>{doc.documentType}</td>
                    <td>{doc.uploadDate}</td>
                    <td>{doc.expiryDate || '—'}</td>
                    <td>{statusBadge(doc.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {doc.filePath && (
                          <button className={s.btnGhost} style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setPreviewDoc(doc)}>
                            <Eye size={12} /> View
                          </button>
                        )}
                        {(doc.status === 'Expired' || doc.status === 'Rejected') && (
                          <button className={s.btnOutline} style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setRenewDoc(doc)}>
                            <RefreshCw size={12} /> Renew
                          </button>
                        )}
                        {doc.status === 'Verified' && (
                          <button className={s.btnGhost} style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setRenewDoc(doc)}>
                            <Upload size={12} /> Replace
                          </button>
                        )}
                        <button
                          className={s.btnGhost}
                          style={{ padding: '5px 8px', fontSize: 11, color: 'var(--color-danger)' }}
                          onClick={() => setDeleteTarget(doc)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
