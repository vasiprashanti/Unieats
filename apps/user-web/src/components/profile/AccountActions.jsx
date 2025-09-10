import React from 'react';
import { History, HelpCircle, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccountActions = ({ onNavigateToOrders, onNavigateToSupport }) => {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth system
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const actionItems = [
    {
      id: 'orders',
      label: 'Order History',
      icon: History,
      onClick: onNavigateToOrders,
      description: 'View your past orders and track current ones',
    },
    {
      id: 'support',
      label: 'Support / FAQ',
      icon: HelpCircle,
      onClick: onNavigateToSupport,
      description: 'Get help and find answers to common questions',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and get support</p>
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Logout Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default AccountActions;