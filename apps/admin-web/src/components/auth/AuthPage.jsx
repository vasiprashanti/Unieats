import React, { useEffect, useMemo, useState } from "react";

// Reusable Auth Page with Carousel + Toggle Login/Signup
// Props:
// - initialMode: 'login' | 'signup'
// - roleLabel: string (e.g., 'Admin', 'Vendor', 'User')
export default function AuthPage({ initialMode = "login", roleLabel = "" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(
    () => [
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
      "https://images.unsplash.com/photo-1543352634-87393f13c33b",
    ],
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(id);
  }, [images.length]);

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
        {images.map((src, idx) => (
          <img
            key={src}
            src={`${src}?auto=format&fit=crop&w=1600&q=60`}
            alt="UniEats"
            className={
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 " +
              (idx === currentIndex ? "opacity-100 z-20" : "opacity-0")
            }
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-30" />
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

import Alert from "../Alert";
import { useAuth } from "../../context/AuthContext";

function LoginForm({ onSwitch }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ emailOrPhone: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const { login, loading, error, setError } = useAuth();

  const isEmail = (v) => /.+@.+\..+/.test(v);
  const errors = {
    emailOrPhone:
      touched.emailOrPhone && !emailOrPhone ? "Email is required" :
      touched.emailOrPhone && emailOrPhone && !isEmail(emailOrPhone) ? "Enter a valid email (name@domain.com)" : "",
    password: touched.password && !password ? "Password is required" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const friendly = (code) => {
    if (!code) return null;
    const map = {
      "auth/wrong-password": "Invalid email or password",
      "auth/user-not-found": "Invalid email or password",
      default: "Something went wrong. Please try again.",
    };
    return map[code] || map.default;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ emailOrPhone: true, password: true });
    if (hasErrors) return;
    setSubmitting(true);
    const res = await login({ email: emailOrPhone, password });
    setSubmitting(false);
  };

  const onChangeClear = (key, setter) => (val) => {
    setter(val);
    if (!touched[key]) setTouched((t) => ({ ...t, [key]: true }));
    if (error) setError(null);
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Alert type="error" message={friendly(error)} />
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
        <button type="button" className="text-sm text-[#ff6600] hover:underline">Forgot password?</button>
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
    const res = await signup({ email, password, displayName: fullName });
    setSubmitting(false);
  };

  const onChangeClear = (key, setter) => (val) => {
    setter(val);
    if (!touched[key]) setTouched((t) => ({ ...t, [key]: true }));
    if (error) setError(null);
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Alert type="error" message={friendly(error)} />
      <Field label="Full Name" placeholder="Full Name" value={fullName} onChange={onChangeClear('fullName', setFullName)} onBlur={() => setTouched((t)=>({...t, fullName: true}))} required error={errors.fullName} />
      <Field label="Email" type="email" placeholder="Email" value={email} onChange={onChangeClear('email', setEmail)} onBlur={() => setTouched((t)=>({...t, email: true}))} required error={errors.email} />
      <Field label="Phone" type="tel" placeholder="Phone number" value={phone} onChange={setPhone} />
      <Field label="Password" type="password" placeholder="Password" value={password} onChange={onChangeClear('password', setPassword)} onBlur={() => setTouched((t)=>({...t, password: true}))} required enableToggle error={errors.password} />
      <Field label="Confirm Password" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={onChangeClear('confirmPassword', setConfirmPassword)} onBlur={() => setTouched((t)=>({...t, confirmPassword: true}))} required enableToggle error={errors.confirmPassword} />
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