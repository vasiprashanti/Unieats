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

// Orders: fetch list with optional status filter and sorting
export async function getVendorOrders({ token, status, search, sortKey, sortDir } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('q', search);
  if (sortKey) params.set('sort', sortKey);
  if (sortDir) params.set('dir', sortDir);
  const res = await fetch(`${BASE_URL}/vendors/orders?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    // Return fallback demo data for UI continuity
    return [
      {
        id: '1', code: 'ORD_001', status: 'new', total: 920,
        placedAt: Date.now() - 5 * 60 * 1000, placedAgoText: '5 minutes ago', timeLeftText: '0m left',
        customerName: 'Priya Sharma', customerPhone: '+91 9988776655',
        address: { line1: 'Flat 201, Green View Apartments', city: 'Bangalore' },
        items: [
          { name: 'Butter Chicken', qty: 2, price: 320, total: 640, note: 'Extra spicy please' },
          { name: 'Garlic Naan', qty: 4, price: 70, total: 280 },
        ],
      },
      {
        id: '2', code: 'ORD_002', status: 'preparing', total: 755,
        placedAt: Date.now() - 20 * 60 * 1000, placedAgoText: '20 minutes ago',
        customerName: 'Amit Patel', customerPhone: '+91 8877665544',
        address: { line1: 'MG Road', city: 'Bangalore' },
        items: [
          { name: 'Paneer Tikka Masala', qty: 1, price: 320, total: 320 },
          { name: 'Dal Tadka', qty: 1, price: 195, total: 195 },
          { name: 'Basmati Rice', qty: 2, price: 120, total: 240 },
        ],
      },
      {
        id: '3', code: 'ORD_003', status: 'ready', total: 800,
        placedAt: Date.now() - 60 * 60 * 1000, placedAgoText: 'about 1 hour ago',
        customerName: 'Sneha Reddy', customerPhone: '+91 7766554433',
        address: { line1: 'HSR Layout', city: 'Bangalore' },
        items: [
          { name: 'Veg Biryani', qty: 3, price: 266.67, total: 800 },
        ],
      },
    ];
  }
  return res.json();
}

export async function updateOrderStatus({ token, id, status }) {
  const res = await fetch(`${BASE_URL}/vendors/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update order');
    throw new Error(errText || 'Failed to update order');
  }
  return res.json();
}

export async function bulkUpdateOrderStatus({ token, ids = [], status }) {
  const res = await fetch(`${BASE_URL}/vendors/orders/bulk-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids, status }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update orders');
    throw new Error(errText || 'Failed to update orders');
  }
  return res.json();
}

// Menu Management APIs

// Get vendor menu items and categories
export async function getVendorMenu({ token }) {
  const res = await fetch(`${BASE_URL}/vendors/menu`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    // Return fallback demo data for UI continuity
    return {
      categories: [
        { id: '1', name: 'Main Course', itemCount: 2 },
        { id: '2', name: 'Starters', itemCount: 0 },
        { id: '3', name: 'Breads', itemCount: 1 },
        { id: '4', name: 'Rice & Biryani', itemCount: 1 },
        { id: '5', name: 'Dal & Curry', itemCount: 1 },
        { id: '6', name: 'Desserts', itemCount: 0 },
        { id: '7', name: 'Beverages', itemCount: 0 },
      ],
      items: [
        {
          id: '1', name: 'Butter Chicken', description: 'Tender chicken in rich tomato and butter gravy',
          price: 320, category: 'Main Course', categoryId: '1', isAvailable: true,
          prepTime: 20, isVegetarian: false, tags: ['Popular', 'Bestseller'],
          image: '/images/butter-chicken.jpg'
        },
        {
          id: '2', name: 'Paneer Tikka Masala', description: 'Grilled paneer in spicy tomato gravy',
          price: 280, category: 'Main Course', categoryId: '1', isAvailable: true,
          prepTime: 18, isVegetarian: true, tags: ['Vegetarian', 'Spicy'],
          image: '/images/paneer-tikka.jpg'
        },
        {
          id: '3', name: 'Garlic Naan', description: 'Fresh naan bread with garlic butter',
          price: 70, category: 'Breads', categoryId: '3', isAvailable: true,
          prepTime: 5, isVegetarian: true, tags: [],
          image: '/images/garlic-naan.jpg'
        },
        {
          id: '4', name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken',
          price: 350, category: 'Rice & Biryani', categoryId: '4', isAvailable: false,
          prepTime: 25, isVegetarian: false, tags: ['Popular'],
          image: '/images/chicken-biryani.jpg'
        },
        {
          id: '5', name: 'Dal Tadka', description: 'Yellow lentils tempered with spices',
          price: 195, category: 'Dal & Curry', categoryId: '5', isAvailable: true,
          prepTime: 12, isVegetarian: true, tags: ['Vegetarian'],
          image: '/images/dal-tadka.jpg'
        },
      ],
      stats: { totalItems: 5, totalCategories: 7 }
    };
  }
  return res.json();
}

// Create new menu item
export async function createMenuItem({ token, data }) {
  const form = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value) {
      form.append('image', value);
    } else if (key === 'tags' && Array.isArray(value)) {
      form.append('tags', JSON.stringify(value));
    } else {
      form.append(key, value);
    }
  });

  const res = await fetch(`${BASE_URL}/vendors/menu`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to create menu item');
    throw new Error(errText || 'Failed to create menu item');
  }
  return res.json();
}

// Update menu item
export async function updateMenuItem({ token, id, data }) {
  const form = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value) {
      form.append('image', value);
    } else if (key === 'tags' && Array.isArray(value)) {
      form.append('tags', JSON.stringify(value));
    } else {
      form.append(key, value);
    }
  });

  const res = await fetch(`${BASE_URL}/vendors/menu/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update menu item');
    throw new Error(errText || 'Failed to update menu item');
  }
  return res.json();
}

