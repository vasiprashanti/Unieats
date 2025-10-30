import React from "react";

const badgeByStatus = {
  new: "bg-amber-100 text-amber-700 border border-amber-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  accepted: "bg-blue-100 text-blue-700 border border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  ready: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  delivery: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  delivered: "bg-gray-100 text-gray-700 border border-gray-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

export default function OrderDetailsModal({ open, onClose, order, onAccept, onReject }) {
  if (!open || !order) return null;

  const platformFee = Math.floor(order.total / 50); // Calculate platform fee
  const subtotal = order.total - (order.deliveryFee ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="relative w-full max-w-md max-h-[90vh] rounded-xl border border-gray-200 bg-gray-200 text-gray-900 shadow-lg flex flex-col" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200" style={{ borderBottomWidth: '1px', borderBottomColor: 'hsl(240, 6%, 90%)' }}>
          <h3 className="text-lg font-semibold" style={{ fontSize: '20px', fontWeight: '600' }}>Order Bill - #{order.code}</h3>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
            onClick={onClose} 
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Customer Information Section */}
          <div>
            <div className="flex justify-between mb-3" style={{ marginBottom: '12px' }}>
              <span style={{ color: 'hsl(240, 4%, 46%)', fontSize: '14px' }}>Customer Name:</span>
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{order.customerName}</span>
            </div>
            <div className="flex justify-between mb-3" style={{ marginBottom: '12px' }}>
              <span style={{ color: 'hsl(240, 4%, 46%)', fontSize: '14px' }}>Mobile:</span>
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{order.customerPhone}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '0' }}>
              <span style={{ color: 'hsl(240, 4%, 46%)', fontSize: '14px' }}>Block Number:</span>
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{order.customerAddress?.block || 'N/A'}</span>
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: '0', borderTop: '1px solid hsl(240, 6%, 90%)', margin: '0' }} />

          {/* Order Details Section */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px' }}>Order Details</h4>
            <div className="space-y-2">
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between" style={{ fontSize: '14px', marginBottom: '12px' }}>
                  <div className="flex gap-2">
                    <span style={{ color: 'hsl(14, 100%, 57%)', fontWeight: '600' }}>{it.qty}x</span>
                    <span>{it.name}</span>
                  </div>
                  <span style={{ fontWeight: '500' }}>₹{Number(it.total || it.price * it.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: '0', borderTop: '1px solid hsl(240, 6%, 90%)', margin: '0' }} />

          {/* Summary Section */}
          <div>
            <div className="flex justify-between mb-3" style={{ fontSize: '14px', marginBottom: '12px' }}>
              <span style={{ color: 'hsl(240, 4%, 46%)' }}>Subtotal:</span>
              <span>₹{Number(subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '14px' }}>
              <span style={{ color: 'hsl(240, 4%, 46%)' }}>Platform Fee:</span>
              <span>₹{Number(platformFee).toLocaleString()}</span>
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: '0', borderTop: '1px solid hsl(240, 6%, 90%)', margin: '0' }} />

          {/* Final Total */}
          <div className="flex justify-between items-center pt-4" style={{ paddingTop: '16px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Final Total:</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'hsl(240, 10%, 10%)' }}>₹{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        {/* {order.status === "new" && (
          <div className="flex items-center justify-end gap-2 px-6 py-6 border-t border-gray-200" style={{ borderTopWidth: '1px', borderTopColor: 'hsl(240, 6%, 90%)', background: 'hsl(240, 5%, 96%)' }}>
            <button
              className="px-4 py-2 rounded-md border font-medium text-sm transition-all"
              onClick={() => onReject(order)}
              style={{ 
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(240, 6%, 90%)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: 'hsl(240, 10%, 10%)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'hsl(240, 5%, 96%)'}
              onMouseLeave={(e) => e.target.style.background = 'hsl(0, 0%, 100%)'}
            >
              Reject
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium text-sm transition-all text-white"
              onClick={() => onAccept(order)}
              style={{ 
                background: 'hsl(14, 100%, 57%)',
                border: '1px solid hsl(14, 100%, 57%)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: 'hsl(0, 0%, 100%)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'hsl(14, 100%, 52%)'}
              onMouseLeave={(e) => e.target.style.background = 'hsl(14, 100%, 57%)'}
            >
              Accept
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}
