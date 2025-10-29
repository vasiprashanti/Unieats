// api/vendor.js
import { getAuth } from "firebase/auth";

// Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper: get Firebase ID token
async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.getIdToken(true);
}

// Helper: fetch wrapper
async function apiFetch(url, options = {}) {
  const token = await getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error((await res.text()) || "Request failed");
  // For blob response (CSV)
  if (options.responseType === "blob") return res.blob();
  return res.json();
}

/** ------------------- Vendor Registration & Profile ------------------- **/

// Update vendor's UPI ID
export async function updateVendorUpiId(upiId) {
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  return apiFetch(`${BASE_URL}/api/v1/vendors/upi`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      upiId,
      userId: firebaseUser.uid, // Adding Firebase UID
    }),
  });
}

export async function registerVendor(data) {
  const form = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (!value) return;
    if (key === "businessLicense" || key === "foodSafetyCertificate") {
      form.append(key, value);
    } else {
      form.append(key, value);
    }
  });

  return apiFetch(`${BASE_URL}/api/v1/vendors/register`, {
    method: "POST",
    body: form,
  });
}

export async function getVendorProfile() {
  console.log("Fetching--");
  return apiFetch(`${BASE_URL}/api/v1/vendors/profile`);
}

export async function updateVendorProfile(data) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** ------------------- Dashboard & Analytics ------------------- **/

export async function getVendorDashboard() {
  return apiFetch(`${BASE_URL}/api/v1/vendors/dashboard`);
}

export async function getAnalytics({ startDate, endDate }) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await apiFetch(
    `${BASE_URL}/api/v1/vendors/analytics?${params.toString()}`
  );
  return res;
}

export async function exportAnalytics(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return apiFetch(
    `${BASE_URL}/api/v1/vendors/analytics/export?${params.toString()}`,
    { responseType: "blob" }
  );
}

/** ------------------- Orders ------------------- **/

export async function getVendorOrders({
  status,
  search,
  sortKey,
  sortDir,
} = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  if (sortKey) params.set("sort", sortKey);
  if (sortDir) params.set("dir", sortDir);

  return apiFetch(`${BASE_URL}/api/v1/vendors/orders?${params.toString()}`);
}

export async function updateOrderStatus(id, status) {
  const res = await apiFetch(`${BASE_URL}/api/v1/vendors/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  console.log("result iss-", res);
  return res;
}

export async function bulkUpdateOrderStatus(ids = [], status) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/orders/bulk-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, status }),
  });
}

/** ------------------- Menu Management ------------------- **/

export async function getVendorMenu() {
  return apiFetch(`${BASE_URL}/api/v1/vendors/menu`);
}

export async function createMenuItem(payload) {
  console.log("Raw data received:", payload);

  // Extract the actual data object
  const data = payload.data || {};
  const form = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image") {
      form.append("image", value);
    } else if (key === "tags" && Array.isArray(value)) {
      form.append("tags", JSON.stringify(value));
    } else {
      form.append(key, value);
    }
  });

  // Print FormData contents
  console.log("FormData contents:");
  for (let [key, value] of form.entries()) {
    console.log(key, ":", value);
  }

  return apiFetch(`${BASE_URL}/api/v1/vendors/menu`, {
    method: "POST",
    body: form,
  });
}

export async function updateMenuItem(itemId, data) {
  const form = new FormData();

  // Handle form data fields
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image") {
      form.append("image", value);
    } else if (key === "tags" && Array.isArray(value)) {
      form.append("tags", JSON.stringify(value));
    } else {
      form.append(key, String(value)); // Convert to string to ensure compatibility
    }
  });

  const response = await apiFetch(`${BASE_URL}/api/v1/vendors/menu/${itemId}`, {
    method: "PATCH",
    body: form,
  });

  return response;
}

export async function deleteMenuItem(itemId) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/menu/${itemId}`, {
    method: "DELETE",
  });
}

export async function updateMenuItemAvailability(id, isAvailable) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/menu/${id.id}/availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAvailable }),
  });
}

/** ------------------- Categories ------------------- **/

export async function getMenuCategories() {
  const res = await apiFetch(`${BASE_URL}/api/v1/vendors/menu`);
  return Array.isArray(res.categories) ? res.categories : [];
}
export async function createMenuCategory(category) {
  // category is an object: { token: ..., name: 'Salads' }

  return apiFetch(`${BASE_URL}/api/v1/vendors/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: category.name }), // send only the name string
  });
}

/** ------------------- Documents ------------------- **/

export async function getVendorDocuments() {
  return apiFetch(`${BASE_URL}/api/v1/vendors/documents`);
}

export async function uploadDocument(documentType, file) {
  const form = new FormData();
  form.append("document", file);
  form.append("type", documentType);
  return apiFetch(`${BASE_URL}/api/v1/vendors/documents`, {
    method: "POST",
    body: form,
  });
}

export async function replaceDocument(documentId, file) {
  const form = new FormData();
  form.append("document", file);
  return apiFetch(`${BASE_URL}/api/v1/vendors/documents/${documentId}`, {
    method: "PUT",
    body: form,
  });
}

/** ------------------- Menu Management (continued) ------------------- **/

// Bulk delete menu items
export async function bulkDeleteMenuItems(ids = []) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/menu/bulk-delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

// Bulk update availability
export async function bulkUpdateMenuItemAvailability(ids = [], isAvailable) {
  return apiFetch(`${BASE_URL}/api/v1/vendors/menu/bulk-availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, isAvailable }),
  });
}
