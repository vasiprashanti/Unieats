import React, { useEffect, useMemo, useState } from "react";
import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import Alert from "../components/Alert";
import { bulkUpdateOrderStatus, getVendorOrders, updateOrderStatus } from "../api/vendor";
import { useAuth } from "../context/AuthContext";

const FILTERS = [
  { key: "", label: "All Orders" },
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "delivery", label: "Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "rejected", label: "Rejected" },
];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("placedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchOrders = async () => {
    setLoading(true); setError("");
    try {
      const data = await getVendorOrders({ token: user?.token, status: filter, search, sortKey, sortDir });
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load orders");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter, sortKey, sortDir]);

  const counts = useMemo(() => {
    const by = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    return { all: orders.length, ...by };
  }, [orders]);

  const displayedOrders = useMemo(() => {
    const filtered = filter ? orders.filter((o) => o.status === filter) : orders;
    const withSearch = search
      ? filtered.filter((o) =>
          [o.code, o.customerName, o.customerPhone, o.items?.map((i) => i.name).join(", ")]
            .filter(Boolean)
            .some((t) => String(t).toLowerCase().includes(search.toLowerCase()))
        )
      : filtered;
    const sorted = [...withSearch].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      return (va > vb ? 1 : -1) * dir;
    });
    return sorted;
  }, [orders, filter, search, sortKey, sortDir]);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const onToggleSelect = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };
  const onToggleSelectAll = (checked) => {
    setSelectedIds(checked ? displayedOrders.map((o) => o.id) : []);
  };

  const openDetails = (order) => { setActiveOrder(order); setModalOpen(true); };
  const closeDetails = () => { setModalOpen(false); setActiveOrder(null); };

  const acceptOrder = async (order) => {
    try {
      await updateOrderStatus({ token: user?.token, id: order.id, status: "accepted" });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "accepted" } : o)));
      setNotice(`Order ${order.code} has been accepted.`);
    } catch (e) { setError("Failed to accept order"); }
  };
  const rejectOrder = async (order) => {
    try {
      await updateOrderStatus({ token: user?.token, id: order.id, status: "rejected" });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "rejected" } : o)));
      setNotice(`Order ${order.code} has been rejected.`);
    } catch (e) { setError("Failed to reject order"); }
  };

  const bulkUpdate = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateOrderStatus({ token: user?.token, ids: selectedIds, status });
      setOrders((prev) => prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status } : o)));
      setSelectedIds([]);
      setNotice(`${selectedIds.length} orders updated to ${status}.`);
    } catch (e) { setError("Failed to update orders"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
          <p className="text-sm text-muted">View, sort, and manage all your orders in one place</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search orders..."
            className="w-64 rounded-xl border border-base bg-[hsl(var(--background))] px-3 py-2 text-sm"
            aria-label="Search orders"
          />
          <span className="absolute right-2 top-2.5 text-muted">⌘K</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-3 py-1.5 text-sm border ${
              (filter || '') === (f.key || '')
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'border-base text-muted hover:bg-accent'
            }`}
          >
            {f.label}
            <span className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
              (filter || '') === (f.key || '') ? 'bg-[hsl(var(--primary-foreground))]/20' : 'bg-accent'
            }`}>
              {f.key ? (counts[f.key] || 0) : counts.all}
            </span>
          </button>
        ))}
      </div>

      <Alert type={error ? 'error' : 'success'} message={error || notice} />

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-base px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate('preparing')}
        >
          Mark as Preparing
        </button>
        <button
          className="rounded-lg border border-base px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate('ready')}
        >
          Mark as Ready
        </button>
      </div>

      {/* Table */}
      <OrdersTable
        orders={displayedOrders}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        allSelected={selectedIds.length > 0 && selectedIds.length === displayedOrders.length}
        onSort={onSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onView={openDetails}
        onAccept={acceptOrder}
        onReject={rejectOrder}
        search={search}
      />

      {/* Modal */}
      <OrderDetailsModal
        open={modalOpen}
        onClose={closeDetails}
        order={activeOrder}
        onAccept={acceptOrder}
        onReject={rejectOrder}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      )}
    </div>
  );
}