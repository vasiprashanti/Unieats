import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import MobileHeader from '../components/Navigation/MobileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import SavedAddresses from '../components/profile/SavedAddresses';
import PaymentMethods from '../components/profile/PaymentMethods';
import AccountActions from '../components/profile/AccountActions';
import { getUserProfile, updateUserProfile, addUserAddress, deleteUserAddress, deletePaymentMethod } from '../api/user';
import Footer from '../components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.data);
        setAddresses(response.data.addresses || []);
        setPaymentMethods(response.data.paymentMethods || []);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      // For demo purposes, load mock data when API fails
      setUser({
        id: 'demo-user',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        phone: '+1 234-567-8900',
        profilePicture: null
      });
      setAddresses([
        {
          id: 'addr-1',
          label: 'Home',
          street: '123 University Ave, Apt 4B',
          city: 'College Town',
          state: 'CA',
          zipCode: '94105',
          phone: '+1 234-567-8900',
          isDefault: true
        },
        {
          id: 'addr-2',
          label: 'Dorm Room',
          street: '456 Campus Drive, Room 201',
          city: 'College Town',
          state: 'CA',
          zipCode: '94105',
          phone: '+1 234-567-8901',
          isDefault: false
        }
      ]);
      setPaymentMethods([
        {
          id: 'card-1',
          cardType: 'visa',
          lastFour: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        },
        {
          id: 'card-2',
          cardType: 'mastercard',
          lastFour: '8888',
          expiryMonth: 6,
          expiryYear: 2026,
          isDefault: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const response = await updateUserProfile(profileData);
      if (response.success) {
        setUser(prev => ({ ...prev, ...profileData }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const response = await addUserAddress(addressData);
      if (response.success) {
        setAddresses(response.addresses);
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await deleteUserAddress(addressId);
      if (response.success) {
        setAddresses(response.addresses);
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      const response = await deletePaymentMethod(methodId);
      if (response.success) {
        setPaymentMethods(response.paymentMethods);
      }
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      throw error;
    }
  };

  const handleNavigateToOrders = () => {
    navigate('/orders');
  };

  const handleNavigateToSupport = () => {
    navigate('/support');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MobileHeader />
        <div className="max-w-4xl mx-auto p-6 pt-20 md:pt-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadUserData}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Profile Details */}
          <ProfileDetails
            user={user}
            onUpdateProfile={handleUpdateProfile}
            isLoading={loading}
          />

          {/* Saved Addresses */}
          <SavedAddresses
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onDeleteAddress={handleDeleteAddress}
            isLoading={loading}
          />

          {/* Account Actions */}
          <AccountActions
            onNavigateToOrders={handleNavigateToOrders}
            onNavigateToSupport={handleNavigateToSupport}
          />
        </div>
      </div>
      <Footer/>
    </div>
  );
}
