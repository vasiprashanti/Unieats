import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MenuBottomNav = ({ onToggleCategoryPanel }) => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Home',
      path: '/home',
      icon: 'fas fa-home'
    },
    {
      name: 'Eats',
      path: '/restaurants', 
      icon: 'fas fa-utensils'
    },
    {
      name: 'Categories',
      onClick: onToggleCategoryPanel,
      icon: 'fas fa-list'
    },
    {
      name: 'Search',
      path: '/restaurants?search=true',
      icon: 'fas fa-search'
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: 'fas fa-shopping-cart',
      badge: totalItems
    }
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-2xl z-[100] w-[calc(100%-2rem)] max-w-[500px] py-1.5" 
         style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
          const isActive = item.path && (location.pathname === item.path || 
            (item.path === '/restaurants' && location.pathname.startsWith('/restaurants/')));
          
          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex flex-col items-center py-1 px-2 transition-all duration-200 relative hover:scale-110 text-[#ff7e2d] bg-transparent border-none cursor-pointer"
              >
                <i className={`${item.icon} text-xl mb-0.5`}></i>
                <span className="text-[0.6rem] mt-0.5 text-[#444]">{item.name}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 transition-all duration-200 relative hover:scale-110 ${
                isActive 
                  ? 'text-[#ff7e2d]' 
                  : 'text-[#ff7e2d]'
              }`}
            >
              <div className="relative">
                <i className={`${item.icon} text-xl mb-0.5`}></i>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff3d00] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] font-semibold px-1.5 py-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[0.6rem] mt-0.5 text-[#444] hover:text-[#ff7e2d]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MenuBottomNav;