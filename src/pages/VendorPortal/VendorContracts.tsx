import React, { useState } from 'react';
import {
  FileSignature, Download, AlertTriangle, PenLine, RefreshCw,
  X, CheckCircle, Clock, Loader, ExternalLink, ShieldCheck,
  Mail, Smartphone, Info,
} from 'lucide-react';
import {
  useVendorContracts, useVendorProfile, useSubmitTicket,
  useEsignStatus, useInitiateEsign, useSimulateEsign,
} from '../../hooks/useVendorPortal';
import type { VendorContract, OtpMethod, EsignRequest } from '../../services/vendorPortalService';
import s from './vendor.module.css';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const statusBadge = (status: string) => {
  if (status === 'Active')                        return <span className={s.badgeSuccess}>{status}</span>;
  if (status === 'Expired' || status === 'Terminated') return <span className={s.badgeDanger}>{status}</span>;
  return <span className={s.badgeWarning}>{status}</span>;
};

const riskBadge = (risk: string) => {
  if (risk === 'Low')  return <span className={s.badgeSuccess}>{risk}</span>;
  if (risk === 'High') return <span className={s.badgeDanger}>{risk}</span>;
  return <span className={s.badgeWarning}>{risk}</span>;
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* ── E-sign status badge ─────────────────────────────────────────────────── */
const EsignBadge: React.FC<{ req: EsignRequest }> = ({ req }) => {
  const map: Record<EsignRequest['status'], { label: string; cls: string }> = {
    Initiated: { label: 'Signing Initiated', cls: s.badgeWarning },
    Sent:      { label: 'Awaiting Signature', cls: s.badgeWarning },
    Signed:    { label: 'E-Signed ✓', cls: s.badgeSuccess },
    Failed:    { label: 'Signing Failed', cls: s.badgeDanger },
  };
  const m = map[req.status];
  return <span className={m.cls}>{m.label}</span>;
};

/* ── SignDesk modal ──────────────────────────────────────────────────────── */
interface EsignModalProps {
  contract: VendorContract;
  esignReq: EsignRequest | null;
  onClose: () => void;
}

const EsignModal: React.FC<EsignModalProps> = ({ contract, esignReq, onClose }) => {
  const { data: profile } = useVendorProfile();
  const initiate = useInitiateEsign();
  const simulate = useSimulateEsign();

  const [signerName,  setSignerName]  = useState(profile?.contactPerson ?? '');
  const [signerEmail, setSignerEmail] = useState(profile?.email ?? '');
  const [signerPhone, setSignerPhone] = useState(profile?.phone ?? '');
  const [otpMethod,   setOtpMethod]   = useState<OtpMethod>('aadhaar');
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!signerName.trim())  e.name  = 'Signer name is required';
    if (!signerEmail.trim()) e.email = 'Email address is required';
    if (!signerPhone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    await initiate.mutateAsync({
      contractId: contract.contractId,
      payload: { signerName, signerEmail, signerPhone, otpMethod },
    });
  };

  const handleSimulate = () => simulate.mutate(contract.contractId);

  /* ── status view (request already exists) ── */
  if (esignReq) {
    return (
      <div className={s.modalBackdrop} onClick={onClose}>
        <div className={s.modal} style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
          <div className={s.modalHeader}>
            <div className={s.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={17} style={{ color: 'var(--color-primary)' }} />
              E-Signature Status — SignDesk
            </div>
            <button className={s.modalClose} onClick={onClose}><X size={18} /></button>
          </div>

          <div className={s.modalBody}>
            {/* SignDesk branding strip */}
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg,#1a56db15,#7c3aed15)',
              border: '1px solid #1a56db30',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <ShieldCheck size={20} style={{ color: '#1a56db' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Powered by SignDesk</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Legally binding e-signatures · Aadhaar eSign / DSC</div>
              </div>
            </div>

            {/* Status card */}
            <div style={{
              padding: '14px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {contract.contractName}
                </span>
                <EsignBadge req={esignReq} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <div><span style={{ color: 'var(--color-text-tertiary)' }}>Signer:</span> {esignReq.signerName}</div>
                <div><span style={{ color: 'var(--color-text-tertiary)' }}>Method:</span> {esignReq.otpMethod === 'aadhaar' ? 'Aadhaar OTP' : 'Email OTP'}</div>
                <div><span style={{ color: 'var(--color-text-tertiary)' }}>Initiated:</span> {new Date(esignReq.initiatedAt).toLocaleString('en-IN')}</div>
                {esignReq.completedAt && (
                  <div><span style={{ color: 'var(--color-text-tertiary)' }}>Signed on:</span> {new Date(esignReq.completedAt).toLocaleString('en-IN')}</div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Request ID:</span> {esignReq.signDeskRequestId}
                </div>
              </div>

              {esignReq.status === 'Sent' && (
                <div style={{
                  padding: '10px 12px', borderRadius: 8, background: 'var(--color-info-bg)',
                  border: '1px solid var(--color-primary)', fontSize: 12,
                  display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-info-text)',
                }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    An OTP has been sent to the signer's {esignReq.otpMethod === 'aadhaar' ? 'Aadhaar-linked mobile number' : 'email address'}.
                    The signer must visit the SignDesk portal to complete signing.
                  </span>
                </div>
              )}

              {esignReq.status === 'Signed' && esignReq.signedDocUrl && (
                <a
                  href={esignReq.signedDocUrl}
                  download
                  className={s.btnPrimary}
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                >
                  <Download size={14} /> Download Signed Contract
                </a>
              )}
            </div>

            {/* Dev-only simulate panel */}
            {esignReq.status === 'Sent' && (
              <div style={{
                padding: '12px 14px', borderRadius: 8,
                border: '1px dashed var(--color-border-strong)',
                background: 'var(--color-surface-2)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Dev / Demo Only
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  Simulate the vendor completing the Aadhaar OTP signing on the SignDesk portal.
                  In production this happens on SignDesk's side.
                </div>
                <button
                  className={s.btnPrimary}
                  style={{ width: '100%', justifyContent: 'center', background: '#7c3aed' }}
                  disabled={simulate.isPending}
                  onClick={handleSimulate}
                >
                  {simulate.isPending
                    ? <><Loader size={13} className="spin" /> Simulating…</>
                    : <><CheckCircle size={13} /> Simulate Signing Complete</>}
                </button>
              </div>
            )}
          </div>

          <div className={s.modalFooter}>
            <button className={s.btnOutline} onClick={onClose}>Close</button>
            {esignReq.status === 'Sent' && (
              <a
                href={esignReq.signingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={s.btnPrimary}
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={13} /> Open SignDesk Portal
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── initiation form ── */
  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <div className={s.modal} style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div className={s.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PenLine size={17} style={{ color: 'var(--color-primary)' }} />
            E-Sign Contract — SignDesk
          </div>
          <button className={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={s.modalBody}>
          {/* SignDesk branding */}
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'linear-gradient(135deg,#1a56db15,#7c3aed15)',
            border: '1px solid #1a56db30',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <ShieldCheck size={20} style={{ color: '#1a56db' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Powered by SignDesk</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                Aadhaar eSign · IT Act 2000 · CCA certified · Legally binding
              </div>
            </div>
          </div>

          {/* Contract summary */}
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)', fontSize: 13,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{contract.contractName}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {contract.contractType} · ₹{(contract.contractValue ?? 0).toLocaleString('en-IN')} · Valid till {contract.expiryDate}
            </div>
          </div>

          {/* Signer details */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Signer Details
          </div>

          <div className={s.formGrid}>
            <div className={s.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={s.label}>Full Name *</label>
              <input
                className={`${s.input} ${errors.name ? s.inputError : ''}`}
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                placeholder="As on Aadhaar / PAN"
              />
              {errors.name && <div className={s.fieldError}>{errors.name}</div>}
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Email Address *</label>
              <input
                type="email"
                className={`${s.input} ${errors.email ? s.inputError : ''}`}
                value={signerEmail}
                onChange={e => setSignerEmail(e.target.value)}
              />
              {errors.email && <div className={s.fieldError}>{errors.email}</div>}
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Mobile Number *</label>
              <input
                type="tel"
                className={`${s.input} ${errors.phone ? s.inputError : ''}`}
                value={signerPhone}
                onChange={e => setSignerPhone(e.target.value)}
                placeholder="+91-XXXXXXXXXX"
              />
              {errors.phone && <div className={s.fieldError}>{errors.phone}</div>}
            </div>
          </div>

          {/* OTP method */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Authentication Method
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              { value: 'aadhaar', icon: <Smartphone size={16} />, label: 'Aadhaar OTP', desc: 'OTP sent to Aadhaar-linked mobile' },
              { value: 'email',   icon: <Mail size={16} />,       label: 'Email OTP',   desc: 'OTP sent to registered email' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOtpMethod(opt.value)}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                  background: otpMethod === opt.value ? 'var(--color-info-bg)' : 'var(--color-surface-2)',
                  border: `2px solid ${otpMethod === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: otpMethod === opt.value ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: 700, fontSize: 13 }}>
                  {opt.icon} {opt.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Legal notice */}
          <div style={{
            padding: '10px 12px', borderRadius: 8, background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-tertiary)',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            By proceeding, you authorize an e-signature on this contract under the Information Technology Act, 2000.
            This is legally equivalent to a handwritten signature.
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.btnOutline} onClick={onClose}>Cancel</button>
          <button
            className={s.btnPrimary}
            onClick={handleSend}
            disabled={initiate.isPending}
          >
            {initiate.isPending
              ? <><Loader size={13} /> Sending…</>
              : <><PenLine size={13} /> Send for Signing</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Contract row with per-contract e-sign state ─────────────────────────── */
const ContractRow: React.FC<{
  c: VendorContract;
  onRenewal: (id: string, name: string) => void;
  renewalPending: boolean;
  renewed: boolean;
}> = ({ c, onRenewal, renewalPending, renewed }) => {
  const [showEsign, setShowEsign] = useState(false);
  const { data: esignReq = null } = useEsignStatus(c.contractId);

  const days = c.expiryDate ? daysUntil(c.expiryDate) : null;
  const expiringSoon = days !== null && days <= 30 && days > 0;
  const expired = days !== null && days <= 0;
  const isSigned = esignReq?.status === 'Signed';

  return (
    <>
      {showEsign && (
        <EsignModal
          contract={c}
          esignReq={esignReq}
          onClose={() => setShowEsign(false)}
        />
      )}

      <div style={{
        border: `1px solid ${expiringSoon || expired ? 'var(--color-warning)' : 'var(--color-border)'}`,
        borderRadius: 10,
        background: expiringSoon || expired ? 'var(--color-warning-bg)' : 'var(--color-surface-2)',
        overflow: 'hidden',
      }}>
        {/* Expiry banner */}
        {(expiringSoon || expired) && (
          <div style={{
            padding: '8px 18px', background: expired ? 'var(--color-danger-bg)' : '#fef3c7',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
            color: expired ? 'var(--color-danger)' : '#d97706',
            borderBottom: '1px solid var(--color-border)', fontWeight: 600,
          }}>
            <AlertTriangle size={14} />
            {expired
              ? `Contract expired ${Math.abs(days!)} day${Math.abs(days!) !== 1 ? 's' : ''} ago`
              : `Expires in ${days} day${days !== 1 ? 's' : ''}`}
          </div>
        )}

        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {c.contractName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>{c.contractType}</span>
                <span>Dept: {c.department}</span>
                <span>{c.effectiveDate} → {c.expiryDate}</span>
                <span>₹{(c.contractValue ?? 0).toLocaleString('en-IN')} {c.currency}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {riskBadge(c.riskLevel)}
              {statusBadge(c.status)}
              {esignReq && <EsignBadge req={esignReq} />}

              {/* View doc */}
              {(c.uploadedFiles?.length ?? 0) > 0 && (
                <button className={s.btnGhost} style={{ padding: '5px 10px', fontSize: 12 }}>
                  <Download size={13} /> View Doc
                </button>
              )}

              {/* E-sign button */}
              {c.status === 'Active' && (
                <button
                  className={isSigned ? s.btnOutline : s.btnPrimary}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setShowEsign(true)}
                >
                  {isSigned
                    ? <><CheckCircle size={12} /> Signed</>
                    : esignReq?.status === 'Sent'
                      ? <><Clock size={12} /> Signing Pending</>
                      : <><PenLine size={12} /> E-Sign</>}
                </button>
              )}

              {/* Renewal */}
              {(expiringSoon || expired) && (
                <button
                  className={s.btnPrimary}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  disabled={renewalPending || renewed}
                  onClick={() => onRenewal(c.contractId, c.contractName)}
                >
                  <RefreshCw size={12} />
                  {renewed ? 'Renewal Requested' : 'Request Renewal'}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 20, fontSize: 12, color: 'var(--color-text-tertiary)', flexWrap: 'wrap' }}>
            <span>Payment: {c.paymentTerms}</span>
            <span>Billing: {c.billingFrequency}</span>
            {days !== null && days > 0 && (
              <span style={{ color: expiringSoon ? '#d97706' : 'inherit' }}>Expires: {days} days</span>
            )}
            {isSigned && esignReq?.completedAt && (
              <span style={{ color: 'var(--color-success-text)' }}>
                ✓ Signed on {new Date(esignReq.completedAt).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Main page ───────────────────────────────────────────────────────────── */
export const VendorContracts: React.FC = () => {
  const { data: contracts = [], isLoading } = useVendorContracts();
  const submitTicket = useSubmitTicket();
  const [requestedRenewal, setRequestedRenewal] = useState<Set<string>>(new Set());

  const handleRequestRenewal = async (contractId: string, contractName: string) => {
    await submitTicket.mutateAsync({
      category: 'Other',
      subject: `Contract Renewal Request — ${contractName}`,
      description: `Please initiate renewal for contract ID ${contractId} (${contractName}). It is expiring soon.`,
    });
    setRequestedRenewal(prev => new Set(prev).add(contractId));
  };

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          {[1, 2].map(i => <div key={i} className={s.skeleton} style={{ height: 100, marginBottom: 12, borderRadius: 10 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Contracts &amp; SLAs</div>
          <div className={s.pageSubtitle}>
            {contracts.length} contracts — {contracts.filter(c => c.status === 'Active').length} active
          </div>
        </div>
        {/* SignDesk badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          borderRadius: 20, border: '1px solid #1a56db40',
          background: 'linear-gradient(135deg,#1a56db12,#7c3aed12)', fontSize: 12,
          fontWeight: 600, color: '#1a56db',
        }}>
          <ShieldCheck size={14} /> E-Signatures via SignDesk
        </div>
      </div>

      <div className={s.card}>
        {contracts.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}><FileSignature size={28} /></div>
            <div className={s.emptyTitle}>No contracts yet</div>
            <div className={s.emptyText}>Contracts issued to you will appear here for review and signing.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {contracts.map(c => (
              <ContractRow
                key={c.contractId}
                c={c}
                onRenewal={handleRequestRenewal}
                renewalPending={submitTicket.isPending}
                renewed={requestedRenewal.has(c.contractId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
