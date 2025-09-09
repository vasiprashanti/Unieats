import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const FilterPills = ({ activeFilter, onFilterChange, filters, onSortChange, activeSortBy, activeDietFilter, onDietFilterChange }) => {
  const { isDarkMode } = useTheme();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const filterOptions = [
    {
      id: 'all',
      label: 'All',
      icon: null
    }
  ];

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
    <div className="flex flex-wrap gap-3 justify-center">
      {/* Original Filter Pills */}
      {filterOptions.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            activeFilter === filter.id
              ? 'shadow-lg transform scale-105'
              : 'border border-base hover:shadow-md'
          }`}
          style={activeFilter === filter.id ? {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          } : {
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
          }}
        >
          {filter.icon && (
            <span className="text-sm">{filter.icon}</span>
          )}
          <span className="text-sm font-medium">{filter.label}</span>
        </button>
      ))}

      {/* Sort By Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 border border-base hover:shadow-md`}
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
          <div className="absolute top-full left-0 mt-2 w-48 z-[9999] rounded-lg border shadow-lg"
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

      {/* Veg Filter */}
      <button
        onClick={() => onDietFilterChange(activeDietFilter === 'veg' ? 'all' : 'veg')}
        className={`inline-flex items-center gap-2 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
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
        <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        </div>
        <span className="text-sm font-medium">Veg</span>
      </button>

      {/* Non-Veg Filter */}
      <button
        onClick={() => onDietFilterChange(activeDietFilter === 'non-veg' ? 'all' : 'non-veg')}
        className={`inline-flex items-center gap-2 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
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
        <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-600"></div>
        </div>
        <span className="text-sm font-medium">Non-Veg</span>
      </button>
    </div>
  );
};

export default FilterPills;