import React, { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import Alert from "../components/Alert";
import { getVendorDashboard } from "../api/vendor";
import { useAuth } from "../context/AuthContext";
import ApprovalStatusBanner from "../components/dashboard/ApprovalStatusBanner";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayRevenue: 0, pendingOrders: 0, avgPrepTime: 0, status: "pending" });
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(""); // placeholder notifications handled in header
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getVendorDashboard({ token: user?.token });
        if (active)
          setStats({
            todayRevenue: data.todayRevenue ?? 0,
            pendingOrders: data.pendingOrders ?? 0,
            avgPrepTime: data.avgPrepTime ?? 0,
            status: data.status ?? "pending",
          });
      } catch (e) {
        if (active) setError("Failed to load dashboard. Showing placeholders.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.token]);

  return (
    <div className="p-4 md:p-6 text-[hsl(var(--foreground))]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-white/60">Welcome back! Here's what's happening today.</p>
        </div>

      </div>

      <ApprovalStatusBanner status={stats.status} />
      <Alert type="error" message={error} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Revenue"
          value={`₹ ${Number(stats.todayRevenue).toLocaleString()}`}
          subtitle={loading ? "Loading..." : "+12% from yesterday"}
        />
        <StatCard
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          subtitle={loading ? "Loading..." : "Require immediate attention"}
        />
        <StatCard
          title="Avg Prep Time"
          value={`${stats.avgPrepTime}m`}
          subtitle={loading ? "Loading..." : "~2m from yesterday"}
        />
      </div>

      {/* Placeholder sections for future widgets to match design */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-base bg-[hsl(var(--card))] p-4">
          <h2 className="text-xl font-semibold mb-1">Recent Orders</h2>
          <p className="text-sm text-muted mb-4">Latest orders that need your attention</p>
          <div className="rounded-xl border border-base bg-[hsl(var(--background))] p-4 text-sm text-muted">
            Coming soon...
          </div>
        </div>
        <div className="rounded-2xl border border-base bg-[hsl(var(--card))] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button className="text-xs text-muted hover:text-[hsl(var(--foreground))]">Mark all read</button>
          </div>
          <div className="mt-3 rounded-xl border border-base bg-[hsl(var(--background))] p-4 text-sm text-muted">
            No new notifications.
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-base bg-[hsl(var(--card))] p-4">
        <h2 className="text-xl font-semibold mb-1">Performance Overview</h2>
        <p className="text-sm text-muted">Your restaurant's key metrics over time</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-extrabold">156</p>
            <p className="text-xs text-white/60">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold">₹45,230</p>
            <p className="text-xs text-white/60">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold">4.5★</p>
            <p className="text-xs text-white/60">Customer Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold">89</p>
            <p className="text-xs text-white/60">Total Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold">3</p>
            <p className="text-xs text-white/60">Cuisine Types</p>
          </div>
        </div>
      </div>
    </div>
  );
}