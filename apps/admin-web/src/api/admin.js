const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getVendors() {
  console.log("HERE-", API_BASE_URL);
  return request(`${API_BASE_URL}/api/v1/admin/vendors`, { method: 'GET' });
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
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
  return request(`${API_BASE_URL}/api/v1/admin/vendors/${id}/approval`, {
    method: 'PATCH',
    body: { status },
  });
}

// Content: Banners
export async function listBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/content?type=banner`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      const err = new Error(data?.message || `Fetch failed: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    const data = await res.json();
    console.log("Fetched banners data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
}

export async function uploadBanner(file) {
  const form = new FormData();
  form.append('type', 'banner');
  form.append('title', file.name || 'Promotional Banner');
  form.append('status', 'published');
  form.append('order', '1');
  form.append('image', file); // File object from input

  const res = await fetch(`${API_BASE_URL}/api/v1/content`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  const data = await res.json();
  console.log("data from backend:", data);

  if (!res.ok) {
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    const err = new Error(data?.message || `Upload failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
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
