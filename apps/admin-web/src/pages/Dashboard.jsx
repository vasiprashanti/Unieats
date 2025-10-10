import React, { useState } from "react";

export default function Dashboard() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Welcome Message */}
      <h1 className="text-4xl font-bold text-center mb-6">
        Welcome to the admin dashboard!
      </h1>

      {/* Full Image */}
      <img
        src="https://i.postimg.cc/k5yMpRt8/Whats-App-Image-2025-10-10-at-22-34-27-61235788.jpg"
        alt="Admin"
        className="w-full max-w-4xl h-auto object-cover rounded-xl shadow-lg"
      />
    </div>
  );
}
