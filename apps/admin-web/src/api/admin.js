// Simple API wrapper for admin endpoints
export const API_BASE = import.meta.env.VITE_API_BASE || ""; // use proxy or absolute if configured
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export function getVendors() {
  console.log("HERE-",VITE_API_BASE_URL);
  return request(`${VITE_API_BASE_URL}/api/v1/admin/vendors`, { method: 'GET' });
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Vendors
export function patchVendorApproval(id, status) {
  return request(`${VITE_API_BASE_URL}/api/v1/admin/vendors/${id}/approval`, {
    method: 'PATCH',
    body: { status },
  });
}


// Content: Banners
export function listBanners() {
  return request(`/api/v1/admin/content/banners`, { method: 'GET' });
}
export async function uploadBanner(file) {
  // For image upload, use FormData with appropriate headers
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/admin/content/banners`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    const err = new Error(data?.message || `Upload failed: ${res.status}`);
    err.status = res.status; err.data = data; throw err;
  }
  return res.json();
}
export function reorderBanners(orderIds) {
  return request(`/api/v1/admin/content/banners/reorder`, {
    method: 'PUT',
    body: { order: orderIds },
  });
}
export function deleteBanner(id) {
  return request(`/api/v1/admin/content/banners/${id}`, { method: 'DELETE' });
}

// Content: FAQs / Policies
export function listFaqs() {
  return request(`/api/v1/admin/content/items`, { method: 'GET' });
}
export function createFaq(payload) {
  return request(`/api/v1/admin/content/items`, { method: 'POST', body: payload });
}
export function updateFaq(id, payload) {
  return request(`/api/v1/admin/content/items/${id}`, { method: 'PUT', body: payload });
}
export function deleteFaq(id) {
  return request(`/api/v1/admin/content/items/${id}`, { method: 'DELETE' });
}

// Settings
export function saveSettings(payload) {
  // Backend endpoint: POST /api/v1/admin/settings1
  return request(`/api/v1/admin/settings1`, { method: 'POST', body: payload });
}