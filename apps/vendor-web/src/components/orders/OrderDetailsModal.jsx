import React from "react";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="text-muted">{label}</div>
      <div className="font-medium text-right">{children}</div>
    </div>
  );
}

const badgeByStatus = {
  new: "bg-amber-100 text-amber-700 border border-amber-200",
  accepted: "bg-blue-100 text-blue-700 border border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  ready: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  delivery: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  delivered: "bg-gray-100 text-gray-700 border border-gray-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

export default function OrderDetailsModal({ open, onClose, order, onAccept, onReject }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-base bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-base">
          <div>
            <h2 className="text-xl font-semibold">Order Details</h2>
            <div className="text-sm text-muted">Order #{order.code} • {order.placedAgoText}</div>
          </div>
          <div className={`ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeByStatus[order.status]}`}>
            {order.status?.[0]?.toUpperCase()}{order.status?.slice(1)}
          </div>
          <button className="ml-2 p-2 rounded hover:bg-accent" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Customer */}
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-muted">{order.customerPhone}</div>
              </div>
              <div className="text-right">
                <div>{order.address?.line1}</div>
                <div className="text-muted">{order.address?.city}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-base bg-[hsl(var(--background))] p-3">
                  <div className="inline-flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-base text-xs">{it.qty}</span>
                    <div>
                      <div className="font-medium">{it.name}</div>
                      {it.note && (
                        <div className="mt-0.5 inline-flex rounded-md bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">Note: {it.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{Number(it.total).toLocaleString()}</div>
                    <div className="text-xs text-muted">₹{Number(it.price).toLocaleString()} each</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="divide-y divide-base">
              <Row label="Subtotal">₹{Number(order.subtotal ?? order.total).toLocaleString()}</Row>
              <Row label="Delivery Fee">₹{Number(order.deliveryFee ?? 0).toLocaleString()}</Row>
              <div className="flex items-center justify-between pt-2">
                <div className="font-semibold">Total</div>
                <div className="text-right font-bold">₹{Number(order.total).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-lg border border-base px-2 py-1 text-sm">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Online Payment
              <span className="ml-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-2 text-xs">Paid</span>
            </div>
          </div>
        </div>

        {/* Footer actions for new orders */}
        {order.status === "new" && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-base bg-[hsl(var(--card))]">
            <button
              className="px-4 py-2 rounded-lg border border-base hover:bg-accent"
              onClick={() => onReject(order)}
            >
              Reject
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              onClick={() => onAccept(order)}
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}