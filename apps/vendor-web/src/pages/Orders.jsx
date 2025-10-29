import React, { useEffect, useMemo, useState } from "react";
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
  { key: "new", label: "NEW" },
  { key: "", label: "ALL ORDERS" },
  { key: "preparing", label: "PREPARING" },
  { key: "ready", label: "READY" },
  { key: "out_for_delivery", label: "OUT FOR DELIVERY" },
  { key: "delivered", label: "DELIVERED" },
  { key: "rejected", label: "REJECTED" },
  { key: "accepted", label: "ACCEPTED" },


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
  setLoading(true); 
  setError("");
  try {
    const data = await getVendorOrders({ status: filter, search, sortKey, sortDir });
    console.log("orders data-", data);


    // Backend returns { success: true, count, orders: [...] }
    const raw = data?.orders ?? [];


    const timeAgo = (iso) => {
      if (!iso) return '';
      const diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return `${Math.floor(diff)} seconds ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      return `about ${Math.floor(diff / 86400)} days ago`;
    };


    const mapItem = (it) => {
      return {
        name: it.name || it.title || it.productName || 'Item',
        qty: it.qty ?? it.quantity ?? it.count ?? 1,
      };
    };


    const mapOrders = raw.map((o) => {
      const customer = o.user || {};
      // customer name may be nested object
      let customerName = '';
      if (customer.name) {
        if (typeof customer.name === 'string') customerName = customer.name;
        else if (typeof customer.name === 'object') {
          customerName = [customer.name.first, customer.name.last].filter(Boolean).join(' ') || customer.name.full || '';
        }
      }
      customerName = customerName || o.customerName || (customer.fullName || '') || 'Customer';


      const customerPhone = customer.phone || customer.phoneNumber || customer.mobile || o.customerPhone || '';


      const addr = o.deliveryAddress || o.customerAddress || o.address || null;
      let customerAddress = null;
      if (addr) {
        if (typeof addr === 'string') customerAddress = addr;
        else {
          customerAddress = {
            line1: addr.line1 || addr.addressLine || '',
            line2: addr.line2 || '',
            city: addr.city || addr.town || '',
            block: addr.block || addr.blockNo || '',
            zip: addr.zipCode || addr.postalCode || addr.zip || ''
          };
        }
      }


      const items = Array.isArray(o.items) ? o.items.map(mapItem) : [];

      const originalStatus = o.status || 'pending';
      const normalizedStatus = STATUS_MAP[originalStatus] || originalStatus;

      return {
        id: o._id || o.id,
        code: o.code || (o._id ? `ORD_${String(o._id).slice(0,6).toUpperCase()}` : 'ORD_000'),
        status: normalizedStatus,
        items,
        customerAddress,
        customerName,
        customerPhone,
        total: o.totalPrice ?? o.total ?? o.amount ?? 0,
        placedAt: o.createdAt || o.placedAt || o.created_at,
        placedAgoText: timeAgo(o.createdAt || o.placedAt || o.created_at),
        timeLeftText: o.timeLeftText || '',
        raw: o,
      };
    });


    setOrders(Array.isArray(mapOrders) ? mapOrders : []);
  } catch (e) {
    setError("Failed to load orders");
  } finally { 
    setLoading(false); 
  }
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
      await updateOrderStatus(order.id, "accepted");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "accepted" } : o)));
      setNotice(`Order ${order.code} has been accepted.`);
    } catch (e) {
      setError("Failed to accept order");
    }
  };


  const rejectOrder = async (order) => {
    try {
      await updateOrderStatus(order.id, "rejected");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "rejected" } : o)));
      setNotice(`Order ${order.code} has been rejected.`);
    } catch (e) {
      setError("Failed to reject order");
    }
  };


  const bulkUpdate = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      // Update each order individually using the existing single-order endpoint
      const results = await Promise.all(
        selectedIds.map((id) =>
          updateOrderStatus(id, status)
            .then((res) => ({ id, ok: true, res }))
            .catch((err) => ({ id, ok: false, err }))
        )
      );


      const successIds = results.filter((r) => r.ok).map((r) => r.id);


      setOrders((prev) => prev.map((o) => (successIds.includes(o.id) ? { ...o, status } : o)));
      setSelectedIds([]);
      setNotice(`${successIds.length} orders updated to ${status}.`);
      const failed = results.length - successIds.length;
      if (failed > 0) setError(`${failed} orders failed to update.`);
    } catch (e) {
      setError("Failed to update orders");
    }
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
      {/* <div className="flex items-center gap-2">
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
        <button
          className="rounded-lg border border-base px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate('out_for_delivery')}
        >
          Mark as Out for Delivery
        </button>
        <button
          className="rounded-lg border border-base px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate('delivered')}
        >
          Mark as Delivered
        </button>
      </div> */}


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
