import React, { useEffect, useMemo, useState } from "react";
import VendorTable from "../components/vendors/VendorTable";
import { patchVendorApproval, getVendors } from "../api/admin";
import { useToast } from "../components/ui/Toast";

// Demo seed data until backend list endpoint is wired
const seedVendors = [];

export default function Vendors() {
  const [vendors, setVendors] = useState(seedVendors);
  const [busyId, setBusyId] = useState(null);
  const byId = useMemo(() => Object.fromEntries(vendors.map(v => [v._id, v])), [vendors]);
  const { push } = useToast();

  // Load vendors from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await getVendors();
        console.log("vendorss-", res);

        if (Array.isArray(res)) {
          setVendors(res);
        } else if (Array.isArray(res?.data)) {
          setVendors(res.data);
        } else if (Array.isArray(res?.vendors)) {
          setVendors(res.vendors);
        } else {
          setVendors([]);
        }
      } catch (e) {
        console.warn("Failed to load vendors:", e);
      }
    })();
  }, []);

  // Optimistic update
  function updateStatusLocal(id, status) {
    setVendors(prev =>
      prev.map(v => (v._id === id ? { ...v, approvalStatus: status } : v))
    );
  }

  // Approve handler
  async function handleApprove(id) {
    setBusyId(id);
    const prev = byId[id];
    updateStatusLocal(id, "approved");

    try {
      await patchVendorApproval(id, "approved");
      push({ type: "success", title: "Vendor approved" });
    } catch (e) {
      updateStatusLocal(id, prev?.approvalStatus || "pending");
      push({ type: "error", title: "Approval failed", message: e?.message });
    } finally {
      setBusyId(null);
    }
  }

  // Reject handler
  async function handleReject(id) {
    setBusyId(id);
    const prev = byId[id];
    updateStatusLocal(id, "rejected");

    try {
      await patchVendorApproval(id, "rejected");
      push({ type: "success", title: "Vendor rejected" });
    } catch (e) {
      updateStatusLocal(id, prev?.approvalStatus || "pending");
      push({ type: "error", title: "Rejection failed", message: e?.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users & Vendors</h1>
        <p className="text-sm text-muted">
          Review newly registered vendors and approve or reject their applications.
        </p>
      </div>

      <VendorTable
        vendors={vendors}
        onApprove={handleApprove}
        onReject={handleReject}
        busyId={busyId}
      />
    </div>
  );
}
