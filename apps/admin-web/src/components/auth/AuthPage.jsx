import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert";
import { useAuth } from "../../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";

// Reusable Auth Page with Carousel + Toggle Login/Signup
// Props:
// - initialMode: 'login' | 'signup'
// - roleLabel: string (e.g., 'Admin', 'Vendor', 'User')
export default function AuthPage({ initialMode = "login", roleLabel = "" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  // Single static hero image for login/signup (use local public asset to avoid external loading issues)
  const heroImage = "/login.jpg"; // TODO: replace with '/pancakes.jpg' once added
  const [imageSrc, setImageSrc] = useState(heroImage);

  const toggleMode = () => setMode((m) => (m === "login" ? "signup" : "login"));

  return (
    <div className="flex h-screen overflow-hidden relative font-sans bg-[#ffffff]">
      {/* Inline keyframes for slide-in animation */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Left - Carousel */}
      <div
        className="relative w-[60%] overflow-hidden block"
        style={{ clipPath: "polygon(0 0, 85% 0, 70% 100%, 0% 100%)" }}
      >
        <img
          src={imageSrc}
          onError={() => setImageSrc('/logo.jpg')}
          alt="UniEats"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Right - Forms */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#ffffff] p-8">
        <h1 className="text-[#ff6600] text-3xl font-bold mb-8 text-center">
          Welcome to Unieats{roleLabel ? ` — ${roleLabel}` : ""}
        </h1>
        <div className="w-full max-w-[400px] bg-[#fafafa] p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className={`${mode === "login" ? "block animate-[slideIn_0.6s_ease_forwards]" : "hidden"}`}>
            <h2 className="text-[#ff6600] text-2xl font-semibold mb-4 text-center">Login</h2>
            <LoginForm onSwitch={toggleMode} />
          </div>
          <div className={`${mode === "signup" ? "block animate-[slideIn_0.6s_ease_forwards]" : "hidden"}`}>
            <h2 className="text-[#ff6600] text-2xl font-semibold mb-4 text-center">Sign Up</h2>
            <SignupForm onSwitch={toggleMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, onBlur, required, enableToggle = false, error }) {
  // Local visibility state only when toggle is enabled on password fields
  const [visible, setVisible] = useState(false);
  const actualType = enableToggle && type === "password" ? (visible ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm text-[#333]">{label}</label>
      <div className="relative">
        <input
          className={`w-full p-3 text-base border rounded-lg outline-none transition-colors pr-16 ${error ? "border-red-400 focus:border-red-500" : "border-[#ddd] focus:border-[#ff6600]"} text-[#111] placeholder:text-[#9aa0a6] bg-white`}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        {enableToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#555] hover:text-[#333]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${label}-error`} className="mt-1 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ children, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full py-3 rounded-lg text-base cursor-pointer mt-2 transition-colors font-bold ${disabled ? "bg-[#ff6600]/50 text-white cursor-not-allowed" : "bg-[#ff6600] text-white hover:bg-[#e65500]"}`}
    >
      {children}
    </button>
  );
}

function SwitchText({ children }) {
  return <div className="text-center mt-4 text-sm text-[#555]">{children}</div>;
}

function LinkButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="text-[#ff6600] font-semibold">
      {children}
    </button>
  );
}

function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ emailOrPhone: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const { login, loading, error, setError } = useAuth();

  // Validation logic
  const errors = {
    emailOrPhone: touched.emailOrPhone && !emailOrPhone ? "Email is required" : "",
    password: touched.password && !password ? "Password is required" : "",
  };

  const hasErrors = Object.values(errors).some(error => error);

  // Helper function to clear errors on input change
  const onChangeClear = (field, setter) => (val) => {
    setter(val);
    if (error) setError(null);
  };

  // Helper function to make error messages user-friendly
  const friendly = (errorMsg) => {
    if (!errorMsg) return "";
    // Add your error message formatting logic here
    return errorMsg;
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google sign-in successful:", user);

      // Get Firebase ID token
      let backendUser = null;
      try {
        const idToken = await user.getIdToken();
        console.log("token--",idToken);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
        });
        if (res.ok) {
          backendUser = await res.json();
          // Store backend user in localStorage
          localStorage.setItem('unieats_admin_user', JSON.stringify(backendUser));
          console.log('Backend user data (Google sign-in):', backendUser);
        } else {
          console.error('Backend getMe error (Google sign-in):', res.status);
        }
      } catch (err) {
        console.error('Backend getMe error (Google sign-in):', err);
      }

      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setSubmitting(false);
    }
  };

  // Form submission handler
  const onSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields as touched to show validation errors
    setTouched({ emailOrPhone: true, password: true });
    if (hasErrors || !emailOrPhone || !password) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Pass as object for destructuring in AuthContext
      const result = await login({ email: emailOrPhone, password });
      if (result && result.backendUser) {
        // Store backend user in localStorage
        localStorage.setItem('unieats_admin_user', JSON.stringify(result.backendUser));
        console.log('Backend user data (from AuthPage):', result.backendUser);
      }
      navigate('/admin/dashboard'); // or wherever you want to redirect after login
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="block">
      {error && <Alert type="error" message={friendly(error)} />}
      
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 py-2 mb-4 border border-[#ff6600] rounded-lg bg-white text-[#ff6600] font-semibold hover:bg-[#ff6600] hover:text-white transition-colors"
        disabled={loading || submitting}
      >
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
      </button>
      
      <Field
        label="Email"
        placeholder="Email"
        value={emailOrPhone}
        onChange={onChangeClear('emailOrPhone', setEmailOrPhone)}
        onBlur={() => setTouched((t) => ({ ...t, emailOrPhone: true }))}
        required
        error={errors.emailOrPhone}
      />
      
      <Field
        label="Password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={onChangeClear('password', setPassword)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        required
        enableToggle
        error={errors.password}
      />
      
      <div className="text-right -mt-2 mb-2">
        <button type="button" className="text-sm text-[#ff6600] hover:underline">
          Forgot password?
        </button>
      </div>
      
      <PrimaryButton type="submit" disabled={loading || submitting || hasErrors}>
        {loading || submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
            Loading...
          </span>
        ) : (
          "Login"
        )}
      </PrimaryButton>
      
      <SwitchText>
        Never ordered before? <LinkButton onClick={onSwitch}>Sign up here</LinkButton>
      </SwitchText>
    </form>
  );
}

