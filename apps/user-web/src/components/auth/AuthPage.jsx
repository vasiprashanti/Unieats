import React, { useEffect, useMemo, useState, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";

// --- Mock AuthContext to resolve dependency errors ---
// In your actual app, you will remove this and import your real AuthContext.
const MockAuthContext = createContext(null);
const MockAuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const login = async () => { console.log("Mock login"); return { ok: true, user: { getIdToken: async () => 'mock-token' } }; };
    const signup = async () => { console.log("Mock signup"); return { ok: true, user: { uid: 'mock-uid' } }; };
    const value = { login, signup, loading: false, error, setError };
    return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};
const useAuth = () => {
    const ctx = useContext(MockAuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
// --- End Mock AuthContext ---


// --- Placeholder Components to resolve import errors ---
const Navbar = () => <header className="bg-white p-4 shadow-md sticky top-0 z-50 text-center font-bold">Navbar</header>;
const MobileHeader = () => null; // Assuming this is for mobile-specific header, can be empty for now.
const Alert = ({ type, message }) => {
    if (!message) return null;
    const colors = {
        error: "bg-red-100 border-red-400 text-red-700",
        success: "bg-green-100 border-green-400 text-green-700",
    };
    return (
        <div className={`border px-4 py-3 rounded relative mb-4 ${colors[type] || "bg-gray-100 border-gray-400 text-gray-700"}`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
};
// --- End Placeholder Components ---


// --- Main AuthPage Component (From Raunak's UI) ---
function AuthPageComponent({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const toggleMode = () => setMode((m) => (m === "login" ? "signup" : "login"));

  return (
    <div className="min-h-screen w-full relative font-sans bg-white overflow-x-hidden">
      <Navbar />
      <MobileHeader />
      
      {/* Background Styling from Raunak's version */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-gray-50" style={{
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '22px 22px'
      }} />
      <div className="absolute w-80 h-80 bg-orange-500 rounded-full filter blur-[100px] opacity-25 -top-24 -left-24 z-0" />
      <div className="absolute w-96 h-96 bg-orange-400 rounded-full filter blur-[100px] opacity-25 -bottom-36 -right-36 z-0" />
      
      {/* Container from Raunak's version */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-5 pt-20 md:pt-20">
        <div className="bg-white/92 backdrop-blur-md rounded-2xl shadow-xl border border-black/5 p-6 w-full max-w-md flex flex-col items-center justify-center"
             style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
          <h1 className="text-[22px] font-bold text-center mb-1.5">
            {mode === "login" ? "Welcome Back!" : "Create Account"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-7">
            {mode === "login" 
              ? "Sign in to continue enjoying your meals" 
              : "Join us to start ordering delicious food"
            }
          </p>
          
          <div className="w-full">
            {mode === "login" ? (
              <LoginForm onSwitch={toggleMode} />
            ) : (
              <SignupForm onSwitch={toggleMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Final export wrapped with the Mock Provider
export default function AuthPage({ initialMode = "login" }) {
    return (
        <MockAuthProvider>
            <AuthPageComponent initialMode={initialMode} />
        </MockAuthProvider>
    );
}


// --- LoginForm (Merged Logic) ---
function LoginForm({ onSwitch }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ emailOrPhone: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const isEmail = (v) => /.+@.+\..+/.test(v);
  const errors = {
    emailOrPhone: touched.emailOrPhone && !emailOrPhone ? "Email is required" :
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

  // onSubmit function with Srikar's backend verification logic
  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ emailOrPhone: true, password: true });
    if (hasErrors) return;
    setSubmitting(true);
    try {
      const res = await login({ email: emailOrPhone, password });
      if (res && res.user) {
        const idToken = await res.user.getIdToken();
        const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await verifyRes.json();
        if (!verifyRes.ok) {
           throw new Error(data.message || "Verification failed");
        }
        console.log("Verification successful:", data.user);
        navigate('/restaurants');
      } else {
        throw new Error("Login failed, user not returned.");
      }
    } catch (err) {
      console.error("Error during login/verification:", err);
      setError(err.code || 'auth/unknown-error');
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
      <Alert type="error" message={friendly(error)} />
      <Field
        label="Email"
        value={emailOrPhone}
        onChange={onChangeClear('emailOrPhone', setEmailOrPhone)}
        onBlur={() => setTouched((t) => ({ ...t, emailOrPhone: true }))}
        required
        error={errors.emailOrPhone}
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={onChangeClear('password', setPassword)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        required
        enableToggle
        error={errors.password}
      />
      <a href="#" className="block text-center text-[13px] text-gray-500 hover:text-orange-400 transition-colors my-1.5 mb-5">
        Forgot password?
      </a>
      <PrimaryButton type="submit" disabled={loading || submitting || hasErrors}>
        {loading || submitting ? "Loading..." : "Login"}
      </PrimaryButton>
      <SwitchText>
        New here? <LinkButton onClick={onSwitch}>Create an account</LinkButton>
      </SwitchText>
    </form>
  );
}

// --- SignupForm (Raunak's multi-step with Srikar's logic) ---
function SignupForm({ onSwitch }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
      emailOrPhone: "", firstName: "", lastName: "", yearOfStudy: "", password: "", confirmPassword: "",
      accommodation: "", hostelBlock: "", hostelRoom: "", addressLine1: "", landmark: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup, loading, error, setError } = useAuth();

  const friendly = (code) => {
    if (!code) return null;
    const map = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/password-mismatch": "Passwords do not match",
      default: "Something went wrong. Please try again.",
    };
    return map[code] || map.default;
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };
  
  const nextStep = () => {
    const { emailOrPhone, firstName, lastName, yearOfStudy, password } = formData;
    if (!emailOrPhone || !firstName || !lastName || !yearOfStudy || !password) {
      setError("Please fill in all required fields");
      return;
    }
    setCurrentStep(2);
    setError(null);
  };

  const prevStep = () => setCurrentStep(1);

  // onSubmit with Srikar's backend registration logic
  const onSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword, accommodation, hostelBlock, hostelRoom, addressLine1, landmark, firstName, lastName, emailOrPhone, yearOfStudy } = formData;
    if (password !== confirmPassword) {
      setError("auth/password-mismatch");
      return;
    }
    setSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const email = emailOrPhone.includes("@") ? emailOrPhone : "";
      
      const res = await signup({ email, password, displayName: fullName });
      if (!res?.user?.uid) throw new Error("Firebase UID not found after signup.");

      const apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phone: !email ? emailOrPhone : "",
          firebaseUid: res.user.uid,
          yearOfStudy,
          accommodation,
          address: accommodation === "hosteller" 
            ? { type: "hostel", block: hostelBlock, room: hostelRoom }
            : { type: "non-hostel", line1: addressLine1, landmark }
        }),
      });
      
      const data = await apiRes.json();
      if (!apiRes.ok) throw new Error(data.message || "Backend registration failed");
      
      alert("Signed Up Successfully! Please Login Now.");
      onSwitch(); // Switch to login mode
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.code || err.message || "auth/unknown-error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Alert type="error" message={friendly(error) || (error && typeof error === 'string' ? error : null)} />
      {currentStep === 1 && (
        <div>
          <Field label="Email / Phone" value={formData.emailOrPhone} onChange={handleChange("emailOrPhone")} required />
          <Field label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
          <Field label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
          <SelectField label="Year of Study" value={formData.yearOfStudy} onChange={handleChange("yearOfStudy")} required options={[{value: "", label: "Select Year"}, {value: "1st Year", label: "1st Year"}, { value: "2nd Year", label: "2nd Year" }, { value: "3rd Year", label: "3rd Year" }, { value: "4th Year", label: "4th Year" }]} />
          <Field label="Password" type="password" value={formData.password} onChange={handleChange("password")} required enableToggle />
          <PrimaryButton type="button" onClick={nextStep}>Next</PrimaryButton>
          <SwitchText>Already have an account? <LinkButton onClick={onSwitch}>Sign in here</LinkButton></SwitchText>
        </div>
      )}
      {currentStep === 2 && (
        <div>
          <SelectField label="Accommodation" value={formData.accommodation} onChange={handleChange("accommodation")} required options={[{value: "", label: "Select"}, {value: "hosteller", label: "Hosteller"}, {value: "non-hosteller", label: "Non-Hosteller"}]} />
          {formData.accommodation === "hosteller" && (
            <>
              <Field label="Hostel Block" value={formData.hostelBlock} onChange={handleChange("hostelBlock")} required />
              <Field label="Hostel Room" value={formData.hostelRoom} onChange={handleChange("hostelRoom")} required />
            </>
          )}
          {formData.accommodation === "non-hosteller" && (
            <>
              <Field label="Address Line 1" value={formData.addressLine1} onChange={handleChange("addressLine1")} required />
              <Field label="Landmark" value={formData.landmark} onChange={handleChange("landmark")} required />
            </>
          )}
          <Field label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} required enableToggle />
          <div className="flex gap-3">
            <button type="button" onClick={prevStep} className="flex-1 py-3.5 rounded-xl text-[15px] font-bold border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors">Back</button>
            <div className="flex-1"><PrimaryButton type="submit" disabled={loading || submitting}>{loading || submitting ? "Loading..." : "Sign Up"}</PrimaryButton></div>
          </div>
          <SwitchText>Already have an account? <LinkButton onClick={onSwitch}>Sign in here</LinkButton></SwitchText>
        </div>
      )}
    </form>
  );
}


// --- UI Helper Components (From Raunak's UI) ---
function Field({ label, type = "text", value, onChange, onBlur, required, enableToggle = false, error }) {
    const [visible, setVisible] = useState(false);
    const actualType = enableToggle && type === "password" ? (visible ? "text" : "password") : type;

    return (
        <div className="relative mb-5 w-full">
            <input
                className={`w-full px-3 py-3.5 text-[15px] bg-white border rounded-xl transition-all duration-200 outline-none ${error ? "border-red-400 focus:border-red-500" : "border-black/8 focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(255,106,0,0.12)]"}`}
                type={actualType}
                placeholder=" "
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                required={required}
                aria-invalid={!!error}
            />
            <label className={`absolute left-3 text-[14px] text-gray-500 pointer-events-none transition-all duration-200 ${value ? "top-1.5 left-2.5 text-[11px] font-semibold text-orange-500 bg-white px-1" : "top-1/2 transform -translate-y-1/2"}`}>
                {label}
            </label>
            {enableToggle && type === "password" && (
                <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700">
                    {visible ? "Hide" : "Show"}
                </button>
            )}
            {error ? <div className="mt-1.5 text-xs text-red-600">{error}</div> : null}
        </div>
    );
}

function SelectField({ label, value, onChange, options, error, required }) {
    return (
        <div className="relative mb-5 w-full">
            <select
                className={`w-full px-3 py-3.5 text-[15px] bg-white border rounded-xl transition-all duration-200 outline-none appearance-none ${error ? "border-red-400 focus:border-red-500" : "border-black/8 focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(255,106,0,0.12)]"}`}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                required={required}
            >
                {options?.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.value === ""}>
                        {option.label}
                    </option>
                ))}
            </select>
            <label className={`absolute left-3 text-[14px] text-gray-500 pointer-events-none transition-all duration-200 ${value ? "top-1.5 left-2.5 text-[11px] font-semibold text-orange-500 bg-white px-1" : "top-1/2 transform -translate-y-1/2"}`}>
                {label}
            </label>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {error ? <div className="mt-1.5 text-xs text-red-600">{error}</div> : null}
        </div>
    );
}

function PrimaryButton({ children, type = "button", disabled = false }) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all duration-100 ${disabled ? "bg-gradient-to-r from-orange-500/50 to-orange-400/50 text-white cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"}`}
            style={{ boxShadow: disabled ? 'none' : '0 8px 20px rgba(255,106,0,0.15)' }}
        >
            {children}
        </button>
    );
}

function SwitchText({ children }) {
  return <div className="text-center mt-[18px] text-[13px] text-gray-500">{children}</div>;
}

function LinkButton({ onClick, children }) {
  return <button type="button" onClick={onClick} className="text-gray-500 font-semibold hover:text-orange-400 transition-colors">{children}</button>;
}

