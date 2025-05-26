"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'roozberooz_isAuthenticated';
const AUTH_PAGES = ['/', '/otp'];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const authStatus = storedAuth === 'true';
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Failed to load auth status from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
        router.replace('/my-habits');
      } else if (!isAuthenticated && !AUTH_PAGES.includes(pathname)) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (error) {
      console.error("Failed to save auth status to localStorage", error);
    }
    setIsAuthenticated(true);
    router.push('/my-habits');
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove auth status from localStorage", error);
    }
    setIsAuthenticated(false);
    router.push('/');
  };

  if (isLoading) {
     // Prevents flicker during auth check, content will be shown once auth status is determined
    return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  // Ensure correct page is shown based on auth state post-loading
  if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>; // Still redirecting
  }
  if (!isAuthenticated && !AUTH_PAGES.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>; // Still redirecting
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
