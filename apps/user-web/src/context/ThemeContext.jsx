import React, { createContext, useContext, useEffect, useState } from "react";

// Provides light/dark theme with persistence and Tailwind 'dark' class control
const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (_) {
    // ignore storage errors and fall back to default
  }
  // Default requirement: light theme
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {
      // ignore
    }
    const root = document.documentElement; // <html>
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const value = { 
    theme, 
    isDark: theme === "dark",
    isDarkMode: theme === "dark", // For backward compatibility
    setTheme, 
    toggleTheme 
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}