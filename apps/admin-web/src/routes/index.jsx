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

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/home';
};

function ProtectedAdmin({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role !== 'admin') return <Navigate to={roleHome(role)} replace />;
  return children;
}

function GuestOnly() {
  const { user, role } = useAuth();
  if (user) return <Navigate to={roleHome(role)} replace />;
  return null; // used as wrapper around actual element via element composition
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<><GuestOnly /> <Login /></>} />
      <Route path="/admin/signup" element={<><GuestOnly /> <Signup /></>} />

      <Route path="/admin/dashboard" element={<ProtectedAdmin><Dashboard /></ProtectedAdmin>} />
      <Route path="/admin/orders" element={<ProtectedAdmin><Orders /></ProtectedAdmin>} />
      <Route path="/admin/users" element={<ProtectedAdmin><Users /></ProtectedAdmin>} />
      <Route path="/admin/vendors" element={<ProtectedAdmin><Vendors /></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><Settings /></ProtectedAdmin>} />
      <Route path="/admin/analytics" element={<ProtectedAdmin><Analytics /></ProtectedAdmin>} />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}