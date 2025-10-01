import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import BottomNav from '../components/Navigation/BottomNav';
import { useAuth } from '../context/AuthContext';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/home';
};

function ProtectedUser({ children }) {
  const { user, role, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== 'user') return <Navigate to={roleHome(role)} replace />;
  return children;
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
  const location = useLocation();
  
  // Don't show bottom nav on auth pages
  const hideBottomNav = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      <Routes>
        <Route path="/login" element= {<Login />}/>
        <Route path="/signup" element={<> <Signup /></>} />

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
      
      {!hideBottomNav && <BottomNav />}
    </>
  );
}