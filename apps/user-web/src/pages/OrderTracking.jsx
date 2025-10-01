import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  ChefHat,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar";

export default function OrderTracking() {
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

  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [simulateRealTime, setSimulateRealTime] = useState(false);
  const intervalRef = useRef(null);

  const statusSteps = [
    { key: "placed", label: "Order Placed", icon: ClipboardCheck },
    { key: "accepted", label: "Accepted", icon: CheckCircle },
    { key: "preparing", label: "Preparing", icon: ChefHat },
    { key: "ready", label: "Ready", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getStatusIndex = (status) =>
    statusSteps.findIndex((step) => step.key === status);
  const currentStatusIndex = getStatusIndex(selectedOrder.status);

  // Simulate WebSocket updates
  useEffect(() => {
    if (simulateRealTime) {
      intervalRef.current = setInterval(() => {
        setOrders((prevOrders) => {
          return prevOrders.map((order) => {
            if (order.id === selectedOrder.id && order.status !== "delivered") {
              const currentIndex = getStatusIndex(order.status);
              if (currentIndex < statusSteps.length - 1) {
                const newStatus = statusSteps[currentIndex + 1].key;
                const updatedOrder = { ...order, status: newStatus };

                // Update estimated time
                if (newStatus === "ready") {
                  updatedOrder.estimatedTime = "5 mins";
                } else if (newStatus === "out_for_delivery") {
                  updatedOrder.estimatedTime = "15 mins";
                } else if (newStatus === "delivered") {
                  updatedOrder.estimatedTime = "Delivered";
                  updatedOrder.deliveredTime = new Date();
                }

                // Simulate driver movement
                if (newStatus === "out_for_delivery" && order.driverLocation) {
                  updatedOrder.driverLocation = {
                    lat:
                      order.driverLocation.lat + (Math.random() - 0.5) * 0.001,
                    lng:
                      order.driverLocation.lng + (Math.random() - 0.5) * 0.001,
                  };
                }

                if (order.id === selectedOrder.id) {
                  setSelectedOrder(updatedOrder);
                }

                return updatedOrder;
              }
            }
            return order;
          });
        });
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulateRealTime, selectedOrder.id]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEstimatedDelivery = (orderTime, status) => {
    const baseTime = new Date(orderTime);
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

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Navbar />
      {/* Controls */}
      <div className="mb-4 md:mb-6 bg-white rounded-lg p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={simulateRealTime}
              onChange={(e) => setSimulateRealTime(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">
              Simulate Real-time Updates
            </span>
          </label>
          <div className="text-sm text-gray-500">
            {simulateRealTime ? " Live updates enabled" : " Updates paused"}
          </div>
        </div>
      </div>

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

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              Order Details
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Order ID</p>
                <p className="font-medium text-sm md:text-base">
                  {selectedOrder.id}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Restaurant</p>
                <p className="font-medium text-sm md:text-base">
                  {selectedOrder.restaurant}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">
                  Delivery Address
                </p>
                <p className="font-medium text-sm md:text-base break-words">
                  {selectedOrder.deliveryAddress}
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
                  {formatTime(selectedOrder.orderTime)}
                </span>
              </div>
              {currentStatusIndex >= 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">Order accepted</span>
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatTime(
                      new Date(
                        selectedOrder.orderTime.getTime() + 2 * 60 * 1000
                      )
                    )}
                  </span>
                </div>
              )}
              {currentStatusIndex >= 2 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">
                    Preparation started
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    {formatTime(
                      new Date(
                        selectedOrder.orderTime.getTime() + 5 * 60 * 1000
                      )
                    )}
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
  );
}
