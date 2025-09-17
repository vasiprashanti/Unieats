import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Vendor Sign-up page with multi-step form
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

        {/* Sign-up form - Multi-step wizard */}
        <div className="flex-1 min-w-[300px] bg-white p-8 rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow">
          <h3 className="mb-6 text-[22px] text-[#333] font-semibold">Partner Registration</h3>
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

     import React from 'react';

export default function Pricing() {
  return (
    <section id="pricing" className="px-[10%] py-16 bg-white border-t border-[#f0f0f0]">
      <h2 className="text-[28px] mb-12 text-[#ff6600] tracking-wide font-semibold text-center">Pricing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        {/* Freemium (Most Popular) */}
        <div className="p-8 rounded-xl border-2 border-[#ff6600] shadow-[0_10px_25px_rgba(255,102,0,0.15)] bg-white relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#ff6600] text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
          </div>
          <h3 className="text-xl font-semibold text-[#333] mb-3">Freemium</h3>
          <ul className="text-[15px] text-[#333] space-y-3 mb-8">
            <li>Free for first 5 vendors only</li>
            <li>No commission, no subscription</li>
            <li>Restaurant listed in Top 5</li>
            <li>2 free ad banners</li>
          </ul>
          <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Grab Freemium</button>
        </div>

        {/* Commission Based */}
        <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
          <h3 className="text-xl font-semibold text-[#333] mb-3">Commission Based</h3>
          <ul className="text-[15px] text-[#333] space-y-3 mb-8">
            <li>Pay per order, no fixed fee</li>
            <li>Unlimited orders</li>
            <li>Analytics dashboard</li>
            <li>All vendor features</li>
            <li>Priority listing by ratings</li>
          </ul>
          <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Choose Commission</button>
        </div>

        {/* Subscription Based */}
        <div className="p-8 rounded-xl border border-[#eee] shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow bg-white">
          <h3 className="text-xl font-semibold text-[#333] mb-3">Subscription Based</h3>
          <ul className="text-[15px] text-[#333] space-y-3 mb-8">
            <li>Flat minimal monthly/annual fee</li>
            <li>Zero commission on orders</li>
            <li>Unlimited orders</li>
            <li>Analytics dashboard</li>
            <li>All vendor features + priority listing</li>
          </ul>
          <button className="w-full px-6 py-3 rounded-lg bg-[#ff6600] text-white font-semibold hover:bg-[#e65c00] transition-colors">Choose Subscription</button>
        </div>

      </div>
    </section>
  );
}
        
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

// Reusable Input Component
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

// Reusable Button Component
function PrimaryButton({ children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      className={`flex-1 px-4 py-3 text-white font-bold rounded-lg bg-[#ff6600] hover:bg-[#e65c00] transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// Multi-Step Form Component
function VendorSignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    businessName: "",
    phone: "",
    
    // Step 2: Business Address
    street: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Step 3: Cuisine & Operating Hours
    cuisineType: [],
    operatingHours: [],
    
    // Step 4: Documents
    businessLicense: null,
    foodSafetyCertificate: null,
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

 const onSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    // Append text fields only
    data.append("businessName", formData.businessName);
    data.append("phone", formData.phone);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("zipCode", formData.zipCode);
    data.append("cuisineType", JSON.stringify(formData.cuisineType));
    data.append("operatingHours", JSON.stringify(formData.operatingHours));

    // Append files
    if (formData.businessLicense) {
      data.append("businessLicense", formData.businessLicense); // actual File object
    }
    if (formData.foodSafetyCertificate) {
      data.append("foodSafetyCertificate", formData.foodSafetyCertificate); // actual File object
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/vendors/register`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();
    console.log("API Response:", result);

    if (response.ok) {
      alert("Vendor registered successfully!");
    } else {
      alert(result.message || "Vendor registration failed.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("An error occurred. Please try again.");
  }
};


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <Step4 formData={formData} updateFormData={updateFormData} onSubmit={onSubmit} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="block">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i + 1}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                i + 1 <= currentStep
                  ? 'bg-[#ff6600] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#ff6600] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Basic Info</span>
          <span>Address</span>
          <span>Details</span>
          <span>Documents</span>
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  );
}

// Step 1: Basic Information
function Step1({ formData, updateFormData, onNext }) {
  const handleNext = (e) => {
    e.preventDefault();
    if (formData.businessName && formData.phone) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleNext}>
      <h4 className="text-lg font-semibold text-[#333] mb-4">Basic Information</h4>
      
      <Input
        placeholder="Business/Restaurant Name"
        value={formData.businessName}
        onChange={(value) => updateFormData('businessName', value)}
        required
      />
      
      <Input
        type="tel"
        placeholder="Business Phone Number"
        value={formData.phone}
        onChange={(value) => updateFormData('phone', value)}
        required
      />

      <PrimaryButton type="submit">Continue</PrimaryButton>
    </form>
  );
}

