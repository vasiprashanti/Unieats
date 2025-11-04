import React, { createContext, useContext, useReducer, useEffect } from "react";
import { auth } from "../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";

const CartContext = createContext(null);

const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
};

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  platformFee: 0,
  subtotal: 0,
  total: 0,
  restaurantId: null,
};

const API_URL = import.meta.env.VITE_API_BASE_URL;

async function getFirebaseToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken(true);
  }
  return null;
}

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
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to handle unauthorized users
  const handleUnauthorized = () => {
    // Store current path to return after login
    localStorage.setItem("returnTo", location.pathname + location.search);
    navigate("/login");
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // User logged out - clear cart
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        localStorage.removeItem("unieats-cart");
      }
    });

    return () => unsubscribe();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("unieats-cart");
      if (savedCart && auth.currentUser) {
        // Only load if user is logged in
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: JSON.parse(savedCart),
        });
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("unieats-cart", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [state]);

  useEffect(() => {
    async function fetchBackendCart() {
      const token = await getFirebaseToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/cart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const text = await response.text();
        console.log("Cart fetch response:", text);
        let data = text ? JSON.parse(text) : {};
        if (response.ok && data.data) {
          const items = data.data.items.map((i) => ({
            _id: i._id,
            menuItem: i.menuItem,
            quantity: i.quantity,
            price: i.price,
            ...i,
          }));

          // Use backend-calculated values to ensure accuracy
          const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
          const subtotal = data.data.subtotal || 0;
          const platformFee = data.data.platformFee || 0;
          const total = data.data.total || 0;
          const totalPrice = subtotal; // Keep totalPrice as subtotal for compatibility

          console.log("Backend cart values:", {
            subtotal,
            platformFee,
            total,
            totalItems,
          });

          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: {
              items,
              totalItems,
              totalPrice,
              subtotal,
              platformFee,
              total,
              restaurantId: data.data.vendor,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching cart from backend:", error);
      }
    }
    fetchBackendCart();
  }, []);

  const addItem = async (item, restaurantId, quantity = 1) => {
    try {
      const token = await getFirebaseToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId: item._id, quantity }),
      });

      const text = await response.text();
      console.log("Add item response:", text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok && data.data) {
        const items = data.data.items.map((i) => ({
          _id: i._id,
          menuItem: i.menuItem,
          quantity: i.quantity,
          price: i.price,
          ...i,
        }));

        // Recalculate totals on frontend
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        console.log("After add - Frontend totals:", { totalItems, totalPrice });

        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            items,
            totalItems,
            totalPrice,
            restaurantId: data.data.vendor,
          },
        });
      } else {
        alert(data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item to cart");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    console.log(
      "Updating quantity - itemId:",
      itemId,
      "newQuantity:",
      quantity
    );

    let resolvedId = itemId;
    if (!resolvedId) {
      const item = state.items.find((i) => i.id === itemId);
      if (item && item._id) {
        resolvedId = item._id;
      }
    }
    if (!resolvedId) {
      alert("Invalid item id for update");
      return;
    }
    try {
      const token = await getFirebaseToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart/item`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId: resolvedId, quantity }),
      });

      const text = await response.text();
      console.log("Update quantity response:", text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok) {
        if (data.data === null) {
          // Cart was cleared/deleted
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: initialState,
          });
          return;
        }

        if (data.data && Array.isArray(data.data.items)) {
          const items = data.data.items.map((i) => ({
            _id: i._id,
            menuItem: i.menuItem,
            quantity: i.quantity,
            price: i.price,
            ...i,
          }));

          // Recalculate totals on frontend
          const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
          const totalPrice = items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          console.log("After update - Frontend totals:", {
            totalItems,
            totalPrice,
          });

          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: {
              items,
              totalItems,
              totalPrice,
              restaurantId: data.data.vendor,
            },
          });
        } else {
          console.error("Invalid cart data format:", data);
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: initialState,
          });
        }
      } else {
        alert(data.message || "Failed to update item quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating item quantity");
    }
  };

  const removeItem = async (itemId) => {
    const menuItemId = itemId;
    if (!menuItemId) {
      alert("Invalid item id for removal");
      return;
    }
    try {
      const token = await getFirebaseToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart/item`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId, quantity: 0 }),
      });

      const text = await response.text();
      console.log("Remove item response:", text);
      let data = text ? JSON.parse(text) : {};

      if (response.ok) {
        // If cart is deleted, backend sends data.data as [] or null
        if (
          data.data === null ||
          (Array.isArray(data.data) && data.data.length === 0)
        ) {
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: initialState,
          });
          return;
        }
        if (data.data && Array.isArray(data.data.items)) {
          const items = data.data.items.map((i) => ({
            _id: i._id,
            menuItem: i.menuItem,
            quantity: i.quantity,
            price: i.price,
            ...i,
          }));
          // Recalculate totals on frontend
          const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
          const totalPrice = items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: {
              items,
              totalItems,
              totalPrice,
              restaurantId: data.data.vendor,
            },
          });
        } else {
          // Unexpected format, clear cart
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: initialState,
          });
        }
      } else {
        alert(data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item");
    }
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (itemId) => {
    const item = state.items.find((i) => i.menuItem === itemId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (itemId) => {
    return state.items.some((i) => i.menuItem === itemId);
  };

  const refreshCart = async () => {
    const token = await getFirebaseToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
      let data = text ? JSON.parse(text) : {};
      if (response.ok && data.data) {
        const items = data.data.items.map((i) => ({
          _id: i._id,
          menuItem: i.menuItem,
          quantity: i.quantity,
          price: i.price,
          ...i,
        }));

        // Recalculate totals on frontend
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            items,
            totalItems,
            totalPrice,
            restaurantId: data.data.vendor,
          },
        });
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  };

  const value = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    isItemInCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

export default CartContext;