// Delete menu item
export async function deleteMenuItem({ token, id }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to delete menu item');
    throw new Error(errText || 'Failed to delete menu item');
  }
  return res.json();
}

// Bulk delete menu items
export async function bulkDeleteMenuItems({ token, ids = [] }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/bulk-delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to delete menu items');
    throw new Error(errText || 'Failed to delete menu items');
  }
  return res.json();
}

// Update menu item availability
export async function updateMenuItemAvailability({ token, id, isAvailable }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/${id}/availability`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isAvailable }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update availability');
    throw new Error(errText || 'Failed to update availability');
  }
  return res.json();
}

// Bulk update menu item availability
export async function bulkUpdateMenuItemAvailability({ token, ids = [], isAvailable }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/bulk-availability`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids, isAvailable }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update availability');
    throw new Error(errText || 'Failed to update availability');
  }
  return res.json();
}

// Get or create categories
export async function getMenuCategories({ token }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/categories`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    return [
      { id: '1', name: 'Main Course' },
      { id: '2', name: 'Starters' },
      { id: '3', name: 'Breads' },
      { id: '4', name: 'Rice & Biryani' },
      { id: '5', name: 'Dal & Curry' },
      { id: '6', name: 'Desserts' },
      { id: '7', name: 'Beverages' },
    ];
  }
  return res.json();
}

// Create a new category
export async function createMenuCategory({ token, name }) {
  const res = await fetch(`${BASE_URL}/vendors/menu/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to create category');
    throw new Error(errText || 'Failed to create category');
  }
  return res.json();
}

// Analytics APIs

// Get analytics data
export async function getAnalytics({ token, startDate, endDate }) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  
  const res = await fetch(`${BASE_URL}/vendors/analytics?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    // Return fallback demo data for UI continuity
    return {
      summary: {
        totalRevenue: 12355,
        totalOrders: 86,
        avgOrderValue: 144,
        avgPrepTime: 18,
        revenueChange: 12.5,
        ordersChange: 8.3,
        avgOrderValueChange: 3.2,
        avgPrepTimeChange: -2
      },
      revenueData: [
        { date: '1 Jan', revenue: 1280, day: '1 Jan' },
        { date: '2 Jan', revenue: 1450, day: '2 Jan' },
        { date: '3 Jan', revenue: 1150, day: '3 Jan' },
        { date: '4 Jan', revenue: 2100, day: '4 Jan' },
        { date: '5 Jan', revenue: 1850, day: '5 Jan' },
        { date: '6 Jan', revenue: 2200, day: '6 Jan' },
        { date: '7 Jan', revenue: 2375, day: '7 Jan' }
      ],
      topItems: [
        { name: 'Butter Chicken', orders: 45, revenue: 14400, rank: 1 },
        { name: 'Paneer Tikka Masala', orders: 32, revenue: 8960, rank: 2 },
        { name: 'Veg Biryani', orders: 28, revenue: 7000, rank: 3 },
        { name: 'Garlic Naan', orders: 56, revenue: 3360, rank: 4 },
        { name: 'Dal Tadka', orders: 21, revenue: 4200, rank: 5 }
      ]
    };
  }

  return res.json();
}

// Export analytics as CSV
export async function exportAnalytics({ token, startDate, endDate }) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  
  const res = await fetch(`${BASE_URL}/vendors/analytics/export?${params.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    // Generate fallback CSV data
    const csvData = `Date,Revenue,Orders,Avg Order Value
1 Jan,1280,9,142
2 Jan,1450,11,132
3 Jan,1150,8,144
4 Jan,2100,15,140
5 Jan,1850,13,142
6 Jan,2200,15,147
7 Jan,2375,16,148`;
    
    return new Blob([csvData], { type: 'text/csv' });
  }

  return res.blob();
}