function SignupForm({ onSwitch }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false });
  const [submitting, setSubmitting] = useState(false);

  const { signup, loading, error, setError } = useAuth();

  const isEmail = (v) => /.+@.+\..+/.test(v);
  const errors = {
    fullName: touched.fullName && !fullName ? "Full name is required" : "",
    email:
      touched.email && !email ? "Email is required" :
      touched.email && email && !isEmail(email) ? "Enter a valid email (name@domain.com)" : "",
    password:
      touched.password && !password ? "Password is required" :
      touched.password && password && password.length < 6 ? "Password must be at least 6 characters" : "",
    confirmPassword:
      touched.confirmPassword && !confirmPassword ? "Confirm your password" :
      touched.confirmPassword && confirmPassword && confirmPassword !== password ? "Passwords do not match" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const friendly = (code) => {
    if (!code) return null;
    const map = {
      "auth/email-already-in-use": "This email is already registered",
      default: "Something went wrong. Please try again.",
    };
    return map[code] || map.default;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (hasErrors) return;
    setSubmitting(true);
    try {
      const res = await signup({ email, password, displayName: fullName });
      navigate('/admin/dashboard'); // or wherever you want to redirect after signup
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeClear = (key, setter) => (val) => {
    setter(val);
    if (!touched[key]) setTouched((t) => ({ ...t, [key]: true }));
    if (error) setError(null);
  };

  return (
    <form onSubmit={onSubmit} className="block">
      {error && <Alert type="error" message={friendly(error)} />}
      <Field 
        label="Full Name" 
        placeholder="Full Name" 
        value={fullName} 
        onChange={onChangeClear('fullName', setFullName)} 
        onBlur={() => setTouched((t) => ({ ...t, fullName: true }))} 
        required 
        error={errors.fullName} 
      />
      <Field 
        label="Email" 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={val => { setEmail(val); if (!touched.email) setTouched(t => ({ ...t, email: true })); if (error) setError(null); }} 
        onBlur={() => setTouched((t) => ({ ...t, email: true }))} 
        required 
        error={errors.email} 
      />
      <Field 
        label="Phone" 
        type="tel" 
        placeholder="Phone number" 
        value={phone} 
        onChange={setPhone} 
      />
      <Field 
        label="Password" 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={onChangeClear('password', setPassword)} 
        onBlur={() => setTouched((t) => ({ ...t, password: true }))} 
        required 
        enableToggle 
        error={errors.password} 
      />
      <Field 
        label="Confirm Password" 
        type="password" 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        onChange={onChangeClear('confirmPassword', setConfirmPassword)} 
        onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))} 
        required 
        enableToggle 
        error={errors.confirmPassword} 
      />
      <PrimaryButton type="submit" disabled={loading || submitting || hasErrors}>
        {loading || submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
            Loading...
          </span>
        ) : (
          "Sign Up"
        )}
      </PrimaryButton>
      <SwitchText>
        Already have an account? <LinkButton onClick={onSwitch}>Login here</LinkButton>
      </SwitchText>
    </form>
  );
}