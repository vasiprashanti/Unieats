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
          <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold">TURN MENU INTO REVENUE</h2>
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

      {/* How It Works */}
      <section id="how-it-works" className="px-[10%] py-16 bg-white">
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-[#ff6600] rounded text-white flex items-center justify-center text-sm font-bold">1</div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">Sign up as a partner</h3>
            <p className="text-[#555] text-[15px] leading-relaxed">Tell us about your restaurant and share the required documents for quick verification.</p>
          </div>
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-[#ff6600] rounded text-white flex items-center justify-center text-sm font-bold">2</div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">Set up your menu</h3>
            <p className="text-[#555] text-[15px] leading-relaxed">Add items, pricing, and availability. Update anytime with ease.</p>
          </div>
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-[#ff6600] rounded text-white flex items-center justify-center text-sm font-bold">3</div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">Start receiving orders</h3>
            <p className="text-[#555] text-[15px] leading-relaxed">Manage orders in real-time and track performance from your dashboard.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-[10%] py-16 bg-white border-t border-[#f0f0f0]">
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Type A - Commission Based */}
          <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <h3 className="text-xl font-semibold text-[#333] mb-3">Type A - Commission</h3>
            <p className="text-[15px] text-[#555] mb-6 leading-relaxed">Pay-per-order model for flexible scaling</p>
            <div className="mb-6">
              <div className="text-2xl font-bold text-[#ff6600] mb-2">Min % Commission</div>
              <div className="text-sm text-[#555]">On orders above ₹50</div>
            </div>
            <ul className="text-[15px] text-[#333] space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Unlimited orders per month
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Complete analytics dashboard
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                All vendor features included
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Priority listing by ratings
              </li>
            </ul>
            <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Choose Commission</button>
          </div>

          {/* Type B - Subscription Based */}
          <div className="p-8 rounded-xl border-2 border-[#ff6600] shadow-[0_10px_25px_rgba(255,102,0,0.15)] bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#ff6600] text-white px-4 py-1 rounded-full text-sm font-semibold">Popular</span>
            </div>
            <h3 className="text-xl font-semibold text-[#333] mb-3">Type B - Subscription</h3>
            <p className="text-[15px] text-[#555] mb-6 leading-relaxed">Fixed monthly fee with no commissions</p>
            <div className="mb-6">
              <div className="text-2xl font-bold text-[#ff6600] mb-2">Minimal Fee</div>
              <div className="text-sm text-[#555]">Monthly or Annual plans</div>
            </div>
            <ul className="text-[15px] text-[#333] space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Unlimited orders per month
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Complete analytics dashboard
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                All vendor features included
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Priority listing by ratings
              </li>
            </ul>
            <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Choose Subscription</button>
          </div>

          {/* Type C - Hybrid Model */}
          <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <h3 className="text-xl font-semibold text-[#333] mb-3">Type C - Hybrid</h3>
            <p className="text-[15px] text-[#555] mb-6 leading-relaxed">Best of both worlds - subscription + commission</p>
            <div className="mb-6">
              <div className="text-2xl font-bold text-[#ff6600] mb-2">Subscription + Commission</div>
              <div className="text-sm text-[#555]">Combined model</div>
            </div>
            <ul className="text-[15px] text-[#333] space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Unlimited orders per month
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Complete analytics dashboard
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                All vendor features included
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                Priority listing by ratings
              </li>
            </ul>
            <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Choose Hybrid</button>
          </div>
        </div>
        
        {/* Additional Features */}
        <div className="mt-16 text-center">
          <h3 className="text-[24px] mb-8 text-[#ff6600] tracking-wide font-semibold">Additional Features Available</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-[#eee] shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-white">
              <h4 className="text-lg font-semibold text-[#333] mb-3">Promotional Banner Space</h4>
              <p className="text-[15px] text-[#555]">Advertise your restaurant with premium banner placements on our platform to boost visibility and attract more customers.</p>
            </div>
            <div className="p-6 rounded-xl border border-[#eee] shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-white">
              <h4 className="text-lg font-semibold text-[#333] mb-3">Priority Listing</h4>
              <p className="text-[15px] text-[#555]">Get higher visibility in category listings based on genuine student ratings, ensuring fair and quality-driven recommendations.</p>
            </div>
          </div>
        </div>
      </section>
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