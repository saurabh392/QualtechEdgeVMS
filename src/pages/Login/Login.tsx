import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ChevronRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import rolesConfig from '../../data/roles.json';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin, user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [domain, setDomain] = useState('qualtech');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Demo Accounts State
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  // Fetch demo users on mount
  useEffect(() => {
    async function loadDemoUsers() {
      try {
        const res = await fetch('/api/auth/demo-users');
        const data = await res.json();
        setDemoUsers(data);
      } catch (err) {
        console.error("Failed to load demo users from backend:", err);
        // Fallback demo users list
        setDemoUsers([
          {
            "id": "USR-001",
            "name": "Saurabh Anand",
            "role": "Tenant Admin",
            "portal": "Admin Portal",
            "username": "admin",
            "password": "admin123",
            "redirectUrl": "/administrator/dashboard",
            "color": "blue",
            "initials": "SA"
          },
          {
            "id": "USR-002",
            "name": "Priya Sharma",
            "role": "Procurement Manager",
            "portal": "Procurement Portal",
            "username": "procurement",
            "password": "procurement123",
            "redirectUrl": "/catalogue/dashboard",
            "color": "green",
            "initials": "PS"
          },
          {
            "id": "USR-003",
            "name": "Rahul Verma",
            "role": "Vendor Onboarding Officer",
            "portal": "Onboarding Portal",
            "username": "onboarding",
            "password": "onboarding123",
            "redirectUrl": "/vendors",
            "color": "purple",
            "initials": "RV"
          },
          {
            "id": "USR-004",
            "name": "Amit Gupta",
            "role": "Finance Manager",
            "portal": "Finance Portal",
            "username": "finance",
            "password": "finance123",
            "redirectUrl": "/finance/dashboard",
            "color": "orange",
            "initials": "AG"
          },
          {
            "id": "USR-005",
            "name": "Acme Vendor",
            "role": "Vendor Portal User",
            "portal": "Vendor Portal",
            "username": "vendor",
            "password": "vendor123",
            "redirectUrl": "/vendor/overview",
            "color": "teal",
            "initials": "AV"
          }
        ]);
      }
    }
    loadDemoUsers();
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      let rId = user.role;
      if (user.role === 'COMPLIANCE') rId = 'ONBOARDING';
      const roleConfig = rolesConfig.roles.find(r => r.id === rId);
      if (roleConfig?.defaultRoute) {
        navigate(roleConfig.defaultRoute);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleDemoCardClick = (demoUser: any) => {
    setDomain('qualtech');
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setStep(2);
    setError(null);
  };

  const handleQuickLogin = async (demoUser: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await demoLogin(demoUser.username);
      if (result.success) {
        navigate(result.redirect || demoUser.redirectUrl);
      } else {
        setError(result.message || 'Demo login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during demo login');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError('Please enter your organization domain');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login(username.trim(), password);
      if (result.success && result.requires2FA) {
        // Store temp username context for 2FA verification route
        sessionStorage.setItem('vms_temp_username', username.trim());
        navigate('/auth/2fa');
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const renderDemoSection = () => {
    if (demoUsers.length === 0) return null;
    return (
      <div className={styles.demoSection}>
        <div className={styles.demoDivider}>
          <span>or continue as demo</span>
        </div>
        
        <div className={styles.demoHeader}>
          <div className={styles.demoBadge}>
            <span className={styles.badgePulse}></span>
            Demo Ready User
          </div>
          <span className={styles.demoCount}>{demoUsers.length} Roles Available</span>
        </div>
        
        <p className={styles.demoNote}>
          Select a role below to explore the platform. Click card to fill credentials, or click <strong>Go →</strong> for instant entry.
        </p>

        <div className={styles.demoUsersGrid}>
          {demoUsers.map(u => (
            <div 
              key={u.id} 
              className={`${styles.demoCard} ${styles[u.color || 'blue']}`} 
              onClick={() => handleDemoCardClick(u)}
              title="Click to populate credentials"
            >
              <div className={styles.demoAvatar}>
                {u.initials}
              </div>
              <div className={styles.demoInfo}>
                <div className={styles.demoName}>{u.name}</div>
                <div className={styles.demoRole}>{u.role}</div>
                <div className={styles.demoPortal}>{u.portal}</div>
              </div>
              <button 
                type="button"
                className={styles.quickLoginBtn} 
                onClick={(e) => { e.stopPropagation(); handleQuickLogin(u); }}
                title={`Quick login as ${u.role}`}
              >
                Go →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Sidebar - Branding */}
      <div className={styles.brandingPanel}>
        <div className={styles.brandHeader}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <h1>Qualtech Edge VMS</h1>
            <p>AI-Powered Vendor Management System</p>
          </div>
        </div>

        <div className={styles.brandHero}>
          <h2>One Platform for <span className={styles.highlight}>Every Vendor.</span><br/>Every Risk. Every Relationship.</h2>
          <p>AI-powered vendor lifecycle management platform for Banks & NBFCs.</p>
          
          <ul className={styles.featureList}>
            <li><CheckCircle2 size={18} /> RBI Compliant</li>
            <li><CheckCircle2 size={18} /> Multi-Tenant SaaS Platform</li>
            <li><CheckCircle2 size={18} /> AI-Powered Risk Monitoring</li>
            <li><CheckCircle2 size={18} /> Maker Checker Workflow</li>
            <li><CheckCircle2 size={18} /> Vendor Lifecycle Management</li>
          </ul>
        </div>

        <div className={styles.complianceBadges}>
          <div className={styles.badge}>
            <ShieldCheck size={24} />
            <span>RBI<br/>Compliant</span>
          </div>
          <div className={styles.badge}>
            <Lock size={24} />
            <span>ISO<br/>27001</span>
          </div>
          <div className={styles.badge}>
            <ShieldCheck size={24} />
            <span>SOC 2<br/>Type II</span>
          </div>
        </div>

        <div className={styles.copyright}>
          © 2026 Qualtech Edge. All rights reserved.
        </div>
      </div>

      {/* Right Sidebar - Forms */}
      <div className={styles.formPanel}>
        <div className={styles.formTopActions}>
          <select className={styles.languageSelect} aria-label="Select Language">
            <option>English</option>
          </select>
          <Button variant="ghost" size="sm">Help & Support</Button>
        </div>

        <div className={styles.formContent}>
          {step === 1 && (
            <form onSubmit={handleDomainSubmit} className={styles.stepForm}>
              <h2>Select Your Organization</h2>
              <p>Enter your organization domain or code to continue to VMS.</p>
              
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: 'var(--border-radius-md)', marginBottom: '16px', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.domainInput}>
                <Input 
                  placeholder="Example: hdfc, icici" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                  fullWidth
                />
                <span className={styles.domainSuffix}>.vms.qualtechedge.com</span>
              </div>
              
              <Button fullWidth type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'} <ChevronRight size={18} />
              </Button>

              {renderDemoSection()}
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCredentialsSubmit} className={styles.stepForm}>
              <h2>Welcome Back!</h2>
              <p>Sign in to continue to your account</p>
              
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: 'var(--border-radius-md)', marginBottom: '16px', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.inputs}>
                <Input 
                  label="Email / Username" 
                  placeholder="Enter your username" 
                  leftIcon={<Mail size={18} />} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input 
                  label="Password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  leftIcon={<Lock size={18} />} 
                  rightIcon={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.formMeta}>
                <label className={styles.checkbox}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  /> Remember Me
                </label>
                <a href="#" className={styles.forgotPass}>Forgot Password?</a>
              </div>
              
              <Button fullWidth type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className={styles.divider}>or continue with</div>
              
              <div className={styles.ssoButtons}>
                <Button variant="outline" fullWidth type="button">SSO / SAML Login</Button>
              </div>

              {renderDemoSection()}
            </form>
          )}
        </div>

        <div className={styles.formFooter}>
          <div className={styles.securityBanner}>
            <ShieldCheck size={18} color="#1d4ed8" />
            <div>
              <strong>Your data is protected with enterprise-grade security</strong>
              <p>MFA enabled • 256-bit encryption • Secure & Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple visual helper component for checkmark list
const CheckCircle2: React.FC<{ size: number }> = ({ size }) => (
  <CheckCircle size={size} />
);
const CheckCircle: React.FC<{ size: number }> = ({ size }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', color: '#60a5fa' }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </span>
);
