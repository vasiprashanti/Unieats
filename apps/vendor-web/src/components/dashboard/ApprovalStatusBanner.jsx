import React from "react";

export default function ApprovalStatusBanner({ status }) {
  if (status === "approved") {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
        <span>Congratulations! Your account is approved and live.</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Approved</span>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
        <span>Your application was not approved. Please contact support for more information.</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Rejected</span>
      </div>
    );
  }
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-3">
      <span>Your application is under review by the admin.</span>
    </div>
  );
}