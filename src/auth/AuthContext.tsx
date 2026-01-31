import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初期値をlocalStorageから直接取得
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('auth_token') !== null
  );

  const login = useCallback(async (password: string) => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('auth_token', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};