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
import { auth } from "../config/firebase"; // Adjust path to your firebase config
import Navbar from "../components/Navigation/Navbar";
import MobileHeader from "../components/Navigation/MobileHeader";

export default function Orders() {
  const getOrderId = (order) => order?._id || order?.id || order?.orderNumber || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get Firebase auth token
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const token = await user.getIdToken();

        const response = await fetch(`${API_BASE_URL}/api/v1/orders/prevOrders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Orders Data from Backend--",data);
        
        // Apply filters - ensure we always have an array
        let allOrders = [];
        if (Array.isArray(data)) {
          allOrders = data;
        } else if (data.orders && Array.isArray(data.orders)) {
          allOrders = data.orders;
        } else if (data.data && Array.isArray(data.data)) {
          allOrders = data.data;
        }

        let filteredOrders = allOrders;

        if (statusFilter !== "all") {
          filteredOrders = filteredOrders.filter(
            (order) => order.status === statusFilter
          );
        }

        if (searchQuery) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.orderNumber
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.restaurant?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
        }

        // Normalize orders for UI
        const normalize = (o) => {
          if (!o) return null;
          const id = o._id || o.id || o.orderNumber || '';
          const restaurant = o.vendor ? (o.vendor.businessName || o.vendor.name) : (o.restaurant?.name || o.restaurant || 'Restaurant');
          const total = o.totalPrice ?? o.total ?? o.amount ?? 0;
          const createdAt = o.createdAt || o.placedAt || o.date || null;
          const paymentMethod = o.paymentDetails?.method || o.paymentMethod || (o.payment && o.payment.method) || 'Online Payment';
          const paymentStatus = o.paymentDetails?.status || o.paymentStatus || (o.payment && o.payment.status) || (paymentMethod === 'COD' ? 'pending' : 'completed');
          const items = Array.isArray(o.items) ? o.items : (o.orderItems || []);
          // derive a displayable address string from deliveryAddress or other address fields
          let customerAddress = '';
          const addr = o.deliveryAddress || o.customerAddress || o.address || null;
          if (addr) {
            if (typeof addr === 'string') customerAddress = addr;
            else {
              // prefer street/line1 if present, otherwise city/state/zip
              const parts = [];
              if (addr.street) parts.push(addr.street);
              if (addr.line1) parts.push(addr.line1);
              if (addr.city) parts.push(addr.city);
              if (addr.state) parts.push(addr.state);
              if (addr.zipCode) parts.push(addr.zipCode);
              if (addr.pincode) parts.push(addr.pincode);
              customerAddress = parts.filter(Boolean).join(', ');
            }
          }

          return {
            ...o,
            id,
            orderNumber: id,
            restaurantName: restaurant,
            total,
            createdAt,
            paymentMethod,
            paymentStatus,
            items,
            customerAddress,
          };
        };

        const normalized = filteredOrders.map(normalize).filter(Boolean);
        setOrders(normalized);
        setTotalPages(Math.ceil(normalized.length / 10));
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, searchQuery, API_BASE_URL]);

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
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
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

  const ErrorMessage = () => (
    <div 
      className="rounded-lg shadow-sm text-center py-16 transition-colors duration-200"
      style={{ backgroundColor: "hsl(var(--card))" }}
    >
      <XCircle 
        className="w-16 h-16 mx-auto mb-4 text-red-500"
      />
      <h3 
        className="text-xl font-medium mb-2"
        style={{ color: "hsl(var(--card-foreground))" }}
      >
        Failed to load orders
      </h3>
      <p 
        className="mb-6"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {error || "Something went wrong. Please try again."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        style={{ 
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))"
        }}
      >
        Retry
      </button>
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
        ) : error ? (
          <ErrorMessage />
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
                  key={getOrderId(order)}
                  onClick={() => navigate(`/orders/${getOrderId(order)}`, { state: { order } })}
                  className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
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
                          {order.restaurantName || order.restaurant?.name || "Restaurant"}
                        </h3>
                        <div 
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          <MapPin className="w-3 h-3" />
                          {order.customerAddress?.line1 ? `${order.customerAddress.line1}, ${order.customerAddress.city || ''}` : (order.customerAddress || 'Address not available')}
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Order ID removed from list view */}
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
                      {order.items?.map((item, index) => (
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
                        className="flex items-center  text-sm"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <span>{formatTime(order.date)}</span>
                        <span className="font-bold">Payment Mode:</span>
                        <span>{order.paymentMethod || order.paymentMethod || "Online Payment"}</span>
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
                      {/* No Reorder button for delivered orders per request */}
                      {order.status === "out_for_delivery" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`, { state: { order } }); }}
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
                          onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${order.restaurantId}`); }}
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
                          onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`, { state: { order } }); }}
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