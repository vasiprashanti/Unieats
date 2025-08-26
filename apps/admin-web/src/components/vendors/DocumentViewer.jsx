import React, { useMemo, useState } from "react";
import Modal from "../ui/Modal";

// Determine how to render based on file type or extension
function detectKind(doc) {
  const t = (doc?.type || "").toLowerCase();
  const url = (doc?.url || "").toLowerCase();
  if (t.startsWith("image/")) return "image";
  if (t === "application/pdf" || url.endsWith(".pdf")) return "pdf";
  return "other";
}

export default function DocumentViewer({ open, onClose, vendorName, documents = [] }) {
  const safeDocs = Array.isArray(documents) ? documents : [];
  const [activeIdx, setActiveIdx] = useState(0);

  const activeDoc = useMemo(() => safeDocs[Math.max(0, Math.min(activeIdx, safeDocs.length - 1))], [safeDocs, activeIdx]);
  const kind = detectKind(activeDoc || {});

  return (
    <Modal
      open={open}
      title={vendorName ? `${vendorName} • Documents` : "Documents"}
      description={safeDocs.length ? "Select a document to preview. Use the open button to view in a new tab." : "No documents available."}
      confirmText={null}
      cancelText="Close"
      onConfirm={null}
      onCancel={onClose}
    >
      {/* Replace Modal's buttons by passing null confirmText, render custom content below */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Sidebar list */}
        <div className="md:col-span-1 space-y-2 max-h-[50vh] overflow-auto pr-1">
          {safeDocs.map((d, i) => (
            <button
              key={d.id || d.url || i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2 rounded border ${i === activeIdx ? 'border-[hsl(var(--primary))] bg-[hsl(var(--muted))]' : 'border-base'}`}
              title={d.name || d.url}
            >
              <div className="text-sm font-medium truncate">{d.name || `Document ${i + 1}`}</div>
              {d.type && <div className="text-xs text-muted truncate">{d.type}</div>}
            </button>
          ))}
          {safeDocs.length === 0 && (
            <div className="text-sm text-muted">No documents to display.</div>
          )}
        </div>

        {/* Preview panel */}
        <div className="md:col-span-2 min-h-[50vh] border border-base rounded overflow-hidden flex items-center justify-center bg-[hsl(var(--card))]">
          {!activeDoc ? (
            <div className="text-sm text-muted">Select a document from the list</div>
          ) : kind === 'image' ? (
            <img src={activeDoc.url} alt={activeDoc.name || 'Document image'} className="max-h-[50vh] w-auto object-contain" />
          ) : kind === 'pdf' ? (
            <iframe title={activeDoc.name || 'PDF'} src={activeDoc.url} className="w-full h-[50vh]" />
          ) : (
            <div className="text-center p-4">
              <div className="text-sm mb-2">Preview not available for this file type.</div>
              <a
                className="text-[hsl(var(--primary))] hover:underline text-sm"
                href={activeDoc.url}
                target="_blank"
                rel="noreferrer"
              >
                Open document
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {activeDoc && (
        <div className="mt-3 flex justify-end">
          <a
            href={activeDoc.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
          >
            Open in new tab
          </a>
        </div>
      )}
    </Modal>
  );
}