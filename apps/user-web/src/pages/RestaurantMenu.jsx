import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRestaurantMenu } from '../api/restaurants';
import { useCart } from '../context/CartContext';

import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';

// Memoized MenuItem component for better performance
const MenuItem = React.memo(({ item, qty, onAdd, onIncrease, onDecrease, isBestseller = false }) => {
  if (isBestseller) {
    return (
      <div className="flex flex-col bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md text-center">
        <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" />
        <div className="p-2.5 pb-4">
          <div className="font-semibold text-base mb-1">{item.name}</div>
          <div className="text-xs text-[#555] mb-1.5">{item.desc}</div>
          <div className="font-bold text-[#2e7d32] mb-2">₹{item.price}</div>
          {qty === 0 ? (
            <button
              onClick={() => onAdd(item._id)}
              className="bg-[#ff7e2d] text-white font-semibold px-3 py-1.5 border-none rounded-lg cursor-pointer text-sm hover:bg-[#e85d00] transition-colors"
            >
              Add
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200">
              <button
                onClick={() => onDecrease(item._id)}
                className="bg-[#ff7e2d] border-none text-white text-base w-7 h-7 rounded-full cursor-pointer flex items-center justify-center hover:bg-[#e85d00] transition-colors"
              >
                -
              </button>
              <span className="min-w-6 text-center font-semibold text-sm px-1">
                {qty}
              </span>
              <button
                onClick={() => onIncrease(item._id)}
                className="bg-[#ff7e2d] border-none text-white text-base w-7 h-7 rounded-full cursor-pointer flex items-center justify-center hover:bg-[#e85d00] transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative text-center">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-full rounded-[10px] object-cover h-[120px]"
      />
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
        {qty === 0 ? (
          <button 
            onClick={() => onAdd(item._id)}
            className="bg-[#ff7e2d] text-white font-semibold px-3 py-1.5 border-none rounded-lg cursor-pointer text-sm hover:bg-[#e85d00] transition-colors"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white/90 p-1 rounded-[20px] shadow-sm">
            <button 
              onClick={() => onDecrease(item._id)}
              className="bg-[#ff7e2d] border-none text-white text-base w-7 h-7 rounded-full cursor-pointer hover:bg-[#e85d00] transition-colors"
            >
              -
            </button>
            <span className="min-w-5 text-center">{qty}</span>
            <button 
              onClick={() => onIncrease(item._id)}
              className="bg-[#ff7e2d] border-none text-white text-base w-7 h-7 rounded-full cursor-pointer hover:bg-[#e85d00] transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

export default function RestaurantMenu() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQuantity, updateQuantity, totalItems } = useCart();

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  // Fetch menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const response = await getRestaurantMenu(restaurantId);
        const categories = {};
        (response.data.menu || []).forEach(category => {
          categories[category.name] = category.items;
        });
        setMenuData({
          ...response.data,
          categories
        });
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

  // Memoize all items to avoid recalculation
  const allItems = useMemo(() => {
    if (!menuData) return [];
    return [
      ...(menuData.bestsellers || []),
      ...Object.values(menuData.categories || {}).flat()
    ];
  }, [menuData]);

  // Create item lookup map for O(1) access
  const itemsMap = useMemo(() => {
    const map = new Map();
    allItems.forEach(item => map.set(item._id, item));
    return map;
  }, [allItems]);

  // Optimized handlers with useCallback
  const handleAddToCart = useCallback((itemId) => {
    const item = itemsMap.get(itemId);
    if (item) {
      addItem(item, restaurantId);
    }
  }, [itemsMap, addItem, restaurantId]);

  const handleIncreaseQty = useCallback((itemId) => {
    const currentQty = getItemQuantity(itemId);
    if (currentQty > 0) {
      updateQuantity(itemId, currentQty + 1);
    } else {
      const item = itemsMap.get(itemId);
      if (item) {
        addItem(item, restaurantId);
      }
    }
  }, [itemsMap, getItemQuantity, updateQuantity, addItem, restaurantId]);

  const handleDecreaseQty = useCallback((itemId) => {
    const currentQty = getItemQuantity(itemId);
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    } else if (currentQty === 1) {
      updateQuantity(itemId, 0);
    }
  }, [getItemQuantity, updateQuantity]);

  const toggleCategory = useCallback((categoryName) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }, []);

  const scrollToCategory = useCallback((categoryName) => {
    const element = document.getElementById(`cat-${categoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowCategoryPanel(false);
  }, []);

  const toggleCategoryPanel = useCallback(() => {
    setShowCategoryPanel(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefefe]">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fefefe]">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load menu: {error}</p>
            <button
              onClick={() => navigate(-1)}
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
    <div 
      className="min-h-screen font-['Poppins',sans-serif] text-[#222] relative"
    >
      {/* Notebook background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(
            to bottom, 
            #ffffff,       
            #ffffff 44px,  
            #e0e0e0 45px   
          )`,
          zIndex: -1
        }}
      />

      {/* Navigation */}
      <Navbar />
      <MobileHeader />
      
      {/* Bottom Navigation */}
      <div 
        className="md:hidden fixed left-1/2 transform -translate-x-1/2 bg-white/70 backdrop-blur-sm z-[100] flex justify-around"
        style={{
          bottom: '12px',
          width: 'calc(100% - 32px)',
          maxWidth: '500px',
          padding: '6px 0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          borderRadius: '15px'
        }}
      >
        <Link 
          to="/home" 
          className="flex flex-col items-center justify-center text-[#ff7e2d] no-underline relative"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-home"></i>
          <span className="text-[0.6rem] mt-0.5 text-[#444]">Home</span>
        </Link>
        
        <Link 
          to="/restaurants" 
          className="flex flex-col items-center justify-center text-[#ff7e2d] no-underline relative"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-utensils"></i>
          <span className="text-[0.6rem] mt-0.5 text-[#444]">Eats</span>
        </Link>
        
        <button 
          onClick={toggleCategoryPanel}
          className="flex flex-col items-center justify-center text-[#ff7e2d] bg-transparent border-none cursor-pointer relative"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-list"></i>
          <span className="text-[0.6rem] mt-0.5 text-[#444]">Categories</span>
        </button>
        
        <Link 
          to="/search" 
          className="flex flex-col items-center justify-center text-[#ff7e2d] no-underline relative"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-search"></i>
          <span className="text-[0.6rem] mt-0.5 text-[#444]">Search</span>
        </Link>

        <Link 
          to="/cart" 
          className="flex flex-col items-center justify-center text-[#ff7e2d] no-underline relative"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-shopping-cart"></i>
          {totalItems > 0 && (
            <span 
              className="absolute text-white text-xs font-semibold"
              style={{
                top: '-8px',
                right: '-12px',
                background: '#ff3d00',
                padding: '2px 6px',
                borderRadius: '50%'
              }}
            >
              {totalItems}
            </span>
          )}
          <span className="text-[0.6rem] mt-0.5 text-[#444]">Cart</span>
        </Link>
      </div>

      {/* Banner */}
      <div className="w-full flex justify-center mt-16 md:mt-16">
        <img 
          src={menuData?.restaurant?.image || '/placeholder-restaurant.jpg'} 
          alt="Banner" 
          className="w-full h-[40vh] object-cover"
        />
      </div>

      {/* Menu Section */}
      <div className="max-w-4xl mx-auto my-10 px-4">
        {/* Bestsellers */}
        <h2 className="text-3xl font-bold mb-4">Bestsellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(menuData.bestsellers || []).map(item => (
            <MenuItem
              key={item._id}
              item={item}
              qty={getItemQuantity(item._id)}
              onAdd={handleAddToCart}
              onIncrease={handleIncreaseQty}
              onDecrease={handleDecreaseQty}
              isBestseller={true}
            />
          ))}
        </div>

        {/* Categories */}
        <h2 className="text-3xl font-bold mb-4">Categories</h2>
        
        {/* Category Bar */}
        <div className="flex gap-2.5 overflow-x-auto py-2.5 mb-5 scrollbar-hide">
          {Object.keys(menuData?.categories || {}).map(categoryName => (
            <button
              key={categoryName}
              onClick={() => scrollToCategory(categoryName)}
              className="flex-shrink-0 px-4 py-2 rounded-[20px] border border-[#ddd] bg-white/70 backdrop-blur-sm text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#ff7e2d] hover:text-white hover:border-[#ff7e2d] transition-colors"
            >
              {categoryName}
            </button>
          ))}
        </div>

        {/* Category Items */}
        <div className="space-y-6">
          {Object.entries(menuData?.categories || {}).map(([categoryName, items]) => (
            <div 
              key={categoryName}
              id={`cat-${categoryName}`}
              className="mb-6 rounded-xl shadow-sm overflow-hidden"
            >
              <div 
                onClick={() => toggleCategory(categoryName)}
                className={`bg-[#050505] text-white p-3.5 font-semibold cursor-pointer flex justify-between items-center ${
                  collapsedCategories.has(categoryName) ? 'active' : ''
                }`}
              >
                {categoryName}
                <i className={`fas fa-chevron-down transition-transform duration-300 ${
                  collapsedCategories.has(categoryName) ? 'rotate-180' : ''
                }`}></i>
              </div>
              
              {!collapsedCategories.has(categoryName) && (
                <div className="bg-transparent">
                  {items.map((item, index) => {
                    const qty = getItemQuantity(item._id);
                    return (
                      <div 
                        key={item._id}
                        className={`flex justify-between gap-3 p-4 ${
                          index < items.length - 1 ? 'border-b border-[#eee]' : ''
                        }`}
                      >
                        <div className="flex-[2] text-left">
                          <div className="font-semibold text-lg mb-1.5">{item.name}</div>
                          <div className="text-sm text-[#555] mb-1.5">{item.desc}</div>
                          <div className="font-bold text-[#2e7d32]">₹{item.price}</div>
                        </div>
                        <MenuItem
                          item={item}
                          qty={qty}
                          onAdd={handleAddToCart}
                          onIncrease={handleIncreaseQty}
                          onDecrease={handleDecreaseQty}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Hamburger Menu - Desktop */}
      <div className="hidden md:block">
        {/* Category Panel */}
        <div 
          className={`fixed top-1/2 transform -translate-y-1/2 w-60 bg-white/90 backdrop-blur-sm p-4 transition-all duration-300 ease-in-out z-[350] ${
            showCategoryPanel ? 'right-0' : '-right-60'
          }`}
          style={{ 
            boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
            borderRadius: '12px 0 0 12px'
          }}
        >
          <h3 className="mt-0 mb-3 text-lg font-semibold text-[#ff7e2d]">Categories</h3>
          <div className="flex flex-col gap-2">
            {menuData && Object.keys(menuData.categories).map(categoryName => (
              <button
                key={categoryName}
                onClick={() => scrollToCategory(categoryName)}
                className="px-2.5 py-2 border-none bg-[#f5f5f5] rounded-md text-left text-sm cursor-pointer transition-colors duration-200 hover:bg-[#ff7e2d] hover:text-white"
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay to close panel - Desktop only */}
        {showCategoryPanel && (
          <div 
            className="hidden md:block fixed inset-0 z-[240]" 
            onClick={() => setShowCategoryPanel(false)}
          />
        )}

        {/* Floating Category Button - Desktop only */}
        <button
          onClick={toggleCategoryPanel}
          className="hidden md:flex fixed right-5 bottom-[150px] bg-[#ff7e2d] text-white rounded-full w-14 h-14 items-center justify-center text-xl cursor-pointer z-[300] hover:bg-[#e85d00] transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
          aria-label="Toggle Categories"
        >
          <i className="fas fa-list"></i>
        </button>
      </div>

      {/* Mobile Category Panel */}
      <div className={`md:hidden fixed top-1/2 right-0 transform -translate-y-1/2 transition-transform duration-300 z-[350] ${
        showCategoryPanel ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-l-xl shadow-lg p-4 min-w-[240px]" style={{ boxShadow: '-4px 0 12px rgba(0,0,0,0.15)' }}>
          <h3 className="text-[#ff7e2d] font-semibold text-lg mb-3">Categories</h3>
          <div className="space-y-2">
            {menuData && Object.keys(menuData.categories).map(categoryName => (
              <button
                key={categoryName}
                onClick={() => scrollToCategory(categoryName)}
                className="block w-full text-left px-2.5 py-2 text-[#333] bg-[#f5f5f5] rounded-md hover:bg-[#ff7e2d] hover:text-white transition-all text-sm font-medium"
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Category Panel Overlay */}
      {showCategoryPanel && (
        <div 
          className="md:hidden fixed inset-0 z-[340]" 
          onClick={() => setShowCategoryPanel(false)}
        />
      )}

      {/* Floating View Cart - Mobile */}
      {totalItems > 0 && (
        <div 
          onClick={() => navigate('/cart')}
          className="fixed bottom-[70px] left-1/2 transform -translate-x-1/2 bg-[#ff7e2d] text-white font-semibold px-4 py-3 rounded-[30px] cursor-pointer z-[200] w-[80vw] max-w-[500px] flex justify-between items-center text-[0.95rem]"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          <span>View Cart ({totalItems})</span>
          <i className="fas fa-arrow-right text-base"></i>
        </div>
      )}
    </div>
  );
}
