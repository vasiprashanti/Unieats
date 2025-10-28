import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  ChefHat,
  ClipboardCheck,
  QrCode,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar";
import { useParams, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderTracking() {
  const { id } = useParams();
  const location = useLocation();

  // Add top margin to account for navbar height and padding on all sides
  const containerStyle = {
    padding: '2rem',
    marginTop: '4rem', // This ensures content is below navbar
  };

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      status: "preparing",
      estimatedTime: "25 mins",
      items: [
        { name: "Butter Chicken", quantity: 1, price: 350 },
        { name: "Garlic Naan", quantity: 2, price: 60 },
        { name: "Basmati Rice", quantity: 1, price: 120 },
      ],
      total: 530,
      restaurant: "Punjabi Dhaba Express",
      deliveryAddress: "H-123, Sector 15, Noida, UP",
      orderTime: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      deliveryLocation: {
        lat: 28.5355,
        lng: 77.391,
        address: "H-123, Sector 15, Noida, UP",
      },
      driverLocation: { lat: 28.5345, lng: 77.392 },
    },
  ]);

  const normalizeOrder = (o) => {
    if (!o) return null;
    const id = o._id || o.id || o.orderNumber || "";
    const total = o.total || o.totalPrice || o.amount || 0;
    const restaurant = o.vendor ? (o.vendor.businessName || o.vendor.name) : (o.restaurant || "");
    const restaurantId = o.vendor ? (o.vendor._id || o.vendor.id) : (o.restaurantId || "");
    const deliveryAddress = o.deliveryAddress || o.address || o.businessAddress || "";
    const items = Array.isArray(o.items) ? o.items : (o.orderItems || []);
    const orderTime = o.createdAt || o.orderTime || o.date || o.orderTimeDate || null;
    const paymentMethod = (o.paymentDetails && o.paymentDetails.method) || o.paymentMethod || (o.payment && o.payment.method) || "Online Payment";
    // Only include UPI ID if the order is payment_pending and payment method is UPI
    const upiId = (paymentMethod === "UPI") ? 
                  (o.paymentDetails && o.paymentDetails.upiId) || 
                  (o.vendor && o.vendor.upiId) || 
                  null : null;
    const status = o.status || 'placed';
    const driverLocation = o.driverLocation || null;
    const estimatedTime = o.estimatedTime || null;

    return {
      ...o,
      id,
      total,
      restaurant,
      restaurantId,
      deliveryAddress,
      items,
      orderTime,
      paymentMethod,
      upiId,
      status,
      driverLocation,
      estimatedTime,
      _raw: o
    };
  };

  const [selectedOrder, setSelectedOrder] = useState(() => {
    return location.state?.order ? normalizeOrder(location.state.order) : normalizeOrder(orders[0]);
  });
  const intervalRef = useRef(null);

  const statusSteps = [
    { key: "placed", label: "Order Placed", icon: ClipboardCheck },
    { key: "accepted", label: "Accepted", icon: CheckCircle },
    { key: "preparing", label: "Preparing", icon: ChefHat },
    { key: "ready", label: "Ready", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const mapBackendStatusToStep = (status) => {
    // Map backend statuses to our step keys
    if (!status) return 'placed';
    if (status === 'payment_pending' || status === 'pending') return 'placed';
    if (status === 'accepted') return 'accepted';
    if (status === 'preparing') return 'preparing';
    if (status === 'ready') return 'ready';
    if (status === 'out_for_delivery') return 'out_for_delivery';
    if (status === 'delivered') return 'delivered';
    if (status === 'rejected' || status === 'cancelled') return 'rejected';
    return 'placed';
  };

  const getStatusIndex = (stepKey) => statusSteps.findIndex((step) => step.key === stepKey);
  const currentStatusIndex = selectedOrder && selectedOrder.status ? getStatusIndex(mapBackendStatusToStep(selectedOrder.status)) : -1;

  // Poll backend for updates to this order (every 5s)
  useEffect(() => {
    let mounted = true;
    const pollIntervalMs = 5000;

    const fetchAndUpdate = async () => {
      if (!id) return;
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/prevOrders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        const rawOrders = Array.isArray(data) ? data : (data.orders || data.data || data.data?.data || []);
        const allOrders = rawOrders.map(normalizeOrder).filter(Boolean);
        if (!mounted) return;
        setOrders(allOrders);
        const found = allOrders.find(o => String(o._id) === String(id) || String(o.id) === String(id) || String(o.orderNumber) === String(id));
        if (found) {
          // update selectedOrder if status or updatedAt changed
          const prevUpdated = selectedOrder?._raw?.updatedAt || selectedOrder?._raw?.updatedAt || selectedOrder?._raw?.updatedAt;
          const prevStatus = selectedOrder?.status;
          const newUpdated = found._raw?.updatedAt || found._raw?.updatedAt || null;
          if (!selectedOrder || prevStatus !== found.status || (newUpdated && String(newUpdated) !== String(prevUpdated))) {
            setSelectedOrder(found);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // initial fetch
    fetchAndUpdate();
    intervalRef.current = setInterval(fetchAndUpdate, pollIntervalMs);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  // If navigated with state, selectedOrder is already set. Otherwise, try to fetch user's orders and find by id
  useEffect(() => {
    const fetchAndSelect = async () => {
      if (!id) return;
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/prevOrders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        console.log("Order data received:", data);
          const rawOrders = Array.isArray(data) ? data : (data.orders || data.data || data.data?.data || []);
          const allOrders = rawOrders.map(order => {
            const normalized = normalizeOrder(order);
            return normalized;
          }).filter(Boolean);
          setOrders(allOrders);
          const found = allOrders.find(o => String(o._id) === String(id) || String(o.id) === String(id) || String(o.orderNumber) === String(id));
          if (found) setSelectedOrder(found);
      } catch (err) {
        console.error('Failed to load order for tracking:', err);
      }
    };

    fetchAndSelect();
  }, [id, location.state]);

  const formatTime = (date) => {
    if (!date) return "";
    let d = date instanceof Date ? date : new Date(date);
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEstimatedDelivery = (orderTime, status) => {
    let baseTime = orderTime ? new Date(orderTime) : new Date();
    if (isNaN(baseTime.getTime())) baseTime = new Date();
    let addMinutes = 30;

    switch (status) {
      case "placed":
        addMinutes = 35;
        break;
      case "accepted":
        addMinutes = 30;
        break;
      case "preparing":
        addMinutes = 25;
        break;
      case "ready":
        addMinutes = 15;
        break;
      case "out_for_delivery":
        addMinutes = 10;
        break;
      default:
        addMinutes = 0;
    }

    baseTime.setMinutes(baseTime.getMinutes() + addMinutes);
    return baseTime;
  };

  const getOrderIdentifier = (o) => o?._id || o?.id || o?.orderNumber || "";

  const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    // addr may be { city, state, zipCode } or { street, city, state, zipCode }
    const parts = [];
    if (addr.street) parts.push(addr.street);
    if (addr.address) parts.push(addr.address);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.zipCode) parts.push(addr.zipCode);
    if (addr.pincode) parts.push(addr.pincode);
    return parts.filter(Boolean).join(', ');
  };

  const formatRestaurant = (r) => {
    if (!r) return "";
    if (typeof r === "string") return r;
    return r.name || r.title || formatAddress(r.address) || "";
  };

  const orderTimeDate = selectedOrder && selectedOrder.orderTime ? new Date(selectedOrder.orderTime) : null;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Navbar />
      <div style={containerStyle}>
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Your Orders</h2>
            </div>
            <div className="divide-y max-h-96 md:max-h-none overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedOrder.id === order.id
                      ? "bg-orange-50 border-r-4 border-orange-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {order.id}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {order.restaurant}
                      </p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="text-sm font-medium">₹{order.total}</p>
                      <p className="text-xs text-gray-500">
                        {formatTime(order.orderTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm capitalize text-gray-700 truncate">
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                      {order.estimatedTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Status Progress */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
              <h2 className="text-lg font-semibold">Order Status</h2>
              <div className="md:text-right">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium text-sm md:text-base">
                  {selectedOrder.status === "delivered"
                    ? `Delivered at ${formatTime(selectedOrder.deliveredTime)}`
                    : formatTime(
                        getEstimatedDelivery(
                          selectedOrder.orderTime,
                          selectedOrder.status
                        )
                      )}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div
                    key={step.key}
                    className="relative flex items-center mb-6 md:mb-8 last:mb-0"
                  >
                    <div
                      className={`relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${
                        isCompleted || isCurrent
                          ? "bg-orange-500 border-orange-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-3 h-3 md:w-4 md:h-4 ${
                          isCompleted || isCurrent
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4 flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm md:text-base ${
                          isCompleted || isCurrent
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs md:text-sm text-orange-600 font-medium">
                          Current Status
                        </p>
                      )}
                    </div>
                    {isCurrent && selectedOrder.status !== "delivered" && (
                      <div className="ml-auto">
                        <div className="animate-pulse">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPI QR Code */}
          {selectedOrder.paymentMethod === "UPI" && (
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
              <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                UPI Payment
              </h3>
              <div className="flex flex-col items-center space-y-4">
                {selectedOrder.upiId ? (
                  <>
                    <QRCodeSVG
                      value={`upi://pay?pa=${selectedOrder.upiId}&pn=UNIEATS&tn=Order%20${selectedOrder.id}&am=${selectedOrder.total}&cu=INR`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="text-sm text-gray-600 font-medium">
                      Scan this QR code to pay
                    </p>
                    <p className="text-xs text-gray-500">
                      UPI ID: {selectedOrder.upiId}
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment Information</p>
                    <p className="text-xs text-gray-500 mt-2">Method: {selectedOrder.paymentMethod}</p>
                    {selectedOrder.paymentDetails && (
                      <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                        {JSON.stringify(selectedOrder.paymentDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              Order Details
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Order ID</p>
                <p className="font-medium text-sm md:text-base">
                  {getOrderIdentifier(selectedOrder) || selectedOrder.id || ''}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Restaurant</p>
                <p className="font-medium text-sm md:text-base">
                  {formatRestaurant(selectedOrder.restaurant)}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">
                  Delivery Address
                </p>
                <p className="font-medium text-sm md:text-base break-words">
                  {formatAddress(selectedOrder.deliveryAddress || selectedOrder.businessAddress || selectedOrder.address)}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Items</p>
                <div className="space-y-2 mt-1">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm md:text-base"
                    >
                      <span className="flex-1 min-w-0 pr-2">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="flex-shrink-0">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-sm md:text-base">
                  <span>Total</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              Order Timeline
            </h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm">Order placed</span>
                <span className="text-xs md:text-sm text-gray-600">
                  {formatTime(orderTimeDate)}
                </span>
              </div>
              {currentStatusIndex >= 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">Order accepted</span>
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatTime(orderTimeDate ? new Date(orderTimeDate.getTime() + 2 * 60 * 1000) : null)}
                  </span>
                </div>
              )}
              {currentStatusIndex >= 2 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">
                    Preparation started
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatTime(orderTimeDate ? new Date(orderTimeDate.getTime() + 5 * 60 * 1000) : null)}
                  </span>
                </div>
              )}
              {selectedOrder.deliveredTime && (
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-orange-600">
                    Order delivered
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatTime(selectedOrder.deliveredTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
