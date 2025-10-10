import React, { useEffect, useRef } from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
  const scrollRef = useRef(null);
  const typewriterRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    function initHorizontalScroll() {
      const totalWidth = scrollContainer.scrollWidth;
      const viewportWidth = window.innerWidth;

      gsap.to(scrollContainer, {
        x: -(totalWidth - viewportWidth),
        ease: "none",
        scrollTrigger: {
          trigger: scrollContainer.parentNode,
          start: "top top",
          end: () => "+=" + scrollContainer.offsetWidth,
          scrub: true,
          pin: true,
        },
      });
    }

    initHorizontalScroll();

    // Recalculate on resize
    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });

    // Typewriter Effect
    const text = `Hellooo! Welcome to our Kitchen of Code at UniEats. \nWhere Cravings became code, code became UniEats. Making food ordering at Manipal University Jaipur easier than ever.`;
    let i = 0;

    function type() {
      if (i < text.length) {
        typewriterRef.current.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 40);
      }
    }

    ScrollTrigger.create({
      trigger: scrollContainer.parentNode,
      start: "top 80%",
      onEnter: () => type(),
    });

    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#fb7a29]">
      <Navbar />
      <div className="p-8">
        <section className="relative w-full min-h-screen flex flex-col items-start overflow-hidden px-6 pt-24 md:pt-32 lg:pt-36">
          {/* Header */}
          <h2 className="text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-extrabold text-black mb-6 z-10 relative leading-tight">
            The UniEats Story
          </h2>

          {/* Typewriter text */}
          <div
            ref={typewriterRef}
            className="text-white text-lg md:text-xl lg:text-2xl whitespace-pre-wrap break-words min-h-[80px] mb-6 z-10 relative"
          ></div>

          {/* Horizontal scroll images (centered vertically) */}
          {/* Horizontal scroll images slightly lower than the text */}
<div
  ref={scrollRef}
  className="flex flex-row absolute left-0 top-[70%] -translate-y-1/2 w-max"
>
  <img
    src="1.jpg"
    alt="Scene 1"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="2.jpg"
    alt="Scene 2"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="3.jpg"
    alt="Scene 3"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="4.jpg"
    alt="Scene 4"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="5.jpg"
    alt="Scene 5"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="6.jpg"
    alt="Scene 6"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
  <img
    src="8.jpg"
    alt="Scene 8"
    className="w-[500px] md:w-[500px] lg:w-[550px] h-[400px] md:h-[500px] lg:h-[550px] object-cover shadow-lg"
  />
</div>

        </section>
      </div>
      <Footer />
    </div>
  );
}
