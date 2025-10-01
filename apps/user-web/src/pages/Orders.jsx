import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Bike,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar";
import MobileHeader from "../components/Navigation/MobileHeader";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // Mock user orders - replace with actual API call
  const mockOrders = [
    {
      id: "ORD-001",
      restaurantId: "REST-101",
      date: "2025-09-10T14:30:00Z",
      status: "delivered",
      total: 680,
      items: [
        { name: "Butter Chicken", quantity: 1, price: 320 },
        { name: "Naan", quantity: 2, price: 60 },
        { name: "Basmati Rice", quantity: 1, price: 120 },
      ],
      restaurant: {
        name: "Spice Garden",
        address: "MG Road, Bangalore",
      },
      orderNumber: "12345",
      deliveryTime: "45 mins",
      paymentMethod: "Pay using UPI",
    },
    {
      id: "ORD-002",
      restaurantId: "REST-102",
      date: "2025-09-09T19:15:00Z",
      status: "out_for_delivery",
      total: 450,
      items: [
        { name: "Masala Dosa", quantity: 2, price: 180 },
        { name: "Filter Coffee", quantity: 2, price: 90 },
      ],
      restaurant: {
        name: "South Spice",
        address: "Koramangala, Bangalore",
      },
      orderNumber: "12346",
      deliveryTime: "30 mins",
      paymentMethod: "Cash on Delivery",
    },
    {
      id: "ORD-003",
      restaurantId: "REST-103",
      date: "2025-09-08T19:15:00Z",
      status: "preparing",
      total: 350,
      items: [
        { name: "Biryani", quantity: 1, price: 250 },
        { name: "Raita", quantity: 1, price: 100 },
      ],
      restaurant: {
        name: "Hyderabadi House",
        address: "Banjara Hills, Hyderabad",
      },
      orderNumber: "12347",
      deliveryTime: "35 mins",
      paymentMethod: "Credit Card",
    },
  ];

  // Simulate API call
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      setTimeout(() => {
        let filteredOrders = mockOrders;

        if (statusFilter !== "all") {
          filteredOrders = filteredOrders.filter(
            (order) => order.status === statusFilter
          );
        }

        if (searchQuery) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.orderNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.restaurant.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
        }

        setOrders(filteredOrders);
        setTotalPages(Math.ceil(filteredOrders.length / 10));
        setLoading(false);
      }, 800);
    };

    fetchOrders();
  }, [statusFilter, searchQuery]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "delivered":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: "Delivered",
          color: "text-green-500",
          bg: "bg-green-500/10",
        };
      case "preparing":
        return {
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          text: "Preparing",
          color: "text-orange-500",
          bg: "bg-orange-500/10",
        };
      case "out_for_delivery":
        return {
          icon: <Bike className="w-5 h-5 text-blue-500" />,
          text: "Out for Delivery",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: "Cancelled",
          color: "text-red-500",
          bg: "bg-red-500/10",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }} />,
          text: "Processing",
          color: "text-gray-500",
          bg: "bg-gray-500/10",
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2"
        style={{ borderColor: "hsl(var(--primary))" }}
      ></div>
    </div>
  );

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title="My Orders" 
          onBack={() => navigate(-1)}
        />
      </div>

      {/* Spacer for sticky mobile header */}
      <div className="md:hidden h-14"></div>

      <div className="max-w-4xl mx-auto px-4 py-4 pb-24 md:py-20 md:pb-6">
        {/* Search and Filter */}
        <div 
          className="rounded-lg shadow-sm  p-4 mb-4 md:mb-6 transition-colors duration-200"
          style={{ backgroundColor: "hsl(var(--card))" }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "hsl(var(--muted-foreground))" }}
              />
              <input
                type="text"
                placeholder="Search orders or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none transition-colors duration-200"
                style={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))"
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg outline-none transition-colors duration-200"
              style={{ 
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))"
              }}
            >
              <option value="all">All Orders</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div 
            className="rounded-lg shadow-sm text-center py-16 transition-colors duration-200"
            style={{ backgroundColor: "hsl(var(--card))" }}
          >
            <Package 
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "hsl(var(--muted-foreground))" }}
            />
            <h3 
              className="text-xl font-medium mb-2"
              style={{ color: "hsl(var(--card-foreground))" }}
            >
              No orders found
            </h3>
            <p 
              className="mb-6"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Looks like you haven't placed any orders yet
            </p>
            <button
              onClick={() => navigate("/restaurants")}
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))"
              }}
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                  style={{ backgroundColor: "hsl(var(--card))" }}
                >
                  {/* Order Header */}
                  <div 
                    className="p-4 border-b transition-colors duration-200"
                    style={{ borderColor: "hsl(var(--border))" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 
                          className="font-semibold"
                          style={{ color: "hsl(var(--card-foreground))" }}
                        >
                          {order.restaurant.name}
                        </h3>
                        <div 
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          <MapPin className="w-3 h-3" />
                          {order.restaurant.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-sm"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          #{order.orderNumber}
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          {formatDate(order.date)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}
                      >
                        {statusInfo.icon}
                        <span
                          className={`text-sm font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>
                            {item.quantity}x {item.name}
                          </span>
                          <span 
                            className="font-medium"
                            style={{ color: "hsl(var(--card-foreground))" }}
                          >
                            ₹{item.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div 
                      className="flex items-center justify-between pt-3 border-t transition-colors duration-200"
                      style={{ borderColor: "hsl(var(--border))" }}
                    >
                      <div 
                        className="flex items-center gap-4 text-sm"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <span>{formatTime(order.date)}</span>
                        <span>•</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                      <div 
                        className="text-lg font-bold"
                        style={{ color: "hsl(var(--card-foreground))" }}
                      >
                        ₹{order.total}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {order.status === "delivered" && (
                        <button
                          onClick={() =>
                            navigate(`/restaurants/${order.restaurantId}`)
                          }
                          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                          style={{ 
                            backgroundColor: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))"
                          }}
                        >
                          Reorder
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 hover:opacity-80"
                          style={{ 
                            border: "1px solid hsl(var(--primary))",
                            color: "hsl(var(--primary))",
                            backgroundColor: "transparent"
                          }}
                        >
                          <Phone className="w-4 h-4" />
                          Track Order
                        </button>
                      )}
                      {order.status === "cancelled" && (
                        <button
                          onClick={() =>
                            navigate(`/restaurants/${order.restaurantId}`)
                          }
                          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                          style={{ 
                            backgroundColor: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))"
                          }}
                        >
                          Reorder
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                          style={{ 
                            border: "1px solid hsl(var(--primary))",
                            color: "hsl(var(--primary))",
                            backgroundColor: "transparent"
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && orders.length > 0 && totalPages > currentPage && (
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--card-foreground))"
              }}
            >
              Load More Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
