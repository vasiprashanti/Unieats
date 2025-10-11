import React from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import CircularGallery from "../components/ui/CircularGallery";
import { Linkedin } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; 


// Team member data
const teamMembers = [
  {
    id: 1,
    name: "Vasi Tanvika",
    role: "Founder & Site Architect",
    image: "tanvika.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    id: 2,
    name: " Raunak Sadana",
    role: "Frontend Developer",
    image: "raunak.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    id: 3,
    name: "Om",
    role: "Frontend Intern",
    image: "om.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    id: 4,
    name: "Srikar",
    role: "Full Stack Developer",
    image: "srikar.jpg",
    
    linkedin: "https://linkedin.com",
  },
  {
    id: 5,
    name: "Rishikesh",
    role: "Backend Developer",
    image: "rishikesh.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    id: 6,
    name: "Pavan",
    role: "Backend Developer",
    image: "pavan.jpg",
    
    linkedin: "https://linkedin.com",
  },
];

export default function Team() {
  const { theme, isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#141414]" : "bg-notebook"
    }`}>
      <Navbar />

      {/* Circular Gallery */}
      <div style={{ height: "600px", position: "relative" }} className="mb-16">
        <CircularGallery
          bend={2}
          textColor={isDark ? "#FFA07A" : "#E65C00"}
          borderRadius={0.05}
          scrollEase={0.02}
          font="bold 30px Poppins, sans-serif"
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-28 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className={isDark ? "text-white" : "text-black"}>
              Meet Our{" "}
            </span>
            <span className="text-[#ff5c21]">Team</span>
          </h1>

          <p className={`text-lg md:text-xl opacity-80 max-w-3xl mx-auto ${
            isDark ? "text-gray-300" : "text-black"
          }`}>
            Get to know the talented individuals who make everything possible.
            Scroll through our interactive gallery to explore each team member's
            profile, role, and expertise.
          </p>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-[#141414] border border-white"
                    : "bg-white border border-black"
                }`}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden h-80 ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-600"
                    : "bg-gradient-to-br from-orange-100 to-yellow-100"
                }`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isDark ? "text-white" : "text-black"
                  }`}>
                    {member.name}
                  </h3>
                  <p className={`font-semibold mb-3 ${
                    isDark ? "text-orange-400" : "text-black"
                  }`}>
                    {member.role}
                  </p>
                  <p className={`text-sm mb-4 ${
                    isDark ? "text-gray-300" : "text-black"
                  }`}>
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className={`flex gap-3 pt-4 ${
                    isDark ? "border-t border-gray-700" : "border-t border-black"
                  }`}>
                    
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full transition-colors ${
                        isDark
                          ? "bg-gray-700 text-orange-400 hover:bg-gray-600"
                          : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                    >
                      <Linkedin size={20} />
                    </a>
                    
                  </div>
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