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

function ProtectedUser({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== 'user') return <Navigate to={roleHome(role)} replace />;
  return children;
}

function GuestOnly() {
  const { user, role } = useAuth();
  if (user) return <Navigate to={roleHome(role)} replace />;
  return null;
}

import Home from '../pages/Home';
import RestaurantList from '../pages/RestaurantList';
import RestaurantMenu from '../pages/RestaurantMenu';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderTracking from '../pages/OrderTracking';
import Profile from '../pages/Profile';
import Support from '../pages/Support';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<><GuestOnly /> <Login /></>} />
      <Route path="/signup" element={<><GuestOnly /> <Signup /></>} />

      {/* Public browsing routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/restaurants/:id" element={<RestaurantMenu />} />

      {/* Protected user routes */}
      <Route path="/cart" element={<ProtectedUser><Cart /></ProtectedUser>} />
      <Route path="/checkout" element={<ProtectedUser><Checkout /></ProtectedUser>} />
      <Route path="/orders" element={<ProtectedUser><Orders /></ProtectedUser>} />
      <Route path="/orders/:id" element={<ProtectedUser><OrderTracking /></ProtectedUser>} />
      <Route path="/profile" element={<ProtectedUser><Profile /></ProtectedUser>} />
      <Route path="/support" element={<ProtectedUser><Support /></ProtectedUser>} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}