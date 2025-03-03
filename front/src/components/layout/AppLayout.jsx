//AppLayout.jsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
 import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AppLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { user, profile } = useAuth();

  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar */}
      
        
        {/* Mobile Sidebar */}
  
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
         
          
          {/* Render children (main content) */}
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}