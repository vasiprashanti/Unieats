import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const FilterPills = ({ activeFilter, onFilterChange, filters, onSortChange, activeSortBy, activeDietFilter, onDietFilterChange }) => {
  const { isDarkMode } = useTheme();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Removed "All" button as requested
  const filterOptions = [];

  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'rating', label: 'Rating (High to Low)' },
    { id: 'deliveryTime', label: 'Delivery Time' },
    { id: 'costLowToHigh', label: 'Cost (Low to High)' },
    { id: 'costHighToLow', label: 'Cost (High to Low)' },
    { id: 'popularity', label: 'Popularity' }
  ];

  const handleSortSelect = (sortId) => {
    onSortChange(sortId);
    setShowSortDropdown(false);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-between items-center">
      {/* Left side - Veg/Non-Veg filters (smaller) */}
      <div className="flex gap-2">
        {/* Veg Filter - Smaller */}
        <button
          onClick={() => onDietFilterChange(activeDietFilter === 'veg' ? 'all' : 'veg')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            activeDietFilter === 'veg'
              ? 'shadow-lg transform scale-105'
              : 'border border-base hover:shadow-md'
          }`}
          style={activeDietFilter === 'veg' ? {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          } : {
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
          }}
        >
          <div className="w-3 h-3 border border-green-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
          </div>
          <span className="text-xs font-medium">Veg</span>
        </button>

        {/* Non-Veg Filter - Smaller */}
        <button
          onClick={() => onDietFilterChange(activeDietFilter === 'non-veg' ? 'all' : 'non-veg')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            activeDietFilter === 'non-veg'
              ? 'shadow-lg transform scale-105'
              : 'border border-base hover:shadow-md'
          }`}
          style={activeDietFilter === 'non-veg' ? {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          } : {
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
          }}
        >
          <div className="w-3 h-3 border border-red-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-600"></div>
          </div>
          <span className="text-xs font-medium">Non-Veg</span>
        </button>
      </div>

      {/* Right side - Sort By Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 border border-base hover:shadow-md`}
          style={{
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span className="text-sm font-medium">Sort by</span>
          <svg className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showSortDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 z-[9999] rounded-lg border shadow-lg"
               style={{ 
                 backgroundColor: 'hsl(var(--card))',
                 borderColor: 'hsl(var(--border))'
               }}>
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortSelect(option.id)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  activeSortBy === option.id ? 'font-semibold' : ''
                }`}
                style={{ 
                  color: activeSortBy === option.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'hsl(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPills;