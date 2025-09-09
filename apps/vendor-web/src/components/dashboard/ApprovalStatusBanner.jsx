import React from "react";

export default function ApprovalStatusBanner({ status }) {
  if (status === "approved") {
    return (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 px-6 py-4 text-emerald-300 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <span className="font-medium">Congratulations! Your account is approved and live.</span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 font-medium border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors duration-200">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Approved
        </span>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/10 px-6 py-4 text-red-300 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <span className="font-medium">Your application was not approved. Please contact support for more information.</span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5 text-xs text-red-300 font-medium border border-red-500/30 group-hover:bg-red-500/30 transition-colors duration-200">
          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          Rejected
        </span>
      </div>
    );
  }
  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-[hsl(var(--primary))]/30 bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[hsl(var(--primary))]/20">
          <svg className="h-5 w-5 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <span className="font-medium">Your application is under review by the admin.</span>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/20 px-3 py-1.5 text-xs text-[hsl(var(--primary))] font-medium border border-[hsl(var(--primary))]/30 group-hover:bg-[hsl(var(--primary))]/30 transition-colors duration-200">
        <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-pulse"></span>
        Under Review
      </span>
    </div>
  );
}