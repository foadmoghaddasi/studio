
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TEMP_PHONE_NUMBER_KEY } from '@/components/auth/welcome-form'; // Import the key

interface AuthContextType {
  isAuthenticated: boolean;
  firstName: string | null;
  lastName: string | null; 
  age: string | null; 
  profilePictureUrl: string | null;
  loginIdentifier: string | null; // For phone number or email
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
const USER_LOGIN_IDENTIFIER_KEY = 'roozberooz_userLoginIdentifier'; // New key for login identifier

const AUTH_PAGES = ['/', '/otp'];
const PROFILE_SETUP_PAGE = '/profile-setup';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState<string | null>(null);
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
        setLoginIdentifier(localStorage.getItem(USER_LOGIN_IDENTIFIER_KEY));

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
        
        // Retrieve and store login identifier (phone number)
        const tempPhoneNumber = localStorage.getItem(TEMP_PHONE_NUMBER_KEY);
        if (tempPhoneNumber) {
          localStorage.setItem(USER_LOGIN_IDENTIFIER_KEY, tempPhoneNumber);
          setLoginIdentifier(tempPhoneNumber);
          localStorage.removeItem(TEMP_PHONE_NUMBER_KEY); // Clean up temporary key
        } else {
          // If no temp phone number, check if a login identifier already exists (e.g. from a previous session)
          const existingIdentifier = localStorage.getItem(USER_LOGIN_IDENTIFIER_KEY);
          if (existingIdentifier) {
            setLoginIdentifier(existingIdentifier);
          }
          // For Google login simulation, we would set an email here if it was real
        }

      } catch (error) {
        console.error("Failed to save auth status or login identifier to localStorage", error);
      }
    }
    setIsAuthenticated(true);
    // Re-check profile completion status from localStorage after login
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
        // Do NOT remove profile setup keys, user name, age, picture, or login identifier
        // This allows the profile and identifier to persist across logout/login on the same browser.
      } catch (error) {
        console.error("Failed to remove auth status from localStorage", error);
      }
    }
    setIsAuthenticated(false);
    // loginIdentifier is not cleared from state here, it will be re-read from localStorage on next mount if user logs back in.
    // Or we can clear it from state:
    // setLoginIdentifier(null); 
    // But if we want it to persist in profile even after logout (like other profile data), we leave it.
    // For this scenario, let's keep it, as other profile data is kept.
  };

  const saveProfile = (profileData: { firstName: string; lastName: string; age: string }) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_FIRST_NAME_KEY, profileData.firstName);
        localStorage.setItem(USER_LAST_NAME_KEY, profileData.lastName);
        localStorage.setItem(USER_AGE_KEY, profileData.age);
        localStorage.setItem(PROFILE_SETUP_COMPLETE_KEY, 'true');

        // If loginIdentifier wasn't set during login (e.g. very first time, or if logic was missed)
        // ensure it's set or re-read here if needed, though login() should handle it.
        const currentIdentifier = localStorage.getItem(USER_LOGIN_IDENTIFIER_KEY);
        if (currentIdentifier) {
            setLoginIdentifier(currentIdentifier);
        }

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
        loginIdentifier,
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
