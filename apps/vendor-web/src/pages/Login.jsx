import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Vendor Login page with the same visual style as Signup
export default function Login() {
  const texts = useMemo(
    () => [
      "Welcome back, partner!",
      "Manage orders in real-time",
      "Track revenue and performance",
      "Serve more. Earn more!",
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setShow(true);
      }, 400);
    }, 2500);
    return () => clearInterval(id);
  }, [texts.length]);

  return (
    <div className="min-h-screen bg-white text-[#222]">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-10 py-4">
          <h1 className="text-[24px] font-bold text-[#ff6600]">UniEats</h1>
          <nav className="flex items-center gap-6 text-[#333]">
            <a href="#how-it-works" className="hover:text-[#ff6600] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#ff6600] transition-colors">Pricing</a>
            <a href="#support" className="hover:text-[#ff6600] transition-colors">Support</a>
            <Link to="/vendor/signup" className="hover:text-[#ff6600] transition-colors">Sign up</Link>
          </nav>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-[320px] flex items-center justify-center text-center overflow-hidden">
        {/* Background with blur + dim */}
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover transform scale-105 filter blur-sm"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-black/40" />
        <h2
          className={
            "text-white font-bold text-[2.2rem] sm:text-[2.6rem] md:text-[2.8rem] transition-all duration-700 " +
            (show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")
          }
        >
          {texts[index]}
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex flex-wrap gap-10 justify-between px-[10%] py-12">
        {/* Left copy to match style */}
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-[28px] mb-4 text-[#ff6600] tracking-wide font-semibold">OPERATE WITH EASE</h2>
          <p className="mb-6 text-[16px] text-[#555]">
            Login to manage orders, update menus, and view performance insights. UniEats helps you focus on what matters most — serving great food.
          </p>
          <ul className="list-disc ml-5 space-y-3 text-[16px] text-[#333]">
            <li>Real-time order updates</li>
            <li>Simple menu management</li>
            <li>Transparent earnings</li>
          </ul>
        </div>

        {/* Login form */}
        <div className="flex-1 min-w-[300px] bg-white p-8 rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
          <h3 className="mb-6 text-[22px] text-[#333] font-semibold">Partner Login</h3>
          <VendorLoginForm />
        </div>
      </div>


    </div>
  );
}

function Input({ type = "text", placeholder, required, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-4 py-3 mb-4 text-[16px] rounded-lg border border-[#ddd] focus:outline-none focus:border-[#ff6600] focus:ring-4 focus:ring-[#ff6600]/15 transition"
    />
  );
}

function PrimaryButton({ children, type = "button", disabled }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full px-4 py-3 text-white font-bold rounded-lg bg-[#ff6600] hover:bg-[#e65c00] disabled:opacity-60 transition-colors"
    >
      {children}
    </button>
  );
}

function VendorLoginForm() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      if (res?.ok) navigate('/vendor/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Input type="email" placeholder="Email Address" value={email} onChange={setEmail} required />
      <Input type="password" placeholder="Password" value={password} onChange={setPassword} required />
      <div className="text-right -mt-2 mb-2">
        <button type="button" className="text-sm text-[#ff6600] hover:underline">Forgot password?</button>
      </div>
      <PrimaryButton type="submit" disabled={loading || submitting}>
        {loading || submitting ? 'Loading...' : 'Login'}
      </PrimaryButton>
      <div className="text-center mt-4 text-sm text-[#555]">
        New partner? <Link to="/vendor/signup" className="text-[#ff6600] font-semibold">Register as Partner</Link>
      </div>
    </form>
  );
}