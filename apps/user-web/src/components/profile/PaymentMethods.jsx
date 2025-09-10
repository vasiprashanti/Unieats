import React, { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

const PaymentMethods = ({ 
  paymentMethods, 
  onDeletePaymentMethod, 
  isLoading = false 
}) => {
  const [deletingMethodId, setDeletingMethodId] = useState(null);

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      setDeletingMethodId(methodId);
      await onDeletePaymentMethod(methodId);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    } finally {
      setDeletingMethodId(null);
    }
  };

  const getCardIcon = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return '💳'; // You can replace with actual Visa icon
      case 'mastercard':
        return '💳'; // You can replace with actual Mastercard icon
      default:
        return '💳';
    }
  };

  const getCardTypeDisplay = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      default:
        return 'Card';
    }
  };

  const formatExpiryDate = (month, year) => {
    const paddedMonth = String(month).padStart(2, '0');
    return `${paddedMonth}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-7 bg-gray-300 rounded w-40"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
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
          <CreditCard className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
        </div>
        <button
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={() => {
            // This would open an "Add Payment Method" modal in a real implementation
            alert('Add New Card functionality would be implemented here');
          }}
        >
          <Plus className="w-4 h-4" />
          Add New Card
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No payment methods added</p>
            <p className="text-sm">Add a card to make payments easier</p>
          </div>
        ) : (
          paymentMethods?.map((method) => (
            <div
              key={method.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Card Icon */}
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                    {getCardIcon(method.cardType)}
                  </div>

                  {/* Card Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {getCardTypeDisplay(method.cardType)} •••• {method.lastFour}
                      </h3>
                      {method.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Expires {formatExpiryDate(method.expiryMonth, method.expiryYear)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={deletingMethodId === method.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Payment Method"
                >
                  {deletingMethodId === method.id ? (
                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Note */}
      {paymentMethods?.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            🔒 Your payment information is securely encrypted and stored.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;