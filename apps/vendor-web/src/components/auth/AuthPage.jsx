import React, { useEffect, useMemo, useState } from "react";

export default function AuthPage({ initialMode = "login", roleLabel = "" }) {
  const [mode, setMode] = useState(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(() => ['/vendor/vendor-login.jpg'], []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(id);
  }, [images.length]);

  const toggleMode = () => setMode((m) => (m === "login" ? "signup" : "login"));

  return (
    <div className="flex h-screen overflow-hidden relative font-sans bg-[#e7ece8]">
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div
        className="relative w-[60%] overflow-hidden block"
        style={{ clipPath: "polygon(0 0, 85% 0, 70% 100%, 0% 100%)" }}
      >
        {images.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt="UniEats"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === currentIndex ? "opacity-100 z-20" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 z-30" />
        <span className="absolute z-40 text-white text-3xl font-bold drop-shadow-md text-center"
          style={{ top: "50%", left: "30%", transform: "translate(-50%, -50%)" }}
        >
          Welcome to Unieats{roleLabel ? ` — ${roleLabel}` : ""}
        </span>
      </div>

      <div className="flex-1 flex justify-center items-center bg-[#e7ece8] p-6 sm:p-8">
        <div className="w-full max-w-[420px] bg-[#fafafa] p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative max-h-[85vh] overflow-y-auto">
          <div className={`${mode === "login" ? "block animate-[slideIn_0.6s_ease_forwards]" : "hidden"}`}>
            <h2 className="text-[#ff6600] text-2xl font-semibold mb-4 text-center">Login</h2>
            <LoginForm onSwitch={toggleMode} />
          </div>
          <div className={`${mode === "signup" ? "block animate-[slideIn_0.6s_ease_forwards]" : "hidden"}`}>
            <h2 className="text-[#ff6600] text-2xl font-semibold mb-4 text-center">Register Your Business</h2>
            <VendorRegisterForm onSwitch={toggleMode} />
            <div className="text-center mt-4 text-sm text-[#555]">Need help? Contact support at <a className="text-[#ff6600] font-semibold" href="mailto:support@fooddelivery.com">support@fooddelivery.com</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, onBlur, required, enableToggle = false, error }) {
  const [visible, setVisible] = useState(false);
  const actualType = enableToggle && type === "password" ? (visible ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm text-[#333]">{label}</label>
      <div className="relative">
        <input
          className={`w-full p-3 text-base border rounded-lg outline-none transition-colors pr-16 ${error ? "border-red-400 focus:border-red-500" : "border-[#ddd] focus:border-[#ff6600]"}`}
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
        New vendor? <LinkButton onClick={onSwitch}>Register Your Business</LinkButton>
      </SwitchText>
    </form>
  );
}

import { registerVendor } from "../../api/vendor";

function VendorRegisterForm({ onSwitch }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Business details
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisineType, setCuisineType] = useState("");

  // Documents
  const [businessLicense, setBusinessLicense] = useState(null);
  const [foodSafety, setFoodSafety] = useState(null);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // We register directly via backend, no Firebase signup here
  const loading = false;

  const [error, setError] = useState(null);
  const friendly = (msg) => msg || null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!businessLicense && !foodSafety) {
      setError('Please upload at least one required document');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await registerVendor({
        token: undefined,
        data: {
          restaurantName,
          address,
          phone,
          cuisineType,
          email,
          password,
          businessLicense,
          foodSafetyCertificate: foodSafety,
        },
      });
      onSwitch();
    } catch (e2) {
      setError(e2?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeClear = (setter) => (val) => {
    setter(val);
    if (error) setError(null);
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Alert type="error" message={friendly(error)} />
      {/* Owner + contact */}
      <Field label="Owner Name" placeholder="John Doe" value={fullName} onChange={onChangeClear(setFullName)} required />
      <Field label="Phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={onChangeClear(setPhone)} />

      {/* Business details */}
      <Field label="Business Name" placeholder="My Restaurant" value={restaurantName} onChange={onChangeClear(setRestaurantName)} required />
      <Field label="Email" type="email" placeholder="vendor@restaurant.com" value={email} onChange={onChangeClear(setEmail)} required />
      <Field label="Address" placeholder="Restaurant address" value={address} onChange={onChangeClear(setAddress)} required />

      {/* Credentials */}
      <Field label="Password" type="password" placeholder="Password" value={password} onChange={onChangeClear(setPassword)} required enableToggle />
      <Field label="Confirm Password" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={onChangeClear(setConfirmPassword)} required enableToggle />

      {/* Cuisine */}
      <div className="mb-4">
        <label className="block mb-1 text-sm text-[#333]">Cuisine Type</label>
        <select
          className="w-full p-3 text-base border rounded-lg outline-none transition-colors border-[#ddd] focus:border-[#ff6600] bg-white"
          value={cuisineType}
          onChange={(e) => onChangeClear(setCuisineType)(e.target.value)}
          required
        >
          <option value="" disabled>Select cuisine</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Indian">Indian</option>
          <option value="Chinese">Chinese</option>
          <option value="American">American</option>
          <option value="Thai">Thai</option>
          <option value="Japanese">Japanese</option>
          <option value="Bakery">Bakery</option>
        </select>
      </div>

      {/* Documents */}
      <div className="mt-4">
        <p className="font-semibold text-[#333] mb-2">Required Documents</p>
        <div className="rounded-xl border border-dashed border-[#bbb] p-4 mb-4 bg-white">
          <div className="flex items-center gap-3">
            <input
              id="businessLicense"
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
            />
            <label htmlFor="businessLicense" className="cursor-pointer text-[#ff6600] font-semibold">Upload Business License</label>
          </div>
          <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</p>
          {businessLicense ? <p className="text-xs mt-1">Selected: {businessLicense.name}</p> : null}
        </div>
        <div className="rounded-xl border border-dashed border-[#bbb] p-4 bg-white">
          <div className="flex items-center gap-3">
            <input
              id="foodSafety"
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setFoodSafety(e.target.files?.[0] || null)}
            />
            <label htmlFor="foodSafety" className="cursor-pointer text-[#ff6600] font-semibold">Upload Food Safety Certificate</label>
          </div>
          <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</p>
          {foodSafety ? <p className="text-xs mt-1">Selected: {foodSafety.name}</p> : null}
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-[#333] mt-4">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        <span>
          I agree to the <a href="#" className="text-[#ff6600] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ff6600] hover:underline">Privacy Policy</a>
        </span>
      </label>

      <PrimaryButton type="submit" disabled={!acceptTerms || loading || submitting}>
        {loading || submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
            Loading...
          </span>
        ) : (
          "Create Account"
        )}
      </PrimaryButton>

      <SwitchText>
        Already have an account? <LinkButton onClick={onSwitch}>Login here</LinkButton>
      </SwitchText>
    </form>
  );
}