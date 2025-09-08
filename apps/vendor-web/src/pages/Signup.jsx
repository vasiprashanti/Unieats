import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Vendor Sign-up page recreated from provided HTML design (UI-only)
export default function Signup() {
  const location = useLocation();
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

  // Handle hash-based navigation when coming from login page
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          scrollToSection(element);
        }, 100);
      }
    }
  }, [location.hash]);

  // Smooth scroll with navbar offset
  const scrollToSection = (element) => {
    const navbarHeight = 80; // Approximate navbar height
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarHeight;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#222]">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-10 py-4">
          <h1 className="text-[24px] font-bold text-[#ff6600]">UniEats</h1>
          <nav className="flex items-center gap-6 text-[#333]">
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) scrollToSection(element);
              }} 
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('pricing');
                if (element) scrollToSection(element);
              }} 
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('support');
                if (element) scrollToSection(element);
              }} 
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              Support
            </button>
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
      <div className="flex flex-wrap gap-10 justify-between px-[10%] py-12">
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
          {/* Commission Based */}
          <div className="p-8 rounded-xl border-2 border-[#ff6600] shadow-[0_10px_25px_rgba(255,102,0,0.15)] bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#ff6600] text-white px-4 py-1 rounded-full text-sm font-semibold">Popular</span>
            </div>
            <h3 className="text-xl font-semibold text-[#333] mb-3">Commission Based</h3>
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

          {/* Subscription Based */}
          <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <h3 className="text-xl font-semibold text-[#333] mb-3">Subscription Based</h3>
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

          {/* Hybrid Model */}
          <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <h3 className="text-xl font-semibold text-[#333] mb-3">Hybrid Model</h3>
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

      {/* Support Section */}
      <section id="support" className="px-[10%] py-16 bg-gray-50">
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">Support & Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#ff6600]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">24/7 Support</h3>
            <p className="text-[#555] text-[15px] leading-relaxed mb-6">Get help anytime with our dedicated support team via chat, email, or phone.</p>
            <button className="px-6 py-2 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Contact Support</button>
          </div>
          
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#ff6600]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">Documentation</h3>
            <p className="text-[#555] text-[15px] leading-relaxed mb-6">Access comprehensive guides, tutorials, and FAQs to help you get started quickly.</p>
            <button className="px-6 py-2 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">View Docs</button>
          </div>
          
          <div className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#ff6600]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#333]">Community</h3>
            <p className="text-[#555] text-[15px] leading-relaxed mb-6">Connect with other restaurant partners, share experiences, and learn best practices.</p>
            <button className="px-6 py-2 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Join Community</button>
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