import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Role defaults to 'vendor' in this app
const AuthContext = createContext(null);

export function AuthProvider({ children, initialRole = 'vendor' }) {
  const [user, setUser] = useState(null); // { uid, email, displayName, role }
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false); // action-level loading
  const [initializing, setInitializing] = useState(true); // initial auth check
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 500));
        // Optionally set user if session exists
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      setUser({ uid: 'demo', email, displayName: 'Vendor', role: 'vendor' });
      setRole('vendor');
      return { ok: true };
    } catch (e) {
      setError('auth/wrong-password');
      return { ok: false, code: 'auth/wrong-password' };
    } finally { setLoading(false); }
  }, []);

  const signup = useCallback(async ({ email, password, displayName }) => {
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      setUser({ uid: 'demo', email, displayName, role: 'vendor' });
      setRole('vendor');
      return { ok: true };
    } catch (e) {
      setError('auth/email-already-in-use');
      return { ok: false, code: 'auth/email-already-in-use' };
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

  const value = useMemo(() => ({ user, role, loading, initializing, error, login, signup, logout, setRole, setError }), [user, role, loading, initializing, error, login, signup, logout]);

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