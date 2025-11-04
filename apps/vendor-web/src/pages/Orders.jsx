import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import Alert from "../components/Alert";
import { getVendorOrders, updateOrderStatus } from "../api/vendor";
import { useAuth } from "../context/AuthContext";

const STATUS_MAP = {
  new: "new",
  preparing: "preparing",
  ready: "ready",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  rejected: "rejected",
  accepted: "accepted",
  pending: "new",
};

const FILTERS = [
  { key: "new", label: "Live" },
  { key: "", label: "All Orders" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "rejected", label: "Rejected" },
  { key: "accepted", label: "Accepted" },
];

// Helper function to normalize orders (extracted and memoized)
const normalizeOrder = (o) => {
  const customer = o.user || {};
  let customerName = "";
  if (customer.name) {
    if (typeof customer.name === "string") customerName = customer.name;
    else if (typeof customer.name === "object") {
      customerName =
        [customer.name.first, customer.name.last].filter(Boolean).join(" ") ||
        customer.name.full ||
        "";
    }
  }
  customerName =
    customerName || o.customerName || customer.fullName || "" || "Customer";

  const customerPhone =
    customer.phone ||
    customer.phoneNumber ||
    customer.mobile ||
    o.customerPhone ||
    "";

  const addr = o.deliveryAddress || o.customerAddress || o.address || null;
  let customerAddress = null;
  if (addr) {
    if (typeof addr === "string") customerAddress = addr;
    else {
      customerAddress = {
        line1: addr.line1 || addr.addressLine || "",
        line2: addr.line2 || "",
        city: addr.city || addr.town || "",
        block: addr.block || addr.blockNo || "",
        zip: addr.zipCode || addr.postalCode || addr.zip || "",
      };
    }
  }

  const items = Array.isArray(o.items)
    ? o.items.map((it) => ({
        name: it.name || it.title || it.productName || "Item",
        qty: it.qty ?? it.quantity ?? it.count ?? 1,
        price: it.price ?? 0,
        total:
          it.total ??
          (it.price ?? 0) * (it.qty ?? it.quantity ?? it.count ?? 1),
      }))
    : [];

  const originalStatus = o.status || "pending";
  const normalizedStatus = STATUS_MAP[originalStatus] || originalStatus;

  return {
    id: o._id || o.id,
    code:
      o.code ||
      (o._id ? `ORD_${String(o._id).slice(0, 6).toUpperCase()}` : "ORD_000"),
    status: normalizedStatus,
    items,
    customerAddress,
    customerName,
    customerPhone,
    total: o.totalPrice ?? o.total ?? o.amount ?? 0,
    subtotal: o.subtotal ?? 0,
    platformFee: o.platformFee ?? 0,
    vendorCommission: o.vendorCommission ?? 0,
    placedAt: o.createdAt || o.placedAt || o.created_at,
    placedAgoText: getTimeAgo(o.createdAt || o.placedAt || o.created_at),
    timeLeftText: o.timeLeftText || "",
    raw: o,
  };
};

