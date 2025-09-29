import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({ trigger, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          // Add a small delay before closing to prevent flickering
          setTimeout(() => {
            if (!dropdownRef.current?.matches(':hover')) {
              setIsOpen(false);
            }
          }, 100);
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border transition-all duration-200 transform origin-top-right ${className}`}
          style={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            animation: 'dropdown-enter 0.15s ease-out',
          }}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export const DropdownItem = ({ 
  children, 
  onClick, 
  to, 
  icon, 
  className = '',
  variant = 'default' // 'default' | 'danger'
}) => {
  const baseClasses = "flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer";
  const variantClasses = {
    default: "text-[hsl(var(--foreground))] hover:bg-accent hover:text-[hsl(var(--primary))]",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700"
  };

  const content = (
    <>
      {icon && (
        <span className="mr-3 flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
    </>
  );

  // If it's a link, render as Link component
  if (to) {
    return (
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {content}
      </Link>
    );
  }

  // If it has onClick, render as button
  return (
    <div 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {content}
    </div>
  );
};

export const DropdownDivider = () => (
  <div className="h-px my-1 bg-[hsl(var(--border))]" />
);

export default DropdownMenu;