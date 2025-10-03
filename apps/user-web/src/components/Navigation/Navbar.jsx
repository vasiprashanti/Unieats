import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import DropdownMenu, { DropdownItem, DropdownDivider } from '../ui/DropdownMenu';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Search functionality
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to restaurants page with search query
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on search input after animation
      setTimeout(() => {
        const searchInput = document.getElementById('navbar-search');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Eats', path: '/restaurants' },
    { name: 'Cart', path: '/cart' },
    { name: 'Profile', path: '/profile', protected: true }
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-300 mt-0 w-[90%] max-w-[1100px]" 
         style={{ 
           backgroundColor: 'hsl(var(--card) / 0.92)',
           borderColor: 'hsl(var(--border))',
           boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
         }}>
      <div className="w-full px-5 py-2">
        <div className="grid grid-cols-3 items-center h-12">
          {/* Logo */}
          <div className="flex justify-start">
            <Link to="/home" className="flex-shrink-0">
              <div className="flex items-center">
                <img 
                  src="/unilogo.jpg" 
                  alt="UniEats" 
                  className="h-10 w-auto object-contain cursor-pointer"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center space-x-6">
              {navLinks.map((link) => {
                // Skip protected routes if user is not logged in
                if (link.protected && !user) return null;
                
                // Skip Cart and Profile from center navigation
                if (link.name === 'Cart' || link.name === 'Profile') {
                  return null;
                }
                
                // Render remaining links (Home and Eats) as text
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-base font-normal hover:scale-110 transition-all duration-200"
                    style={{ 
                      color: 'hsl(var(--primary))',
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center justify-end space-x-4">
            {/* Search Bar */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    id="navbar-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search restaurants..."
                    className="w-64 pl-4 pr-10 py-2 text-sm border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all duration-200"
                    style={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))'
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[#ff7e2d] hover:text-[#ff6600] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={toggleSearch}
                  className="p-2 rounded-lg transition-all duration-200 text-[#ff7e2d] hover:text-[#ff6600] hover:bg-accent"
                  aria-label="Search restaurants"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 text-[#ff7e2d] hover:text-[#ff6600] hover:bg-accent"
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
              className="p-2 rounded-lg transition-all duration-200 relative text-[#ff7e2d] hover:text-[#ff6600] hover:bg-accent"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6600] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu
                trigger={
                  <div className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 text-[#ff7e2d] hover:text-[#ff6600] hover:bg-accent">
                    <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                }
              >
                <DropdownItem
                  to="/orders"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                >
                  Past Orders
                </DropdownItem>
                <DropdownItem
                  to="/profile"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Account Settings
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  onClick={handleLogout}
                  variant="danger"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-[hsl(var(--foreground))] hover:bg-accent transition-colors duration-200"
              >
                Login
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