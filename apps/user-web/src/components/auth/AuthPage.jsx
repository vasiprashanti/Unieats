import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthProvider } from "../../context/AuthContext";
import Navbar from "../Navigation/Navbar";
import MobileHeader from "../Navigation/MobileHeader";
import Alert from "../Alert";

function AuthPageComponent({ initialMode = "login", roleLabel = "" }) {
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

// Final export wrapped with the Auth Provider
export default function AuthPage({ initialMode = "login" }) {
    return (
        <AuthProvider>
            <AuthPageComponent initialMode={initialMode} />
        </AuthProvider>
    );
}


// --- LoginForm (Merged Logic) ---
function LoginForm({ onSwitch }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ emailOrPhone: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const navigate=useNavigate();
  const { login, loading, error, setError } = useAuth();

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

  
const onSubmit = async (e) => {
  e.preventDefault();
  setTouched({ emailOrPhone: true, password: true });

  if (hasErrors) return;

  setSubmitting(true);

  try {
    // 1. Login and get the Firebase UID / ID token
    const res = await login({ email: emailOrPhone, password });
    // Assuming `res.uid` is the Firebase ID token
    const idToken = await res.user.getIdToken();
    // 2. Make a request to the /verify endpoint
    const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/verify`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    const data = await verifyRes.json();
    if (!verifyRes.ok) {
      console.error("Verification failed:", data.message);
      // handle error (show message to user)
    } else {
      console.log("Login successful:", data.user);
      // Check if there's a return URL stored
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo) {
        localStorage.removeItem('returnTo'); // Clear it
        navigate(returnTo); // Go back to the stored page
      } else {
        navigate('/restaurants'); // Default redirect
      }
      // You can save the user info in state or context
    }
  } catch (error) {
    console.error("Error during login/verification:", error);
  } finally {
    setSubmitting(false);
  };
  }

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
      emailOrPhone: "", phone: "", firstName: "", lastName: "", yearOfStudy: "", password: "", confirmPassword: "",
      accommodation: "", hostelBlock: "", hostelRoom: "", 
      addressLine1: "", landmark: "", city: "", state: "", zipCode: "", addressLabel: "Home"
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup, loading, error, setError } = useAuth();
 const navigate=useNavigate();
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
    const { emailOrPhone, firstName, lastName, password } = formData;
    if (!emailOrPhone || !firstName || !lastName || !password) {
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
  
  const { emailOrPhone, firstName, lastName, password, confirmPassword } = formData;
  const fullName = `${firstName} ${lastName}`;
  const email = emailOrPhone; // Assuming emailOrPhone contains email

  if (password !== confirmPassword) {
    setError("auth/password-mismatch");
    return;
  }

  // Validate hosteller requirements
  if (formData.accommodation === "hosteller" && !formData.yearOfStudy) {
    setError("Year of Study is required for hostellers");
    return;
  }

  console.log("Form submitted with values:", {
    email,
    password,
    confirmPassword,
    fullName,
  });

  setSubmitting(true);

  try {
    // Step 1: Sign up user with Firebase
    const res = await signup({ email, password, displayName: fullName });
    console.log("Firebase signup result:", res);

    if (!res?.ok) {
      setError("auth/firebase-signup-failed");
      setSubmitting(false);
      return;
    }
    // Extract Firebase UID (depends on your signup implementation)
    const user = res.user;
    const firebaseUid = user?.uid;

    if (!firebaseUid) {
      throw new Error("Firebase UID not found");
    }

    // Step 2: Call your backend API to register user in MongoDB
    const registrationPayload = {
      firebaseUid,
      email,
      phone: formData.phone,
      name: { first: formData.firstName, last: formData.lastName },
      yearOfStudy: formData.yearOfStudy,
      accommodation: formData.accommodation === 'hosteller' ? 'Hosteller' : 'Non-Hosteller',
    };
    if (formData.accommodation === 'hosteller') {
      registrationPayload.hostelDetails = {
        block: formData.hostelBlock,
        room: formData.hostelRoom,
      };
    } else if (formData.accommodation === 'non-hosteller') {
      registrationPayload.offCampusAddress = {
        addressLine1: formData.addressLine1,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      };
    }
    const apiRes = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      }
    );


    const data = await apiRes.json();
    console.log("Backend response:", data);

    if (!apiRes.ok) {
      setError(data.message || "Backend registration failed");
    } else {
      console.log("User registered successfully in backend!");
      navigate('/'); // Navigate to home after successful signup
    }
  } catch (err) {
    console.error("Error during registration:", err);
    setError("auth/unknown-error");
  } finally {
    setSubmitting(false);
  }
};

  const onChangeClear = (setter) => (val) => {
    setter(val);
    if (error) setError(null);
  };

  return (
    <form onSubmit={onSubmit}>
      <Alert type="error" message={friendly(error) || (error && typeof error === 'string' ? error : null)} />
      {currentStep === 1 && (
        <div>
          <Field label="Email" value={formData.emailOrPhone} onChange={handleChange("emailOrPhone")} required />
          <Field label="Phone Number" value={formData.phone} onChange={handleChange("phone")} required />
          <Field label="First Name" value={formData.firstName} onChange={handleChange("firstName")} required />
          <Field label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} required />
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
              <SelectField 
                label="Year of Study" 
                value={formData.yearOfStudy} 
                onChange={handleChange("yearOfStudy")} 
                required 
                options={[
                  {value: "", label: "Select Year"}, 
                  {value: "1st Year", label: "1st Year"}, 
                  {value: "2nd Year", label: "2nd Year"}, 
                  {value: "3rd Year", label: "3rd Year"}, 
                  {value: "4th Year", label: "4th Year"}
                ]} 
              />
              <Field label="Hostel Block" value={formData.hostelBlock} onChange={handleChange("hostelBlock")} required />
              <Field label="Hostel Room" value={formData.hostelRoom} onChange={handleChange("hostelRoom")} required />
            </>
          )}
          {formData.accommodation === "non-hosteller" && (
            <>
              <Field label="Address Line 1" value={formData.addressLine1} onChange={handleChange("addressLine1")} required />
              <Field label="City" value={formData.city} onChange={handleChange("city")} required />
              <Field label="State" value={formData.state} onChange={handleChange("state")} required />
              <Field label="ZIP Code" value={formData.zipCode} onChange={handleChange("zipCode")} required />
              <Field label="Landmark" value={formData.landmark} onChange={handleChange("landmark")} />
              <Field label="Address Label" value={formData.addressLabel} onChange={handleChange("addressLabel")} required placeholder="e.g. Home, Office, etc." />
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
                className={`w-full px-3 text-[15px] bg-white border rounded-xl transition-all duration-200 outline-none leading-normal ${
                    value ? "pt-6 pb-2" : "py-3.5"
                } ${error ? "border-red-400 focus:border-red-500" : "border-black/8 focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(255,106,0,0.12)]"}`}
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
                className={`w-full px-3 text-[15px] bg-white border rounded-xl transition-all duration-200 outline-none appearance-none leading-normal ${
                    value ? "pt-6 pb-2" : "py-3.5"
                } ${error ? "border-red-400 focus:border-red-500" : "border-black/8 focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(255,106,0,0.12)]"}`}
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

function PrimaryButton({ children, type = "button", disabled = false, onClick }) {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
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

