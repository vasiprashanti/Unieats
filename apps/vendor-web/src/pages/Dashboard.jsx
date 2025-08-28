import React, { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import Alert from "../components/Alert";
import { getVendorDashboard } from "../api/vendor";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayRevenue: 0, pendingOrders: 0, avgPrepTime: 0, status: "pending" });
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState("You have a new order!"); // basic notification demo
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getVendorDashboard({ token: user?.token });
        if (active) setStats({
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
    return () => { active = false; };
  }, [user?.token]);

  const statusBanner = () => {
    if (stats.status === "approved") {
      return (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
          Your vendor account is approved. You can accept orders.
        </div>
      );
    }
    if (stats.status === "rejected") {
      return (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          Your application was rejected. Please contact support.
        </div>
      );
    }
    return (
      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
        Your application is pending review.
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Vendor Dashboard</h1>
      <p className="mb-4 text-sm text-gray-500">Overview of today’s performance and status.</p>

      {statusBanner()}
      <Alert type="error" message={error} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Today's Revenue" value={`₹ ${Number(stats.todayRevenue).toLocaleString()}`} subtitle={loading ? "Loading..." : "Updated just now"} />
        <StatCard title="Pending Orders" value={String(stats.pendingOrders)} subtitle={loading ? "Loading..." : "Live"} />
        <StatCard title="Avg Prep Time" value={`${stats.avgPrepTime} mins`} subtitle={loading ? "Loading..." : "Today"} />
      </div>

      {/* Notifications */}
      <div className="mt-6">
        <h2 className="mb-2 text-lg font-medium">Notifications</h2>
        {notif ? (
          <div className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-orange-700">
            <span>{notif}</span>
            <button onClick={() => setNotif("")} className="text-sm font-medium text-orange-700 hover:underline">Dismiss</button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No new notifications.</p>
        )}
      </div>
    </div>
  );
}