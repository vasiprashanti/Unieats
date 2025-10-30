import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Vendor layout with theme toggle mirroring admin
export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/vendor/login");
  };

  
  return (
    <div className="flex h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-[width] duration-200 border-r border-base bg-[hsl(var(--background))]`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-base">
          <Link to="/vendor/dashboard" className="font-semibold tracking-wide">
            {sidebarOpen ? "UniEats Vendor" : "UE"}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded hover:bg-accent"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          {/* <NavLink to="/vendor/dashboard" className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg className="h-5 w-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
            </span>
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>  */}
          
          <NavLink to="/vendor/orders" className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg className="h-5 w-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15V8a2 2 0 0 0-2-2h-3l-2-2H8L6 6H5a2 2 0 0 0-2 2v7" />
                <path d="M3 21h18" />
                <path d="M16 13a4 4 0 0 1-8 0" />
              </svg>
            </span>
            {sidebarOpen && <span>Orders</span>}
          </NavLink>
          <NavLink to="/vendor/menu" className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg className="h-5 w-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5V4a2 2 0 0 1 2-2h9l5 5v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </span>
            {sidebarOpen && <span>Menu</span>}
          </NavLink>
          <NavLink to="/vendor/analytics" className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg className="h-5 w-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </span>
            {sidebarOpen && <span>Analytics</span>}
          </NavLink>
          <NavLink to="/vendor/profile" className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg className="h-5 w-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            {sidebarOpen && <span>Profile</span>}
          </NavLink>
        </nav>
      </aside>

      
      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-base bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">Vendor Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-accent"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              
              {isDark ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            
            {/* Notification bell (placeholder) */}
            <div className="relative group">
              <button type="button" className="p-2 rounded hover:bg-accent" title="Notifications">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 21a2 2 0 0 0 4 0" />
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 hidden w-56 rounded-lg border border-base bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-3 text-sm shadow-xl group-hover:block">
                <p className="text-muted">No new notifications.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="px-3 py-2 rounded border border-base hover:bg-accent disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 bg-[hsl(var(--background))]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
