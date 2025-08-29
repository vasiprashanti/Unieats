import React, { useState, useRef } from 'react';

// --- Helper Components for Icons ---
// You can replace these with an icon library like lucide-react or Font Awesome if you have it installed.
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff802c] mr-3 inline-block">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
    <path d="M20.52 3.49a10.15 10.15 0 0 0-16.9 11.36L2 22l7.25-1.9a10.16 10.16 0 0 0 11.27-16.61Zm-2.05 12.2c-.34.96-1.63 1.76-2.33 1.8-.6.03-1.36.04-2.2-.14-.5-.1-1.14-.36-1.86-.71-3.27-1.5-5.41-4.98-5.58-5.21-.16-.22-1.33-1.77-1.33-3.38 0-1.6.84-2.4 1.14-2.73.3-.33.66-.41.88-.41.22 0 .44 0 .64.01.2.01.49-.08.77.58.34.82 1.15 2.84 1.25 3.05.1.2.17.45.03.73-.13.28-.2.45-.4.69-.2.24-.42.53-.6.71-.2.2-.4.42-.17.82.23.4 1.03 1.7 2.21 2.75 1.52 1.35 2.8 1.77 3.2 1.97.4.2.64.17.88-.1.23-.28 1.02-1.19 1.29-1.6.26-.4.53-.34.88-.2.34.14 2.16 1.02 2.53 1.2.37.18.61.27.7.42.08.15.08.9-.25 1.86Z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// New Benefit Icons (for the orange circular badges)
const MapPinIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UsersIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ZapIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// --- Main Page Components ---

