import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  sendOtp,
  verifyOtp,
  logoutUser, 
  validateSession, 
  getLocalUser, 
  getLocalToken, 
  getLocal2faVerified,
  setLocalSession, 
  clearLocalSession 
} from '../services/authService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  verify2fa: (username: string, otp: string) => Promise<{ success: boolean; redirect?: string; message?: string }>;
  triggerSendOtp: (username: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasPermission: (moduleName: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      const savedToken = getLocalToken();
      const savedUser = getLocalUser();
      const verified2fa = getLocal2faVerified();

      if (savedToken && savedUser && verified2fa) {
        setToken(savedToken);
        setUser(savedUser);
        try {
          // Verify session on backend
          const data = await validateSession();
          if (data.success) {
            setUser(data.user);
            setLocalSession(data.user, savedToken, data.user.role);
          } else {
            handleLogoutCleanly();
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          const err = error as any;
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            handleLogoutCleanly();
          }
        }
      } else {
        handleLogoutCleanly();
      }
      setLoading(false);
    }

    initSession();
  }, []);

  const handleLogoutCleanly = () => {
    setUser(null);
    setToken(null);
    clearLocalSession();
  };

  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password);
      if (data.success && data.requires2FA) {
        return { success: true, requires2FA: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: errMsg };
    }
  };

  const triggerSendOtp = async (username: string) => {
    try {
      const data = await sendOtp(username);
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: 'Failed to send OTP' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to send OTP';
      return { success: false, message: errMsg };
    }
  };

  const verify2fa = async (username: string, otp: string) => {
    try {
      const data = await verifyOtp(username, otp);
      if (data.success && data.authenticated) {
        setUser(data.user);
        setToken(data.token);
        setLocalSession(data.user, data.token, data.role);
        return { success: true, redirect: data.redirect };
      }
      return { success: false, message: 'Invalid OTP' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Invalid OTP';
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Server logout request failed, clearing locally:", e);
    } finally {
      handleLogoutCleanly();
    }
  };

  const hasPermission = (moduleName: string): boolean => {
    if (!user) return false;
    const role = user.role;

    if (role === 'ADMIN') {
      return moduleName !== 'Vendor Portal';
    }

    if (role === 'VENDOR') {
      return moduleName === 'Vendor Portal';
    }

    return false;
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      verify2fa, 
      triggerSendOtp, 
      logout, 
      hasPermission, 
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
