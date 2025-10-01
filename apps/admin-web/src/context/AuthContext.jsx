import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const googleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Verify with backend and check admin role
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
      });

      if (response.ok) {
        const backendUser = await response.json();
        
        // Check if user has admin role
        if (backendUser.role !== 'admin') {
          throw new Error('Access Denied. This account is not authorized for admin access.');
        }

        // Store admin user in localStorage
        localStorage.setItem('unieats_admin_user', JSON.stringify(backendUser));
        
        return { success: true, user: user, backendUser };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Account verification failed' }));
        throw new Error(errorData.message || 'Failed to verify admin account');
      }
    } catch (error) {
      // Sign out if there's any error
      await signOut(auth).catch(console.error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('unieats_admin_user');
      await signOut(auth);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    googleSignIn,
    logout,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}