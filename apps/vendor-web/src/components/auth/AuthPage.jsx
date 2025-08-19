import React, { useEffect, useMemo, useState } from "react";

export default function AuthPage({ initialMode = "login", roleLabel = "" }) {
  const [mode, setMode] = useState(initialMode);
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
    <div className="flex h-screen overflow-hidden relative font-sans bg-[#e7ece8]">
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div
        className="relative w-[60%] overflow-hidden block"
        style={{ clipPath: "polygon(0 0, 85% 0, 70% 100%, 0% 100%)" }}
      >
        {images.map((src, idx) => (
          <img
            key={src}
            src={`${src}?auto=format&fit=crop&w=1600&q=60`}
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

      <div className="flex-1 flex justify-start items-center bg-[#e7ece8] p-8">
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

function Field({ label, type = "text", placeholder, value, onChange, required, enableToggle = false }) {
  const [visible, setVisible] = useState(false);
  const actualType = enableToggle && type === "password" ? (visible ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm text-[#333]">{label}</label>
      <div className="relative">
        <input
          className="w-full p-3 text-base border border-[#ddd] rounded-lg outline-none transition-colors focus:border-[#ff6600] pr-16"
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
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
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Field
        label="Email or Phone"
        placeholder="Email or phone"
        value={emailOrPhone}
        onChange={setEmailOrPhone}
        required
      />
      <Field
        label="Password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        required
        enableToggle
      />
      <div className="text-right -mt-2 mb-2">
        <button type="button" className="text-sm text-[#ff6600] hover:underline">Forgot password?</button>
      </div>
      <PrimaryButton type="submit">Login</PrimaryButton>
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
  const [acceptTerms, setAcceptTerms] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Field label="Full Name" placeholder="Full Name" value={fullName} onChange={setFullName} required />
      <Field label="Email" type="email" placeholder="Email" value={email} onChange={setEmail} required />
      <Field label="Phone" type="tel" placeholder="Phone number" value={phone} onChange={setPhone} />
      <Field label="Password" type="password" placeholder="Password" value={password} onChange={setPassword} required enableToggle />
      <Field label="Confirm Password" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} required enableToggle />
      <label className="flex items-start gap-2 text-sm text-[#333] mt-2">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        <span>
          I agree to the <a href="#" className="text-[#ff6600] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ff6600] hover:underline">Privacy Policy</a>
        </span>
      </label>
      <PrimaryButton type="submit" disabled={!acceptTerms}>Sign Up</PrimaryButton>
      <SwitchText>
        Already have an account? <LinkButton onClick={onSwitch}>Login here</LinkButton>
      </SwitchText>
    </form>
  );
}