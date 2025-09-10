import React, { useState } from 'react';
import { MapPin, Edit3, Trash2, Plus } from 'lucide-react';
import AddAddressModal from './AddAddressModal';

const SavedAddresses = ({ 
  addresses, 
  onAddAddress, 
  onDeleteAddress, 
  isLoading = false 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const handleDeleteAddress = async (addressId) => {
    try {
      setDeletingAddressId(addressId);
      await onDeleteAddress(addressId);
    } catch (error) {
      console.error('Failed to delete address:', error);
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      await onAddAddress(addressData);
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No addresses saved</p>
            <p className="text-sm">Add your first address to get started</p>
          </div>
        ) : (
          addresses?.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{address.label}</h3>
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={deletingAddressId === address.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Address"
                  >
                    {deletingAddressId === address.id ? (
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

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddAddress={handleAddAddress}
      />
    </div>
  );
};

export default SavedAddresses;