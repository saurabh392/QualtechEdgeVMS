import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLocal2faVerified } from '../../services/authService';
import rolesConfig from '../../data/roles.json';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  moduleKey?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  moduleKey, 
  children 
}) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Verifying credentials...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Enforce logged in AND 2FA verified
  const is2faVerified = getLocal2faVerified();
  if (!user || !is2faVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize allowedRoles to support role transition (COMPLIANCE -> ONBOARDING)
  const userRole = user.role;

  // Finance Dashboard is restricted exclusively to the FINANCE role
  if (location.pathname === '/finance/dashboard' && userRole !== 'FINANCE') {
    return <Navigate to="/access-denied" replace />;
  }

  // Procurement Manager restricted routes check
  if (userRole === 'PROCUREMENT') {
    const restrictedPaths = ['/vendors/add', '/kyc/screening', '/kyc/reviews'];
    if (restrictedPaths.includes(location.pathname)) {
      return <Navigate to="/vendors" replace />;
    }
  }
  const matchesAllowedRole = allowedRoles ? allowedRoles.some(r => {
    if (r === userRole) return true;
    if (r === 'COMPLIANCE' && userRole === 'ONBOARDING') return true;
    if (r === 'ONBOARDING' && userRole === 'COMPLIANCE') return true;
    return false;
  }) : true;

  if (allowedRoles && !matchesAllowedRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // Dynamic path-to-module authorization mapping
  const getModuleForPath = (pathName: string): string | null => {
    const cleanPath = pathName.replace(/\/$/, '');
    
    if (cleanPath === '/dashboard' || 
        cleanPath === '/administrator/dashboard' || 
        cleanPath === '/procurement/dashboard' || 
        cleanPath === '/compliance/dashboard') {
      return 'Dashboard';
    }

    // Finance Dashboard is a dedicated module restricted to Finance Manager only
    if (cleanPath === '/finance/dashboard') {
      return 'Finance Dashboard';
    }

    if (cleanPath.startsWith('/vendors')) return 'Vendors';
    if (cleanPath.startsWith('/documents')) return 'Documents';
    if (cleanPath.startsWith('/kyc')) return 'Due Diligence & KYC';
    if (cleanPath.startsWith('/catalogue')) return 'Item & Service Catalogue';
    if (cleanPath.startsWith('/contracts')) return 'Contracts & SLAs';
    if (cleanPath.startsWith('/purchase-orders')) return 'Purchase Orders';
    if (cleanPath.startsWith('/invoices')) return 'Invoices';
    if (cleanPath.startsWith('/payments')) return 'Payments';
    if (cleanPath.startsWith('/reports') || cleanPath.startsWith('/mis')) return 'Reports & MIS';
    if (cleanPath.startsWith('/settings')) return 'Settings';

    // Vendor self-service paths
    if (cleanPath.startsWith('/vendor/documents')) return 'My Documents';
    if (cleanPath.startsWith('/vendor/kyc')) return 'My KYC';
    if (cleanPath.startsWith('/vendor/contracts')) return 'My Contracts';
    if (cleanPath.startsWith('/vendor/purchase-orders')) return 'My Purchase Orders';
    if (cleanPath.startsWith('/vendor/invoices')) return 'My Invoices';
    if (cleanPath.startsWith('/vendor/payments')) return 'My Payments';

    return null;
  };

  const currentModule = getModuleForPath(location.pathname);
  if (currentModule && !hasPermission(currentModule)) {
    if (currentModule === 'Dashboard' && user) {
      let rId = user.role;
      if (rId === 'COMPLIANCE') rId = 'ONBOARDING';
      const roleConfig = rolesConfig.roles.find(r => r.id === rId);
      if (roleConfig?.defaultRoute) {
        return <Navigate to={roleConfig.defaultRoute} replace />;
      }
    }
    if ((currentModule === 'Documents' || currentModule === 'My Documents') && user) {
      let rId = user.role;
      if (rId === 'COMPLIANCE') rId = 'ONBOARDING';
      const roleConfig = rolesConfig.roles.find(r => r.id === rId);
      if (roleConfig?.defaultRoute) {
        return <Navigate to={roleConfig.defaultRoute} replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/access-denied" replace />;
  }

  if (moduleKey && !hasPermission(moduleKey)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
