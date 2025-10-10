import React, { useMemo, useState } from "react";
import DocumentViewer from "./DocumentViewer";

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
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [docView, setDocView] = useState({ open: false, vendor: null });

  const filtered = useMemo(() => {
    let data = vendors || [];
    if (statusFilter !== "all") {
      data = data.filter(v => v.approvalStatus === statusFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        v =>
          v.businessName?.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q)
      );
    }
    if (sortKey) data = sortBy(data, sortKey, sortDir);
    return data;
  }, [vendors, query, statusFilter, sortKey, sortDir]);

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openDocs = vendor => setDocView({ open: true, vendor });
  const closeDocs = () => setDocView({ open: false, vendor: null });

  const columns = [
    { key: "businessName", label: "Vendor Name" },
    { key: "email", label: "Email" },
    { key: "approvalStatus", label: "Status" },
    { key: "createdAt", label: "Date Registered" },
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
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="border border-base rounded px-3 py-2 w-64 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
                  {col.key !== "actions" && col.key !== "docs" ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span className="text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
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
              <tr key={v._id} className="border-t border-base">
                <td className="px-3 py-2">{v.businessName}</td>
                <td className="px-3 py-2">{v.email || "—"}</td>
                <td className="px-3 py-2 capitalize">
                  {(() => {
                    const map = {
                      pending:
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                      approved:
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                      rejected:
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                    };
                    const cls =
                      map[v.approvalStatus] ||
                      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100";
                    return (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}
                      >
                        {v.approvalStatus}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-[hsl(var(--primary))] hover:underline"
                    onClick={() => openDocs(v)}
                  >
                    View
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove(v._id)}
                      disabled={busyId === v._id}
                      className={`px-2 py-1 rounded text-white ${
                        v.approvalStatus === "approved"
                          ? "bg-green-600"
                          : "bg-gray-400 hover:bg-green-600"
                      } disabled:opacity-60`}
                    >
                      {busyId === v._id ? "..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(v._id)}
                      disabled={busyId === v._id}
                      className={`px-2 py-1 rounded text-white ${
                        v.approvalStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-gray-400 hover:bg-red-600"
                      } disabled:opacity-60`}
                    >
                      {busyId === v._id ? "..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  className="px-3 py-8 text-center text-muted"
                  colSpan={columns.length}
                >
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Document viewer */}
      <DocumentViewer
        open={docView.open}
        onClose={closeDocs}
        vendorName={docView.vendor?.businessName}
        documents={docView.vendor?.documents}
      />
    </div>
  );
}
