import React, { useMemo, useState } from "react";
import Modal from "../ui/Modal";

// Local utility: sort helper
function sortBy(items, key, dir = "asc") {
  const mult = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = (a[key] ?? "").toString().toLowerCase();
    const vb = (b[key] ?? "").toString().toLowerCase();
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
}

// Status badge renderer
function StatusBadge({ status }) {
  const map = {
    placed: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    ready: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };
  const cls = map[status] || map.placed;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>{status}</span>;
}

export default function OrdersTable({ orders = [], onOrderUpdate, onOrderCancel }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Derive vendor list from orders
  const vendors = useMemo(() => {
    const set = new Set();
    orders.forEach(o => { if (o.vendor) set.add(o.vendor); if (o.vendorName) set.add(o.vendorName); });
    return Array.from(set);
  }, [orders]);

  const filtered = useMemo(() => {
    let data = orders || [];
    if (statusFilter) data = data.filter(o => o.status === statusFilter);
    if (vendorFilter) data = data.filter(o => (o.vendor || o.vendorName) === vendorFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(o =>
        (o.id || "").toLowerCase().includes(q) ||
        (o.customer || o.customerName || "").toLowerCase().includes(q) ||
        (o.vendor || o.vendorName || "").toLowerCase().includes(q)
      );
    }
    if (sortKey) data = sortBy(data, sortKey, sortDir);
    return data;
  }, [orders, query, statusFilter, vendorFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const startCancel = (id) => setConfirm({ open: true, id });
  const closeCancel = () => setConfirm({ open: false, id: null });
  const proceedCancel = async () => {
    if (!confirm.id) return;
    try {
      await onOrderCancel?.(confirm.id);
    } finally {
      closeCancel();
    }
  };

  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "vendor", label: "Vendor" },
    { key: "items", label: "Items" },
    { key: "totalAmount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Placed At" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, vendor"
            className="border border-base rounded px-3 py-2 w-64 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          />
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="border border-base rounded px-2 py-2 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          >
            <option value="">All Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-base rounded px-2 py-2 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={() => { setQuery(""); setVendorFilter(""); setStatusFilter(""); }}
            className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Reset
          </button>
        </div>
        <div className="text-xs text-muted">{filtered.length} result(s)</div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-base rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-3 py-2 whitespace-nowrap">
                  {col.key !== 'actions' ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  ) : (
                    <span className="font-medium">{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-base">
                <td className="px-3 py-2 whitespace-nowrap font-medium">{o.id}</td>
                <td className="px-3 py-2">{o.customer || o.customerName}</td>
                <td className="px-3 py-2">{o.vendor || o.vendorName}</td>
                <td className="px-3 py-2 text-muted">{Array.isArray(o.items) ? `${o.items.length} item(s)` : '-'}</td>
                <td className="px-3 py-2">{typeof o.totalAmount === 'number' ? `₹${o.totalAmount.toFixed(2)}` : (o.amount || '-')}</td>
                <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                <td className="px-3 py-2 whitespace-nowrap">{o.createdAt || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <select
                      className="border border-base rounded px-2 py-1"
                      value={o.status}
                      onChange={(e) => onOrderUpdate?.(o.id, e.target.value)}
                    >
                      <option value="placed">Placed</option>
                      <option value="accepted">Accepted</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => startCancel(o.id)}
                      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-muted" colSpan={columns.length}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={confirm.open}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel order"
        cancelText="Back"
        onConfirm={proceedCancel}
        onCancel={closeCancel}
      />
    </div>
  );
}