// Time formatting helper
const getTimeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `about ${Math.floor(diff / 86400)} days ago`;
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
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
  const abortControllerRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const data = await getVendorOrders({
        status: filter,
        search,
        sortKey,
        sortDir,
      });
      const raw = data?.orders ?? [];

      // Batch map operations for better performance
      const mapped = raw.map(normalizeOrder);
      setOrders(Array.isArray(mapped) ? mapped : []);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }, [filter, search, sortKey, sortDir]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const data = await getVendorOrders({
        status: "",
        search: "",
        sortKey: "placedAt",
        sortDir: "desc",
      });
      const raw = data?.orders ?? [];
      const mapped = raw.map(normalizeOrder);
      setAllOrders(Array.isArray(mapped) ? mapped : []);
    } catch (e) {
      // Silent fail for count fetching
    }
  }, []);

  // Fetch filtered orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [filter, sortKey, sortDir, fetchOrders]);

  // Fetch all orders on mount only
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Memoized counts calculation
  const counts = useMemo(() => {
    const by = {};
    for (let i = 0; i < allOrders.length; i++) {
      const status = allOrders[i].status;
      by[status] = (by[status] || 0) + 1;
    }
    return { all: allOrders.length, ...by };
  }, [allOrders]);

  // Memoized displayed orders with optimized filtering
  const displayedOrders = useMemo(() => {
    let result = filter ? orders.filter((o) => o.status === filter) : orders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const searchFields = [o.code, o.customerName, o.customerPhone];
        if (o.items?.length > 0) {
          searchFields.push(o.items.map((i) => i.name).join(" "));
        }
        return searchFields.some(
          (t) => t && String(t).toLowerCase().includes(q)
        );
      });
    }

    // Sort only once
    result.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      return (va > vb ? 1 : -1) * dir;
    });

    return result;
  }, [orders, filter, search, sortKey, sortDir]);

  const onSort = useCallback(
    (key) => {
      setSortDir((d) =>
        sortKey === key ? (d === "asc" ? "desc" : "asc") : "asc"
      );
      if (sortKey !== key) setSortKey(key);
    },
    [sortKey]
  );

  const onToggleSelect = useCallback((id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }, []);

  const onToggleSelectAll = useCallback(
    (checked) => {
      setSelectedIds(checked ? displayedOrders.map((o) => o.id) : []);
    },
    [displayedOrders]
  );

  const openDetails = useCallback((order) => {
    setActiveOrder(order);
    setModalOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setModalOpen(false);
    setActiveOrder(null);
  }, []);

  const acceptOrder = useCallback(async (order) => {
    try {
      await updateOrderStatus(order.id, "accepted");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "accepted" } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "accepted" } : o))
      );
      setNotice(`Order ${order.code} has been accepted.`);
    } catch (e) {
      setError("Failed to accept order");
    }
  }, []);

  const rejectOrder = useCallback(async (order) => {
    try {
      await updateOrderStatus(order.id, "rejected");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "rejected" } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "rejected" } : o))
      );
      setNotice(`Order ${order.code} has been rejected.`);
    } catch (e) {
      setError("Failed to reject order");
    }
  }, []);

  const updateOrderStatusHandler = useCallback(async (order, newStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      setNotice(
        `Order ${order.code} status updated to ${newStatus.replace("_", " ")}.`
      );
    } catch (e) {
      setError("Failed to update order status");
    }
  }, []);

  const bulkUpdate = useCallback(
    async (status) => {
      if (selectedIds.length === 0) return;
      try {
        const results = await Promise.all(
          selectedIds.map((id) =>
            updateOrderStatus(id, status)
              .then((res) => ({ id, ok: true, res }))
              .catch((err) => ({ id, ok: false, err }))
          )
        );

        const successIds = results.filter((r) => r.ok).map((r) => r.id);

        setOrders((prev) =>
          prev.map((o) => (successIds.includes(o.id) ? { ...o, status } : o))
        );
        setAllOrders((prev) =>
          prev.map((o) => (successIds.includes(o.id) ? { ...o, status } : o))
        );
        setSelectedIds([]);
        setNotice(`${successIds.length} orders updated to ${status}.`);
        const failed = results.length - successIds.length;
        if (failed > 0) setError(`${failed} orders failed to update.`);
      } catch (e) {
        setError("Failed to update orders");
      }
    },
    [selectedIds]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
          <p className="text-sm text-muted">
            View, sort, and manage all your orders in one place
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-3 py-1.5 text-sm border transition-all ${
              (filter || "") === (f.key || "")
                ? "bg-[hsl(14,100%,57%)] text-white border-[hsl(14,100%,57%)]"
                : "border-base text-muted hover:bg-accent"
            }`}
          >
            {f.label}
            <span
              className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                (filter || "") === (f.key || "") ? "bg-white/20" : "bg-accent"
              }`}
            >
              {f.key ? counts[f.key] || 0 : counts.all}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
          placeholder="Search Orders..."
          className="w-96 rounded-xl border border-base bg-[hsl(var(--background))] px-3 py-2 text-sm"
          aria-label="Search orders"
        />
        {/* <span className="absolute right-3 top-2.5 text-muted">⌘K</span> */}
      </div>

      <Alert type={error ? "error" : "success"} message={error || notice} />

      <OrdersTable
        orders={displayedOrders}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        allSelected={
          selectedIds.length > 0 &&
          selectedIds.length === displayedOrders.length
        }
        onSort={onSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onView={openDetails}
        onAccept={acceptOrder}
        onReject={rejectOrder}
        onUpdateStatus={updateOrderStatusHandler}
        search={search}
      />

      <OrderDetailsModal
        open={modalOpen}
        onClose={closeDetails}
        order={activeOrder}
        onAccept={acceptOrder}
        onReject={rejectOrder}
      />

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
