import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Vendor Sign-up page recreated from provided HTML design (UI-only)
export default function Signup() {
  const texts = useMemo(
    () => [
      "Grow your restaurant with Unieats!",
      "ZERO commission!",
      "Serve more. Earn more!",
      "Partner with us and thrive online!",
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
            <Link to="/vendor/login" className="hover:text-[#ff6600] transition-colors">Login</Link>
          </nav>
        </div>
      </div>

      {/* Banner */}
      <div className="relative z-0 h-[320px] flex items-center justify-center text-center overflow-hidden">
        {/* Background with blur + dim */}
        <div
          className="absolute inset-0 z-0 bg-center bg-cover transform scale-105 filter blur-sm"
          style={{ backgroundImage: "url('/vendor-login.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-black/40" />
        <h2
          className={
            "relative z-10 text-white font-bold text-[2.2rem] sm:text-[2.6rem] md:text-[2.8rem] transition-all duration-700 " +
            (show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")
          }
        >
          {texts[index]}
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex flex-wrap gap-10 justify-between px-[10%] py-12" id="how-it-works">
        {/* Why join */}
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-[28px] mb-4 text-[#ff6600] tracking-wide font-semibold">TURN MENU INTO REVENUE</h2>
          <p className="mb-6 text-[16px] text-[#555]">
            Expand your reach, boost your sales, and connect with thousands of food lovers through UniEats. We make it
            simple to grow your business online.
          </p>
          <ul className="list-disc ml-5 space-y-3 text-[16px] text-[#333]">
            <li>Complete the sign-up form and share your restaurant details</li>
            <li>Upload your FSSAI license and required documents</li>
            <li>Add your menu, set prices, and start receiving orders</li>
          </ul>
        </div>

        {/* Sign-up form (UI only; no backend wiring yet) */}
        <div className="flex-1 min-w-[300px] bg-white p-8 rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
          <h3 className="mb-6 text-[22px] text-[#333] font-semibold">Sign Up as a Partner</h3>
          <VendorSignupForm />
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

function PrimaryButton({ children, type = "button" }) {
  return (
    <button
      type={type}
      className="w-full px-4 py-3 text-white font-bold rounded-lg bg-[#ff6600] hover:bg-[#e65c00] transition-colors"
    >
      {children}
    </button>
  );
}

function VendorSignupForm() {
  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // UI-only for now
    alert("Thanks! We\u2019ll review your details and get back soon.");
  };

  return (
    <form onSubmit={onSubmit} className="block">
      <Input placeholder="Restaurant Name" value={restaurantName} onChange={setRestaurantName} required />
      <Input placeholder="Owner's Name" value={ownerName} onChange={setOwnerName} required />
      <Input type="email" placeholder="Email Address" value={email} onChange={setEmail} required />
      <Input type="tel" placeholder="Phone Number" value={phone} onChange={setPhone} required />
      <PrimaryButton type="submit">Join Now</PrimaryButton>
    </form>
  );
}