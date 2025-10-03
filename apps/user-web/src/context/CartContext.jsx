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
const API_URL = import.meta.env.VITE_API_URL; // for Vite
// const API_URL = process.env.REACT_APP_API_URL; // for CRA

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
            items: data.data.items.map(i => ({
              ...i.menuItem,
              quantity: i.quantity,
              id: i.menuItem._id,
              price: i.menuItem.price
            })),
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
        body: JSON.stringify({ menuItemId: itemId, quantity }),
      });

      const text = await response.text();
      console.log('Raw update response:', text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok && data.data) {
        const items = data.data.items.map(i => ({
          ...i.menuItem,
          quantity: i.quantity,
          id: i.menuItem._id,
          price: i.menuItem.price
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
        alert(data.message || 'Failed to update item quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating item quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = await getFirebaseToken();
      if (!token) {
        alert("User not logged in");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw remove response:', text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok && data.data) {
        const items = data.data.items.map(i => ({
          ...i.menuItem,
          quantity: i.quantity,
          id: i.menuItem._id,
          price: i.menuItem.price
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
    const item = state.items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (itemId) => {
    return state.items.some(i => i.id === itemId);
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
