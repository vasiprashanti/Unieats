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
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/vendor/login" replace />;
  if (role !== 'vendor') return <Navigate to={roleHome(role)} replace />;
  return children;
}

function GuestOnly() {
  const { user, role } = useAuth();
  if (user) return <Navigate to={roleHome(role)} replace />;
  return null;
}

import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Menu from '../pages/Menu';
import Profile from '../pages/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/vendor/login" element={<><GuestOnly /> <Login /></>} />
      <Route path="/vendor/signup" element={<><GuestOnly /> <Signup /></>} />
      <Route path="/vendor/dashboard" element={<ProtectedVendor><Dashboard /></ProtectedVendor>} />
      <Route path="/vendor/orders" element={<ProtectedVendor><Orders /></ProtectedVendor>} />
      <Route path="/vendor/menu" element={<ProtectedVendor><Menu /></ProtectedVendor>} />
      <Route path="/vendor/profile" element={<ProtectedVendor><Profile /></ProtectedVendor>} />
      <Route path="*" element={<Navigate to="/vendor/login" replace />} />
    </Routes>
  );
}