// iPhone mockup device
const IPhoneMockup = () => (
  <div className="mx-auto w-[300px] md:w-[320px]">
    <div className="relative rounded-[36px] border border-[#222] bg-[#050505] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-2">
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-[12px] bg-black/90 border border-[#1a1a1a]" />
      {/* Screen */}
      <div className="rounded-[28px] overflow-hidden bg-gradient-to-b from-[#1b1b1b] to-black">
        <div className="h-[600px] w-full p-4 flex flex-col gap-3">
          {/* Status/Header */}
          <div className="flex items-center justify-between">
            <span className="text-[#ff802c] font-extrabold">UniEats</span>
            <span className="text-[#666] text-xs">9:41</span>
          </div>

          {/* Hero card */}
          <div className="mt-2 rounded-2xl bg-[#141414] border border-[#2a2a2a] p-4">
            <p className="text-white font-semibold">Cravings?</p>
            <p className="text-[#9aa4b2] text-sm">Order on campus in minutes</p>
            <button className="mt-4 inline-flex items-center rounded-lg bg-[#ff802c] px-3 py-1.5 text-[13px] font-semibold text-black hover:bg-[#ff6f17]">Explore</button>
          </div>

          {/* Grid preview */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="h-20 rounded-xl bg-[#141414] border border-[#2a2a2a]" />
            <div className="h-20 rounded-xl bg-[#141414] border border-[#2a2a2a]" />
            <div className="h-20 rounded-xl bg-[#141414] border border-[#2a2a2a]" />
          </div>

          {/* Handle */}
          <div className="mt-auto flex items-center justify-center border-t border-[#1f1f1f] pt-3">
            <div className="h-1.5 w-16 rounded-full bg-[#333]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Header = () => (
  <header className="sticky top-0 z-10 flex justify-between items-center px-[5%] py-4 bg-[#121214] border-b border-[#111]">
    <h1 className="text-[2.4rem] font-extrabold text-[#ff802c]">UniEats</h1>
    <nav className="flex items-center space-x-[30px] text-[#ff802c] font-semibold text-[1.1rem] md:text-[1.2rem]">
      <a href="#why-us" className="hover:text-white transition-colors">Why Unieats</a>
      <a href="#benefits" className="hover:text-white transition-colors">Perks</a>
      <a href="#contact" className="hover:text-white transition-colors">Contact</a>
    </nav>
  </header>
);

const Hero = () => {
  const [showForm, setShowForm] = useState(false);
  const nameInputRef = useRef(null);

  const handleOpenForm = () => {
    setShowForm(true);
    // Focus the first field immediately after state update
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('You will be notified soon!');
  };

  return (
    <section className="text-center py-32 px-[5%] flex flex-col items-center gap-10">
      <h1 className="text-[4rem] font-bold text-[#ff802c] fade-up" style={{ animationDelay: '0s' }}>
        We are building a site that turns <br />visitors into happy foodies
      </h1>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[1.1rem] text-[#9aa4b2] max-w-2xl fade-up" style={{ animationDelay: '0.6s' }}>
          Get pure insider access. Sneak peeks, insider perks, and early-bird treats?
        </p>
        <p className="text-[1.1rem] text-[#9aa4b2] max-w-2xl fade-up" style={{ animationDelay: '0.8s' }}>
          Are you on the list, or watching from the sidelines?
        </p>
      </div>
      <button
        onClick={handleOpenForm}
        className="inline-flex items-center rounded-full bg-[#ff802c] px-6 py-3 text-[1rem] font-semibold text-black hover:bg-[#ff6f17] transition-colors"
      >
        Join Table
      </button>
      {showForm && (
        <div className="w-full max-w-[400px] bg-[#1f1f1f] p-5 rounded-[10px] mt-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input ref={nameInputRef} type="text" placeholder="Name" required className="w-full p-3 border border-[#333] rounded-[8px] bg-[#111] text-white text-[1rem] focus:outline-none focus:ring-2 focus:ring-[#ff802c]" />
            <input type="email" placeholder="Email" required className="w-full p-3 border border-[#333] rounded-[8px] bg-[#111] text-white text-[1rem] focus:outline-none focus:ring-2 focus:ring-[#ff802c]" />
            <input type="tel" placeholder="Phone" required className="w-full p-3 border border-[#333] rounded-[8px] bg-[#111] text-white text-[1rem] focus:outline-none focus:ring-2 focus:ring-[#ff802c]" />
            <button type="submit" className="w-full p-3 bg-[#ff802c] text-white font-semibold rounded-[8px] text-[1rem] hover:bg-[#ff6600] transition-colors">
              Join Club
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

const WhyUs = () => (
  <section id="why-us" className="py-16 px-[5%]">
    <h2 className="text-[2.2rem] font-bold text-[#ff802c] text-center mb-8">Why Choose UniEats?</h2>
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
      <div className="flex-1 max-w-xl">
        <p className="text-[#ccc] text-[1.1rem] mb-4">
          UniEats is your ultimate campus food solution—bringing convenience, affordability, and variety right to your fingertips.
        </p>
        <ul className="text-[#ccc] text-[1.1rem] space-y-3">
          <li className="flex items-start"><CheckIcon />Fast and easy ordering</li>
          <li className="flex items-start"><CheckIcon />Exclusive student discounts</li>
          <li className="flex items-start"><CheckIcon />Trusted campus vendors</li>
        </ul>
      </div>
      <div className="md:w-1/3">
        <IPhoneMockup />
      </div>
    </div>
  </section>
);

// --- New Benefits section (matches the screenshot style) ---
const Benefits = () => (
  <section id="benefits" className="py-20 px-[5%] bg-[#121214]">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-white text-3xl md:text-4xl font-extrabold fade-up" style={{ animationDelay: '0.1s' }}>
        Why Choose UniEats?
      </h2>
      <p className="text-[#9aa4b2] mt-2 fade-up" style={{ animationDelay: '0.25s' }}>
        Built by students, for students
      </p>

      <div className="grid gap-12 md:grid-cols-3 mt-12">
        {/* Card 1 */}
        <div className="flex flex-col items-center text-center fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff802c] flex items-center justify-center">
            <MapPinIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </div>
          <h3 className="text-white text-2xl font-semibold mt-5">Built in Manipal for Manipal</h3>
          <p className="text-[#9aa4b2] mt-3 max-w-xs leading-relaxed">
            Designed specifically for the Manipal University ecosystem
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center text-center fade-up" style={{ animationDelay: '0.45s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff802c] flex items-center justify-center">
            <UsersIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </div>
          <h3 className="text-white text-2xl font-semibold mt-5">Student-friendly</h3>
          <p className="text-[#9aa4b2] mt-3 max-w-xs leading-relaxed">
            Affordable pricing and features tailored for student life
          </p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center text-center fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff802c] flex items-center justify-center">
            <ZapIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </div>
          <h3 className="text-white text-2xl font-semibold mt-5">Tech-driven</h3>
          <p className="text-[#9aa4b2] mt-3 max-w-xs leading-relaxed">
            Cutting-edge technology for the fastest food delivery experience
          </p>
        </div>
      </div>
    </div>
  </section>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#1f1f1f] rounded-[8px] cursor-pointer w-full relative" onClick={() => setIsOpen(!isOpen)}>
      <div className="p-5 pr-10">
        <h3 className="text-[1.1rem] text-white font-semibold">{question}</h3>
      </div>
      <span
        className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#ccc] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      >
        ▼
      </span>
      {isOpen && <p className="px-5 pb-5 text-[#ccc]">{answer}</p>}
    </div>
  );
};

const Faq = () => (
  <section id="faq" className="py-16 px-[5%]">
    <h2 className="text-[2.8rem] md:text-[3.2rem] font-extrabold text-[#ff802c] text-left mb-8">Questions? We Got Answers</h2>
    <div className="w-full space-y-3">
      <FaqItem question="When will UniEats launch?" answer="We're launching very soon! Sign up to get notified first." />
      <FaqItem question="Is it free to use?" answer="Yes! Using UniEats is completely free for students." />
      <FaqItem question="How do I place an order?" answer="Once we launch, just log in and select your favorite vendor to order instantly." />
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="text-center py-16 px-[5%]">
    <h2 className="text-[2.2rem] font-bold text-[#ff802c] text-center mb-4">Need Help? Contact Us</h2>
    <p className="text-[#ccc] mb-8">Reach us anytime via email or phone.</p>
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
      <a
        href="mailto:unieats.co@gmail.com"
        className="inline-flex items-center justify-center w-full sm:w-auto border border-[#333] text-[#ddd] py-2.5 px-5 rounded-[10px] text-[0.95rem] font-medium hover:border-[#ff802c] hover:text-[#ff802c] transition-colors"
      >
        Email us
      </a>
      <a
        href="tel:90006636"
        className="inline-flex items-center justify-center w-full sm:w-auto border border-[#333] text-[#ddd] py-2.5 px-5 rounded-[10px] text-[0.95rem] font-medium hover:border-[#ff802c] hover:text-[#ff802c] transition-colors"
      >
        Contact
      </a>
    </div>
  </section>
);

const Footer = () => (
  <footer className="flex justify-center items-center py-6 px-[5%] bg-[#121214] mt-8">
    <div className="flex items-center space-x-6 text-[#9aa4b2]">
      <a href="https://instagram.com/unieats" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
        <InstagramIcon />
      </a>
      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-white transition-colors">
        <WhatsAppIcon />
      </a>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-[#121214] text-white font-sans poppins">
      {/* Page-scoped styles: font import and animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
        .poppins { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .fade-up { opacity: 0; transform: translateY(20px); animation: fadeUp 1s ease forwards; }
      `}</style>

      <Header />
      <main>
        <Hero />
        <WhyUs />
        <Benefits />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}