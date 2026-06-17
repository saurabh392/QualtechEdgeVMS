import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { useAuth } from '../../context/AuthContext';
import styles from './AccessDenied.module.css';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user?.role === 'VENDOR') {
      navigate('/vendor/overview');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.iconWrapper}>
          <ShieldAlert size={48} className={styles.icon} />
        </div>
        
        <h1 className={styles.title}>403 - Access Denied</h1>
        <p className={styles.subtitle}>
          You do not have the required permissions to view this resource. 
          Please contact your administrator if you believe this is an error.
        </p>

        <div className={styles.detailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.label}>User:</span>
            <span className={styles.value}>{user?.fullName || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Assigned Role:</span>
            <span className={styles.value} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              {user?.role || 'N/A'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Requested Resource:</span>
            <span className={styles.value} style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {window.location.pathname}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button 
            variant="outline" 
            onClick={handleGoBack} 
            icon={<ArrowLeft size={16} />}
          >
            Go Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGoHome} 
            icon={<Home size={16} />}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
