import React from "react";
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      <div className="p-8">
          
      </div>
      <Footer />
    </div>
  );
}