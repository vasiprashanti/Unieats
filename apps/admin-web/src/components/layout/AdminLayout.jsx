import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarCollapsed((s) => !s);

  const onLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen">
      {/* App shell */}
      <div className="flex h-screen w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-b border-base h-16 flex items-center justify-between px-4">
            {/* Sidebar toggle is now handled by the sidebar logo; left area kept minimal for balance */}
            <div className="flex items-center gap-2" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle Theme"
                title="Toggle Theme"
              >
                {isDark ? (
                  // Sun icon
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  // Moon icon
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={onLogout}
                disabled={loading}
                className="px-3 py-2 rounded border border-base text-[hsl(var(--foreground))] hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}