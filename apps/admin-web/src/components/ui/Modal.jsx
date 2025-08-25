import React from "react";

export default function Modal({ open, title = "Confirm", description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, loading = false, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onCancel} />
      <div className="relative bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] w-full max-w-3xl rounded-lg shadow-lg border border-base p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm text-muted mb-2">{description}</p>}
        {children}
        {(confirmText || cancelText) && (
          <div className="mt-4 flex justify-end gap-2">
            {cancelText && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
              >
                {cancelText}
              </button>
            )}
            {confirmText && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-3 py-2 rounded bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? "Processing..." : confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}