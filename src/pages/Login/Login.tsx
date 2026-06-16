import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, Mail, ChevronRight, Eye, EyeOff,
  AlertCircle, Zap, Building2, CheckCircle2, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import rolesConfig from '../../data/roles.json';
import styles from './Login.module.css';

/* ─── Validation helpers ─────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateDomain(v: string): string {
  if (!v.trim()) return 'Organization domain is required.';
  if (!/^[a-z0-9-]+$/i.test(v.trim())) return 'Only letters, numbers, and hyphens are allowed.';
  return '';
}
function validateUsername(v: string): string {
  if (!v.trim()) return 'Username or email is required.';
  if (v.includes('@') && !EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
  return '';
}
function validatePassword(v: string): string {
  if (!v) return 'Password is required.';
  if (v.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

/* ─── Main component ─────────────────────────────────── */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin, user } = useAuth();
  const formId = React.useId();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Step 1
  const [domain, setDomain] = useState('qualtech');
  const [domainTouched, setDomainTouched] = useState(false);
  const domainError = validateDomain(domain);

  // Step 2
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    const fallback = [
      { id: 'USR-001', name: 'Saurabh Anand',  role: 'Tenant Admin',              portal: 'Admin Portal',       username: 'admin',       password: 'admin123',       redirectUrl: '/administrator/dashboard', color: 'blue',   initials: 'SA' },
      { id: 'USR-002', name: 'Priya Sharma',    role: 'Procurement Manager',       portal: 'Procurement Portal', username: 'procurement', password: 'procurement123', redirectUrl: '/catalogue/dashboard',     color: 'green',  initials: 'PS' },
      { id: 'USR-003', name: 'Rahul Verma',     role: 'Vendor Onboarding Officer', portal: 'Onboarding Portal',  username: 'onboarding',  password: 'onboarding123',  redirectUrl: '/vendors',                 color: 'purple', initials: 'RV' },
      { id: 'USR-004', name: 'Amit Gupta',      role: 'Finance Manager',           portal: 'Finance Portal',     username: 'finance',     password: 'finance123',     redirectUrl: '/finance/dashboard',       color: 'orange', initials: 'AG' },
      { id: 'USR-005', name: 'Acme Vendor',     role: 'Vendor Portal User',        portal: 'Vendor Portal',      username: 'vendor',      password: 'vendor123',      redirectUrl: '/vendor/overview',         color: 'teal',   initials: 'AV' },
    ];
    fetch('/api/auth/demo-users')
      .then(r => r.json())
      .then(setDemoUsers)
      .catch(() => setDemoUsers(fallback));
  }, []);

  useEffect(() => {
    if (!user) return;
    let rId = user.role;
    if (user.role === 'COMPLIANCE') rId = 'ONBOARDING';
    const roleConfig = rolesConfig.roles.find(r => r.id === rId);
    if (roleConfig?.defaultRoute) {
      navigate(roleConfig.defaultRoute);
    } else {
      const map: Record<string, string> = {
        ADMIN: '/administrator/dashboard',
        PROCUREMENT: '/procurement/dashboard',
        COMPLIANCE: '/compliance/dashboard',
        ONBOARDING: '/compliance/dashboard',
        FINANCE: '/finance/dashboard',
        VENDOR: '/vendor/overview',
      };
      navigate(map[user.role] ?? '/dashboard');
    }
  }, [user, navigate]);

  // Close demo modal on Escape
  useEffect(() => {
    if (!showDemoModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDemoModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDemoModal]);

  const handleDemoCardClick = useCallback((u: any) => {
    setDomain('qualtech');
    setUsername(u.username);
    setPassword(u.password);
    setStep(2);
    setServerError(null);
    setShowDemoModal(false);
  }, []);

  const handleQuickLogin = useCallback(async (u: any) => {
    setLoading(true);
    setServerError(null);
    setShowDemoModal(false);
    try {
      const result = await demoLogin(u.username);
      if (result.success) navigate(result.redirect || u.redirectUrl);
      else setServerError(result.message || 'Demo login failed. Please try again.');
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [demoLogin, navigate]);

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainTouched(true);
    if (domainError) return;
    setServerError(null);
    setStep(2);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameTouched(true);
    setPasswordTouched(true);
    if (usernameError || passwordError) return;
    setLoading(true);
    setServerError(null);
    try {
      const result = await login(username.trim(), password);
      if (result.success && result.requires2FA) {
        sessionStorage.setItem('vms_temp_username', username.trim());
        navigate('/auth/2fa');
      } else {
        setServerError(result.message || 'Incorrect username or password. Please check and try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setServerError(null);
    setUsernameTouched(false);
    setPasswordTouched(false);
  };

  return (
    <div className={styles.loginContainer}>

      {/* ── LEFT BRANDING PANEL ── */}
      <aside className={styles.brandingPanel} aria-hidden="true">
        <div className={styles.brandHeader}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7L12 12L22 7L12 2Z"  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>Qualtech Edge VMS</span>
            <span className={styles.logoTagline}>AI-Powered Vendor Management</span>
          </div>
        </div>

        <div className={styles.brandHero}>
          <h2 className={styles.heroHeading}>
            One Platform for <span className={styles.highlight}>Every Vendor.</span><br />
            Every Risk. Every Relationship.
          </h2>
          <p className={styles.heroSub}>AI-powered vendor lifecycle management for Banks &amp; NBFCs.</p>

          <ul className={styles.featureList}>
            {['RBI Compliant', 'Multi-Tenant SaaS', 'AI Risk Monitoring', 'Maker-Checker Workflow', 'Vendor Lifecycle Management'].map(f => (
              <li key={f}><CheckCircle2 size={14} className={styles.checkIcon} aria-hidden="true" /> {f}</li>
            ))}
          </ul>

          {/* Mini dashboard preview */}
          <div className={styles.previewCard}>
            <div className={styles.previewCardTitle}>Live Platform Overview</div>
            <div className={styles.previewMetrics}>
              <div className={styles.previewMetric}>
                <div className={styles.pmLabel}>Vendors</div>
                <div className={styles.pmValue}>587</div>
                <div className={`${styles.pmSub} ${styles.pmGreen}`}>+12 this week</div>
              </div>
              <div className={styles.previewMetric}>
                <div className={styles.pmLabel}>Pending KYC</div>
                <div className={styles.pmValue}>24</div>
                <div className={`${styles.pmSub} ${styles.pmOrange}`}>Needs review</div>
              </div>
              <div className={styles.previewMetric}>
                <div className={styles.pmLabel}>Compliance</div>
                <div className={styles.pmValue}>97.4%</div>
                <div className={`${styles.pmSub} ${styles.pmBlue}`}>RBI aligned</div>
              </div>
            </div>
            {[
              { label: 'Invoice Processed', pct: 82 },
              { label: 'Contracts Active', pct: 67 },
              { label: 'Payments Cleared', pct: 94 },
            ].map(b => (
              <div key={b.label} className={styles.previewBar}>
                <span className={styles.previewBarLabel}>{b.label}</span>
                <div className={styles.previewBarTrack}>
                  <div className={styles.previewBarFill} style={{ width: `${b.pct}%` }} />
                </div>
                <span className={styles.previewBarVal}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.complianceBadges}>
          {[
            { icon: <ShieldCheck size={14} />, label: 'RBI Compliant' },
            { icon: <Lock size={14} />, label: 'ISO 27001' },
            { icon: <ShieldCheck size={14} />, label: 'SOC 2 Type II' },
          ].map(b => (
            <div key={b.label} className={styles.badge}>
              {b.icon}<span>{b.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── RIGHT FORM PANEL ── */}
      <main className={styles.formPanel}>
        <div className={styles.formContent}>

          {/* Step 1 — Domain */}
          {step === 1 && (
            <form
              id={`${formId}-step1`}
              onSubmit={handleDomainSubmit}
              className={styles.stepForm}
              noValidate
              aria-label="Organization sign-in form"
            >
              <div className={styles.formLogo} aria-hidden="true">
                <div className={styles.logoIconSm}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className={styles.formTitleGroup}>
                <h1 className={styles.formTitle}>Welcome back</h1>
                <p className={styles.formSubtitle}>Enter your organization domain to continue</p>
              </div>

              {serverError && (
                <div role="alert" className={styles.serverError}>
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className={styles.fieldGroup}>
                <label htmlFor={`${formId}-domain`} className={styles.fieldLabel}>
                  Organization Domain
                </label>
                <div className={`${styles.domainRow} ${domainTouched && domainError ? styles.inputWrapError : ''}`}>
                  <Building2 size={16} className={styles.inputLeadIcon} aria-hidden="true" />
                  <input
                    id={`${formId}-domain`}
                    type="text"
                    placeholder="e.g. hdfc, icici"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    onBlur={() => setDomainTouched(true)}
                    autoComplete="organization"
                    spellCheck={false}
                    aria-describedby={domainTouched && domainError ? `${formId}-domain-err` : undefined}
                    aria-invalid={domainTouched && !!domainError ? 'true' : undefined}
                    aria-required="true"
                  />
                  <span className={styles.domainSuffix}>.vms.qualtechedge.com</span>
                </div>
                {domainTouched && domainError && (
                  <span id={`${formId}-domain-err`} role="alert" className={styles.fieldErrorMsg}>
                    <AlertCircle size={13} aria-hidden="true" /> {domainError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
                {loading ? 'Verifying…' : 'Continue'}
                {!loading && <ChevronRight size={16} aria-hidden="true" />}
              </button>

              <div className={styles.demoTriggerRow}>
                <span>Need demo access?</span>
                <button
                  type="button"
                  className={styles.demoTriggerBtn}
                  onClick={() => setShowDemoModal(true)}
                  aria-haspopup="dialog"
                >
                  <Zap size={13} aria-hidden="true" /> Enter Demo Mode
                </button>
              </div>

              <p className={styles.encryptionNote} aria-label="Security information">
                <ShieldCheck size={13} aria-hidden="true" /> 256-bit encrypted · RBI-compliant access
              </p>
            </form>
          )}

          {/* Step 2 — Credentials */}
          {step === 2 && (
            <form
              id={`${formId}-step2`}
              onSubmit={handleCredentialsSubmit}
              className={styles.stepForm}
              noValidate
              aria-label="Sign-in credentials form"
            >
              <div className={styles.formLogo} aria-hidden="true">
                <div className={styles.logoIconSm}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12"            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className={styles.formTitleGroup}>
                <h1 className={styles.formTitle}>Sign in</h1>
                <p className={styles.formSubtitle}>
                  to&nbsp;
                  <span className={styles.domainPill}>
                    <Building2 size={11} aria-hidden="true" /> {domain}.vms.qualtechedge.com
                  </span>
                </p>
              </div>

              {serverError && (
                <div role="alert" className={styles.serverError}>
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Username */}
              <div className={styles.fieldGroup}>
                <label htmlFor={`${formId}-username`} className={styles.fieldLabel}>
                  Username or email
                </label>
                <div className={`${styles.inputWrap} ${usernameTouched && usernameError ? styles.inputWrapError : ''}`}>
                  <Mail size={16} className={styles.inputLeadIcon} aria-hidden="true" />
                  <input
                    id={`${formId}-username`}
                    type="text"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onBlur={() => setUsernameTouched(true)}
                    autoComplete="username"
                    aria-describedby={usernameTouched && usernameError ? `${formId}-username-err` : undefined}
                    aria-invalid={usernameTouched && !!usernameError ? 'true' : undefined}
                    aria-required="true"
                    spellCheck={false}
                  />
                </div>
                {usernameTouched && usernameError && (
                  <span id={`${formId}-username-err`} role="alert" className={styles.fieldErrorMsg}>
                    <AlertCircle size={13} aria-hidden="true" /> {usernameError}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor={`${formId}-password`} className={styles.fieldLabel}>Password</label>
                  <a href="#" className={styles.forgotLink} tabIndex={0}>Forgot password?</a>
                </div>
                <div className={`${styles.inputWrap} ${passwordTouched && passwordError ? styles.inputWrapError : ''}`}>
                  <Lock size={16} className={styles.inputLeadIcon} aria-hidden="true" />
                  <input
                    id={`${formId}-password`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="current-password"
                    aria-describedby={passwordTouched && passwordError ? `${formId}-password-err` : undefined}
                    aria-invalid={passwordTouched && !!passwordError ? 'true' : undefined}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className={styles.togglePasswordBtn}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {passwordTouched && passwordError && (
                  <span id={`${formId}-password-err`} role="alert" className={styles.fieldErrorMsg}>
                    <AlertCircle size={13} aria-hidden="true" /> {passwordError}
                  </span>
                )}
              </div>

              {/* Remember me */}
              <div className={styles.rememberRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <span className={styles.spinner} aria-hidden="true" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <div className={styles.divider} role="separator"><span>or</span></div>

              <button type="button" className={styles.ssoBtn}>
                SSO / SAML Login
              </button>

              <button
                type="button"
                className={styles.backLink}
                onClick={goBack}
                aria-label="Go back to organization domain step"
              >
                ← Use a different domain
              </button>

              <div className={styles.demoTriggerRow}>
                <span>Need demo access?</span>
                <button
                  type="button"
                  className={styles.demoTriggerBtn}
                  onClick={() => setShowDemoModal(true)}
                  aria-haspopup="dialog"
                >
                  <Zap size={13} aria-hidden="true" /> Enter Demo Mode
                </button>
              </div>

              <p className={styles.encryptionNote} aria-label="Security information">
                <ShieldCheck size={13} aria-hidden="true" /> 256-bit encrypted · RBI-compliant access
              </p>
            </form>
          )}
        </div>

        {/* Bottom security row */}
        <footer className={styles.securityRow} aria-label="Security certifications">
          {[
            { icon: '🔒', label: 'Secure Access' },
            { icon: '👤', label: 'Role-Based Permissions' },
            { icon: '📍', label: 'Geo Validation' },
            { icon: '⚡', label: 'Workflow Automation' },
          ].map(b => (
            <div key={b.label} className={styles.secBadge}>
              <span aria-hidden="true">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </footer>
      </main>

      {/* ── DEMO MODAL ── */}
      {showDemoModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowDemoModal(false)}
          role="presentation"
        >
          <div
            className={styles.demoModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            aria-describedby="demo-modal-desc"
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.demoModalHeader}>
              <div>
                <div className={styles.demoBadge} aria-hidden="true">
                  <span className={styles.badgePulse} /> Demo Ready Environment
                </div>
                <h2 id="demo-modal-title" className={styles.demoModalTitle}>Choose a Demo Role</h2>
                <p id="demo-modal-desc" className={styles.demoModalSub}>
                  Click a card to fill credentials, or <strong>Go →</strong> for instant sign-in.
                </p>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowDemoModal(false)}
                aria-label="Close demo modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <ul className={styles.demoUsersGrid} role="list">
              {demoUsers.map(u => (
                <li key={u.id} className={`${styles.demoCard} ${styles[u.color || 'blue']}`} role="listitem">
                  <button
                    type="button"
                    className={styles.demoCardBtn}
                    onClick={() => handleDemoCardClick(u)}
                    aria-label={`Use credentials for ${u.name}, ${u.role}`}
                  >
                    <div className={styles.demoAvatar} aria-hidden="true">{u.initials}</div>
                    <div className={styles.demoInfo}>
                      <div className={styles.demoName}>{u.name}</div>
                      <div className={styles.demoRole}>{u.role}</div>
                      <div className={styles.demoPortal}>{u.portal}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.quickLoginBtn}
                    onClick={() => handleQuickLogin(u)}
                    aria-label={`Quick login as ${u.role}`}
                  >
                    Go →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
