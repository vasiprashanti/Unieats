import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getVendorProfile, updateVendorProfile } from "../api/vendor";
import BusinessHours from "../components/profile/BusinessHours";
import DocumentManager from "../components/profile/DocumentManager";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
  // description removed per request
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
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
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  // Load profile data on component mount or when token changes
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await getVendorProfile();
      // Log the fetched data so developers can see the response
      console.log('Vendor profile:', data);

      const vendor = data && data.vendor ? data.vendor : data;

      // Map vendor fields to our profileData shape
      const mapped = {};
      if (vendor.businessName) mapped.businessName = vendor.businessName;
      if (vendor.owner) mapped.ownerName = vendor.owner; // owner id — keep as-is for now
      if (vendor.contactPhone) mapped.phone = vendor.contactPhone;
      if (vendor.cuisineType) mapped.cuisineType = vendor.cuisineType;
      // Address mapping
      if (vendor.businessAddress) {
        mapped.streetAddress = vendor.businessAddress.street || '';
        mapped.city = vendor.businessAddress.city || '';
        mapped.state = vendor.businessAddress.state || '';
        mapped.pincode = vendor.businessAddress.zipCode || '';
      }

      // Operating hours: backend stores as array [{ day: 'Monday', open: '09:00', close: '22:00', isClosed: false }, ...]
      if (Array.isArray(vendor.operatingHours)) {
        const hoursObj = {};
        // Initialize all days as closed by default
        const allDays = {
          monday: { open: false, openTime: '09:00', closeTime: '22:00' },
          tuesday: { open: false, openTime: '09:00', closeTime: '22:00' },
          wednesday: { open: false, openTime: '09:00', closeTime: '22:00' },
          thursday: { open: false, openTime: '09:00', closeTime: '22:00' },
          friday: { open: false, openTime: '09:00', closeTime: '22:00' },
          saturday: { open: false, openTime: '09:00', closeTime: '22:00' },
          sunday: { open: false, openTime: '10:00', closeTime: '22:00' }
        };

        vendor.operatingHours.forEach(h => {
          if (!h || !h.day) return;
          const dayLower = String(h.day).toLowerCase();
          const key = dayLower.startsWith('mon') ? 'monday' :
                      dayLower.startsWith('tue') ? 'tuesday' :
                      dayLower.startsWith('wed') ? 'wednesday' :
                      dayLower.startsWith('thu') ? 'thursday' :
                      dayLower.startsWith('fri') ? 'friday' :
                      dayLower.startsWith('sat') ? 'saturday' :
                      dayLower.startsWith('sun') ? 'sunday' : null;
          if (!key) return;

          const isClosed = !!h.isClosed;
          hoursObj[key] = {
            open: !isClosed,
            openTime: h.open || '09:00',
            closeTime: h.close || '22:00'
          };
        });

        // Merge specific hours into allDays (days not present remain closed)
        mapped.operatingHours = { ...allDays, ...hoursObj };
      }

      // Email: fallback to auth user email if available
      if (user && user.email && !vendor.email) mapped.email = user.email;

      // Merge mapped fields into state
      if (Object.keys(mapped).length > 0) {
        setProfileData(prevData => ({ ...prevData, ...mapped }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until auth user is available, otherwise api wrapper's getToken() will fail
    if (!user) return;
    loadProfileData();
    // re-run when user changes
  }, [user]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // convert operatingHours object to backend array before saving
      const convertToArray = (hoursObj) => {
        const dayNames = {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
          sunday: 'Sunday'
        };
        return Object.keys(dayNames).map(key => {
          const h = hoursObj[key] || { open: false, openTime: '09:00', closeTime: '22:00' };
          return {
            day: dayNames[key],
            open: h.openTime || '09:00',
            close: h.closeTime || '22:00',
            isClosed: !h.open
          };
        }).filter(Boolean);
      };

      const payload = { ...profileData, operatingHours: convertToArray(profileData.operatingHours) };
      await updateVendorProfile(payload);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleHoursUpdate = async (hoursData) => {
    // Convert our hours object (monday, tuesday...) into backend array format
    const convertToArray = (hoursObj) => {
      const dayNames = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      };
      return Object.keys(dayNames).map(key => {
        const h = hoursObj[key] || { open: false, openTime: '09:00', closeTime: '22:00' };
        return {
          day: dayNames[key],
          open: h.openTime || '09:00',
          close: h.closeTime || '22:00',
          isClosed: !h.open
        };
      }).filter(Boolean);
    };

    try {
      const operatingHoursArray = convertToArray(hoursData);
      // Call the same API as update profile, sending the array
      await updateVendorProfile({ operatingHours: operatingHoursArray });
      setProfileData(prev => ({ ...prev, operatingHours: hoursData }));
      alert('Business hours updated successfully!');
    } catch (error) {
      alert('Failed to update business hours.');
      console.error('Hours update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-muted">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted mt-2">Manage your business information, operating hours, and account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Business Information</h2>
              <p className="text-muted text-sm">Update your restaurant details and contact information</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => handleInputChange(null, 'businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="Spice Kitchen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Owner Name</label>
                <input
                  type="text"
                  value={profileData.ownerName}
                  onChange={(e) => handleInputChange(null, 'ownerName', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="Rajesh Kumar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange(null, 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="rajesh@spicekitchen.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* description removed */}

            {/* FSSAI and GST fields removed */}

            {/* Update Profile button removed */}
          </form>
        </div>

        {/* Address Information */}
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Address Information</h2>
              <p className="text-muted text-sm">Your business address for deliveries and legal purposes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <input
                type="text"
                value={profileData.streetAddress}
                onChange={(e) => handleInputChange(null, 'streetAddress', e.target.value)}
                className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                placeholder="123 Food Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleInputChange(null, 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => handleInputChange(null, 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="Maharashtra"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pincode</label>
              <input
                type="text"
                value={profileData.pincode}
                onChange={(e) => handleInputChange(null, 'pincode', e.target.value)}
                className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                placeholder="400001"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="mt-6">
        <BusinessHours 
          initialHours={profileData.operatingHours}
          onSave={handleHoursUpdate}
        />
      </div>

      {/* Documents
      <div className="mt-6">
        <DocumentManager />
      </div>
      */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Notification Preferences (commented out)
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10 21a2 2 0 01-2-2V9a2 2 0 012-2h5l5 5v7a2 2 0 01-2 2h-1M10 3v6h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <p className="text-muted text-sm">Choose how you want to receive order and promotional alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'emailOrders', label: 'Email Order Notifications', desc: 'Receive new order alerts via email' },
              { key: 'pushOrders', label: 'Push Order Notifications', desc: 'Receive instant push notifications for new orders' },
              { key: 'emailPromotions', label: 'Email Promotions', desc: 'Receive promotional emails and updates' },
              { key: 'pushPromotions', label: 'Push Promotions', desc: 'Receive promotional push notifications' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{label}</h3>
                  <p className="text-muted text-sm">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('notifications', key, !profileData.notifications[key])}
                  className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] ${
                    profileData.notifications[key] 
                      ? 'bg-[hsl(var(--primary))]' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      profileData.notifications[key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Payout Information */}
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Payout Information</h2>
              <p className="text-muted text-sm">Manage your bank account details for receiving payments</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Holder Name</label>
              <input
                type="text"
                value={profileData.payoutInfo.accountHolder}
                onChange={(e) => handleInputChange('payoutInfo', 'accountHolder', e.target.value)}
                className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                placeholder="Account holder name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={profileData.payoutInfo.accountNumber}
                  onChange={(e) => handleInputChange('payoutInfo', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={profileData.payoutInfo.ifscCode}
                  onChange={(e) => handleInputChange('payoutInfo', 'ifscCode', e.target.value)}
                  className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                  placeholder="IFSC code"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">UPI ID (Alternative)</label>
              <input
                type="text"
                value={profileData.payoutInfo.upiId}
                onChange={(e) => handleInputChange('payoutInfo', 'upiId', e.target.value)}
                className="w-full px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                placeholder="user@paytm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                handleProfileUpdate({ preventDefault: () => {} });
              }}
              disabled={saving}
              className="w-full bg-transparent border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-4 py-2 rounded-lg font-medium hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Update Payout Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}