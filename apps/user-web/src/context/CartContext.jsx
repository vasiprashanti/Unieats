import React, { createContext, useContext, useReducer, useEffect } from 'react';

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

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return action.payload || initialState;

    case CART_ACTIONS.ADD_ITEM: {
      const { item, restaurantId } = action.payload;
      
      // Clear cart if switching restaurants
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        const newState = {
          items: [{ ...item, quantity: 1 }],
          totalItems: 1,
          totalPrice: item.price,
          restaurantId
        };
        return newState;
      }

      const existingItemIndex = state.items.findIndex(i => i.id === item.id);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        newItems = state.items.map((i, index) => 
          index === existingItemIndex 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // New item, add to cart
        newItems = [...state.items, { ...item, quantity: 1 }];
      }

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalPrice,
        restaurantId: restaurantId || state.restaurantId
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { itemId } = action.payload;
      const newItems = state.items.filter(i => i.id !== itemId);
      
      if (newItems.length === 0) {
        return initialState;
      }

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { 
          type: CART_ACTIONS.REMOVE_ITEM, 
          payload: { itemId } 
        });
      }

      const newItems = state.items.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      );

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('unieats-cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('unieats-cart', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state]);

  // Cart actions
  const addItem = (item, restaurantId) => {
    dispatch({ 
      type: CART_ACTIONS.ADD_ITEM, 
      payload: { item, restaurantId } 
    });
  };

  const removeItem = (itemId) => {
    dispatch({ 
      type: CART_ACTIONS.REMOVE_ITEM, 
      payload: { itemId } 
    });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { itemId, quantity } 
    });
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

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isItemInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;