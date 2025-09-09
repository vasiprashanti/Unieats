import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const MobileHeader = ({ title, showLogo = true, showThemeToggle = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-50 backdrop-blur-lg border-b border-base transition-all duration-300" 
            style={{ backgroundColor: 'hsl(var(--background) / 0.95)' }}>
      <div className="flex items-center justify-between px-4 py-3 h-14">
        {/* Logo or Title */}
        {showLogo ? (
          <Link to="/home" className="flex-shrink-0">
            <div className="flex items-center">
              <img 
                src="/unilogo.jpg" 
                alt="UniEats" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>
        ) : title ? (
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
        ) : (
          <div></div>
        )}

        {/* Theme Toggle */}
        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-200 text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;