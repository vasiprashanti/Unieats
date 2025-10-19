import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../config/firebase'; // your Firebase config
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!active) return;
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'vendor',
        });
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
  
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Extract user info
      const firebaseUser = userCredential.user;
      const userWithRole = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: "vendor", // Since this is vendor-web, default to vendor role
      };
  
      setUser(userWithRole);
      return { ok: true, user: userWithRole };
    } catch (e) {
      console.error("Firebase login error:", e);
      setError(e.code || "auth/wrong-password");
      return { ok: false, code: e.code };
    } finally {
      setLoading(false);
    }
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

  const value = useMemo(() => ({
    user,
    role: user?.role || initialRole,
    loading,
    initializing,
    error,
    login,
    signup,
    logout,
    setError
  }), [user, initialRole, loading, initializing, error, login, signup, logout]);

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