
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  firstName: string | null;
  lastName: string | null; 
  age: string | null; 
  profilePictureUrl: string | null;
  isProfileSetupComplete: boolean;
  login: () => void;
  logout: () => void;
  saveProfile: (profileData: { firstName: string; lastName: string; age: string }) => void;
  updateProfileImage: (imageUrl: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'roozberooz_isAuthenticated';
const PROFILE_SETUP_COMPLETE_KEY = 'roozberooz_profileSetupComplete';
const USER_FIRST_NAME_KEY = 'roozberooz_userFirstName';
const USER_LAST_NAME_KEY = 'roozberooz_userLastName';
const USER_AGE_KEY = 'roozberooz_userAge';
const USER_PROFILE_PICTURE_KEY = 'roozberooz_userProfilePictureUrl';

const AUTH_PAGES = ['/', '/otp'];
const PROFILE_SETUP_PAGE = '/profile-setup';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        const authStatus = storedAuth === 'true';
        setIsAuthenticated(authStatus);

        const storedProfileSetup = localStorage.getItem(PROFILE_SETUP_COMPLETE_KEY);
        const profileSetupStatus = storedProfileSetup === 'true';
        setIsProfileSetupComplete(profileSetupStatus);

        setFirstName(localStorage.getItem(USER_FIRST_NAME_KEY));
        setLastName(localStorage.getItem(USER_LAST_NAME_KEY));
        setAge(localStorage.getItem(USER_AGE_KEY));
        setProfilePictureUrl(localStorage.getItem(USER_PROFILE_PICTURE_KEY));

      } catch (error) {
        console.error("Failed to load auth status from localStorage", error);
      }
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
      } else if (!AUTH_PAGES.includes(pathname) && pathname !== PROFILE_SETUP_PAGE) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isProfileSetupComplete, isLoading, pathname, router, mounted]);

  const login = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch (error) {
        console.error("Failed to save auth status to localStorage", error);
      }
    }
    setIsAuthenticated(true);
    // Re-check profile completion status from localStorage after login, in case it was set in a previous session
    if (typeof window !== 'undefined') {
        const storedProfileSetup = localStorage.getItem(PROFILE_SETUP_COMPLETE_KEY);
        setIsProfileSetupComplete(storedProfileSetup === 'true');
        setFirstName(localStorage.getItem(USER_FIRST_NAME_KEY));
        setLastName(localStorage.getItem(USER_LAST_NAME_KEY));
        setAge(localStorage.getItem(USER_AGE_KEY));
        setProfilePictureUrl(localStorage.getItem(USER_PROFILE_PICTURE_KEY));
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        // Do NOT remove PROFILE_SETUP_COMPLETE_KEY, USER_FIRST_NAME_KEY, etc.
        // This allows the profile to persist across logout/login on the same browser.
      } catch (error) {
        console.error("Failed to remove auth status from localStorage", error);
      }
    }
    setIsAuthenticated(false);
    // We keep isProfileSetupComplete, firstName etc. as they are in localStorage,
    // so the next login can pick them up if it's the "same user" on this browser.
    // The local react states will be updated by the useEffect when isAuthenticated changes.
  };

  const saveProfile = (profileData: { firstName: string; lastName: string; age: string }) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_FIRST_NAME_KEY, profileData.firstName);
        localStorage.setItem(USER_LAST_NAME_KEY, profileData.lastName);
        localStorage.setItem(USER_AGE_KEY, profileData.age);
        localStorage.setItem(PROFILE_SETUP_COMPLETE_KEY, 'true');
      } catch (error) {
        console.error("Failed to save profile data to localStorage", error);
      }
    }
    setFirstName(profileData.firstName);
    setLastName(profileData.lastName);
    setAge(profileData.age);
    setIsProfileSetupComplete(true);
    router.push('/my-habits');
  };

  const updateProfileImage = (imageUrl: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_PROFILE_PICTURE_KEY, imageUrl);
        setProfilePictureUrl(imageUrl);
      } catch (error) {
        console.error("Failed to save profile image to localStorage", error);
      }
    }
  };

  if (isLoading || !mounted) {
     return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <AuthContext.Provider value={{ 
        isAuthenticated, 
        firstName, 
        lastName,
        age,
        profilePictureUrl,
        isProfileSetupComplete, 
        login, 
        logout, 
        saveProfile, 
        updateProfileImage,
        isLoading 
      }}>
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

    