import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth } from '../config/firebase'; // adjust path to your firebase config file

const CartContext = createContext(null);

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Initial cart state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  restaurantId: null
};

// Base API URL from .env
const API_URL = import.meta.env.VITE_API_BASE_URL; 

// ✅ Helper to get fresh Firebase token
async function getFirebaseToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken(true); // force refresh if expired
  }
  return null;
}

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return action.payload || initialState;

    case CART_ACTIONS.CLEAR_CART:
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('unieats-cart');
      if (savedCart) {
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: JSON.parse(savedCart) });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unieats-cart', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [state]);

  // Add fetching cart from backend on mount
  useEffect(() => {
    async function fetchBackendCart() {
      const token = await getFirebaseToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/cart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const text = await response.text();
        console.log("resss-",response);
        let data = text ? JSON.parse(text) : {};
        if (response.ok && data.data) {
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: {
              items: data.data.items.map(i => ({
                _id: i._id,
                menuItem: i.menuItem,
                quantity: i.quantity,
                price: i.price,
                ...i
              })),
              totalItems: data.data.items.reduce((sum, i) => sum + i.quantity, 0),
              totalPrice: data.data.total,
              restaurantId: data.data.vendor
            }
          });
        }
      } catch (error) {
        console.error('Error fetching cart from backend:', error);
      }
    }
    fetchBackendCart();
  }, []);

  // ---------------------------
  // Cart Actions
  // ---------------------------

  const addItem = async (item, restaurantId, quantity = 1) => {
    try {
      const token = await getFirebaseToken();
      if (!token) {
        alert("User not logged in");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId: item._id, quantity }),
      });

      const text = await response.text();
      console.log('Raw cart response:', text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok && data.data) {
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            items: data.data.items.map(i => {
              // i._id is the cart item ID, i.menuItem is the menu item ID
              return {
                _id: i._id, // cart item unique ID
                menuItem: i.menuItem,
                quantity: i.quantity,
                price: i.price,
                ...i
              };
            }),
            totalItems: data.data.items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: data.data.total,
            restaurantId: data.data.vendor,
          }
        });
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
  // Try to resolve _id from id if needed
  console.log("first dhi", itemId);
  console.log("second dhi", quantity);
    let resolvedId = itemId;
    if (!resolvedId) {
      const item = state.items.find(i => i.id === itemId);
      if (item && item._id) {
        resolvedId = item._id;
      }
    }
    if (!resolvedId) {
      alert('Invalid item id for update');
      return;
    }
    try {
      const token = await getFirebaseToken();
      if (!token) {
        alert("User not logged in");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart/item`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId: resolvedId, quantity }),
      });

      const text = await response.text();
      console.log('Raw update response:', text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok && data.data) {
        const items = data.data.items.map(i => {
          return {
            menuItem: i.menuItem,
            quantity: i.quantity,
            price: i.price,
            ...i
          };
        });
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            items,
            totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: data.data.total,
            restaurantId: data.data.vendor,
          }
        });
      } else {
        alert(data.message || 'Failed to update item quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating item quantity');
    }
  };

  const removeItem = async (itemId) => {
    // Use cart item's unique _id for removal
        const menuItemId = itemId;
        if (!menuItemId) {
          alert('Invalid item id for removal');
          return;
        }
        try {
          const token = await getFirebaseToken();
          if (!token) {
            alert("User not logged in");
            return;
          }

          const response = await fetch(`${API_URL}/api/v1/cart/item`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ menuItemId, quantity: 0 }),
          });

          const text = await response.text();
          console.log('Raw remove response:', text);
          let data = text ? JSON.parse(text) : {};

          if (response.ok && data.data) {
            const items = data.data.items.map(i => ({
              _id: i._id,
              menuItem: i.menuItem,
              quantity: i.quantity,
              price: i.price,
              ...i
            }));
            dispatch({
              type: CART_ACTIONS.LOAD_CART,
              payload: {
                items,
                totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
                totalPrice: data.data.total,
                restaurantId: data.data.vendor,
              }
            });
          } else {
            alert(data.message || 'Failed to remove item');
          }
        } catch (error) {
          console.error('Error removing item:', error);
          alert('Error removing item');
        }
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (itemId) => {
  const item = state.items.find(i => i._id === itemId);
  return item ? item.quantity : 0;
  };

  const isItemInCart = (itemId) => {
  return state.items.some(i => i._id === itemId);
  };

  // Add refreshCart function in CartProvider
  const refreshCart = async () => {
    const token = await getFirebaseToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const text = await response.text();
      let data = text ? JSON.parse(text) : {};
      if(response.ok && data.data) {
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            items: data.data.items.map(i => ({
              _id: i._id,
              menuItem: i.menuItem,
              quantity: i.quantity,
              price: i.price,
              ...i
            })),
            totalItems: data.data.items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: data.data.total,
            restaurantId: data.data.vendor
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  // Context value
  const value = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    isItemInCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export default CartContext;