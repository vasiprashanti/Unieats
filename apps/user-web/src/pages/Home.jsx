import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';
import Footer from '../components/Footer';

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  
  const words = ["Pizza", "Burger", "Momos", "Fries", "Pasta", "Coffee"];

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    const timeout = setTimeout(() => {
      if (typing) {
        if (charIndex < currentWord.length) {
          setTypewriterText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTyping(false);
          setTimeout(() => {
            // Start deleting after pause
          }, 1000);
        }
      } else {
        if (charIndex > 0) {
          setTypewriterText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setTyping(true);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, typing ? 150 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex, typing]);

  // Wave text animation for scroll
  useEffect(() => {
    const waveSpans = document.querySelectorAll("#waveText span");
    const waveScrollHeight = document.body.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      const progress = window.scrollY / waveScrollHeight;

      waveSpans.forEach((span, i) => {
        const baseX = window.innerWidth - progress * (window.innerWidth + waveSpans.length * 30);
        const x = baseX + i * 28;
        const amplitude = 60;
        const wavelength = 180;
        const y = Math.sin((x + i * 15) / wavelength) * amplitude * (1 - progress);

        span.style.transform = `translate(${x}px, ${y}px)`;
        span.style.opacity = x > -40 ? 1 : 0;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full relative font-['Poppins',sans-serif] text-[#111] overflow-x-hidden">
      {/* Notebook background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            #fffef9,
            #fffef9 49px,
            #d0d0d07f 50px
          )`,
          zIndex: -1
        }}
      />

      {/* Navigation */}
      <Navbar />
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col justify-center items-start px-[5vw] overflow-hidden">
        <h1 className="text-[8vw] leading-none font-semibold relative z-[2] md:text-[6rem]">
          Ordering<br />
          <span 
            className="text-[#FF4500] inline-block pr-0.5"
            style={{
              borderRight: '3px solid #FF4500',
              animation: 'blink 0.7s infinite'
            }}
          >
            {typewriterText}
          </span><br />
          Think UniEats.
        </h1>

        {/* Floating Images */}
        <img 
          src="/Biryani.jpg" 
          alt="Biryani"
          className="absolute w-[220px] rounded-[10px] shadow-[0_12px_25px_rgba(0,0,0,0.25)] z-[1] top-[20%] left-[55%] animate-float"
          style={{ animationDelay: '0s' }}
        />
        <img 
          src="/images/pizza.png" 
          alt="Pizza"
          className="absolute w-[220px] rounded-[10px] shadow-[0_12px_25px_rgba(0,0,0,0.25)] z-[1] top-[65%] left-[25%] animate-float"
          style={{ animationDelay: '2s' }}
        />
        <img 
          src="/pasta.jpg" 
          alt="Pasta"
          className="absolute w-[220px] rounded-[10px] shadow-[0_12px_25px_rgba(0,0,0,0.25)] z-[1] top-[55%] left-[55%] animate-float"
          style={{ animationDelay: '4s' }}
        />

        {/* CTA Button */}
        {user ? (
          <Link
            to="/restaurants"
            className="mt-8 px-8 py-4 bg-[#ff5c21] text-white text-base font-semibold border-none cursor-pointer rounded transition-all duration-200 z-[3] hover:translate-y-[-3px] hover:bg-[#e63e00]"
          >
            ORDER FOOD
          </Link>
        ) : (
          <Link
            to="/login"
            className="mt-8 px-8 py-4 bg-[#ff5c21] text-white text-base font-semibold border-none cursor-pointer rounded transition-all duration-200 z-[3] hover:translate-y-[-3px] hover:bg-[#e63e00]"
          >
            ORDER FOOD
          </Link>
        )}

        {/* Small Description */}
        <div className="absolute bottom-[15%] right-[10%] max-w-[260px] text-[0.95rem] text-left leading-[1.4]">
          <span className="text-[#FF4500]">(1)</span> Small team. Big appetite.<br />
          Making food ordering simple,<br />
          one craving at a time.
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 right-8 text-[0.8rem] tracking-[2px] text-[#333] flex flex-col items-center"
        >
          <div 
            className="mb-4"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)'
            }}
          >
            SCROLL TO DISCOVER
          </div>
          <div className="text-[1.2rem] text-[#FF4500]">↓</div>
        </div>
      </section>

      {/* Full Screen Slide-in Menu */}
      <div 
        className={`fixed top-0 w-full h-full grid grid-cols-4 gap-8 justify-items-center content-center z-50 transition-all duration-500 px-8 ${
          menuOpen ? 'right-0' : 'right-[-100%]'
        }`}
        style={{
          background: `repeating-linear-gradient(
            0deg,
            #ff5900,
            #ff7c1e 79px,
            #c60f0f 80px
          )`
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-8 text-2xl cursor-pointer text-[#FF4500] hover:scale-110 transition-transform duration-200"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Menu Items */}
        <Link to="/home" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <img src="/Coffee.jpg" alt="Home" className="w-[60px] h-[60px] object-cover rounded mb-2" />
          <span className="text-[1.2rem] font-semibold text-[#111]">Home</span>
        </Link>

        <Link to="/restaurants" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">02</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Eats</span>
        </Link>

        <a href="#contact" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">03</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Contact</span>
        </a>

        <Link to="/restaurants?search=" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">04</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Search</span>
        </Link>

        <Link to="/cart" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">05</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Cart</span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">06</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Profile</span>
        </Link>

        <button className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded flex items-center justify-center mb-2 text-sm font-bold">07</div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Dark Mode</span>
        </button>
      </div>

      {/* About Section with Wave Track Text */}
      <section 
        className="relative h-screen overflow-hidden bg-white pt-[100px]"
        id="about"
      >
        <div className="hero-text" id="waveText">
          {Array.from("Every memory, every favorite bite, every flavor you love — curated into one platform.").map((char, index) => (
            <span
              key={index}
              className="absolute text-[2rem] font-extrabold whitespace-pre opacity-0 pointer-events-none"
            >
              {char}
            </span>
          ))}
        </div>
      </section>

      {/* Hamburger Menu Button (only show if using top nav instead of existing navbar) */}
      <div className="md:hidden fixed top-4 right-4 z-[20]">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-[1.8rem] cursor-pointer text-[#FF4500] transition-transform duration-200 hover:scale-110"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50%, 100% { border-color: #FF4500; }
          25%, 75% { border-color: transparent; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 14vw;
            text-align: center;
          }
          
          .hero {
            align-items: center;
            text-align: center;
            padding: 2rem;
          }
          
          .floating-img {
            width: 140px;
          }
          
          .menu-full {
            grid-template-columns: 1fr;
            padding: 1rem;
            justify-items: stretch;
            align-content: flex-start;
          }
          
          .menu-full .menu-item {
            flex-direction: row;
            justify-content: space-between;
            padding: 0.5rem 1rem;
            border-bottom: 1px solid #ddd;
          }
          
          .menu-full .menu-item img,
          .menu-full .menu-item div {
            width: 30px;
            height: 30px;
            margin: 0;
          }
          
          .menu-full .menu-item span {
            text-align: right;
            flex: 1;
            font-size: 1rem;
          }
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </div>
  );
}