import React from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import CircularGallery from "../components/ui/CircularGallery";
import { Linkedin, Github } from "lucide-react";

// Team member data
const teamMembers = [
  {
    id: 1,
    name: "",
    role: "CEO & Founder",
    image: "https://via.placeholder.com/400x400?text=Alex+Johnson",
    bio: "Visionary leader with 15+ years of experience in tech innovation",
    linkedin: "https://linkedin.com",
    github: ""
  },
  {
    id: 2,
    name: "",
    role: "CTO",
    image: "https://via.placeholder.com/400x400?text=Mia+Thompson",
    bio: "Tech enthusiast specializing in scalable architecture and AI",
    linkedin: "https://linkedin.com",
    github: ""
  },
  {
    id: 3,
    name: "",
    role: "Head of Design",
    image: "https://via.placeholder.com/400x400?text=Ethan+Lee",
    bio: "Creative designer passionate about user-centered experiences",
    linkedin: "https://linkedin.com",
    github: ""
  },
  {
    id: 4,
    name: "",
    role: "Lead Developer",
    image: "https://via.placeholder.com/400x400?text=Sofia+Patel",
    bio: "Full-stack developer with expertise in React and Node.js",
    linkedin: "https://linkedin.com",
    github: ""
  },
  {
    id: 5,
    name: "",
    role: "Marketing Director",
    image: "https://via.placeholder.com/400x400?text=Liam+Carter",
    bio: "Strategic marketer driving growth through innovative campaigns",
    linkedin: "https://linkedin.com",
    github: ""
  },
  {
    id: 6,
    name: "",
    role: "Product Manager",
    image: "https://via.placeholder.com/400x400?text=Emma+Rodriguez",
    bio: "Product strategist focused on delivering exceptional value",
    linkedin: "https://linkedin.com",
    github: ""
  }
];

export default function Team() {
  return (
    <div className="min-h-screen bg-notebook transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-28   px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-black  bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
            Get to know the talented individuals who make everything possible. 
            Scroll through our interactive gallery to explore each team member's profile, 
            role, and expertise.
          </p>
        </div>
      </section>

    

      {/* Circular Gallery */}
      <div style={{ height: "600px", position: "relative" }} className="mb-16">
        <CircularGallery
          bend={2}
          textColor="#E65C00"
          borderRadius={0.05}
          scrollEase={0.02}
          font="bold 30px Poppins, sans-serif"
        />
      </div>

      {/* Team Grid Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-gray-300 rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden h-64 bg-gradient-to-br from-orange-100 to-yellow-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-orange-600 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm opacity-70 mb-4">{member.bio}</p>

                  {/* Social Links */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                    >
                      <Github size={20} />
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
