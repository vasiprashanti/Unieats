import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';


const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();


  // Don't show global bottom nav on restaurant menu pages - they have their own custom navigation
  if (location.pathname.match(/^\/restaurants\/[a-zA-Z0-9]+$/)) {
    return null;
  }


  const navItems = [
    {
      name: 'Home',
      path: '/home',
      icon: (isActive) => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      name: 'Food',
      path: '/restaurants', 
      icon: (isActive) => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
      )
    },
    {
      name: 'Search',
      path: '/restaurants?search=true',
      icon: (isActive) => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      )
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: (isActive) => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
      
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (isActive) => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      requiresAuth: true
    }
  ];


  const getVisibleItems = () => {
    if (user) {
      return navItems;
    }
    return navItems.filter(item => !item.requiresAuth);
  };


  return (
    <div className="md:hidden fixed bottom-3 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-2xl z-[100] w-[calc(100%-2rem)] max-w-[500px] h-12 flex items-center" 
         style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center justify-around w-full h-full">
        {getVisibleItems().map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/restaurants' && location.pathname.startsWith('/restaurants/'));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-center px-2 h-full transition-all duration-200 relative hover:scale-110 ${
                isActive 
                  ? 'text-[#ff7e2d]' 
                  : 'text-[#ff7e2d]'
              }`}
            >
              <div className="relative">
                {item.icon(isActive)}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6600] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};


export default BottomNav;
