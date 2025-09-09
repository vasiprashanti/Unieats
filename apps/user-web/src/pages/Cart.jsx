import React from "react";
import Navbar from '../components/Navigation/Navbar';

export default function Cart() {
  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      <div className="p-8">Cart</div>
    </div>
  );
}