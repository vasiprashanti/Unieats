import React, { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import DocumentViewer from "./DocumentViewer";

// Utility: simple sort by key
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

export default function VendorTable({ vendors, onApprove, onReject, busyId }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const [confirm, setConfirm] = useState({ open: false, id: null, action: null });
  const [docView, setDocView] = useState({ open: false, vendor: null });

  const filtered = useMemo(() => {
    let data = vendors || [];
    // filter by status
    if (statusFilter !== "all") data = data.filter(v => v.status === statusFilter);
    // filter by query (name/email)
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(v => v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    }
    // sort
    if (sortKey) data = sortBy(data, sortKey, sortDir);
    return data;
  }, [vendors, query, statusFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const startConfirm = (id, action) => setConfirm({ open: true, id, action });
  const closeConfirm = () => setConfirm({ open: false, id: null, action: null });

  const proceedConfirm = async () => {
    if (!confirm.id || !confirm.action) return;
    try {
      if (confirm.action === "approve") await onApprove(confirm.id);
      else await onReject(confirm.id);
    } finally {
      closeConfirm();
    }
  };

  const openDocs = (vendor) => setDocView({ open: true, vendor });
  const closeDocs = () => setDocView({ open: false, vendor: null });

  const columns = [
    { key: "name", label: "Vendor Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date Registered" },
    { key: "docs", label: "Documents" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="border border-base rounded px-3 py-2 w-64 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-base rounded px-2 py-2 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
                  {col.key !== 'actions' && col.key !== 'docs' ? (
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
            {filtered.map(v => (
              <tr key={v.id} className="border-t border-base">
                <td className="px-3 py-2">{v.name}</td>
                <td className="px-3 py-2">{v.email}</td>
                <td className="px-3 py-2 capitalize">
                  {(() => {
                    const map = {
                      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                    };
                    const cls = map[v.status] || "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100";
                    return (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
                        {v.status}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{v.date}</td>
                <td className="px-3 py-2">
                  <button type="button" className="text-[hsl(var(--primary))] hover:underline" onClick={() => openDocs(v)}>View</button>
                </td>
                <td className="px-3 py-2">
                  {v.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startConfirm(v.id, 'approve')}
                        disabled={busyId === v.id}
                        className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {busyId === v.id ? '...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startConfirm(v.id, 'reject')}
                        disabled={busyId === v.id}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyId === v.id ? '...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-muted" colSpan={columns.length}>No vendors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      <Modal
        open={confirm.open}
        title={confirm.action === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
        description={confirm.action === 'approve' ? 'Are you sure you want to approve this vendor?' : 'Are you sure you want to reject this vendor?'}
        confirmText={confirm.action === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        onConfirm={proceedConfirm}
        onCancel={closeConfirm}
        loading={busyId === confirm.id}
      />

      {/* Document viewer */}
      <DocumentViewer
        open={docView.open}
        onClose={closeDocs}
        vendorName={docView.vendor?.name}
        documents={docView.vendor?.documents}
      />
    </div>
  );
}