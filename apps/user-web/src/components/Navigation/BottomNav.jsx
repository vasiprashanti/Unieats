import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Home',
      path: '/home',
      icon: (isActive) => (
        <svg className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Restaurants',
      path: '/restaurants',
      icon: (isActive) => (
        <svg className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: (isActive) => (
        <svg className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h4" />
        </svg>
      ),
      badge: totalItems
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: (isActive) => (
        <svg className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (isActive) => (
        <svg className="w-4 h-4" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-1">
        {getVisibleItems().map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/restaurants' && location.pathname.startsWith('/restaurants/'));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 transition-all duration-200 relative ${
                isActive 
                  ? 'text-[#ff6600]' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="relative mb-1">
                {item.icon(isActive)}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6600] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${
                isActive ? 'text-[#ff6600]' : 'text-gray-600'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;