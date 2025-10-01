import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setError: setAuthError } = useAuth();

  const handleGoogleSignIn = async () => {
    setError(null);
    setAuthError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send token to backend for verification and role check
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
          setError('Access Denied. This account is not authorized for admin access.');
          // Sign out the user since they don't have admin privileges
          await auth.signOut();
          return;
        }

        // Store admin user in localStorage
        localStorage.setItem('unieats_admin_user', JSON.stringify(backendUser));
        console.log('Admin authenticated successfully:', backendUser);
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setError(errorData.message || 'Failed to verify account. Please contact support.');
        // Sign out the user
        await auth.signOut();
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative font-sans bg-[#ffffff]">
      {/* Left - Hero Image */}
      <div
        className="relative w-[60%] overflow-hidden block"
        style={{ clipPath: "polygon(0 0, 85% 0, 70% 100%, 0% 100%)" }}
      >
        <img
          src="/login.jpg"
          onError={(e) => { e.target.src = '/logo.jpg'; }}
          alt="UniEats Admin Panel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#ffffff] p-8">
        <h1 className="text-[#ff6600] text-3xl font-bold mb-8 text-center">
          UniEats Admin Panel
        </h1>
        
        <div className="w-full max-w-[400px] bg-[#fafafa] p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
          <h2 className="text-[#ff6600] text-2xl font-semibold mb-6 text-center">
            Admin Sign In
          </h2>
          
          {error && <Alert type="error" message={error} />}
          
          <p className="text-[#666] text-sm mb-6 text-center">
            Sign in with your authorized Google account to access the admin dashboard.
          </p>
          
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#ff6600] rounded-lg font-semibold text-base transition-all duration-200 ${
              loading 
                ? 'bg-[#ff6600]/50 text-white cursor-not-allowed' 
                : 'bg-white text-[#ff6600] hover:bg-[#ff6600] hover:text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_17_40)">
                    <path d="M47.5 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.56 3.02-2.24 5.58-4.76 7.3v6.06h7.7c4.5-4.14 7.06-10.24 7.06-17.676z" fill="#4285F4"/>
                    <path d="M24.48 48c6.48 0 11.92-2.14 15.9-5.82l-7.7-6.06c-2.14 1.44-4.88 2.3-8.2 2.3-6.3 0-11.62-4.26-13.52-9.98H2.6v6.24C6.56 43.34 14.8 48 24.48 48z" fill="#34A853"/>
                    <path d="M10.96 28.44c-.5-1.44-.8-2.98-.8-4.44s.3-3 .8-4.44v-6.24H2.6A23.98 23.98 0 000 24c0 3.98.96 7.76 2.6 10.68l8.36-6.24z" fill="#FBBC05"/>
                    <path d="M24.48 9.52c3.54 0 6.68 1.22 9.16 3.62l6.84-6.84C36.4 2.14 30.96 0 24.48 0 14.8 0 6.56 4.66 2.6 13.32l8.36 6.24c1.9-5.72 7.22-9.98 13.52-9.98z" fill="#EA4335"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_17_40">
                      <rect width="48" height="48" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          
          <div className="text-center mt-6 text-xs text-[#999]">
            Only authorized admin accounts can access this panel.
          </div>
        </div>
      </div>
    </div>
  );
}