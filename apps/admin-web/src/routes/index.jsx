import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { useAuth } from '../context/AuthContext';

import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Users from '../pages/Users';
import Vendors from '../pages/Vendors';
import Settings from '../pages/Settings';
import Analytics from '../pages/Analytics';
import Content from '../pages/Content';
import AdminLayout from '../components/layout/AdminLayout';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/home';
};

function ProtectedAdmin({ children }) {
  const { user, role, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role !== 'admin') return <Navigate to={roleHome(role)} replace />;
  return children;
}

function GuestOnly() {
  const { user, role, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to={roleHome(role)} replace />;
  return null; // used as wrapper around actual element via element composition
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/admin/login" element={<><GuestOnly /> <Login /></>} />
     

      {/* Protected admin routes with common layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/content" element={<Content />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}