import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase'; // adjust path as needed


const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      return { success: true, user: userCredential.user, backendUser };
    } catch (error) {
      setError(error.code);
      return { success: false, error: error.code };
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, displayName }) => {
    try {
      setLoading(true);
      setError(null);
      // Create user account in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      // POST user info to backend auth/register route
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: displayName,
            email,
            firebaseUid: userCredential.user.uid
          }),
        });
      } catch (err) {
        // Optionally handle backend error
        console.error('Backend signup error:', err);
      }
      return { success: true, user: userCredential.user };
    } catch (error) {
      setError(error.code);
      return { success: false, error: error.code };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      setError(error.code);
      return { success: false, error: error.code };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      setError(error.code);
      return { success: false, error: error.code };
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
    login,
    signup,
    logout,
    resetPassword,
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