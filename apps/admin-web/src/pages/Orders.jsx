import React, { useEffect, useState } from "react";
import OrdersTable from "../components/orders/OrdersTable";
import { useToast } from "../components/ui/Toast";
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Orders() {
  const { push } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/V1/admin/orders/monitor`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        console.log("data", data);
        
        // Transform the data to flatten nested objects
        const transformedOrders = (data.data || []).map(order => ({
          id: order._id,
          customer: `${order.user?.name?.first || ''} ${order.user?.name?.last || ''}`.trim() || 'Unknown',
          customerId: order.user?._id,
          vendor: order.vendor?.businessName || 'Unknown',
          vendorId: order.vendor?._id,
          items: order.items || [],
          totalAmount: order.totalPrice || 0,
          status: order.status || 'pending',
          createdAt: new Date(order.createdAt).toLocaleString(),
          deliveryAddress: order.deliveryAddress,
          paymentDetails: order.paymentDetails,
        }));

        
        setOrders(transformedOrders);
      } catch (error) {
        console.error(error);
        push({ title: "Error", message: error.message || "Failed to fetch orders" });
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [push]);

  // Simulated real-time status progression
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => {
        if (!prev.length) return prev;
        const i = Math.floor(Math.random() * prev.length);
        const statuses = ["pending", "accepted", "preparing", "ready", "delivered"];
        const curr = prev[i];
        if (!curr || curr.status === "delivered" || curr.status === "cancelled") return prev;
        const idx = statuses.indexOf(curr.status);
        if (idx === -1 || idx >= statuses.length - 1) return prev;
        const next = statuses[idx + 1];
        const copy = [...prev];
        copy[i] = { ...curr, status: next };
        return copy;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/api/V1/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update order");
      
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      push({ title: "Order Updated", message: `Order status updated to ${newStatus}` });
    } catch (error) {
      console.error(error);
      push({ title: "Error", message: error.message || "Failed to update order" });
    }
  };

  const handleOrderCancel = async (orderId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/api/V1/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to cancel order");
      
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
      push({ title: "Order Cancelled", message: `Order has been cancelled` });
    } catch (error) {
      console.error(error);
      push({ title: "Error", message: error.message || "Failed to cancel order" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
          <p className="text-muted text-sm">Monitor and manage all platform orders with real-time updates</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>
      <OrdersTable
        orders={orders}
        loading={loading}
        onOrderUpdate={handleStatusUpdate}
        onOrderCancel={handleOrderCancel}
      />
    </div>
  );
}