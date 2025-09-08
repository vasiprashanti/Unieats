import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Orders', path: '/orders', protected: true },
    { name: 'Profile', path: '/profile', protected: true }
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-base transition-all duration-300" 
         style={{ backgroundColor: 'hsl(var(--background) / 0.9)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex-shrink-0">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#FF6B35]">UniEats</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                // Skip protected routes if user is not logged in
                if (link.protected && !user) return null;
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'text-[hsl(var(--primary))] bg-accent'
                        : 'text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="p-2 rounded-lg transition-all duration-200 relative text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h4" />
              </svg>
              {/* Cart badge - you can implement cart count logic here */}
              {/* <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span> */}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent"
                >
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))' 
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md transition-colors duration-200 text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;