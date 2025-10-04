import React, { useState, useEffect } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { getAuth } from 'firebase/auth';

const ProfileDetails = ({ user, isLoading = false}) => {
  const [formData, setFormData] = useState({
    firstName: user?.name?.first || '',
    lastName: user?.name?.last || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const baseUrl=import.meta.env.VITE_API_BASE_URL;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Keep formData in sync if user prop changes
  useEffect(() => {
    setFormData({
      firstName: user?.name?.first || '',
      lastName: user?.name?.last || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const auth = getAuth();
      if (!auth.currentUser) throw new Error('User not authenticated');

      const userToken = await auth.currentUser.getIdToken();

      const payload = {
        name: {
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        phone: formData.phone,
      };

      const res = await fetch(`${baseUrl}/api/v1/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('API response:', data);
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('Profile updated:', data);

      // Update local state with API response
      setFormData({
        firstName: data.user.name.first,
        lastName: data.user.name.last,
        email: data.user.email,
        phone: data.user.phone,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.name?.first || '',
      lastName: user?.name?.last || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="h-7 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-700"
            placeholder="Enter first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-700"
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-700"
            placeholder="Enter email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-700"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
