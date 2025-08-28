import React, { useEffect, useMemo, useState } from "react";
import VendorTable from "../components/vendors/VendorTable";
import { patchVendorApproval, getVendors } from "../api/admin";
import { useToast } from "../components/ui/Toast";

// Demo seed data until backend list endpoint is wired
const seedVendors = [
  { id: "v_001", name: "Lets Go Live", email: "contact@lgl.example", status: "pending", date: "2025-01-10", documents: [
    { id: 'd1', name: 'Business License.pdf', type: 'application/pdf', url: 'https://example.com/docs/business-license.pdf' },
    { id: 'd2', name: 'Owner ID.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200' },
  ] },
  { id: "v_002", name: "Tea Tradition", email: "hello@teatrad.example", status: "approved", date: "2025-01-02", documents: [
    { id: 'd3', name: 'GST Certificate.pdf', type: 'application/pdf', url: 'https://example.com/docs/gst.pdf' },
  ] },
  { id: "v_003", name: "Nescafe", email: "sales@nescafe.example", status: "pending", date: "2025-01-14", documents: [] },
  { id: "v_004", name: "The Italian Oven", email: "owner@italianoven.example", status: "rejected", date: "2025-01-03" },
];

export default function Vendors() {
  const [vendors, setVendors] = useState(seedVendors);
  const [busyId, setBusyId] = useState(null);
  const byId = useMemo(() => Object.fromEntries(vendors.map(v => [v.id, v])), [vendors]);
  const { push } = useToast();

  // Load vendors from backend
  useEffect(() => {
    (async () => {
      try {
        const data = await getVendors();
        // Expecting an array of vendors [{ id, name, email, status, date }]
        if (Array.isArray(data)) setVendors(data);
        else if (Array.isArray(data?.vendors)) setVendors(data.vendors);
      } catch (e) {
        // keep seed data as fallback
        console.warn('Failed to load vendors:', e);
      }
    })();
  }, []);

  // Optimistic update helpers
  const updateStatusLocal = (id, status) => setVendors(prev => prev.map(v => (v.id === id ? { ...v, status } : v)));

  const handleApprove = async (id) => {
    setBusyId(id);
    const prev = byId[id];
    updateStatusLocal(id, "approved");
    try {
      await patchVendorApproval(id, "approved");
      push({ type: 'success', title: 'Vendor approved' });
    } catch (e) {
      // revert on failure
      updateStatusLocal(id, prev?.status || "pending");
      push({ type: 'error', title: 'Approval failed', message: e?.message });
    } finally { setBusyId(null); }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    const prev = byId[id];
    updateStatusLocal(id, "rejected");
    try {
      await patchVendorApproval(id, "rejected");
      push({ type: 'success', title: 'Vendor rejected' });
    } catch (e) {
      updateStatusLocal(id, prev?.status || "pending");
      push({ type: 'error', title: 'Rejection failed', message: e?.message });
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users & Vendors</h1>
        <p className="text-sm text-muted">Review newly registered vendors and approve or reject their applications.</p>
      </div>
      <VendorTable vendors={vendors} onApprove={handleApprove} onReject={handleReject} busyId={busyId} />
    </div>
  );
}