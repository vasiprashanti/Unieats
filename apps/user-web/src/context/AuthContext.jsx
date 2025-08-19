import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Role defaults to 'user' in this app
const AuthContext = createContext(null);

export function AuthProvider({ children, initialRole = 'user' }) {
  const [user, setUser] = useState(null); // { uid, email, displayName, role }
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {};
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      setUser({ uid: 'demo', email, displayName: 'User', role: 'user' });
      setRole('user');
      return true;
    } catch (e) {
      setError('Failed to login');
      return false;
    } finally { setLoading(false); }
  }, []);

  const signup = useCallback(async ({ email, password, displayName }) => {
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      setUser({ uid: 'demo', email, displayName, role: 'user' });
      setRole('user');
      return true;
    } catch (e) {
      setError('Failed to signup');
      return false;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 200));
      setUser(null);
      setRole(null);
    } catch (e) {
      setError('Failed to logout');
    } finally { setLoading(false); }
  }, []);

  const value = useMemo(() => ({ user, role, loading, error, login, signup, logout, setRole }), [user, role, loading, error, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}