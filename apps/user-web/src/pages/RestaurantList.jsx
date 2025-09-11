import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRestaurants } from '../api/restaurants';
import FilterPills from '../components/restaurants/FilterPills';
import RestaurantCard from '../components/restaurants/RestaurantCard';
import Navbar from '../components/Navigation/Navbar';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantList() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSortBy, setActiveSortBy] = useState('relevance');
  const [activeDietFilter, setActiveDietFilter] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'relevance',
    dietType: 'all'
  });

  // Handle URL search parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      setFilters(prev => ({
        ...prev,
        search: searchQuery
      }));
    }
  }, [location.search]);

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

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    // Only 'all' filter is supported now, so no additional logic needed
  };

  const handleSortChange = (sortId) => {
    setActiveSortBy(sortId);
    setFilters(prev => ({ ...prev, sortBy: sortId }));
  };

  const handleDietFilterChange = (dietType) => {
    setActiveDietFilter(dietType);
    setFilters(prev => ({ ...prev, dietType }));
  };

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      
      {/* Compact Hero Section */}
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-8">
          {/* Main Headline - Compact */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight" 
                style={{ color: 'hsl(var(--primary))' }}>
              Find Your Next Food Adventure
            </h1>
            <p className="text-sm md:text-base max-w-xl mx-auto text-muted">
              Discover trending restaurants and campus favorites
            </p>
          </div>

          {/* Filter Pills */}
          <FilterPills 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            filters={filters}
            onSortChange={handleSortChange}
            activeSortBy={activeSortBy}
            activeDietFilter={activeDietFilter}
            onDietFilterChange={handleDietFilterChange}
          />
        </div>
      </div>

      {/* Restaurants Section - Brought Up */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Search Results Header or Default Header */}
        {filters.search ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold" 
                  style={{ color: 'hsl(var(--foreground))' }}>
                Search Results for "{filters.search}"
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                {restaurants.length} restaurants found
              </p>
              <button
                onClick={() => {
                  setFilters(prev => ({ 
                    ...prev, 
                    search: '',
                    sortBy: 'relevance',
                    dietType: 'all'
                  }));
                  setActiveSortBy('relevance');
                  setActiveDietFilter('all');
                  window.history.pushState({}, '', '/restaurants');
                }}
                className="text-xs text-[hsl(var(--primary))] hover:underline font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" 
                  style={{ color: 'hsl(var(--foreground))' }}>Popular Restaurants</h2>
              <p className="text-sm text-muted">
                Discover amazing food around campus
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">University Campus</span>
            </div>
          </div>
        )}

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
            {/* Restaurant Grid - Pinterest Masonry Layout */}
            {restaurants.length > 0 ? (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3">
                {restaurants.map((restaurant, index) => {
                  // Different patterns for mobile vs desktop
                  const getMobileCardType = () => {
                    const mobilePatterns = [
                      'extra-tall', // 0: extra tall for Pinterest effect
                      'small',      // 1: compact
                      'medium',     // 2: medium height
                      'default',    // 3: normal
                      'tall',       // 4: tall card
                      'small',      // 5: compact
                      'default',    // 6: normal
                      'medium',     // 7: medium height
                      'extra-tall', // 8: extra tall card
                      'small',      // 9: compact
                      'tall',       // 10: tall card
                      'default',    // 11: normal
                    ];
                    return mobilePatterns[index % mobilePatterns.length];
                  };

                  const getDesktopCardType = () => {
                    const desktopPatterns = [
                      'extra-tall', // 0: extra tall card
                      'small',      // 1: compact
                      'large',      // 2: large card
                      'default',    // 3: normal
                      'tall',       // 4: tall card
                      'small',      // 5: compact
                      'medium',     // 6: medium
                      'default',    // 7: normal
                      'extra-tall', // 8: extra tall card
                      'small',      // 9: compact
                      'large',      // 10: large card
                      'medium',     // 11: medium
                    ];
                    return desktopPatterns[index % desktopPatterns.length];
                  };

                  return (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      mobileCardType={getMobileCardType()}
                      desktopCardType={getDesktopCardType()}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4">
                  <span className="text-6xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" 
                    style={{ color: 'hsl(var(--foreground))' }}>
                  {filters.search ? `No results for "${filters.search}"` : 'No restaurants found'}
                </h3>
                <p className="mb-6 text-muted">
                  {filters.search 
                    ? 'Try searching for something else or browse all restaurants.' 
                    : 'Try adjusting your filters to find more options.'
                  }
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setActiveSortBy('relevance');
                    setActiveDietFilter('all');
                    setFilters({ 
                      search: '', 
                      sortBy: 'relevance',
                      dietType: 'all'
                    });
                    if (filters.search) {
                      window.history.pushState({}, '', '/restaurants');
                    }
                  }}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
                >
                  {filters.search ? 'Browse all restaurants' : 'Clear all filters'}
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