import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FilterPills = ({ activeFilter, onFilterChange, filters }) => {
  const { isDarkMode } = useTheme();
  const filterOptions = [
    {
      id: 'all',
      label: 'All',
      icon: null
    },
    {
      id: 'openNow',
      label: 'Open Now',
      icon: '🕒'
    },
    {
      id: 'fastDelivery',
      label: 'Fast Delivery',
      icon: '⚡'
    },
    {
      id: 'topRated',
      label: 'Top Rated',
      icon: '⭐'
    }
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
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
    </div>
  );
};

export default FilterPills;