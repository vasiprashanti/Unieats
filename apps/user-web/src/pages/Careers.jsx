import React from "react";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext"; 

export default function Careers() {
  const { theme } = useTheme(); 

  const roles = [
    {
      image: "frontendintern.jpg",
      title: "Frontend Intern",
      description:
        "Design and code delightful user interfaces that make ordering food on campus fast, fun, and intuitive for every student.",
      link: "https://forms.gle/1g2YeAgi7QFv711DA",
    },
    {
      image: "marketingintern.jpg",
      title: "Marketing Intern",
      description:
        "Spread the UniEats buzz! Onboard Vendors, run campaigns, and engage with students to make ordering food faster.",
      link: "https://forms.gle/1g2YeAgi7QFv711DA",
    },
    {
      image: "backendintern.jpg",
      title: "Backend Developer",
      description:
        "Work behind the scenes to make orders flow fast, smooth, and reliably efficient with a strong backend architecture.",
      link: "https://forms.gle/1g2YeAgi7QFv711DA",
    },
  ];

  return (
    <div
      className={`min-h-screen font-[Poppins] transition-colors duration-300
        ${theme === "dark" ? "bg-[#141414] text-white border-white"  : "bg-gradient-to-b from-white via-[#f9f9f9] to-white text-black"}
      `}
    >
      <Navbar />

      {/* Header Section */}
      <header className="text-center px-4 pt-24 pb-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Join the Team.
        </h1>
        <p
          className={`max-w-2xl mx-auto text-justify leading-relaxed
            ${theme === "dark" ? "text-gray-300" : "text-gray-700"}
          `}
        >
          We’re looking for passionate, curious, and creative individuals to help
          us redefine how students discover and order food on campus.
        </p>
      </header>

      {/* Opportunities Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-[10%] py-12">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`border-2 rounded-2xl shadow-md hover:-translate-y-1 transition-transform overflow-hidden
              ${theme === "dark" ? "bg-[#141414] border-white" : "bg-white border-black"}
            `}
          >
            <img
              src={role.image}
              alt={role.title}
              className="w-full h-100 object-cover border-b-2 border-black"
            />
            <div className="p-6 flex flex-col">
              <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-6`}>
                {role.description}
              </p>
              <a
                href={role.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#fb7a29] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#e56818] transition-colors w-fit"
              >
                Apply Now
              </a>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
