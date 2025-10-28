import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Menu from '../pages/Menu';
import Analytics from '../pages/Analytics';
import Profile from '../pages/Profile';
import VendorLayout from '../components/layout/VendorLayout';
import { useAuth } from '../context/AuthContext';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/home';
};

// Wrap protected vendor routes
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

// Restrict routes to guests only
function GuestOnly({ children }) {
  const { user, role, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to={roleHome(role)} replace />;

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route
        path="/vendor/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/vendor/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />
      <Route
        path="/vendor/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />

      {/* Protected vendor area */}
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

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/vendor/signup" replace />} />
    </Routes>
  );
}
