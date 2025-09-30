import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const MobileHeader = ({ title, showLogo = true, showThemeToggle = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-white shadow-sm" 
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between px-3 py-3">
        {/* Logo */}
        {showLogo && (
          <Link to="/home" className="flex-shrink-0">
            <img 
              src="/unilogo.jpg" 
              alt="UniEats Logo" 
              className="h-6 w-auto object-contain"
            />
          </Link>
        )}
        
        {/* Address/Location */}
        <div className="flex items-center font-medium text-sm text-gray-800 cursor-pointer">
          <span>Hostel MUJ</span>
          <svg className="w-3 h-3 ml-1.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;