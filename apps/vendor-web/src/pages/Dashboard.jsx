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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Revenue"
          value={`₹ ${Number(stats.todayRevenue).toLocaleString()}`}
          subtitle={loading ? "Loading..." : "+12% from yesterday"}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <StatCard
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          subtitle={loading ? "Loading..." : "Require immediate attention"}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15V8a2 2 0 0 0-2-2h-3l-2-2H8L6 6H5a2 2 0 0 0-2 2v7" />
              <path d="M3 21h18" />
              <path d="M16 13a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <StatCard
          title="Avg Prep Time"
          value={`${stats.avgPrepTime}m`}
          subtitle={loading ? "Loading..." : "~2m from yesterday"}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          }
        />
      </div>

      {/* Enhanced content sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-base bg-[hsl(var(--card))] p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[hsl(var(--primary))]/10">
              <svg className="h-5 w-5 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15V8a2 2 0 0 0-2-2h-3l-2-2H8L6 6H5a2 2 0 0 0-2 2v7" />
                <path d="M3 21h18" />
                <path d="M16 13a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <p className="text-sm text-muted">Latest orders that need your attention</p>
            </div>
          </div>
          <div className="rounded-2xl border border-base bg-[hsl(var(--background))] p-6 text-sm text-muted group-hover:bg-[hsl(var(--accent))]/50 transition-colors duration-300">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <p>Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-base bg-[hsl(var(--card))] p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[hsl(var(--primary))]/10">
                <svg className="h-5 w-5 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 21a2 2 0 0 0 4 0" />
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <button className="text-xs text-muted hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] px-2 py-1 rounded-lg transition-all duration-200">Mark all read</button>
          </div>
          <div className="rounded-2xl border border-base bg-[hsl(var(--background))] p-6 text-sm text-muted group-hover:bg-[hsl(var(--accent))]/50 transition-colors duration-300">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 21a2 2 0 0 0 4 0" />
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                </div>
                <p>No new notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-base bg-[hsl(var(--card))] p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[hsl(var(--primary))]/10">
            <svg className="h-5 w-5 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Performance Overview</h2>
            <p className="text-sm text-muted">Your restaurant's key metrics over time</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-2xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]/30 transition-all duration-300 group/metric hover:scale-105 hover:shadow-md border border-base/50">
            <p className="text-3xl font-extrabold text-[hsl(var(--primary))] group-hover/metric:scale-110 transition-transform duration-200">156</p>
            <p className="text-xs text-muted font-medium mt-2">Total Orders</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]/30 transition-all duration-300 group/metric hover:scale-105 hover:shadow-md border border-base/50">
            <p className="text-3xl font-extrabold text-[hsl(var(--primary))] group-hover/metric:scale-110 transition-transform duration-200">₹45,230</p>
            <p className="text-xs text-muted font-medium mt-2">Total Revenue</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]/30 transition-all duration-300 group/metric hover:scale-105 hover:shadow-md border border-base/50">
            <p className="text-3xl font-extrabold text-[hsl(var(--primary))] group-hover/metric:scale-110 transition-transform duration-200">4.5★</p>
            <p className="text-xs text-muted font-medium mt-2">Customer Rating</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]/30 transition-all duration-300 group/metric hover:scale-105 hover:shadow-md border border-base/50">
            <p className="text-3xl font-extrabold text-[hsl(var(--primary))] group-hover/metric:scale-110 transition-transform duration-200">89</p>
            <p className="text-xs text-muted font-medium mt-2">Total Reviews</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]/30 transition-all duration-300 group/metric hover:scale-105 hover:shadow-md border border-base/50">
            <p className="text-3xl font-extrabold text-[hsl(var(--primary))] group-hover/metric:scale-110 transition-transform duration-200">3</p>
            <p className="text-xs text-muted font-medium mt-2">Cuisine Types</p>
          </div>
        </div>
      </div>
    </div>
  );
}