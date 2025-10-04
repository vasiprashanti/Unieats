import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';
import Footer from '../components/Footer';

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(2); // Middle card active by default

  // Categories data
  const categories = [
    { title: 'PIZZA', restaurants: ["Domino's", "Pizza Hut", "La Pino'z"] },
    { title: 'BURGER', restaurants: ["Burger King", "McDonald's", "Wendy's"] },
    { title: 'MOMOS', restaurants: ["Wow! Momo", "Himalayan Bites", "Tandoori Momo Hub"] },
    { title: 'COFFEE', restaurants: ["Starbucks", "CCD", "Blue Tokai"] },
    { title: 'CAKE', restaurants: ["Theobroma", "CakeZone", "Monginis"] }
  ];

  // Mobile swipe functionality
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const diffX = startX - endX;
      const diffY = startY - endY;
      const timeDiff = endTime - startTime;

      // Only handle horizontal swipes (ignore vertical) with reasonable timing
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30 && timeDiff < 300) {
        if (diffX > 0) {
          // Swipe left - next card
          setActiveCard((prev) => (prev + 1) % categories.length);
        } else {
          // Swipe right - previous card
          setActiveCard((prev) => (prev - 1 + categories.length) % categories.length);
        }
      }
    };

    const handleTouchMove = (e) => {
      // Prevent default scrolling during horizontal swipe
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };

    const mobileSection = document.querySelector('.poker-hand-mobile');
    if (mobileSection) {
      mobileSection.addEventListener('touchstart', handleTouchStart, { passive: true });
      mobileSection.addEventListener('touchend', handleTouchEnd, { passive: true });
      mobileSection.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (mobileSection) {
        mobileSection.removeEventListener('touchstart', handleTouchStart);
        mobileSection.removeEventListener('touchend', handleTouchEnd);
        mobileSection.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [categories.length]);

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
    }, typing ? 200 : 120);

    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex, typing]);

  // Wave text animation for scroll
  useEffect(() => {
    const waveSpans = document.querySelectorAll("#waveText span");
    const waveScrollHeight = document.body.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      const progress = window.scrollY / waveScrollHeight;

      waveSpans.forEach((span, i) => {
        const baseX = window.innerWidth - progress * (window.innerWidth + waveSpans.length * 30) * 1.5;
        const x = baseX + i * 28;
        const amplitude = 60;
        const wavelength = 180;
        const y = Math.sin((x + i * 15) / wavelength) * amplitude * (1 - progress);

        span.style.transform = `translate(${x}px, ${y}px)`;
        span.style.opacity = x > -800 ? 1 : 0;
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
            className="text-[#ff5c21] inline-block pr-0.5"
            style={{
              borderRight: '3px solid #ff5c21',
              animation: 'blink 0.7s infinite'
            }}
          >
            {typewriterText}
          </span><br />
          Think UniEats.
        </h1>



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

      {/* Categories Section */}
      <section className="categories-section">
        <div className="text-center pt-10 pb-20" style={{ background: '#ff6a20', minHeight: '90vh' }}>
          <h2 className="text-[3rem] mb-2.5 text-[#020202] font-bold">CATEGORIES</h2>
          <p className="text-[1.2rem] mb-12 text-[#020202]">Pick your cravings, find your spot</p>
          
          {/* Wave Text */}
          <div className="hero-text relative mt-8 h-32 overflow-visible" id="waveText">
            {Array.from("Every memory, every favorite bite, every flavor you love — curated into one platform.").map((char, index) => (
              <span
                key={index}
                className="absolute text-[1.8rem] font-extrabold whitespace-pre opacity-0 pointer-events-none text-[#020202]"
              >
                {char}
              </span>
            ))}
          </div>
          
          {/* Desktop Poker Hand */}
          <div className="poker-hand hidden md:flex relative justify-center mt-10">
            {categories.map((category, index) => {
              const rotations = ['-rotate-[15deg]', '-rotate-[7deg]', 'rotate-0', 'rotate-[7deg]', 'rotate-[15deg]'];
              return (
                <div
                  key={category.title}
                  className={`category-card relative w-[220px] h-[400px] p-5 rounded-2xl bg-[#fafafa] shadow-lg text-center transition-all duration-400 cursor-pointer -ml-[70px] ${rotations[index]} hover:rotate-0 hover:scale-110 hover:z-10`}
                >
                  <h3 className="text-[2.2rem] mb-2.5 text-[#ff6600] font-bold">{category.title}</h3>
                  {category.restaurants.map((restaurant, idx) => (
                    <Link
                      key={idx}
                      to={`/restaurants?search=${restaurant}`}
                      className="block mt-5 text-[#111111] font-medium border-b border-[#e63e00] no-underline hover:text-[#ff6600] transition-colors"
                    >
                      {restaurant}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Mobile Carousel Cards */}
          <div className="poker-hand-mobile md:hidden relative w-full h-[420px] sm:h-[450px] flex justify-center items-center overflow-hidden px-4">
            <div className="relative w-full max-w-[320px] h-full flex justify-center items-center">
              {categories.map((category, index) => {
                let cardClass = 'category-card-mobile absolute w-full h-[380px] sm:h-[410px] max-w-[300px] rounded-2xl bg-[#fafafa] shadow-xl text-center cursor-pointer transition-all duration-700 ease-out';
                
                if (index === activeCard) {
                  // Active card - centered, full opacity
                  cardClass += ' translate-x-0 scale-100 opacity-100 z-20';
                } else if (index === activeCard - 1 || (activeCard === 0 && index === categories.length - 1)) {
                  // Previous card - left side preview
                  cardClass += ' -translate-x-[280px] scale-75 opacity-30 z-10';
                } else if (index === activeCard + 1 || (activeCard === categories.length - 1 && index === 0)) {
                  // Next card - right side preview
                  cardClass += ' translate-x-[280px] scale-75 opacity-30 z-10';
                } else {
                  // Hidden cards
                  cardClass += ' translate-x-[400px] scale-60 opacity-0 z-5 pointer-events-none';
                }

                return (
                  <div
                    key={category.title}
                    className={cardClass}
                    onClick={() => setActiveCard(index)}
                  >
                    <div className="p-6 h-full flex flex-col justify-between bg-gradient-to-br from-[#fafafa] to-[#f0f0f0] rounded-2xl shadow-lg border border-[#e0e0e0]">
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-[2rem] sm:text-[2.2rem] mb-6 text-[#ff6600] font-extrabold tracking-wider">
                          {category.title}
                        </h3>
                        <div className="space-y-3">
                          {category.restaurants.map((restaurant, idx) => (
                            <Link
                              key={idx}
                              to={`/restaurants?search=${restaurant}`}
                              className="block text-[1rem] sm:text-[1.1rem] text-[#333] font-semibold no-underline hover:text-[#ff6600] transition-all duration-300 py-2 px-3 rounded-lg hover:bg-[#ff6600]/10 hover:shadow-md transform hover:translate-x-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {restaurant}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 text-[0.8rem] text-[#666] font-medium">
                        Swipe or tap to explore
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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