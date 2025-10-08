import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Wallet,
  Gift,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navigation/Navbar";
import MobileHeader from "../components/Navigation/MobileHeader";

export default function Cart() {
  const {
    items: cartItems,
    totalItems,
    totalPrice: subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  } = useCart();

  console.log("Cart items:", cartItems);
  console.log("Subtotal from context:", subtotal);

  const navigate = useNavigate();

  const [deliveryFee, setDeliveryFee] = useState(5);
  const [walletBalance] = useState(850);
  const [useWallet, setUseWallet] = useState(false);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  const totalBeforeWallet = subtotal + deliveryFee;
  const walletDeduction = useWallet
    ? Math.min(walletBalance, totalBeforeWallet)
    : 0;
  const finalTotal = totalBeforeWallet - walletDeduction;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const calculateDeliveryFee = async () => {
    setIsCalculatingDelivery(true);
    try {
      setTimeout(() => {
        let simulatedFee;
        if (subtotal >= 500) simulatedFee = 0;
        else if (subtotal >= 300) simulatedFee = 25;
        else simulatedFee = 49;

        setDeliveryFee(Math.max(simulatedFee, 5));
        setIsCalculatingDelivery(false);
      }, 800);
    } catch (error) {
      console.error("Failed to calculate delivery fee:", error);
      setDeliveryFee(Math.max(subtotal >= 500 ? 0 : 49, 5));
      setIsCalculatingDelivery(false);
    }
  };

  const handleUpdateQuantity = (menuItemId, newQuantity) => {
    if (!menuItemId) {
      console.warn(
        "Cart: Tried to update quantity with undefined id",
        menuItemId,
        newQuantity
      );
      return;
    }
    updateQuantity(menuItemId, newQuantity);
  };

  const handleRemoveItem = (menuItemId) => {
    console.log("Removing item id:", menuItemId);
    if (!menuItemId) {
      console.warn("Cart: Tried to remove item with undefined id", menuItemId);
      return;
    }
    removeItem(menuItemId);
  };

  const toggleWallet = () => setUseWallet(!useWallet);

  useEffect(() => {
    if (cartItems.length > 0) calculateDeliveryFee();
    else setDeliveryFee(0);
  }, [cartItems.length, subtotal]);

  // Call refreshCart on mount if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      refreshCart();
    }
  }, []);

  // Helper function to get item price (per unit)
  const getItemUnitPrice = (item) => {
    // The backend sends price as the unit price
    return item.price;
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Navbar />
      <MobileHeader title="My Cart" showCart={false} />

      {/* Content */}
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pt-16 md:pt-6">
          <div className="relative mb-6">
            <ShoppingBag className="h-20 w-20 text-[hsl(var(--primary))] opacity-30" />
            <Sparkles className="h-6 w-6 text-[hsl(var(--primary))] absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
            Your cart is empty
          </h2>
          <p
            className="mb-6 text-center text-sm"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Discover amazing food and start ordering!
          </p>
          <button
            onClick={() => navigate("/restaurants")}
            className="px-8 py-3 rounded-2xl font-semibold shadow-xl transition-colors duration-200"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 25px 50px -12px hsla(var(--primary), 0.25)",
            }}
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="p-4  pb-[280px] md:pb-6 pt-16 md:pt-24 space-y-6 max-w-2xl mx-auto">
          {/* Cart Items (stacked) */}
          <div className="space-y-3">
            {cartItems.map((item) => {
              const unitPrice = getItemUnitPrice(item);
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item._id || item.menuItem}
                  className="rounded-2xl p-4 transition-colors duration-200"
                  style={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <div className="flex items-start justify-between">
                    {/* Dish Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold text-sm md:text-base"
                          style={{ color: "hsl(var(--card-foreground))" }}
                        >
                          {/* Added item name display */}
                          {item.name ? item.name.replace(/^"|"$/g, "") : "Unnamed Item"}
                        </h3>
                        {item.veg !== undefined && (
                          <div
                            className={`w-4 h-4 border-2 flex items-center justify-center ${
                              item.veg
                                ? "border-green-500"
                                : "border-red-500"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.veg ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className="text-xs md:text-sm mt-1"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          {item.description}
                        </p>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        ₹{unitPrice.toFixed(0)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => {
                            console.log("Decreasing quantity for item:", item);
                            handleUpdateQuantity(
                              item.menuItem,
                              item.quantity - 1
                            );
                          }}
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center hover:border-[hsl(var(--primary))] transition-colors duration-200"
                          style={{
                            borderColor: "hsl(var(--primary) / 0.5)",
                          }}
                        >
                          <Minus
                            className="h-3 w-3"
                            style={{ color: "hsl(var(--primary))" }}
                          />
                        </button>
                        <span
                          className="w-7 text-center font-semibold text-sm"
                          style={{ color: "hsl(var(--card-foreground))" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            console.log("Increasing quantity for item:", item);
                            handleUpdateQuantity(
                              item.menuItem,
                              item.quantity + 1
                            );
                          }}
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center hover:border-[hsl(var(--primary))] transition-colors duration-200"
                          style={{
                            borderColor: "hsl(var(--primary) / 0.5)",
                          }}
                        >
                          <Plus
                            className="h-3 w-3"
                            style={{ color: "hsl(var(--primary))" }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Price + Delete */}
                    <div className="flex flex-col items-end space-y-2">
                      <p
                        className="text-base md:text-lg font-bold"
                        style={{ color: "hsl(var(--card-foreground))" }}
                      >
                        ₹{itemTotal.toFixed(0)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.menuItem)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary (desktop only) */}
          <div
            className="rounded-2xl p-4 shadow-md transition-colors duration-200 hidden md:block"
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h3
              className="font-bold mb-3"
              style={{ color: "hsl(var(--card-foreground))" }}
            >
              Order Summary
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Subtotal
              </span>
              <span style={{ color: "hsl(var(--card-foreground))" }}>
                ₹{subtotal.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Delivery
              </span>
              <span style={{ color: "hsl(var(--card-foreground))" }}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(0)}`}
              </span>
            </div>

            {useWallet && (
              <div className="flex justify-between text-sm mb-2 text-green-500">
                <span>Wallet Applied</span>
                <span>-₹{walletDeduction.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg mt-4">
              <span style={{ color: "hsl(var(--card-foreground))" }}>Total</span>
              <span style={{ color: "hsl(var(--card-foreground))" }}>
                ₹{finalTotal.toFixed(0)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-4 py-3 rounded-2xl font-bold transition-colors duration-200"
              style={{
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Mobile checkout bar */}
      {cartItems.length > 0 && (
        <div
          className="md:hidden fixed bottom-16 left-0 right-0 backdrop-blur-xl shadow-2xl transition-colors duration-200"
          style={{
            backgroundColor: "hsl(var(--card) / 0.98)",
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Subtotal ({totalItems} items)
              </span>
              <span
                className="font-semibold"
                style={{ color: "hsl(var(--card-foreground))" }}
              >
                ₹{subtotal.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Platform Fee
              </span>
              <span
                className="font-semibold"
                style={{ color: "hsl(var(--card-foreground))" }}
              >
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(0)}`}
              </span>
            </div>

            {/* Wallet inside mobile bar */}
            <div
              className="flex items-center justify-between rounded-xl p-2 transition-colors duration-200"
              style={{
                backgroundColor: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <Wallet
                  className="h-4 w-4"
                  style={{ color: "hsl(var(--primary))" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Wallet: ₹{walletBalance}
                </span>
              </div>
              <button
                onClick={toggleWallet}
                className={`px-2 py-1 text-xs rounded-lg transition-colors duration-200`}
                style={{
                  backgroundColor: useWallet
                    ? "hsl(var(--primary))"
                    : "hsl(var(--card))",
                  color: useWallet
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--primary))",
                  border: useWallet ? "none" : "1px solid hsl(var(--primary))",
                }}
              >
                {useWallet ? "Wallet Applied" : "Pay with Wallet"}
              </button>
            </div>
            {useWallet && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Gift className="h-3 w-3" /> Applying ₹
                {walletDeduction.toFixed(0)}
              </p>
            )}

            <div
              className="h-px my-2"
              style={{
                background:
                  "linear-gradient(to right, transparent, hsl(var(--primary) / 0.3), transparent)",
              }}
            ></div>
            <div className="flex justify-between text-lg font-bold">
              <span style={{ color: "hsl(var(--card-foreground))" }}>
                Total to Pay
              </span>
              <span style={{ color: "hsl(var(--primary))" }}>
                ₹{finalTotal.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-2xl font-bold disabled:opacity-50 transition-colors duration-200"
              style={{
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Proceed to Checkout • ₹{finalTotal.toFixed(0)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
