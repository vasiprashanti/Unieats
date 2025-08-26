// Vendor API: registration and profile endpoints
// Uses fetch; replace BASE_URL with env if available

const BASE_URL = import.meta?.env?.VITE_API_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : '/api/v1');

// Register vendor with multipart/form-data for documents
export async function registerVendor({ token, data }) {
  // data: { businessName, address, phone, cuisineType, avgPrepTime, ... , files }
  const form = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Attach file fields specially
    if (key === 'businessLicense' || key === 'foodSafetyCertificate') {
      if (value) form.append(key, value);
    } else {
      form.append(key, value);
    }
  });

  const res = await fetch(`${BASE_URL}/vendors/register`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Registration failed');
    throw new Error(errText || 'Registration failed');
  }
  return res.json();
}

export async function getVendorDashboard({ token }) {
  const res = await fetch(`${BASE_URL}/vendors/dashboard`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return { todayRevenue: 0, pendingOrders: 0, avgPrepTime: 0, status: 'pending' };
  return res.json();
}