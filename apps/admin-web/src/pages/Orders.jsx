import React, { useEffect, useState } from "react";
import OrdersTable from "../components/orders/OrdersTable";
import { useToast } from "../components/ui/Toast";

export default function Orders() {
  const { push } = useToast();
  const [orders, setOrders] = useState([
    { id: "ORD-001", customer: "John Doe", vendor: "LGL", items: [{}, {}], totalAmount: 45.99, status: "delivered", createdAt: "2024-01-20 10:12" },
    { id: "ORD-002", customer: "Sarah Wilson", vendor: "Tea", items: [{}], totalAmount: 12.5, status: "preparing", createdAt: "2024-01-20 10:20" },
    { id: "ORD-003", customer: "Mike Chen", vendor: "Nescafe", items: [{}, {}, {}], totalAmount: 8.8, status: "placed", createdAt: "2024-01-20 10:25" },
    { id: "ORD-004", customer: "Lisa Wang", vendor: "Oven", items: [{}, {}], totalAmount: 28.9, status: "ready", createdAt: "2024-01-20 10:35" },
    { id: "ORD-005", customer: "Emma Brown", vendor: "LGL", items: [{}], totalAmount: 16.4, status: "delivered", createdAt: "2024-01-20 10:45" },
  ]);

  // Simulated real-time status progression
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => {
        if (!prev.length) return prev;
        const i = Math.floor(Math.random() * prev.length);
        const statuses = ["placed", "accepted", "preparing", "ready", "delivered"];
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

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    push({ title: "Order Updated", message: `Order ${orderId} status updated to ${newStatus}` });
  };

  const handleOrderCancel = (orderId) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
    push({ title: "Order Cancelled", message: `Order ${orderId} has been cancelled` });
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
        onOrderUpdate={handleStatusUpdate}
        onOrderCancel={handleOrderCancel}
      />
    </div>
  );
}