// src/contexts/AuthContext.jsx - Modified for Feathers.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import client from '@/client/feathers';
import { authAPI } from '@/client/api';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const { success, user } = await authAPI.reAuthenticate();
        
        if (success && user) {
          setUser(user);
          // Get full profile
          const { success: profileSuccess, profile } = await authAPI.getProfile();
          if (profileSuccess) {
            setProfile(profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Setup real-time connection state listener
    client.io.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    client.io.on('connect', () => {
      console.log('Connected to server');
      // Re-authenticate on reconnect
      checkAuth();
    });
    
    return () => {
      client.io.off('disconnect');
      client.io.off('connect');
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const { success, user, error } = await authAPI.login(email, password);
      
      if (!success) {
        throw new Error(error?.message || "Login failed");
      }
      
      setUser(user);
      
      // Get full profile
      const { profile } = await authAPI.getProfile();
      setProfile(profile);
      
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
      return { success: false, error };
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      const { success, user, error } = await authAPI.register(email, password, userData.full_name);
      
      if (!success) {
        throw new Error(error?.message || "Registration failed");
      }
      
      toast.success("Registration successful! Please log in.");
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setProfile(null);
      router.push("/auth/login");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      const { success, profile: updatedProfile, error } = await authAPI.updateProfile(updates);
      
      if (!success) {
        throw new Error(error?.message || "Failed to update profile");
      }
      
      setProfile(updatedProfile);
      
      toast.success("Profile updated successfully");
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
      return { success: false, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}