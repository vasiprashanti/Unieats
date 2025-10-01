import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';
import CategoryList from '../components/menu/CategoryList';
import Bestsellers from '../components/menu/Bestsellers';
import MenuItemCard from '../components/menu/MenuItemCard';
import Toast from '../components/Toast';
import { getRestaurantMenu } from '../api/restaurants';
import { useCart } from '../context/CartContext';

export default function RestaurantMenu() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQuantity, updateQuantity, totalItems } = useCart();

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const response = await getRestaurantMenu(restaurantId);
        
        if (response.success) {
          setMenuData(response.data);
          // Select first category by default
          if (response.data.categories.length > 0) {
            setSelectedCategory(response.data.categories[0]);
          }
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      loadMenuData();
    }
  }, [restaurantId]);

  // Get filtered menu items for selected category
  const filteredMenuItems = useMemo(() => {
    if (!menuData || !selectedCategory) return [];
    return menuData.menuItems.filter(item => item.categoryId === selectedCategory.id);
  }, [menuData, selectedCategory]);

  // Get bestseller items
  const bestsellerItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.menuItems.filter(item => 
      menuData.bestsellers.includes(item.id)
    );
  }, [menuData]);

  // Handle adding items to cart
  const handleAddToCart = (item) => {
    addItem(item, restaurantId);
    setToast({
      isVisible: true,
      message: `${item.name} added to cart`,
      type: 'success'
    });
  };

  // Handle quantity updates
  const handleUpdateQuantity = (itemId, quantity) => {
    updateQuantity(itemId, quantity);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300" 
           style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin mx-auto mb-4" />
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen transition-colors duration-300" 
           style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        <Navbar />
        <MobileHeader />
        <div className="flex items-center justify-center h-96 pt-20 md:pt-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load menu: {error}</p>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!menuData) return null;

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Navbar />
      <MobileHeader title={menuData.restaurant.name} showLogo={false} />
      
      {/* Restaurant Header - Rounded Container */}
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <div className="relative h-64 md:h-80 overflow-hidden rounded-3xl shadow-lg">
          <img
            src={menuData.restaurant.image}
            alt={menuData.restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-3xl" />
          
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cart Button - Hidden on mobile (bottom nav handles cart) */}
          <button
            onClick={() => navigate('/cart')}
            className="hidden md:flex absolute top-4 right-4 bg-[#ff6600] text-white px-4 py-2 rounded-lg items-center space-x-2 hover:bg-[#e55a00] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h4" />
            </svg>
            <span>{totalItems}</span>
          </button>
          
          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{menuData.restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span>{menuData.restaurant.rating}</span>
                <span className="hidden sm:inline">({menuData.restaurant.reviewCount}+ reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>{menuData.restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Open Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content - Responsive layout */}
      <div className="md:flex min-h-screen">
        {/* Desktop - Left Page Categories */}
        <div className="hidden md:block w-1/3 bg-card border-r border-border">
          <CategoryList
            categories={menuData.categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pb-20 md:pb-6">
          {/* Mobile - Horizontal Categories */}
          <div className="md:hidden bg-card border-b border-border">
            <div className="p-4 pb-2">
              <h2 className="text-lg font-bold text-foreground mb-3">Menu Categories</h2>
            </div>
            <div className="flex space-x-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {menuData.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory?.id === category.id
                      ? 'bg-[#ff6600] text-white'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {category.name} ({category.itemCount || 0})
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Bestsellers Section */}
            <Bestsellers
              items={bestsellerItems}
              onAddToCart={handleAddToCart}
              getItemQuantity={getItemQuantity}
              onUpdateQuantity={handleUpdateQuantity}
            />

            {/* Category Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl md:text-2xl">
                  {selectedCategory?.name.toLowerCase().includes('main') ? '🍽️' : 
                   selectedCategory?.name.toLowerCase().includes('starter') ? '🥗' :
                   selectedCategory?.name.toLowerCase().includes('bread') ? '🥖' :
                   selectedCategory?.name.toLowerCase().includes('rice') ? '🍚' :
                   selectedCategory?.name.toLowerCase().includes('dal') ? '🍛' :
                   selectedCategory?.name.toLowerCase().includes('dessert') ? '🧁' :
                   selectedCategory?.name.toLowerCase().includes('beverage') ? '🥤' : '🍽️'}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {selectedCategory?.name}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                {filteredMenuItems.length} items available
              </p>
            </div>

            {/* Menu Items */}
            {filteredMenuItems.length > 0 ? (
              <div className="space-y-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    quantity={getItemQuantity(item.id)}
                    onUpdateQuantity={handleUpdateQuantity}
                    isSoldOut={!item.isAvailable}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl md:text-6xl mb-4">🍽️</div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No items available</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  This category doesn't have any items at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        type={toast.type}
      />
    </div>
  );
}