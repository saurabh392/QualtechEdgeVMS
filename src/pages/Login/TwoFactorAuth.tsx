import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import rolesConfig from '../../data/roles.json';
import styles from './TwoFactorAuth.module.css';

export const TwoFactorAuth: React.FC = () => {
  const navigate = useNavigate();
  const { verify2fa, triggerSendOtp, user } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState<string | null>(null);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Get temp user on mount and trigger initial OTP
  useEffect(() => {
    // If user is already fully authenticated with 2fa, redirect to dashboard
    if (user) {
      let rId = user.role;
      if (user.role === 'COMPLIANCE') rId = 'ONBOARDING';
      const roleConfig = rolesConfig.roles.find(r => r.id === rId);
      if (roleConfig?.defaultRoute) {
        navigate(roleConfig.defaultRoute);
      } else {
        navigate('/dashboard');
      }
      return;
    }

    const username = sessionStorage.getItem('vms_temp_username');
    if (!username) {
      navigate('/login');
      return;
    }
    setTempUsername(username);

    // Call send-otp to trigger backend seed
    triggerSendOtp(username).catch(err => console.error("Initial OTP send failed:", err));
  }, [user, navigate, triggerSendOtp]);

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    if (!tempUsername) {
      setError('Authentication context missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verify2fa(tempUsername, otpCode);
      if (result.success) {
        sessionStorage.removeItem('vms_temp_username');
        if (result.redirect) {
          navigate(result.redirect);
        } else {
          let rId = user?.role || 'ADMIN';
          if (rId === 'COMPLIANCE') rId = 'ONBOARDING';
          const roleConfig = rolesConfig.roles.find(r => r.id === rId);
          navigate(roleConfig?.defaultRoute || '/dashboard');
        }
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!tempUsername) return;
    setResending(true);
    setError(null);
    try {
      const result = await triggerSendOtp(tempUsername);
      if (result.success) {
        setTimer(300);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        alert('Verification code resent successfully.');
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('vms_temp_username');
    navigate('/login');
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
            <li><CheckCircle2 size={18} /> RBI Compliant & Audit Ready</li>
            <li><CheckCircle2 size={18} /> Multi-Tenant SaaS Platform</li>
            <li><CheckCircle2 size={18} /> AI Powered Risk Monitoring</li>
            <li><CheckCircle2 size={18} /> Maker-Checker Workflows</li>
            <li><CheckCircle2 size={18} /> Secure. Scalable. Reliable.</li>
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

      {/* Right Sidebar - 2FA Verification */}
      <div className={styles.formPanel}>
        <div className={styles.formTopActions}>
          <Button variant="ghost" size="sm" onClick={handleBackToLogin} icon={<ChevronLeft size={16} />}>Back to Login</Button>
          <Button variant="ghost" size="sm">Help & Support</Button>
        </div>

        <div className={styles.formContent}>
          <form onSubmit={handleVerify} className={styles.stepForm}>
            <div className={styles.mfaIcon}>
              <Lock size={32} color="#1d4ed8" />
            </div>
            <h2>Two-Factor Verification</h2>
            <p>Enter the 6-digit verification code sent to your registered credentials. (Default: <strong>123456</strong>)</p>

            {error && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { if (el) inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                />
              ))}
            </div>

            <p className={styles.expiryText}>Code expires in: <strong style={{ color: '#dc2626' }}>{formatTimer(timer)}</strong></p>
            
            <div className={styles.actionRow}>
              <button 
                type="button" 
                onClick={handleResendOtp} 
                className={styles.resendBtn}
                disabled={resending || timer > 270}
              >
                <RefreshCw size={14} className={resending ? styles.spin : ''} /> Resend OTP
              </button>
            </div>

            <Button fullWidth type="submit" disabled={loading || timer <= 0}>
              {loading ? 'Verifying...' : 'Verify OTP & Proceed'}
            </Button>
          </form>
        </div>

        <div className={styles.formFooter}>
          <div className={styles.securityBanner}>
            <ShieldCheck size={18} color="#1d4ed8" />
            <div>
              <strong>Secure Identity Verification Node</strong>
              <p>MFA mandated for institutional access control compliance.</p>
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
