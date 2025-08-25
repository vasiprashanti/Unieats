import React from "react";
import { NavLink } from "react-router-dom";

// Simple classnames utility to conditionally join class names
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
      </svg>
    ) },
  { name: "Users & Vendors", href: "/admin/users", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ) },
  { name: "Orders", href: "/admin/orders", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V8a2 2 0 0 0-2-2h-3l-2-2H8L6 6H5a2 2 0 0 0-2 2v7" /><path d="M3 21h18" /><path d="M16 13a4 4 0 0 1-8 0" />
      </svg>
    ) },
  { name: "Content", href: "/admin/content", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5V4a2 2 0 0 1 2-2h9l5 5v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </svg>
    ) },
  { name: "Analytics", href: "/admin/analytics", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 13l3 3 7-7" />
      </svg>
    ) },
  { name: "Settings", href: "/admin/settings", icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 15.4a1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 3c.23 0 .46-.03.68-.09H9a2 2 0 1 1 4 0h.09c.22.06.45.09.68.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.39.39-.5.97-.33 1.82.06.22.09.45.09.68s-.03.46-.09.68a1.65 1.65 0 0 0 .33 1.82Z" />
      </svg>
    ) },
];

export default function AdminSidebar({ collapsed = false, onToggle }) {
  return (
    <aside
      className={cn(
        "sidebar bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-base h-full transition-[width] duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-start border-b border-base px-3">
        {/* Logo toggles sidebar and stays at the far left in both states */}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className={cn(
            "flex items-center justify-center cursor-pointer bg-transparent p-0 rounded focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none",
            collapsed ? "h-8 w-8" : "h-8 w-8"
          )}
        >
          <img
            src="/logo.jpg"
            alt="UniEats Logo"
            className={cn("object-contain", "h-8 w-8")}
          />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
              )
            }
          >
            <span className={cn("flex-shrink-0", collapsed ? "mx-auto" : "mr-3")}>
              {/* Force nav icon to inherit current item color */}
              {React.cloneElement(item.icon, { className: cn("h-5 w-5", "text-current") })}
            </span>
            {!collapsed && <span className="transition-opacity duration-200">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}