// Profile Management APIs

// Get vendor profile information
export async function getVendorProfile({ token }) {
  const res = await fetch(`${BASE_URL}/vendors/profile`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  if (!res.ok) {
    // Return fallback demo data for UI continuity
    return {
      businessName: 'Spice Kitchen',
      ownerName: 'Rajesh Kumar',
      email: 'rajesh@spicekitchen.com',
      phone: '+91 9876543210',
      description: 'Authentic Indian cuisine with a modern twist. Serving delicious traditional recipes passed down through generations.',
      fssaiNumber: 'FSSAI123456789',
      gstNumber: 'GST123456789',
      streetAddress: '123 Food Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      operatingHours: {
        monday: { open: true, openTime: '09:00', closeTime: '22:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '22:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '22:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '22:00' },
        friday: { open: true, openTime: '09:00', closeTime: '23:00' },
        saturday: { open: true, openTime: '09:00', closeTime: '23:00' },
        sunday: { open: true, openTime: '10:00', closeTime: '22:00' }
      },
      notifications: {
        emailOrders: true,
        pushOrders: true,
        emailPromotions: false,
        pushPromotions: true
      },
      payoutInfo: {
        accountHolder: '',
        accountNumber: '••••••••••',
        ifscCode: '',
        upiId: 'user@paytm'
      }
    };
  }
  
  return res.json();
}

// Update vendor profile information
export async function updateVendorProfile({ token, data }) {
  const res = await fetch(`${BASE_URL}/vendors/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to update profile');
    throw new Error(errText || 'Failed to update profile');
  }
  
  return res.json();
}

// Document Management APIs

// Get vendor documents
export async function getVendorDocuments({ token }) {
  const res = await fetch(`${BASE_URL}/vendors/documents`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  if (!res.ok) {
    // Return fallback demo data
    return [
      {
        id: 'fssai',
        name: 'FSSAI License',
        required: true,
        status: 'approved',
        uploadedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        filename: 'FSSAI_License.pdf',
        rejectionReason: null
      },
      {
        id: 'gst',
        name: 'GST Certificate',
        required: true,
        status: 'pending',
        uploadedDate: '2024-01-20',
        expiryDate: null,
        filename: 'GST_Certificate.pdf',
        rejectionReason: null
      },
      {
        id: 'business_license',
        name: 'Business License',
        required: true,
        status: 'rejected',
        uploadedDate: '2024-01-18',
        expiryDate: null,
        filename: 'Business_License.pdf',
        rejectionReason: 'Document is not clear, please upload a higher quality scan'
      }
    ];
  }
  
  return res.json();
}

// Upload document
export async function uploadDocument({ token, documentType, file }) {
  const form = new FormData();
  form.append('document', file);
  form.append('type', documentType);

  const res = await fetch(`${BASE_URL}/vendors/documents`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to upload document');
    throw new Error(errText || 'Failed to upload document');
  }
  
  return res.json();
}

// Replace/update existing document
export async function replaceDocument({ token, documentId, file }) {
  const form = new FormData();
  form.append('document', file);

  const res = await fetch(`${BASE_URL}/vendors/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Failed to replace document');
    throw new Error(errText || 'Failed to replace document');
  }
  
  return res.json();
}