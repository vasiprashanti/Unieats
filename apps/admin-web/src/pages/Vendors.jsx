import React, { useEffect, useMemo, useState } from "react";
import VendorTable from "../components/vendors/VendorTable";
import { patchVendorApproval, getVendors } from "../api/admin";
import { useToast } from "../components/ui/Toast";

import { getAuth } from "firebase/auth";

async function getUsers() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const token = await user.getIdToken(); // THIS ensures a valid Firebase ID token

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
}


// Simple Users Table Component
function UsersTable({ users }) {
  // Helper function to format name
  const formatName = (name) => {
    if (typeof name === 'string') return name;
    if (name?.first && name?.last) return `${name.first} ${name.last}`;
    if (name?.first) return name.first;
    if (name?.last) return name.last;
    return 'N/A';
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accommodation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatName(user.name)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.accommodation || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Vendors() {
  const [activeView, setActiveView] = useState("vendors"); // "vendors" or "users"
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const byId = useMemo(() => Object.fromEntries(vendors.map(v => [v._id, v])), [vendors]);
  const { push } = useToast();

  // Load vendors from backend
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getVendors();
        console.log("vendors-", res);

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
        push({ type: "error", title: "Failed to load vendors", message: e?.message });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Load users from backend
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getUsers();
        console.log("users-", res);

        if (Array.isArray(res)) {
          setUsers(res);
        } else if (Array.isArray(res?.data)) {
          setUsers(res.data);
        } else if (Array.isArray(res?.users)) {
          setUsers(res.users);
        } else {
          setUsers([]);
        }
      } catch (e) {
        console.warn("Failed to load users:", e);
        push({ type: "error", title: "Failed to load users", message: e?.message });
      } finally {
        setIsLoading(false);
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
        <p className="text-sm text-gray-600">
          {activeView === "vendors" 
            ? "Review newly registered vendors and approve or reject their applications."
            : "View all registered users in the system."}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView("vendors")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === "vendors"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveView("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Users ({users.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {activeView === "vendors" ? (
            <VendorTable
              vendors={vendors}
              onApprove={handleApprove}
              onReject={handleReject}
              busyId={busyId}
            />
          ) : (
            <UsersTable users={users} />
          )}
        </>
      )}
    </div>
  );
}