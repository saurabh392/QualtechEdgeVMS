import React, { useEffect, useState } from 'react';
import { Save, ShieldCheck, Clock, XCircle, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useVendorKyc, useUpdateKyc } from '../../hooks/useVendorPortal';
import s from './vendor.module.css';

export const VendorKYC: React.FC = () => {
  const { data: kyc, isLoading, refetch } = useVendorKyc();
  const updateKyc = useUpdateKyc();
  const [form, setForm] = useState({ gstNumber: '', panNumber: '', msmeNumber: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (kyc) {
      setForm({
        gstNumber: kyc.gstNumber ?? '',
        panNumber: kyc.panNumber ?? '',
        msmeNumber: kyc.msmeNumber ?? '',
      });
    }
  }, [kyc]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber))
      e.gstNumber = 'Enter a valid GST number (15 chars, e.g. 22AAAAA0000A1Z5)';
    if (!form.panNumber)
      e.panNumber = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber))
      e.panNumber = 'Enter a valid PAN number (10 chars, e.g. ABCDE1234F)';
    if (!form.gstNumber)
      e.gstNumber = 'GST number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateKyc.mutate(form, {
      onSuccess: () => {
        setSubmitted(true);
        refetch();
      }
    });
  };

  const isPending = kyc?.status === 'Pending Review';
  const isVerified = kyc?.status === 'Verified';
  const isRejected = kyc?.status === 'Rejected';
  const isReadOnly = isPending || isVerified;

  const StatusBanner = () => {
    if (isVerified) return (
      <div className={s.kycStatusBanner} style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534' }}>
        <CheckCircle2 size={18} />
        <div>
          <strong>KYC Verified</strong>
          <p>Your KYC details have been reviewed and approved by the compliance team.</p>
        </div>
      </div>
    );
    if (isPending) return (
      <div className={s.kycStatusBanner} style={{ background: '#fefce8', border: '1px solid #fde047', color: '#854d0e' }}>
        <Clock size={18} />
        <div>
          <strong>Under Review</strong>
          <p>Your KYC details have been submitted and are awaiting admin verification. You will be notified once reviewed.</p>
        </div>
      </div>
    );
    if (isRejected) return (
      <div className={s.kycStatusBanner} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
        <XCircle size={18} />
        <div>
          <strong>KYC Rejected — Please Re-submit</strong>
          {kyc?.rejectionRemarks && <p>Reason: {kyc.rejectionRemarks}</p>}
        </div>
      </div>
    );
    return (
      <div className={s.kycStatusBanner} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
        <AlertCircle size={18} />
        <div>
          <strong>KYC Not Submitted</strong>
          <p>Fill in your GST, PAN and MSME details below and click Save to submit for verification.</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          <div className={s.formGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={s.formGroup}>
                <div className={s.skeleton} style={{ height: 12, width: '40%' }} />
                <div className={s.skeleton} style={{ height: 38, width: '100%', marginTop: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>KYC Details</div>
          <div className={s.pageSubtitle}>Registration numbers for compliance verification</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isVerified && <span className={s.badgeSuccess}><ShieldCheck size={12} /> KYC Verified</span>}
          {isPending && <span className={s.badgeWarning}><Clock size={12} /> Pending Review</span>}
          {isRejected && <span className={s.badgeDanger}><XCircle size={12} /> Rejected</span>}
          {!kyc?.status || kyc.status === 'Not Submitted' ? <span className={s.badgeDefault}><AlertCircle size={12} /> Not Submitted</span> : null}
        </div>
      </div>

      <StatusBanner />

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.cardTitle}><ShieldCheck size={15} /> Registration Numbers</div>
          {isPending && (
            <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
              Editing locked — pending admin review
            </span>
          )}
          {isVerified && (
            <span style={{ fontSize: 11, color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
              Verified — contact admin to update
            </span>
          )}
        </div>

        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.label}>GST Number <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              className={`${s.input} ${errors.gstNumber ? s.inputError : ''}`}
              value={form.gstNumber}
              onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              disabled={isReadOnly}
            />
            {errors.gstNumber && <div className={s.fieldError}>{errors.gstNumber}</div>}
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>PAN Number <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              className={`${s.input} ${errors.panNumber ? s.inputError : ''}`}
              value={form.panNumber}
              onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
              placeholder="ABCDE1234F"
              maxLength={10}
              disabled={isReadOnly}
            />
            {errors.panNumber && <div className={s.fieldError}>{errors.panNumber}</div>}
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>MSME Registration <span style={{ color: '#94a3b8', fontSize: 11 }}>(optional)</span></label>
            <input
              className={s.input}
              value={form.msmeNumber}
              onChange={e => setForm(f => ({ ...f, msmeNumber: e.target.value }))}
              placeholder="UDYAM-XX-00-0000000"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {!isReadOnly && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
            {submitted && !updateKyc.isPending && (
              <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Submitted for review
              </span>
            )}
            <button className={s.btnPrimary} onClick={handleSave} disabled={updateKyc.isPending}>
              {updateKyc.isPending
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                : <><Save size={14} /> {isRejected ? 'Re-submit KYC' : 'Submit for Review'}</>
              }
            </button>
          </div>
        )}
      </div>

      {(isVerified || isPending) && (
        <div className={s.card} style={{ marginTop: 12 }}>
          <div className={s.cardHeader}>
            <div className={s.cardTitle}>Verification Timeline</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>KYC Submitted</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {kyc?.submittedAt ? new Date(kyc.submittedAt).toLocaleString('en-IN') : 'Submitted'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPending ? '#f59e0b' : '#16a34a', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {isVerified ? 'KYC Verified by Compliance Team' : 'Compliance Review — In Progress'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {isVerified && kyc?.verifiedAt
                    ? new Date(kyc.verifiedAt).toLocaleString('en-IN')
                    : isPending ? 'Awaiting compliance team review' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
