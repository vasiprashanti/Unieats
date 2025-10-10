import React, { useState } from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white  p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back! Here's your system overview
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">System Active</span>
            </div>
          </div>
        </div>

        {/* Image Card */}
        <div>
          <div >
            <img
              src="https://i.postimg.cc/k5yMpRt8/Whats-App-Image-2025-10-10-at-22-34-27-61235788.jpg"
              alt="Admin Dashboard Overview"
              className="w-full h-auto object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}