// Step 2: Business Address
function Step2({ formData, updateFormData, onNext, onPrev }) {
  const handleNext = (e) => {
    e.preventDefault();
    if (formData.street && formData.city && formData.state && formData.zipCode) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleNext}>
      <h4 className="text-lg font-semibold text-[#333] mb-4">Business Address</h4>
      
      <Input
        placeholder="Street Address"
        value={formData.street}
        onChange={(value) => updateFormData('street', value)}
        required
      />
      
      <div className="flex gap-2">
        <Input
          placeholder="City"
          value={formData.city}
          onChange={(value) => updateFormData('city', value)}
          required
        />
        <Input
          placeholder="State"
          value={formData.state}
          onChange={(value) => updateFormData('state', value)}
          required
        />
      </div>
      
      <Input
        placeholder="ZIP Code"
        value={formData.zipCode}
        onChange={(value) => updateFormData('zipCode', value)}
        required
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 px-4 py-3 text-[#ff6600] font-bold rounded-lg border-2 border-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-colors"
        >
          Back
        </button>
        <PrimaryButton type="submit">Continue</PrimaryButton>
      </div>
    </form>
  );
}

// Step 3: Cuisine Types & Operating Hours
function Step3({ formData, updateFormData, onNext, onPrev }) {
  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental',
    'Fast Food', 'Desserts', 'Beverages', 'North Indian', 'South Indian', 'Street Food'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleCuisineChange = (cuisine) => {
    const newCuisines = formData.cuisineType.includes(cuisine)
      ? formData.cuisineType.filter(c => c !== cuisine)
      : [...formData.cuisineType, cuisine];
    updateFormData('cuisineType', newCuisines);
  };

  const handleOperatingHoursChange = (day, field, value) => {
    const existingHours = formData.operatingHours.find(h => h.day === day);
    if (existingHours) {
      const updatedHours = formData.operatingHours.map(h =>
        h.day === day ? { ...h, [field]: value } : h
      );
      updateFormData('operatingHours', updatedHours);
    } else {
      const newHours = [...formData.operatingHours, { day, [field]: value }];
      updateFormData('operatingHours', newHours);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.cuisineType.length > 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleNext}>
      <h4 className="text-lg font-semibold text-[#333] mb-4">Cuisine & Operating Hours</h4>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#333] mb-3">
          Cuisine Types (Select at least one) *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {cuisineOptions.map(cuisine => (
            <label key={cuisine} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cuisineType.includes(cuisine)}
                onChange={() => handleCuisineChange(cuisine)}
                className="mr-2 text-[#ff6600] focus:ring-[#ff6600]"
              />
              <span className="text-sm text-[#333]">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#333] mb-3">
          Operating Hours (Optional)
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {days.map(day => {
            const dayHours = formData.operatingHours.find(h => h.day === day) || {};
            return (
              <div key={day} className="flex items-center gap-2 text-sm">
                <span className="w-20 text-[#333]">{day.slice(0, 3)}</span>
                <input
                  type="time"
                  value={dayHours.open || ''}
                  onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                  className="px-2 py-1 border border-[#ddd] rounded text-xs"
                />
                <span className="text-[#666]">to</span>
                <input
                  type="time"
                  value={dayHours.close || ''}
                  onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                  className="px-2 py-1 border border-[#ddd] rounded text-xs"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 px-4 py-3 text-[#ff6600] font-bold rounded-lg border-2 border-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-colors"
        >
          Back
        </button>
        <PrimaryButton type="submit">Continue</PrimaryButton>
      </div>
    </form>
  );
}

// Step 4: Document Upload
function Step4({ formData, updateFormData, onSubmit, onPrev }) {
  const handleFileChange = (field, file) => {
    updateFormData(field, file);
  };

  return (
    <form onSubmit={onSubmit}>
      <h4 className="text-lg font-semibold text-[#333] mb-4">Required Documents</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#333] mb-2">
          Business License *
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('businessLicense', e.target.files[0])}
          className="w-full px-3 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#ff6600] text-sm"
          required
        />
        <p className="text-xs text-[#666] mt-1">Upload PDF, JPG, or PNG (Max 5MB)</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#333] mb-2">
          Food Safety Certificate (FSSAI) *
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('foodSafetyCertificate', e.target.files[0])}
          className="w-full px-3 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#ff6600] text-sm"
          required
        />
        <p className="text-xs text-[#666] mt-1">Upload PDF, JPG, or PNG (Max 5MB)</p>
      </div>

      <div className="bg-[#fff3e0] border border-[#ffcc80] rounded-lg p-4 mb-6">
        <h5 className="text-sm font-semibold text-[#ef6c00] mb-2">Review Process</h5>
        <p className="text-xs text-[#bf360c]">
          After submission, our team will review your application within 2-3 business days. 
          You'll receive an email notification once your account is approved.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 px-4 py-3 text-[#ff6600] font-bold rounded-lg border-2 border-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-colors"
        >
          Back
        </button>
        <PrimaryButton type="submit">Submit Application</PrimaryButton>
      </div>
    </form>
  );
}
