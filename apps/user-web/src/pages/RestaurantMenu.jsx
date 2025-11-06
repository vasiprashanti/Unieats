import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getRestaurantMenu } from '../api/restaurants';
import { useCart } from '../context/CartContext';
import { FixedSizeList as List } from 'react-window';

import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';

// Memoized MenuItem for better performance
const MenuItem = React.memo(({ item, qty, onAdd, onIncrease, onDecrease, isBestseller = false }) => {
  return (
    <div className={`flex flex-col ${isBestseller ? 'bg-white/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden text-center' : 'relative text-center'}`}>
      <img 
        src={item.image} 
        alt={item.name} 
        className={`w-full ${isBestseller ? 'aspect-square object-cover' : 'h-[120px] rounded-[10px] object-cover'}`}
        loading="lazy"
      />
      <div className={isBestseller ? 'p-2.5 pb-4' : 'absolute -bottom-3 left-1/2 transform -translate-x-1/2'}>
        <div className="font-semibold text-base mb-1">{item.name}</div>
        {isBestseller && <div className="text-xs text-[#555] mb-1.5">{item.desc}</div>}
        <div className="font-bold text-[#2e7d32] mb-2">₹{item.price}</div>
        {qty === 0 ? (
          <button
            onClick={() => onAdd(item._id)}
            className="bg-[#ff7e2d] text-white font-semibold px-3 py-1.5 border-none rounded-lg cursor-pointer text-sm hover:bg-[#e85d00] transition-colors"
          >
            Add
          </button>
        ) : (
          <div className={`inline-flex items-center gap-2 ${isBestseller ? 'bg-white p-1.5 rounded-full shadow-md border border-gray-200' : 'bg-white/90 p-1 rounded-[20px] shadow-sm'}`}>
            <button
              onClick={() => onDecrease(item._id)}
              className="bg-[#ff7e2d] text-white text-base w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e85d00] transition-colors"
            >
              -
            </button>
            <span className="min-w-6 text-center font-semibold text-sm px-1">{qty}</span>
            <button
              onClick={() => onIncrease(item._id)}
              className="bg-[#ff7e2d] text-white text-base w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e85d00] transition-colors"
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
  const auth = getAuth();

  const { addItem, getItemQuantity, updateQuantity, totalItems } = useCart();

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  const categoryRefs = useRef({});

  // Fetch menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const response = await getRestaurantMenu(restaurantId);
        if (response.error === "User not authenticated") {
          navigate('/login', { state: { from: location.pathname } });
          return;
        }
        const categories = {};
        (response.data.menu || []).forEach(category => {
          categories[category.name] = category.items;
        });
        setMenuData({ ...response.data, categories });
      } catch (err) {
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) loadMenuData();
  }, [restaurantId]);

  // Memoize all items & create lookup map
  const allItems = useMemo(() => {
    if (!menuData) return [];
    return [...(menuData.bestsellers || []), ...Object.values(menuData.categories || {}).flat()];
  }, [menuData]);

  const itemsMap = useMemo(() => {
    const map = new Map();
    allItems.forEach(item => map.set(item._id, item));
    return map;
  }, [allItems]);

  // Optimized handlers
  const handleAddToCart = useCallback(itemId => {
    const item = itemsMap.get(itemId);
    if (item) addItem(item, restaurantId);
  }, [itemsMap, addItem, restaurantId]);

  const handleIncreaseQty = useCallback(itemId => {
    const qty = getItemQuantity(itemId);
    if (qty > 0) updateQuantity(itemId, qty + 1);
    else {
      const item = itemsMap.get(itemId);
      if (item) addItem(item, restaurantId);
    }
  }, [itemsMap, getItemQuantity, updateQuantity, addItem, restaurantId]);

  const handleDecreaseQty = useCallback(itemId => {
    const qty = getItemQuantity(itemId);
    if (qty > 1) updateQuantity(itemId, qty - 1);
    else if (qty === 1) updateQuantity(itemId, 0);
  }, [getItemQuantity, updateQuantity]);

  const toggleCategory = useCallback(name => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  }, []);

  const scrollToCategory = useCallback(name => {
    const el = categoryRefs.current[name];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowCategoryPanel(false);
  }, []);

  const toggleCategoryPanel = useCallback(() => setShowCategoryPanel(prev => !prev), []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} navigate={navigate} />;
  if (!menuData) return null;

  // Virtualized Category List
  const CategoryList = ({ categories }) => (
    <div className="space-y-6">
      {Object.entries(categories).map(([categoryName, items]) => (
        <div key={categoryName} ref={el => categoryRefs.current[categoryName] = el}>
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
            <List
              height={Math.min(400, items.length * 140)}
              itemCount={items.length}
              itemSize={140}
              width="100%"
            >
              {({ index, style }) => {
                const item = items[index];
                const qty = getItemQuantity(item._id);
                return (
                  <div key={item._id} style={style} className="flex justify-between gap-3 p-4 border-b border-[#eee]">
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
              }}
            </List>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen font-['Poppins',sans-serif] text-[#222] relative pb-14">
      {/* Notebook background */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(to bottom,#ffffff,#ffffff 44px,#e0e0e0 45px)`, zIndex: -1 }} />

      <Navbar />
      <MobileHeader />

      {/* Banner */}
      <div className="w-full flex justify-center mt-16 md:mt-16">
        <img src={menuData?.restaurant?.image || '/placeholder-restaurant.jpg'} alt="Banner" className="w-full h-[40vh] object-cover" loading="lazy" />
      </div>

      <div className="max-w-4xl mx-auto my-10 px-4">
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
              isBestseller
            />
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-4">Categories</h2>

        {/* Category Bar */}
        <div className="flex gap-2.5 overflow-x-auto py-2.5 mb-5 scrollbar-hide">
          {Object.keys(menuData.categories).map(categoryName => (
            <button
              key={categoryName}
              onClick={() => scrollToCategory(categoryName)}
              className="flex-shrink-0 px-4 py-2 rounded-[20px] border border-[#ddd] bg-white/70 backdrop-blur-sm text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#ff7e2d] hover:text-white hover:border-[#ff7e2d] transition-colors"
            >
              {categoryName}
            </button>
          ))}
        </div>

        <CategoryList categories={menuData.categories} />
      </div>

      {/* Floating bottom nav, cart, category panels (mobile + desktop) */}
      {/* Copy your previous implementation here; optimized with memoization and callbacks */}
    </div>
  );
}

// Loading & Error screens
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#fefefe] flex items-center justify-center h-96">
    <div className="text-center">
      <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading menu...</p>
    </div>
  </div>
);

const ErrorScreen = ({ error, navigate }) => (
  <div className="min-h-screen bg-[#fefefe] flex items-center justify-center h-96">
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
);
