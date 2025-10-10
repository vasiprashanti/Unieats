import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar";
import MobileHeader from "../components/Navigation/MobileHeader";
import Footer from "../components/Footer";

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(2);
  const [currentCraving, setCurrentCraving] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cravings = [
    "Late Night Hunger",
    "Cramp Cravings",
    "Comfort Meals",
    "Protein Khaana Hai",
    "Khaane ke baad kuch meetha hona chahiye",
    "Snack Attack",
    "Instant Noodles Mood",
  ];

  const featuredRestaurants = [
    { name: "The Pizza Palace", cuisine: "Italian", rating: "4.8" },
    { name: "Burger Junction", cuisine: "American", rating: "4.6" },
    { name: "Spice Paradise", cuisine: "Indian", rating: "4.9" },
    { name: "Sushi Station", cuisine: "Japanese", rating: "4.7" },
    { name: "Taco Fiesta", cuisine: "Mexican", rating: "4.5" },
    { name: "Noodle House", cuisine: "Chinese", rating: "4.8" },
  ];

  // Categories data
  const categories = [
    { title: "PIZZA", restaurants: ["Domino's", "Pizza Hut", "La Pino'z"] },
    { title: "BURGER", restaurants: ["Burger King", "McDonald's", "Wendy's"] },
    {
      title: "MOMOS",
      restaurants: ["Wow! Momo", "Himalayan Bites", "Tandoori Momo Hub"],
    },
    { title: "COFFEE", restaurants: ["Starbucks", "CCD", "Blue Tokai"] },
    { title: "CAKE", restaurants: ["Theobroma", "CakeZone", "Monginis"] },
  ];

  // Craving rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCraving((prev) => (prev + 1) % cravings.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

      if (
        Math.abs(diffX) > Math.abs(diffY) &&
        Math.abs(diffX) > 30 &&
        timeDiff < 300
      ) {
        if (diffX > 0) {
          setActiveCard((prev) => (prev + 1) % categories.length);
        } else {
          setActiveCard(
            (prev) => (prev - 1 + categories.length) % categories.length
          );
        }
      }
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };

    const mobileSection = document.querySelector(".poker-hand-mobile");
    if (mobileSection) {
      mobileSection.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      mobileSection.addEventListener("touchend", handleTouchEnd, {
        passive: true,
      });
      mobileSection.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }

    return () => {
      if (mobileSection) {
        mobileSection.removeEventListener("touchstart", handleTouchStart);
        mobileSection.removeEventListener("touchend", handleTouchEnd);
        mobileSection.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [categories.length]);

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  const words = ["Pizza", "Burger", "Momos", "Fries", "Pasta", "Coffee"];

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (typing) {
          if (charIndex < currentWord.length) {
            setTypewriterText(currentWord.substring(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          } else {
            setTyping(false);
            setTimeout(() => {}, 1000);
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
      },
      typing ? 200 : 120
    );

    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex, typing]);

  // Wave text animation for scroll
  useEffect(() => {
    const waveSpans = document.querySelectorAll("#waveText span");
    const waveScrollHeight = document.body.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      const progress = window.scrollY / waveScrollHeight;

      waveSpans.forEach((span, i) => {
        const baseX =
          window.innerWidth -
          progress * (window.innerWidth + waveSpans.length * 30) * 1.5;
        const x = baseX + i * 28;
        const amplitude = 60;
        const wavelength = 180;
        const y =
          Math.sin((x + i * 15) / wavelength) * amplitude * (1 - progress);

        span.style.transform = `translate(${x}px, ${y}px)`;
        span.style.opacity = x > -800 ? 1 : 0;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.mobile) {
      alert(`Thanks for entering, ${formData.name}! Good luck! 🎉`);
      setFormData({ name: "", email: "", mobile: "" });
    } else {
      alert("Please fill in all fields");
    }
  };

  // Calculate parallax values
  const x =
    typeof window !== "undefined"
      ? (window.innerWidth / 2 - mousePos.x) / 40
      : 0;
  const y =
    typeof window !== "undefined"
      ? (window.innerHeight / 2 - mousePos.y) / 40
      : 0;

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
          zIndex: -1,
        }}
      />

      {/* Navigation */}
      <Navbar />
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col justify-center items-start px-[6vw] py-[10vh] overflow-hidden ">
        {/* Heading */}
        <h1 className="text-[11vw] sm:text-[9vw] md:text-[6rem] leading-tight font-semibold relative z-[2]">
          Ordering
          <br />
          <span
            className="text-[#ff5c21] inline-block pr-0.5"
            style={{
              borderRight: "3px solid #ff5c21",
              animation: "blink 0.7s infinite",
            }}
          >
            {typewriterText}
          </span>
          <br />
          Think UniEats.
        </h1>

        {/* CTA Button */}
        {user ? (
          <Link
            to="/restaurants"
            className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-[#ff5c21] text-white text-sm sm:text-base font-semibold border-none cursor-pointer rounded-lg transition-all duration-200 z-[3] hover:translate-y-[-3px] hover:bg-[#e63e00]"
          >
            ORDER FOOD
          </Link>
        ) : (
          <Link
            to="/login"
            className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-[#ff5c21] text-white text-sm sm:text-base font-semibold border-none cursor-pointer rounded-lg transition-all duration-200 z-[3] hover:translate-y-[-3px] hover:bg-[#e63e00]"
          >
            ORDER FOOD
          </Link>
        )}

        {/* Small Description */}
        <div className="absolute bottom-[12%] right-[8%] max-w-[250px] text-[0.9rem] text-left leading-[1.4] opacity-90">
          <span className="text-[#FF4500]">(1)</span> Small team. Big appetite.
          <br />
          Making food ordering simple,
          <br />
          one craving at a time.
        </div>

        {/* Scroll Indicator (always visible) */}
        <div className="absolute bottom-5 right-5 text-[0.75rem] sm:text-[0.8rem] tracking-[2px] text-[#333] flex flex-col items-center animate-bounce-slow">
          <div
            className="mb-3"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            SCROLL TO DISCOVER
          </div>
          <div className="text-[1.1rem] sm:text-[1.2rem] text-[#FF4500]">↓</div>
        </div>

        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f6] via-transparent to-transparent -z-[1]" />
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div
          className="text-center pt-10 pb-20"
          style={{ background: "#ff6a20", minHeight: "90vh" }}
        >
          <h2 className="text-[2rem] md:text-[3rem] mb-2.5 text-[#020202] font-bold">
            CATEGORIES
          </h2>
          <p className="text-[1rem] md:text-[1.2rem] mb-12 text-[#020202]">
            Pick your cravings, find your spot
          </p>

          {/* Wave Text */}
          <div
            className="hero-text relative mt-8 h-32 overflow-visible"
            style={{ position: "sticky", top: 0 }}
            id="waveText"
          >
            {Array.from(
              "Every memory, every favorite bite, every flavor you love — curated into one platform."
            ).map((char, index, arr) => {
              const progress = index / arr.length;
              const waveY = Math.sin(progress * 2 * Math.PI) * 20; // wave height
              const xOffset = index * 16; // horizontal spacing between chars
              return (
                <span
                  key={index}
                  className="absolute text-[1.2rem] md:text-[1.8rem] font-extrabold whitespace-pre opacity-0 pointer-events-none text-[#020202]"
                  style={{
                    left: `${xOffset}px`,
                    top: `${waveY + 10}px`,
                    opacity: 1, // make visible immediately
                    transition: "top 0.3s",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Desktop Poker Hand */}
          <div className="poker-hand hidden md:flex relative justify-center mt-10">
            {categories.map((category, index) => {
              const rotations = [
                "-rotate-[15deg]",
                "-rotate-[7deg]",
                "rotate-0",
                "rotate-[7deg]",
                "rotate-[15deg]",
              ];
              return (
                <div
                  key={category.title}
                  className={`category-card relative w-[220px] h-[400px] p-5 rounded-2xl bg-[#fafafa] shadow-lg text-center transition-all duration-400 cursor-pointer -ml-[70px] ${rotations[index]} hover:rotate-0 hover:scale-110 hover:z-10`}
                >
                  <h3 className="text-[2.2rem] mb-2.5 text-[#ff6600] font-bold">
                    {category.title}
                  </h3>
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
            <div className="relative w-full max-w-[350px] h-full flex justify-center items-center">
              {categories.map((category, index) => {
                let cardClass =
                  "category-card-mobile absolute w-full h-[380px] sm:h-[410px] max-w-[280px] rounded-2xl bg-[#fafafa] shadow-xl text-center cursor-pointer transition-all duration-700 ease-out";

                if (index === activeCard) {
                  cardClass +=
                    " translate-x-0 scale-110 opacity-100 z-30 rotate-[2deg]";
                } else if (
                  index === activeCard - 1 ||
                  (activeCard === 0 && index === categories.length - 1)
                ) {
                  cardClass +=
                    " -translate-x-[120px] scale-80 opacity-40 z-20 -rotate-[8deg]";
                } else if (
                  index === activeCard + 1 ||
                  (activeCard === categories.length - 1 && index === 0)
                ) {
                  cardClass +=
                    " translate-x-[120px] scale-80 opacity-40 z-20 rotate-[8deg]";
                } else {
                  cardClass +=
                    " translate-x-0 scale-75 opacity-0 z-10 pointer-events-none rotate-0";
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

      {/* Hunger + Lucky Draw Combined Section */}
      <section className="flex flex-col justify-center items-center min-h-screen px-4 md:px-8 py-20 text-center">
        {/* Lucky Draw Content Inside Same Section */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row rounded-3xl shadow-2xl overflow-hidden bg-white">
            {/* Left Side - Image */}
            <div className="w-full lg:w-[65%] flex items-center justify-center bg-gray-50">
              <div className="relative w-full h-[300px] sm:h-[400px] lg:h-full">
                <img
                  src="luckydraw.png"
                  alt="Lucky Draw Promotion"
                  className="absolute inset-0 w-full h-full object-contain lg:object-cover"
                />
              </div>
            </div>

            {/* Right Side - Entry Form */}
            <div className="w-full lg:w-[35%] bg-white p-8 md:p-10 lg:border-l-4 lg:border-dashed lg:border-orange-300 flex items-center">
              <div className="w-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <img
                    src="unilogo.jpg"
                    alt="Logo"
                    className="mx-auto mb-3 w-20 h-auto"
                  />
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    Lucky Draw Entry Form
                  </p>
                  <div className="w-20 h-1 bg-orange-500 mx-auto mt-3 rounded-full"></div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
                  />

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter your mobile"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4"
                >
                  Enter Lucky Draw
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  By entering, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Screen Slide-in Menu */}
      <div
        className={`fixed top-0 w-full h-full grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center content-center z-50 transition-all duration-500 px-8 ${
          menuOpen ? "right-0" : "right-[-100%]"
        }`}
        style={{
          background: `repeating-linear-gradient(
            0deg,
            #ff5900,
            #ff7c1e 79px,
            #c60f0f 80px
          )`,
        }}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-8 text-2xl cursor-pointer text-white hover:scale-110 transition-transform duration-200 bg-black/20 w-10 h-10 rounded-full flex items-center justify-center"
        >
          ✕
        </button>

        <Link
          to="/home"
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center mb-2 text-2xl shadow-lg">
            🏠
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Home</span>
        </Link>

        <Link
          to="/restaurants"
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            02
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Eats</span>
        </Link>

        <a
          href="#contact"
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            03
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">
            Contact
          </span>
        </a>

        <Link
          to="/restaurants?search="
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            04
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">
            Search
          </span>
        </Link>

        <Link
          to="/cart"
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            05
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">Cart</span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]"
        >
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            06
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">
            Profile
          </span>
        </Link>

        <button className="flex flex-col items-center cursor-pointer text-center transition-transform duration-300 hover:translate-y-[-5px]">
          <div className="w-[60px] h-[60px] bg-[#FF4500] text-white rounded-full flex items-center justify-center mb-2 text-sm font-bold shadow-lg">
            07
          </div>
          <span className="text-[1.2rem] font-semibold text-[#111]">
            Dark Mode
          </span>
        </button>
      </div>

      <div className="md:hidden fixed top-4 right-4 z-[20]">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-[1.8rem] cursor-pointer text-[#FF4500] transition-transform duration-200 hover:scale-110 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          ☰
        </button>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          50%,
          100% {
            border-color: #ff4500;
          }
          25%,
          75% {
            border-color: transparent;
          }
        }

        @media (max-width: 768px) {
          section {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
