import React, { useState, useEffect } from 'react';
import { getRestaurants } from '../api/restaurants';
import FilterPills from '../components/restaurants/FilterPills';
import RestaurantCard from '../components/restaurants/RestaurantCard';
import Navbar from '../components/Navigation/Navbar';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantList() {
  const { isDarkMode } = useTheme();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    isOpen: false,
    fastDelivery: false,
    topRated: false
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await getRestaurants(filters);
      if (response.success) {
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    
    // Reset all filters
    const newFilters = {
      search: filters.search,
      isOpen: false,
      fastDelivery: false,
      topRated: false
    };

    // Apply selected filter
    if (filterId !== 'all') {
      if (filterId === 'openNow') newFilters.isOpen = true;
      if (filterId === 'fastDelivery') newFilters.fastDelivery = true;
      if (filterId === 'topRated') newFilters.topRated = true;
    }

    setFilters(newFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16">
          {/* Campus Food Discovery Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 text-[#FF6B35] px-4 py-2 rounded-full">
              <span className="text-lg">🍽️</span>
              <span className="font-medium text-sm">Campus Food Discovery</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" 
                style={{ color: 'hsl(var(--primary))' }}>
              Find Your Next<br />
              Food Adventure
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-muted">
              Discover trending restaurants, hidden gems, and campus favorites.<br />
              From late-night snacks to gourmet meals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search restaurants, cuisines, or dishes..."
                className="w-full pl-6 pr-16 py-4 text-lg border border-base rounded-2xl backdrop-blur-sm focus:outline-none shadow-lg transition-colors duration-300"
                style={{ 
                  backgroundColor: 'hsl(var(--card) / 0.8)', 
                  color: 'hsl(var(--foreground))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-3 rounded-xl transition-colors"
                style={{ 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))' 
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Filter Pills */}
          <FilterPills 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" 
                style={{ color: 'hsl(var(--foreground))' }}>Popular Restaurants</h2>
            <p className="text-muted">
              Discover amazing food around campus
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">University Campus</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-muted">Finding delicious restaurants...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Restaurant Grid */}
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isLarge={index === 0} // Make first card large
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4">
                  <span className="text-6xl">🍽️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" 
                    style={{ color: 'hsl(var(--foreground))' }}>No restaurants found</h3>
                <p className="mb-6 text-muted">Try adjusting your search or filters to find more options.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                    setFilters({ search: '', isOpen: false, fastDelivery: false, topRated: false });
                  }}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#FF6B35] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}