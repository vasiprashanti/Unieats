import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRestaurants } from '../api/restaurants';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';

export default function RestaurantList() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeCategory, setActiveCategory] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'relevance',
    dietType: 'all'
  });

  // Categories data with local images and cuisine mappings
  const categories = [
    { id: 1, name: 'Biryani', image: '/Biryani.jpg', cuisines: ['Indian', 'Multi-cuisine'] },
    { id: 2, name: 'Burger', image: '/Burger.jpg', cuisines: ['Fast Food', 'Multi-cuisine'] },
    { id: 3, name: 'Noodles', image: '/Chowmein.jpg', cuisines: ['Chinese', 'Multi-cuisine', 'Fast Food'] },
    { id: 4, name: 'Coffee', image: '/Coffee.jpg', cuisines: ['Coffee', 'Beverages', 'Cafe'] },
    { id: 5, name: 'Momos', image: '/momos.jpg', cuisines: ['Chinese', 'Multi-cuisine', 'Fast Food'] },
    { id: 6, name: 'Pasta', image: '/pasta.jpg', cuisines: ['Italian', 'Multi-cuisine'] },
    { id: 7, name: 'Pizza', image: '/pizza.jpg', cuisines: ['Italian', 'Multi-cuisine', 'Fast Food'] }
  ];

  // Restaurant image mapping
  const restaurantImages = {
    'Chatkara': '/Chatkara.jpg',
    'Chilling Point': '/Chilling Point.jpg', 
    'Dev Sweets': '/Dev Sweets.jpg',
    'Dialog': '/Dialog.jpg',
    'Italian Oven': '/Italian Oven.jpg',
    "Let's Go Live": "/Let's Go Live.jpg",
    'Nescafe': '/Nescafe.jpg',
    'Subway': '/Subway.jpg',
    'Tea Tradition': '/Tea Tradition.jpg',
    'The Health Bar': '/The Health Bar.jpg'
  };

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

  // Handle category selection with smooth scroll and filtering
  const handleCategoryClick = (categoryId) => {
    const newActiveCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActiveCategory);
    
    // Filter restaurants based on selected category
    if (newActiveCategory) {
      const selectedCategory = categories.find(cat => cat.id === newActiveCategory);
      const filtered = allRestaurants.filter(restaurant => 
        selectedCategory.cuisines.some(cuisine => 
          restaurant.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
        )
      );
      setFilteredRestaurants(filtered);
      setRestaurants(filtered);
    } else {
      setFilteredRestaurants(allRestaurants);
      setRestaurants(allRestaurants);
    }
    
    // Smooth scroll to restaurants section
    const restaurantsSection = document.querySelector('.restaurants-section');
    if (restaurantsSection) {
      restaurantsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

   const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await getRestaurants(filters);
      if (response.success) {
        setAllRestaurants(response.data);
        setFilteredRestaurants(response.data);
        setRestaurants(response.data);
      } else {
        // Fallback to test data if API fails (for testing local images)
        const fallbackRestaurants = [
          { id: 1, name: 'Chatkara', cuisine: 'Indian', rating: '4.2', deliveryTime: '25-30' },
          { id: 2, name: 'Chilling Point', cuisine: 'Multi-cuisine', rating: '4.0', deliveryTime: '30-35' },
          { id: 3, name: 'Dev Sweets', cuisine: 'Sweets', rating: '4.5', deliveryTime: '20-25' },
          { id: 4, name: 'Dialog', cuisine: 'Cafe', rating: '4.1', deliveryTime: '15-20' },
          { id: 5, name: 'Italian Oven', cuisine: 'Italian', rating: '4.3', deliveryTime: '25-30' },
          { id: 6, name: "Let's Go Live", cuisine: 'Fast Food', rating: '3.9', deliveryTime: '20-25' },
          { id: 7, name: 'Nescafe', cuisine: 'Coffee', rating: '4.0', deliveryTime: '10-15' },
          { id: 8, name: 'Subway', cuisine: 'Fast Food', rating: '4.2', deliveryTime: '15-20' },
          { id: 9, name: 'Tea Tradition', cuisine: 'Beverages', rating: '4.1', deliveryTime: '10-15' },
          { id: 10, name: 'The Health Bar', cuisine: 'Healthy', rating: '4.4', deliveryTime: '20-25' }
        ];
        setRestaurants(fallbackRestaurants);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Fallback to test data if API fails (for testing local images)
      const fallbackRestaurants = [
        { id: 1, name: 'Chatkara', cuisine: 'Indian', rating: '4.2', deliveryTime: '25-30' },
        { id: 2, name: 'Chilling Point', cuisine: 'Multi-cuisine', rating: '4.0', deliveryTime: '30-35' },
        { id: 3, name: 'Dev Sweets', cuisine: 'Sweets', rating: '4.5', deliveryTime: '20-25' },
        { id: 4, name: 'Dialog', cuisine: 'Cafe', rating: '4.1', deliveryTime: '15-20' },
        { id: 5, name: 'Italian Oven', cuisine: 'Italian', rating: '4.3', deliveryTime: '25-30' },
        { id: 6, name: "Let's Go Live", cuisine: 'Fast Food', rating: '3.9', deliveryTime: '20-25' },
        { id: 7, name: 'Nescafe', cuisine: 'Coffee', rating: '4.0', deliveryTime: '10-15' },
        { id: 8, name: 'Subway', cuisine: 'Fast Food', rating: '4.2', deliveryTime: '15-20' },
        { id: 9, name: 'Tea Tradition', cuisine: 'Beverages', rating: '4.1', deliveryTime: '10-15' },
        { id: 10, name: 'The Health Bar', cuisine: 'Healthy', rating: '4.4', deliveryTime: '20-25' }
      ];
      setRestaurants(fallbackRestaurants);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
  };

  const handleVegToggle = () => {
    const newVegState = !isVegOnly;
    setIsVegOnly(newVegState);
    setFilters(prev => ({ 
      ...prev, 
      dietType: newVegState ? 'vegetarian' : 'all'
    }));
  };

  

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{
           backgroundColor: 'hsl(var(--background))',
           color: 'hsl(var(--foreground))',
           margin: 0,
           fontFamily: "'DM Sans', sans-serif",
           textAlign: 'center',
           padding: 0
         }}>
      <Navbar />
      <MobileHeader title="Restaurants" showCart={true} />
      {/* CSS Styles */}
      <style jsx>{`
        * {
          scrollbar-width: none;
          scrollbar-color: #f69558 #f1f1f1;
          transition: background 0.3s, color 0.3s;
        }

        ::-webkit-scrollbar {
          width: 2px;
          height: 1px;
        }
        ::-webkit-scrollbar-track {
          background: #fffdfd;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #060505;
        }

        .dark-mode ::-webkit-scrollbar-track {
          background: #2a2a2a;
        }
        .dark-mode ::-webkit-scrollbar-thumb {
          background: #ffffff;
        }

        /* Veg Switch Styles */
        .switch {
          flex: 0 0 auto;
          width: 3.5rem;
          height: 2rem;
          position: relative;
        }

        input[type=checkbox] {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          height: 100%;
          background-color: #ddd;
          border-radius: 1rem;
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        input[type=checkbox]::before {
          content: '';
          display: block;
          width: 1.8rem;
          height: 1.8rem;
          background-color: #010101;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 0.1rem;
          transform: translateY(-50%);
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type=checkbox]:checked::before {
          background-color: #28a745;
          left: calc(100% - 1.8rem - 0.1rem);
        }

        input[type=checkbox]:checked {
          background-color: #cde6cd;
        }

        .dark-mode input[type=checkbox]::before {
          background-color: #fff;
        }
        .dark-mode input[type=checkbox] {
          background-color: #555;
        }
        .dark-mode input[type=checkbox]:checked {
          background-color: #28a745;
        }

        /* Arc Carousel Styles */
        .arc-carousel {
          perspective: 1000px;
          overflow-x: auto;
          overflow-y: visible;
          padding: 40px 0 60px;
          width: 100%;
          scroll-behavior: smooth;
        }

        .arc-track {
          display: flex;
          justify-content: center;
          gap: 16px;
          position: relative;
          height: 200px;
          padding-bottom: 60px;
        }

        .category-card {
          flex: 0 0 auto;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease, z-index 0.3s, background 0.3s;
        }

        .category-card img {
          width: clamp(90px, 8vw, 140px);
          height: clamp(90px, 8vw, 150px);
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 8px;
          border: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card span {
          font-size: clamp(0.7rem, 2vw, 1rem);
          font-weight: 500;
          color: #333;
          display: block;
        }

        /* Selected category - Elegant glow effect */
        .category-card.active {
          position: relative;
        }
        
        .category-card.active img {
          border: 3px solid #ff6600;
          box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.1), 
                      0 0 20px rgba(255, 102, 0, 0.3),
                      0 4px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .category-card.active span {
          color: #ff6600;
          font-weight: 600;
        }

        /* Mobile: Straight layout */
        @media (max-width: 767px) {
          .arc-carousel {
            overflow-x: auto;
            padding: 20px 0 40px;
          }
          
          .arc-track {
            justify-content: flex-start;
            padding: 20px 12px 16px 12px;
            height: auto;
            gap: 12px;
          }

          .category-card {
            position: relative;
          }

          .category-card img {
            width: 80px;
            height: 80px;
          }

          .category-card span {
            font-size: 0.8rem;
          }
          
          .category-card:not(.active):active img {
            transform: scale(0.98);
          }
        }

        /* Tablets and Desktop: Subtle Arc effect */
        @media (min-width: 768px) {
          .arc-track {
            justify-content: center;
            padding: 60px 12px 40px 12px;
            height: 240px;
          }

          .category-card:nth-child(1) { transform: translateY(25px); }
          .category-card:nth-child(2) { transform: translateY(10px); }
          .category-card:nth-child(3) { transform: translateY(3px); }
          .category-card:nth-child(4) { transform: translateY(0px); }
          .category-card:nth-child(5) { transform: translateY(3px); }
          .category-card:nth-child(6) { transform: translateY(10px); }
          .category-card:nth-child(7) { transform: translateY(25px); }

          .category-card.active {
            position: relative;
          }

          .category-card:not(.active):hover img {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .category-card:hover {
            transform: translateY(calc(var(--y-offset, 0px) - 5px));
          }
        }

        .arc-carousel::-webkit-scrollbar {
          display: none;
        }
        .arc-carousel {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        

        /* Restaurant Cards */
        .restaurant-card {
          background: hsl(var(--card));
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
          width: 100%;
          max-width: 250px
        }

        .restaurant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }

        .restaurant-card img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 10px 10px 0 0;
          display: block;
        }

        .restaurant-info {
          padding: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .restaurant-info .name-rating {
          font-weight: 700;
          font-size: 1rem;
          color: hsl(var(--foreground));
          transition: color 0.3s;
        }

        .restaurant-info .cuisine {
          margin-top: 4px;
          font-size: 0.85rem;
          color: #ff611e;
          transition: color 0.3s;
        }

        

        

        
      `}</style>

      {/* Top Navbar (Desktop/Tablet) */}
      

      {/* Mobile Topbar */}
      

      {/* Bottom Navbar (Mobile Only) */}
      

      {/* Banner Section */}
      <div className="w-full flex justify-center overflow-hidden mb-0 pt-16 md:pt-20">
        <img 
          src="/banner.jpg" 
          alt="Food Banner"
          className="w-full h-auto object-cover block md:h-[25vh] xl:h-[40vh]"
          style={{
            filter: 'brightness(0.7)'
          }}
        />
      </div>

      {/* Categories Section */}
      <section className="mx-auto max-w-5xl text-center pt-8 px-4">
        <h1 className="font-black text-6xl md:text-8xl text-black dark:text-white m-0 pt-8 transition-colors duration-300"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(2.5rem, 8vw, 8rem)',
              transform: 'perspective(1000px) rotateX(0deg)',
              transformOrigin: 'bottom center',
              transition: 'transform 1.3s ease-out, color 0.3s',
              color: 'hsl(var(--foreground))'
            }}>
          CATEGORIES
        </h1>
        <h4 className="font-medium text-gray-600 text-sm md:text-base my-2 mb-6"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(0.86rem, 1.3vw, 2rem)',
              color: 'hsl(var(--muted-foreground))'
            }}>
          From Cheeeesy Slices to juicy burgers, pick your craving.
        </h4>

        {/* Arc Carousel */}
        <div className="arc-carousel">
          <div className="arc-track">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="relative">
                  <img 
                    src={category.image}
                    alt={category.name}
                  />
                </div>
                <span>
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="restaurants-section w-full mx-auto text-center px-2 pb-10 transition-colors duration-300"
               style={{ backgroundColor: 'hsl(var(--background))' }}>
        <h2 className="font-black text-6xl md:text-8xl m-0 pt-8 transition-colors duration-300"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(2.5rem, 8vw, 8rem)',
              color: 'hsl(var(--foreground))'
            }}>
          EATERIES
        </h2>
        <h4 className="font-medium text-sm md:text-base my-3 mb-6 transition-colors duration-300"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(0.9rem, 1.5vw, 2rem)',
              color: 'hsl(var(--muted-foreground))'
            }}>
          Top rated restaurants near you
        </h4>
        {/* Filters Container */}
        <div className="flex justify-between items-center my-4 mb-6 px-4 max-w-lg mx-auto">
          {/* Veg Switch */}
          <div className="switch">
            <input
              type="checkbox"
              id="vegSwitch"
              checked={isVegOnly}
              onChange={handleVegToggle}
            />
          </div>

          {/* Sort Select */}
          <select
            id="sortSelect"
            value={sortBy}
            onChange={handleSortChange}
            className="flex-shrink-0 h-8 rounded-xl border border-gray-300 px-2 text-sm bg-white text-gray-800 cursor-pointer outline-none transition-all duration-200 shadow-sm"
            style={{
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="delivery_time">Delivery Time</option>
            <option value="cost">Cost: Low to High</option>
            <option value="cost_desc">Cost: High to Low</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-gray-600">Finding delicious restaurants...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Restaurants Grid */}
            {filteredRestaurants.length > 0 ? (
              <div className="mt-3 grid gap-6 justify-center justify-items-center items-start w-full mx-auto px-4 grid-cols-2 md:grid-cols-4">
                {filteredRestaurants.map((restaurant) => {
                  const restaurantName = restaurant.name || restaurant.businessName || restaurant.title || restaurant.restaurantName;
                  const localImage = restaurantImages[restaurantName];
                  const finalImage = localImage || restaurant.image || restaurant.logo || restaurant.photo || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=300&fit=crop&crop=center';

                  return (
                    <div
                      key={restaurant.id}
                      className="restaurant-card cursor-pointer"
                      onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                    >
                      <img src={finalImage} alt={restaurantName} />
                      <div className="restaurant-info">
                        <div className="name-rating">
                          {restaurantName} • {restaurant.rating || '4.2'}
                        </div>
                        <div className="cuisine">
                          {restaurant.cuisine || 'Multi-cuisine'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4">
                  <span className="text-6xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  No restaurants found
                </h3>
                <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Try adjusting your filters to find more options.
                </p>
                <button
                  onClick={() => {
                    setIsVegOnly(false);
                    setSortBy('relevance');
                    setActiveCategory(null);
                    setFilters({
                      search: '',
                      sortBy: 'relevance',
                      dietType: 'all',
                    });
                    setFilteredRestaurants(allRestaurants);
                  }}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="w-full bg-transparent p-0 box-border transition-all duration-300 mt-16">
        <div className="mx-auto rounded-t-3xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row md:flex-wrap justify-between items-center md:items-start gap-6 transition-all duration-300 text-center md:text-left"
             style={{
               backgroundColor: 'hsl(var(--card))',
               borderRadius: '20px 20px 0 0',
               boxShadow: '0 -6px 16px rgba(0,0,0,0.08)'
             }}>
          
          {/* Site Section */}
          <div className="flex-1 min-w-[200px] flex flex-col gap-3 items-center md:items-start">
            <h4 className="font-semibold text-base mb-2" style={{ color: 'hsl(var(--foreground))' }}>Site</h4>
            <a href="/home" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Home</a>
            <a href="/restaurants" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Restaurants</a>
            <a href="/cart" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Cart</a>
            <a href="/profile" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Profile</a>
          </div>

          {/* Legal Section */}
          <div className="flex-1 min-w-[200px] flex flex-col gap-3 items-center md:items-start">
            <h4 className="font-semibold text-base mb-2" style={{ color: 'hsl(var(--foreground))' }}>Legal</h4>
            <a href="#" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Privacy Policy</a>
            <a href="#" className="no-underline transition-colors duration-200 hover:text-orange-500" style={{ color: 'hsl(var(--muted-foreground))' }}>Terms & Conditions</a>
          </div>

          {/* Follow Us Section */}
          <div className="flex-1 min-w-[200px] flex flex-col gap-3 items-center md:items-start">
            <h4 className="font-semibold text-base mb-2" style={{ color: 'hsl(var(--foreground))' }}>Follow Us</h4>
            <div className="flex gap-4 justify-center md:justify-start">
              <i className="fab fa-facebook-f text-xl cursor-pointer transition-all duration-200 hover:scale-125 hover:text-orange-500"></i>
              <i className="fab fa-instagram text-xl cursor-pointer transition-all duration-200 hover:scale-125 hover:text-orange-500"></i>
              <i className="fab fa-twitter text-xl cursor-pointer transition-all duration-200 hover:scale-125 hover:text-orange-500"></i>
            </div>
          </div>
        </div>
      </footer>

      
    </div>
  );
}