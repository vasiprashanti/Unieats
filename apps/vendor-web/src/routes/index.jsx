import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { useAuth } from '../context/AuthContext';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/home';
};

function ProtectedVendor({ children }) {
  const { user, role, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/vendor/login" replace />;
  if (role !== 'vendor') return <Navigate to={roleHome(role)} replace />;
  return children;
}

function GuestOnly() {
  const { user, role, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to={roleHome(role)} replace />;
  return null;
}

import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Menu from '../pages/Menu';
import Analytics from '../pages/Analytics';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import VendorLayout from '../components/layout/VendorLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/vendor/login" element={<><GuestOnly /> <Login /></>} />
      <Route path="/vendor/signup" element={<><GuestOnly /> <Signup /></>} />
      <Route path="/vendor/register" element={<><GuestOnly /> <Register /></>} />

      {/* Protected vendor area with layout */}
      <Route
        path="/vendor"
        element={
          <ProtectedVendor>
            <VendorLayout />
          </ProtectedVendor>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Default landing should show the new signup page */}
      <Route path="*" element={<Navigate to="/vendor/signup" replace />} />
    </Routes>
  );
}