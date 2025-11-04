import React, { useState, useEffect } from "react";
import {
  MapPin,
  CreditCard,
  Plus,
  Check,
  AlertCircle,
  Clock,
  ShoppingBag,
  Edit,
} from "lucide-react";
import Navbar from "../components/Navigation/Navbar";
import MobileHeader from "../components/Navigation/MobileHeader";
import { useCart } from "../context/CartContext";

import { getAuth } from "firebase/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Checkout() {
  console.log("Checkout page loaded");
  console.log("API_BASE_URL:", API_BASE_URL);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    landmark: "",
    phone: "",
  });

  // Real-time address data from backend
  const [savedAddresses, setSavedAddresses] = useState([]);
  // Fetch addresses from backend
  useEffect(() => {
    const fetchAddresses = async () => {
      console.log("Fetching addresses...");
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        console.log("User:", user);
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/v1/users/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Fetch response:", res);
        try {
          const data = await res.json();
          console.log("Backend addresses response:", data);
          setSavedAddresses(data.addresses || []);
          if (data.addresses && data.addresses.length > 0) {
            setSelectedAddress(data.addresses[0]);
          }
        } catch (err) {
          console.error("Error parsing response:", err);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setSavedAddresses([]);
      }
    };
    fetchAddresses();
  }, []);

  // Use cart context for order summary
  const {
    items: cartItems,
    totalItems,
    totalPrice,
    platformFee: backendPlatformFee,
    subtotal: backendSubtotal,
    total: backendTotal,
  } = useCart();

  // Use backend-calculated values, fallback to old logic if not available
  const subtotal = backendSubtotal || totalPrice;
  const platformfee = backendPlatformFee || 5;
  const total = backendTotal || subtotal + platformfee;

  console.log("Checkout cart values:", {
    subtotal,
    platformfee,
    total,
    backendSubtotal,
    backendPlatformFee,
    backendTotal,
  });

  useEffect(() => {
    if (savedAddresses.length > 0) {
      setSelectedAddress(savedAddresses[0]);
    }
  }, []);

  const handleAddNewAddress = () => {
    if (newAddress.label && newAddress.address && newAddress.phone) {
      (async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken();
          await fetch(`${API_BASE_URL}api/v1/users/addresses`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              label: newAddress.label,
              street: newAddress.address, // or split into street/city/state/zipCode if needed
              landmark: newAddress.landmark,
              phone: newAddress.phone,
            }),
          });
          // Refetch addresses
          const res = await fetch(`${API_BASE_URL}api/v1/users/addresses`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setSavedAddresses(data.addresses || []);
          setSelectedAddress(data.addresses[0]);
          setShowNewAddress(false);
          setNewAddress({ label: "", address: "", landmark: "", phone: "" });
        } catch (err) {
          // handle error
        }
      })();
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert("Please select delivery address and payment method");
      return;
    }

    setIsPlacingOrder(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const token = await user.getIdToken();
    try {
      // POST /api/v1/payments/orders for UPI or COD
      const response = await fetch(`${API_BASE_URL}/api/v1/payments/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddress._id || selectedAddress.id,
          paymentMethod: selectedPayment, // ✅ added payment method
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order placed successfully:", result);
        setOrderSuccess(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order will be delivered in 30-45 minutes
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Order ID: #FD{Math.floor(Math.random() * 10000)}
            </p>
            <p className="text-sm text-green-800">Total: ₹{total}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden min-h-screen bg-white">
        <Navbar />
        <MobileHeader
          title="Checkout"
          showCart={true}
          cartItemCount={cartItems.length}
        />

        <div className="bg-white pt-16">
          {/* Mobile Order Summary - Collapsible */}
          <div className="p-4 border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">
                  {cartItems.length} Items
                </h2>
              </div>
              <span className="font-bold text-lg text-orange-600">
                ₹{total}
              </span>
            </div>
            <details className="group">
              <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-700">
                View Details
              </summary>
              <div className="mt-3 space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.image}</span>
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{platformfee}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Mobile Delivery Address */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-orange-600 text-sm font-medium"
              >
                + Add New
              </button>
            </div>

            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAddress?.id === address.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {address.label}
                        </span>
                        {selectedAddress?.id === address.id && (
                          <Check className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{address.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showNewAddress && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Add New Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Label (Hostel Room, Campus, Lab, etc.)"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <textarea
                    placeholder="Complete Address"
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-orange-500 h-20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNewAddress}
                      className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowNewAddress(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Payment Method */}
          <div className="p-4 bg-white rounded-lg mx-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setSelectedPayment("cod")}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedPayment === "cod"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">₹</span>
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">
                        Pay when order arrives
                      </p>
                    </div>
                  </div>
                  {selectedPayment === "cod" && (
                    <Check className="h-5 w-5 text-orange-500" />
                  )}
                </div>
              </div>

              <div
                onClick={() => setSelectedPayment("upi")}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedPayment === "upi"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        UPI
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">UPI on Delivery</p>
                      <p className="text-sm text-gray-500">
                        Pay via UPI when order arrives
                      </p>
                    </div>
                  </div>
                  {selectedPayment === "upi" && (
                    <Check className="h-5 w-5 text-orange-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom */}
        <div className="fixed bottom-16 left-0 right-0 bg-white p-4 shadow-lg">
          <button
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || !selectedPayment || isPlacingOrder}
            className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            {isPlacingOrder ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                Placing Order...
              </>
            ) : (
              `Place Order • ₹${total}`
            )}
          </button>
        </div>

        {/* Bottom padding to account for sticky button */}
        <div className="h-40"></div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen bg-white/92">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Delivery Address
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowNewAddress(!showNewAddress)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {savedAddresses.map((address) => (
                    <div
                      key={address._id || address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedAddress?._id === (address._id || address.id)
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {address.label}
                            </span>
                            {selectedAddress?._id ===
                              (address._id || address.id) && (
                              <Check className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">{address.street}</p>
                          <p className="text-gray-600 mb-1">
                            {address.city}, {address.state} - {address.zipCode}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-gray-500">
                              Landmark: {address.landmark}
                            </p>
                          )}
                          {address.phone && (
                            <p className="text-sm text-gray-500">
                              Phone: {address.phone}
                            </p>
                          )}
                        </div>
                        <Edit className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </div>
                    </div>
                  ))}
                </div>

                {showNewAddress && (
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Label (Hostel Room, Campus, Lab, etc.)"
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            label: e.target.value,
                          })
                        }
                        className="px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                        className="px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500"
                      />
                      <textarea
                        placeholder="Complete Address"
                        value={newAddress.address}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            address: e.target.value,
                          })
                        }
                        className="md:col-span-2 px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500 h-20"
                      />
                      <input
                        type="text"
                        placeholder="Landmark (Optional)"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            landmark: e.target.value,
                          })
                        }
                        className="md:col-span-2 px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddNewAddress}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
                      >
                        Add Address
                      </button>
                      <button
                        onClick={() => setShowNewAddress(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedPayment("cod")}
                    className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedPayment === "cod"
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            ₹
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-gray-500">
                            Pay when your order arrives
                          </p>
                        </div>
                      </div>
                      {selectedPayment === "cod" && (
                        <Check className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedPayment("upi")}
                    className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedPayment === "upi"
                        ? "border-orange-500 bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">UPI</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            UPI on Delivery
                          </p>
                          <p className="text-sm text-gray-500">
                            Pay via UPI when order arrives
                          </p>
                        </div>
                      </div>
                      {selectedPayment === "upi" && (
                        <Check className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">{item.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{platformfee}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-orange-600">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    !selectedAddress || !selectedPayment || isPlacingOrder
                  }
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                      Placing Order...
                    </>
                  ) : (
                    `Place Order • ₹${total}`
                  )}
                </button>

                {(!selectedAddress || !selectedPayment) && (
                  <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please complete all selections above</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
