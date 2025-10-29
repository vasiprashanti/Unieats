import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Vendor Sign-up page with multi-step form
export default function Signup() {
  const navigate = useNavigate();

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

  // Smooth scroll with navbar offset
  const scrollToSection = (element) => {
    const navbarHeight = 80;
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
                const element = document.getElementById("how-it-works");
                if (element) scrollToSection(element);
              }}
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("pricing");
                if (element) scrollToSection(element);
              }}
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("support");
                if (element) scrollToSection(element);
              }}
              className="hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              Support
            </button>
            <button
              className="hover:text-[#ff6600] transition-colors"
              onClick={() => navigate("/vendor/login")}
            >
              Login
            </button>
          </nav>
        </div>
      </div>

      {/* Banner */}
      <div className="relative z-0 h-[320px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-center bg-cover transform scale-105 filter blur-sm bg-gradient-to-r from-orange-400 to-red-500" />
        <div className="absolute inset-0 z-0 bg-black/40" />
        <h2
          className={
            "relative z-10 text-white font-bold text-[2.4rem] transition-all duration-700 " +
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
          <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold">
            TURN MENU INTO REVENUE
          </h2>
          <p className="mb-6 text-[16px] text-[#555]">
            Expand your reach, boost your sales, and connect with thousands of
            food lovers through UniEats. We make it simple to grow your business
            online.
          </p>
          <ul className="list-disc ml-5 space-y-3 text-[16px] text-[#333]">
            <li>Complete the sign-up form and share your restaurant details</li>
            <li>Upload your FSSAI license and required documents</li>
            <li>Add your menu, set prices, and start receiving orders</li>
          </ul>
        </div>

        {/* Sign-up form */}
        <div className="flex-1 min-w-[300px] bg-white p-8 rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
          <h3 className="mb-6 text-[22px] text-[#333] font-semibold">
            Partner Registration
          </h3>
          <VendorSignupForm />
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="px-[10%] py-16 bg-white">
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Sign up as a partner",
              desc: "Tell us about your restaurant and share the required documents for quick verification.",
            },
            {
              step: "2",
              title: "Set up your menu",
              desc: "Add items, pricing, and availability. Update anytime with ease.",
            },
            {
              step: "3",
              title: "Start receiving orders",
              desc: "Manage orders in real-time and track performance from your dashboard.",
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#ff6600] rounded text-white flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#333]">{title}</h3>
              <p className="text-[#555] text-[15px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="px-[10%] py-16 bg-white border-t border-[#f0f0f0]"
      >
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">
          Pricing
        </h2>

        <div className="flex justify-center">
          {/* Commission-Based Plan */}
          <div className="p-8 w-full sm:w-[400px] rounded-xl border-2 border-[#ff6600] shadow-[0_10px_25px_rgba(255,102,0,0.15)] bg-white relative flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-[#333] mb-3">
              Commission-Based Plan
            </h3>
            <ul className="text-[15px] text-[#333] space-y-3 mb-6 text-left">
              <li>Pay % commission only on orders above ₹20.</li>
              <li>Unlimited orders per month.</li>
              <li>Add, manage, and customize your menu easily.</li>
              <li>Accept online orders via app or website.</li>
              <li>Real-time sales and customer analytics.</li>
              <li>
                Single admin access, compatible on mobile, tablet, and PC.
              </li>
            </ul>
            <button className="mt-auto w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">
              Choose Commission Plan
            </button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="px-[10%] py-16 bg-gray-50">
        <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">
          Support & Help
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: "24/7 Support",
              desc: "Get help anytime with our dedicated support team via chat, email, or phone.",
              btn: "Contact Support",
            },
            {
              title: "Documentation",
              desc: "Access comprehensive guides, tutorials, and FAQs to help you get started quickly.",
              btn: "View Docs",
            },
            {
              title: "Community",
              desc: "Connect with other restaurant partners, share experiences, and learn best practices.",
              btn: "Join Community",
            },
          ].map(({ title, desc, btn }) => (
            <div
              key={title}
              className="text-center p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white"
            >
              <h3 className="text-xl font-semibold mb-4 text-[#333]">
                {title}
              </h3>
              <p className="text-[#555] text-[15px] leading-relaxed mb-6">
                {desc}
              </p>
              <button className="px-6 py-2 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">
                {btn}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

