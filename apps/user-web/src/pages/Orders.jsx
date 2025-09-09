import React from "react";
import Navbar from '../components/Navigation/Navbar';

export default function Orders() {
  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      <div className="p-8">Orders</div>
    </div>
  );
}