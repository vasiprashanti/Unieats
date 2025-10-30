import React, { useMemo, useState } from "react";


// Status badge styles mapped to tokens
const statusStyles = {
  new: "bg-amber-100 text-amber-700 border border-amber-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  accepted: "bg-blue-100 text-blue-700 border border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  ready: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  delivery: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  delivered: "bg-gray-100 text-gray-700 border border-gray-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};


function StatusBadge({ status }) {
  const cls = statusStyles[status] || "bg-accent";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status?.[0]?.toUpperCase()}
      {status?.slice(1)}
    </span>
  );
}


// Format time to HH:MM AM/PM
const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '';
  }
};


export default function OrdersTable({
  orders,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  onSort,
  sortKey,
  sortDir,
  onView,
  onAccept,
  onReject,
  search,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);


  const visibleOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      [o.code, o.customerName, o.customerPhone, o.items?.map((i) => i.name).join(", ")]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(q))
    );
  }, [orders, search]);


  const toggleMenu = (id) => setMenuOpenId((v) => (v === id ? null : id));


  const sortIndicator = (key) => (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-muted hover:text-[hsl(var(--foreground))]"
      onClick={() => onSort(key)}
      title="Sort"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 18L12 22 16 18" />
        <path d="M16 6L12 2 8 6" />
      </svg>
      {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </button>
  );


  return (
    <div className="rounded-2xl border border-base bg-[hsl(var(--card))]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-base">
              <th className="w-10 p-3">
                {/* <input
                  aria-label="Select all"
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                /> */}
              </th>
              <th className="p-3">Order No {sortIndicator("code")}</th>
              <th className="p-3">Item List</th>
              <th className="p-3 text-right">Actions </th>
              <th className="p-3">Status {sortIndicator("status")}</th>
              <th className="p-3">Block No/Address</th>
              {/* <th className="p-3">Customer {sortIndicator("customerName")}</th> */}
              <th className="p-3 whitespace-nowrap">Amount {sortIndicator("total")}</th>
              <th className="p-3 whitespace-nowrap">Time {sortIndicator("placedAt")}</th>
              <th className="p-3 text-center">Bill</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((o) => (
              <tr key={o.id} className="border-t border-base hover:bg-[hsl(var(--accent))]/30">
                <td className="p-3 align-top">
                  {/* <input
                    aria-label={`Select ${o.code}`}
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={(e) => onToggleSelect(o.id, e.target.checked)}
                  /> */}
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium tracking-wide">{o.code}</span>
                    {/* {o.status === "new" && (
                      <span className="text-xs text-red-500">{o.timeLeftText || "\u231A 2m left"}</span>
                    )} */}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="space-y-1">
                    {o.items?.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="font-medium text-[hsl(var(--foreground))]">
                        <span className="text-[#ff6600] font-semibold">{it.qty}x</span> {it.name}
                      </div>
                    ))}
                    {(o.items?.length || 0) > 3 && (
                      <div className="text-muted font-medium text-sm">+ {o.items.length - 3} more items</div>
                    )}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="flex items-start justify-end gap-2 relative">
                    {(o.status === "new" || o.status === "pending") && (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg bg-green-700 text-white px-3 py-1.5 hover:bg-green-900 text-xs font-medium"
                          onClick={() => onAccept(o)}
                          title="Accept order"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg bg-red-700 text-white px-3 py-1.5 hover:bg-red-900 text-xs font-medium"
                          onClick={() => onReject(o)}
                          title="Reject order"
                        >
                          Reject
                        </button>
                      </div>
                    )}


                    {/* <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-base px-2 py-1 hover:bg-accent"
                      onClick={() => toggleMenu(o.id)}
                      title="More"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </button> */}


                    {/* {menuOpenId === o.id && (
                      <div className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-base bg-[hsl(var(--card))] p-1 shadow-xl">
                        {(o.status === "new" || o.status === "pending") && (
                          <>
                            <button
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
                              onClick={() => { setMenuOpenId(null); onAccept(o); }}
                            >
                              ✅ Accept Order
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-red-600"
                              onClick={() => { setMenuOpenId(null); onReject(o); }}
                            >
                              ❌ Reject Order
                            </button>
                          </>
                        )}
                        {o.status !== "new" && o.status !== "pending" && (
                          <div className="px-3 py-2 text-muted">No actions</div>
                        )}
                      </div>
                    )} */}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3 align-top text-muted">
                  <div className="leading-tight">
                    <div className="text-sm">
                      {(() => {
                        const addr = o.customerAddress || o.address;
                        if (!addr) return 'N/A';
                        if (typeof addr === 'string') return addr;
                        if (typeof addr === 'object') {
                          const parts = [];
                          if (addr.line1) parts.push(addr.line1);
                          if (addr.line2) parts.push(addr.line2);
                          if (addr.city) parts.push(addr.city);
                          if (addr.block) parts.push(`Block ${addr.block}`);
                          return parts.length > 0 ? parts.join(', ') : 'N/A';
                        }
                        return 'N/A';
                      })()}
                    </div>
                  </div>
                </td>
                {/* <td className="p-3 align-top">
                  <div className="leading-tight">
                    <div className="text-sm text-[hsl(var(--foreground))]">{o.customerName}</div>
                    <div className="text-muted text-xs">{o.customerPhone}</div>
                  </div>
                </td> */}
                <td className="p-3 align-top font-semibold">₹{Number(o.total).toLocaleString()}</td>
                <td className="p-3 align-top text-muted">{formatTime(o.placedAt)}</td>
                <td className="p-3 align-top">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-base px-2 py-1 hover:bg-accent"
                      onClick={() => onView(o)}
                      title="View order"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}


            {visibleOrders.length === 0 && (
              <tr>
                <td colSpan={9} className="p-10 text-center text-muted">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
