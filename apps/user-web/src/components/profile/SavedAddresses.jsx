import React, { useEffect, useState } from 'react';
import { MapPin, Edit3, Trash2, Plus, Star } from 'lucide-react';
import AddAddressModal from './AddAddressModal';
import { auth } from '../../config/firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SavedAddresses = ({ onAddAddress, onDeleteAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [error, setError] = useState(null);

  // Get auth token helper
  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BASE_URL}/api/v1/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
      
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setError(error.message);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add address handler
  const handleAddAddress = async (addressData) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BASE_URL}/api/v1/users/addresses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add address');
      }
      
      // Only throw error if success is explicitly false
      if (data.success === false) {
        throw new Error(data.message || 'Failed to add address');
      }
      
      // Refresh addresses to get latest data
      await fetchAddresses();
      setIsModalOpen(false);
      
      // Call parent callback if provided
      if (onAddAddress) {
        onAddAddress();
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  };

  // Update address handler
  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BASE_URL}/api/v1/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update address');
      }
      
      // Only throw error if success is explicitly false
      if (data.success === false) {
        throw new Error(data.message || 'Failed to update address');
      }
      
      // Refresh addresses to get latest data
      await fetchAddresses();
      setIsModalOpen(false);
      setEditingAddress(null);
      
      return data;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  };

  // Delete address handler
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setDeletingAddressId(addressId);
      const token = await getAuthToken();
      
      const res = await fetch(`${BASE_URL}/api/v1/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete address');
      }
      
      // Only throw error if success is explicitly false
      if (data.success === false) {
        throw new Error(data.message || 'Failed to delete address');
      }
      
      // Refresh addresses to get latest data
      await fetchAddresses();
      
      // Call parent callback if provided
      if (onDeleteAddress) {
        onDeleteAddress(addressId);
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert(error.message || 'Failed to delete address');
    } finally {
      setDeletingAddressId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-7 bg-gray-300 rounded w-36"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Failed to load addresses</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAddresses}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No addresses saved</p>
            <p className="text-sm">Add your first address to get started</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id || address.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{address.label || 'Address'}</h3>
                    {address.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{address.street}</p>
                  <p className="text-gray-600 text-sm mb-1">
                    {address.city}, {address.state} - {address.zipCode}
                  </p>
                  {address.phone && (
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <span>📞</span>
                      {address.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address._id || address.id)}
                      disabled={settingDefaultId === (address._id || address.id)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Set as Default"
                    >
                      {settingDefaultId === (address._id || address.id) ? (
                        <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(address)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id || address.id)}
                    disabled={deletingAddressId === (address._id || address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Address"
                  >
                    {deletingAddressId === (address._id || address.id) ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onAddAddress={handleAddAddress}
        onUpdateAddress={handleUpdateAddress}
        editingAddress={editingAddress}
      />
    </div>
  );
};

export default SavedAddresses;