import React, { useEffect } from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

// Founder & VC data
const founders = [
  {
    id: 1,
    name: "Vasi Tanvika",
    role: "Founder & Site Architect",
    image: "tanvika.jpg",
  },
]; // ✅ closed the founders array properly

// Development Team data
const devTeam = [
  {
    id: 1,
    name: "Raunak Sadana",
    role: "Developer @ TechLearn",
    image: "raunak.jpg",
  },
  {
    id: 2,
    name: "Om",
    role: "Intern @ TechLearn",
    image: "om.jpg",
  },
  {
    id: 3,
    name: "Srikar",
    role: "Developer @ TechLearn",
    image: "srikar.jpg",
  },
  {
    id: 4,
    name: "Rishikesh",
    role: "Developer @ TechLearn",
    image: "rishikesh.jpg",
  },
  {
    id: 5,
    name: "Pavan",
    role: "Developer @ TechLearn",
    image: "pavan.jpg",
  },
];

export default function Team() {
  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#141414]" : "bg-notebook"
      }`}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-28 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className={isDark ? "text-white" : "text-black"}>
              Meet Our{" "}
            </span>
            <span className="text-[#ff5c21]">Team</span>
          </h1>

          <p
            className={`text-lg md:text-xl opacity-80 max-w-3xl mx-auto ${
              isDark ? "text-gray-300" : "text-black"
            }`}
          >
            Learn more about our founder, investor, and the dedicated
            development team behind UniEats — a Techlearn Solutions initiative.
          </p>
        </div>
      </section>

      {/* Founder & Investor Section */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-3xl font-bold mb-10 text-center ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Founder
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((member) => (
              <div
                key={member.id}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-[#141414] border border-white"
                    : "bg-white border border-black"
                }`}
              >
                <div
                  className={`relative overflow-hidden h-96 ${
                    isDark
                      ? "bg-gradient-to-br from-gray-700 to-gray-600"
                      : "bg-gradient-to-br from-orange-100 to-yellow-100"
                  }`}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3
                    className={`text-2xl font-bold mb-1 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {member.name}
                  </h3>
                  <p
                    className={`font-semibold mb-2 ${
                      isDark ? "text-orange-400" : "text-black"
                    }`}
                  >
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Team Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className={isDark ? "text-white" : "text-black"}>
              Meet Our{" "}
            </span>
            <span className="text-[#ff5c21]">Team</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {devTeam.map((member) => (
              <div
                key={member.id}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-[#141414] border border-white"
                    : "bg-white border border-black"
                }`}
              >
                <div
                  className={`relative overflow-hidden h-80 ${
                    isDark
                      ? "bg-gradient-to-br from-gray-700 to-gray-600"
                      : "bg-gradient-to-br from-orange-100 to-yellow-100"
                  }`}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3
                    className={`text-2xl font-bold mb-1 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {member.name}
                  </h3>
                  <p
                    className={`font-semibold mb-3 ${
                      isDark ? "text-orange-400" : "text-black"
                    }`}
                  >
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
