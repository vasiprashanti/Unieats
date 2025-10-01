import React from "react";
import Navbar from '../components/Navigation/Navbar';

export default function Cart() {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white">
      <Navbar />
      <div className="pt-20 p-8">Cart</div>
    </div>
  );
}