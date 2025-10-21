// User API functions for profile management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};



// Get user profile
export const getUserProfile = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for development
    return {
      success: true,
      data: mockUserData,
    };
    
    // Uncomment for actual API call:
    // return await apiRequest('/api/v1/users/profile', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //   },
    // });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update mock data
    Object.assign(mockUserData, {
      ...profileData,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: 'Profile updated successfully',
      data: mockUserData,
    };
    
    // Uncomment for actual API call:
    // return await apiRequest('/api/v1/users/profile', {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //   },
    //   body: JSON.stringify(profileData),
    // });
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

// Get user addresses
export const getUserAddresses = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      addresses: mockUserData.addresses,
    };
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    throw error;
  }
};

// Add new address
export const addUserAddress = async (addressData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newAddress = {
      id: (mockUserData.addresses.length + 1).toString(),
      ...addressData,
      isDefault: mockUserData.addresses.length === 0, // First address is default
    };
    
    // If new address is set as default, update others
    if (addressData.isDefault) {
      mockUserData.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockUserData.addresses.push(newAddress);
    
    return {
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      addresses: mockUserData.addresses,
    };
    
    // Uncomment for actual API call:
    // return await apiRequest('/api/v1/users/address', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //   },
    //   body: JSON.stringify(addressData),
    // });
  } catch (error) {
    console.error('Failed to add address:', error);
    throw error;
  }
};

// Update address
export const updateUserAddress = async (addressId, addressData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const addressIndex = mockUserData.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }
    
    // If setting as default, update others
    if (addressData.isDefault) {
      mockUserData.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockUserData.addresses[addressIndex] = {
      ...mockUserData.addresses[addressIndex],
      ...addressData,
    };
    
    return {
      success: true,
      message: 'Address updated successfully',
      address: mockUserData.addresses[addressIndex],
      addresses: mockUserData.addresses,
    };
  } catch (error) {
    console.error('Failed to update address:', error);
    throw error;
  }
};

// Delete address
export const deleteUserAddress = async (addressId) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const addressIndex = mockUserData.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }
    
    const deletedAddress = mockUserData.addresses[addressIndex];
    mockUserData.addresses.splice(addressIndex, 1);
    
    // If deleted address was default and there are remaining addresses, make first one default
    if (deletedAddress.isDefault && mockUserData.addresses.length > 0) {
      mockUserData.addresses[0].isDefault = true;
    }
    
    return {
      success: true,
      message: 'Address deleted successfully',
      addresses: mockUserData.addresses,
    };
    
    // Uncomment for actual API call:
    // return await apiRequest(`/api/v1/users/address/${addressId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //   },
    // });
  } catch (error) {
    console.error('Failed to delete address:', error);
    throw error;
  }
};

// Get payment methods
export const getUserPaymentMethods = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      paymentMethods: mockUserData.paymentMethods,
    };
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    throw error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const methodIndex = mockUserData.paymentMethods.findIndex(method => method.id === paymentMethodId);
    if (methodIndex === -1) {
      throw new Error('Payment method not found');
    }
    
    const deletedMethod = mockUserData.paymentMethods[methodIndex];
    mockUserData.paymentMethods.splice(methodIndex, 1);
    
    // If deleted method was default and there are remaining methods, make first one default
    if (deletedMethod.isDefault && mockUserData.paymentMethods.length > 0) {
      mockUserData.paymentMethods[0].isDefault = true;
    }
    
    return {
      success: true,
      message: 'Payment method deleted successfully',
      paymentMethods: mockUserData.paymentMethods,
    };
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    throw error;
  }
};

// Helper function to get auth token (implement based on your auth system)
const getAuthToken = () => {
  // Implement based on your authentication system
  // This could be from localStorage, context, or cookies
  return localStorage.getItem('authToken') || '';
};