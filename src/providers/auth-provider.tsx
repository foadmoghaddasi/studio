
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  firstName: string | null;
  isProfileSetupComplete: boolean;
  login: () => void;
  logout: () => void;
  saveProfile: (profileData: { firstName: string; lastName: string; age: string }) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'roozberooz_isAuthenticated';
const PROFILE_SETUP_COMPLETE_KEY = 'roozberooz_profileSetupComplete';
const USER_FIRST_NAME_KEY = 'roozberooz_userFirstName';
const USER_LAST_NAME_KEY = 'roozberooz_userLastName';
// const USER_AGE_KEY = 'roozberooz_userAge'; // Age can be stored if needed for profile page

const AUTH_PAGES = ['/', '/otp'];
const PROFILE_SETUP_PAGE = '/profile-setup';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const authStatus = storedAuth === 'true';
      setIsAuthenticated(authStatus);

      const storedProfileSetup = localStorage.getItem(PROFILE_SETUP_COMPLETE_KEY);
      const profileSetupStatus = storedProfileSetup === 'true';
      setIsProfileSetupComplete(profileSetupStatus);

      const storedFirstName = localStorage.getItem(USER_FIRST_NAME_KEY);
      setFirstName(storedFirstName);

    } catch (error) {
      console.error("Failed to load auth status from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (isAuthenticated) {
        if (!isProfileSetupComplete && pathname !== PROFILE_SETUP_PAGE) {
          router.replace(PROFILE_SETUP_PAGE);
        } else if (isProfileSetupComplete && (AUTH_PAGES.includes(pathname) || pathname === PROFILE_SETUP_PAGE)) {
          router.replace('/my-habits');
        }
      } else if (!AUTH_PAGES.includes(pathname) && pathname !== PROFILE_SETUP_PAGE) { // Allow access to profile-setup if not authenticated yet (should not happen ideally)
        router.replace('/');
      }
    }
  }, [isAuthenticated, isProfileSetupComplete, isLoading, pathname, router, mounted]);

  const login = () => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (error) {
      console.error("Failed to save auth status to localStorage", error);
    }
    setIsAuthenticated(true);
    // Redirection logic is now handled by the useEffect above
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(PROFILE_SETUP_COMPLETE_KEY);
      localStorage.removeItem(USER_FIRST_NAME_KEY);
      localStorage.removeItem(USER_LAST_NAME_KEY);
      // localStorage.removeItem(USER_AGE_KEY);
    } catch (error) {
      console.error("Failed to remove auth status from localStorage", error);
    }
    setIsAuthenticated(false);
    setIsProfileSetupComplete(false);
    setFirstName(null);
    // Redirection logic is now handled by the useEffect above
  };

  const saveProfile = (profileData: { firstName: string; lastName: string; age: string }) => {
    try {
      localStorage.setItem(USER_FIRST_NAME_KEY, profileData.firstName);
      localStorage.setItem(USER_LAST_NAME_KEY, profileData.lastName);
      // localStorage.setItem(USER_AGE_KEY, profileData.age);
      localStorage.setItem(PROFILE_SETUP_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error("Failed to save profile data to localStorage", error);
    }
    setFirstName(profileData.firstName);
    setIsProfileSetupComplete(true);
    router.push('/my-habits');
  };

  if (isLoading || !mounted) {
     return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, firstName, isProfileSetupComplete, login, logout, saveProfile, isLoading }}>
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
