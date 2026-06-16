import React, { useEffect, useState } from 'react';
import { User, Save, Building } from 'lucide-react';
import { useVendorProfile, useUpdateProfile } from '../../hooks/useVendorPortal';
import type { VendorProfile as VendorProfileData } from '../../services/vendorPortalService';
import s from './vendor.module.css';

export const VendorProfile: React.FC = () => {
  const { data: profile, isLoading } = useVendorProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<Partial<VendorProfileData>>({});

  useEffect(() => {
    if (profile) setForm({
      contactPerson: profile.contactPerson ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      email: profile.email ?? '',
    });
  }, [profile]);

  const handleSave = () => updateProfile.mutate(form);

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          <div className={s.formGrid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={s.formGroup}>
                <div className={s.skeleton} style={{ height: 12, width: '40%' }} />
                <div className={s.skeleton} style={{ height: 38, marginTop: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={[s.page, s.venderProfile].join(' ')}>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageTitle}>Vendor Profile</div>
          <div className={s.pageSubtitle}>Update your company and contact information</div>
        </div>
        <span className={profile?.status === 'Active' ? s.badgeSuccess : s.badgeWarning}>
          {profile?.status}
        </span>
      </div>

      {/* Read-only identity */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.cardTitle}><Building size={15} /> Company Identity</div>
        </div>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.label}>Vendor ID</label>
            <input className={s.input} value={profile?.vendorId ?? ''} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Vendor Name</label>
            <input className={s.input} value={profile?.vendorName ?? ''} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Vendor Type</label>
            <input className={s.input} value={profile?.vendorType ?? ''} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Onboarding Date</label>
            <input className={s.input} value={profile?.onboardingDate ?? ''} readOnly style={{ opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Editable contact */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.cardTitle}><User size={15} /> Contact Details</div>
        </div>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.label}>Contact Person</label>
            <input className={s.input} value={form.contactPerson ?? ''}
              onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
              placeholder="Full name" />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Email</label>
            <input className={s.input} value={form.email ?? ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="contact@company.com" />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Phone</label>
            <input className={s.input} value={form.phone ?? ''}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210" />
          </div>
          <div className={s.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={s.label}>Registered Address</label>
            <textarea className={s.textarea} value={form.address ?? ''}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Full registered address" rows={3} />
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className={s.btnPrimary} onClick={handleSave} disabled={updateProfile.isPending}>
            <Save size={14} /> {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
