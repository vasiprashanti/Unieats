import React, { useMemo, useState } from "react";


const btnBase = "action-btn";
const btnAccept = `${btnBase} accept`;
const btnReject = `${btnBase} reject`;
const btnPrimary = `${btnBase} primary`;


function StatusBadge({ status }) {
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
  const cls = statusStyles[status] || "bg-accent";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status?.[0]?.toUpperCase()}
      {status?.slice(1)}
    </span>
  );
}


const formatTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
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
  onUpdateStatus,
  search,
}) {
  const visibleOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      [o.code, o.customerName, o.customerPhone, o.items?.map((i) => i.name).join(", ")]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(q))
    );
  }, [orders, search]);


  const sortIndicator = (key) => (
    <button
      type="button"
      style={{ border: 0, background: "none", cursor: "pointer" }}
      className="inline-flex items-center gap-1 text-muted hover:text-[hsl(var(--foreground))]"
      onClick={() => onSort(key)}
      title="Sort"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 18L12 22 16 18" />
        <path d="M16 6L12 2 8 6" />
      </svg>
      {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </button>
  );


  const getActionButton = (order) => {
    if (order.status === "new" || order.status === "pending") {
      return (
        <div className="flex flex-col gap-1" >
          <button
            type="button"
            className={btnAccept}
            style={{ marginBottom: 4 }}
            onClick={() => onAccept(order)}
            title="Accept order"
          >
            Accept
          </button>
          <button
            type="button"
            className={btnReject}
            onClick={() => onReject(order)}
            title="Reject order"
          >
            Reject
          </button>
        </div>
      );
    } else if (order.status === "accepted") {
      return (
        <button
          type="button"
          className={btnPrimary}
          onClick={() => onUpdateStatus(order, "preparing")}
          title="Mark as preparing"
          style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" }}
        >
          Mark as Preparing
        </button>
      );
    } else if (order.status === "preparing") {
      return (
        <button
          type="button"
          className={btnPrimary}
          onClick={() => onUpdateStatus(order, "ready")}
          title="Mark as ready"
          style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" }}
        >
          Mark as Ready
        </button>
      );
    } else if (order.status === "ready") {
      return (
        <button
          type="button"
          className={btnPrimary}
          onClick={() => onUpdateStatus(order, "out_for_delivery")}
          title="Mark as out for delivery"
          style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" }}
        >
          Mark as Out for Delivery
        </button>
      );
    } else if (order.status === "out_for_delivery") {
      return (
        <button
          type="button"
          className={btnPrimary}
          onClick={() => onUpdateStatus(order, "delivered")}
          title="Mark as delivered"
          style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" }}
        >
          Mark as Delivered
        </button>
      );
    }
    return null;
  };


  return (
    <div className="rounded-2xl border border-base bg-[hsl(var(--card))]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-base">
              <th className="w-10 p-3"></th>
              <th className="p-3">ORDER ID {sortIndicator("code")}</th>
              <th className="p-3">ITEM LIST</th>
              <th className="p-3 ">ACTIONS </th>
              <th className="p-3">STATUS {sortIndicator("status")}</th>
              <th className="p-3">ADDRESS</th>
              <th className="p-3 whitespace-nowrap">AMOUNT {sortIndicator("total")}</th>
              <th className="p-3 whitespace-nowrap">TIME {sortIndicator("placedAt")}</th>
              <th className="p-3 text-center">BILL</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((o) => (
              <tr key={o.id} className="border-t border-base hover:bg-[hsl(var(--accent))]/30">
                <td className="p-3 align-top"></td>
                <td className="p-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium tracking-wide">{o.code}</span>
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
                  <div className="flex items-start justify-start gap-2 relative">
                    {getActionButton(o)}
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
                        if (!addr) return "N/A";
                        if (typeof addr === "string") return addr;
                        if (typeof addr === "object") {
                          const parts = [];
                          if (addr.line1) parts.push(addr.line1);
                          if (addr.line2) parts.push(addr.line2);
                          if (addr.city) parts.push(addr.city);
                          if (addr.block) parts.push(`Block ${addr.block}`);
                          return parts.length > 0 ? parts.join(", ") : "N/A";
                        }
                        return "N/A";
                      })()}
                    </div>
                  </div>
                </td>
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
                <td colSpan={9} className="p-10 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Action button styles */}
      <style>
        {`
        .action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid hsl(240, 6%, 90%);
          background: hsl(0, 0%, 100%);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .action-btn:hover {
          background: hsl(240, 5%, 96%);
        }
        
        .action-btn.accept {
          background: hsl(120, 60%, 70%);
          color: hsl(120, 40%, 20%);
          border-color: hsl(120, 60%, 65%);
          padding: 6px 12px;
          font-size: 13px;
        }
        .action-btn.accept:hover {
          background: hsl(120, 60%, 65%);
        }
        
        .action-btn.reject {
          background: hsl(0, 70%, 75%);
          color: hsl(0, 50%, 25%);
          border-color: hsl(0, 70%, 70%);
          padding: 6px 12px;
          font-size: 13px;
        }
        .action-btn.reject:hover {
          background: hsl(0, 70%, 70%);
        }
        
        /* Progressive buttons - all orange */
        .action-btn.primary {
          background: hsl(14, 100%, 57%);
          color: #fff;
          border-color: hsl(14, 100%, 57%);
          padding: 6px 12px;
          font-size: 13px;
        }
        .action-btn.primary:hover {
          background: hsl(14, 100%, 52%);
        }
        `}
      </style>
    </div>
  );
}
