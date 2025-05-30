
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TEMP_PHONE_NUMBER_KEY } from '@/components/auth/welcome-form';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup, // Using signInWithPopup as per user's statement
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  firstName: string | null;
  lastName: string | null;
  age: string | null;
  profilePictureUrl: string | null;
  loginIdentifier: string | null;
  isProfileSetupComplete: boolean;
  loginWithOtp: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  saveProfile: (profileData: { firstName: string; lastName: string; age: string }) => void;
  updateProfileImage: (imageUrl: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY_PREFIX = 'roozberooz_user_';

const getStorageKey = (identifier: string | null, key: string) => {
  if (!identifier) return `roozberooz_global_${key}`; // Should ideally not happen for user-specific data
  return `${AUTH_STORAGE_KEY_PREFIX}${identifier}_${key}`;
};

const AUTH_PAGES = ['/', '/otp'];
const PROFILE_SETUP_PAGE = '/profile-setup';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState<string | null>(null);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true, set to false by onAuthStateChanged
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // setIsLoading(true) is already default, onAuthStateChanged will set it to false
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true); // Set loading true while processing auth state change
      if (user) {
        setFirebaseUser(user);
        setIsAuthenticated(true);
        const currentIdentifier = user.email || user.phoneNumber || user.uid; // Use UID as a fallback identifier
        setLoginIdentifier(currentIdentifier);
        loadUserProfile(currentIdentifier); // This also sets isProfileSetupComplete from localStorage

        // Pre-fill profile from Google if it's the first time for this identifier
        // and profile is not yet set up, and data is not already in localStorage.
        if (user.providerData.some(p => p.providerId === GoogleAuthProvider.PROVIDER_ID) && currentIdentifier) {
          const storedProfileSetup = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'profileSetupComplete')) : null;
          const isSetup = storedProfileSetup === 'true';

          if (!isSetup) { // Only prefill if not already set up
            const nameParts = user.displayName?.split(' ') || [];
            const googleFirstName = nameParts[0] || null;
            const googleLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

            if (googleFirstName && !localStorage.getItem(getStorageKey(currentIdentifier, 'userFirstName'))) {
                setFirstName(googleFirstName);
                if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userFirstName'), googleFirstName);
            }
            if (googleLastName && !localStorage.getItem(getStorageKey(currentIdentifier, 'userLastName'))) {
                setLastName(googleLastName);
                if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userLastName'), googleLastName);
            }
            if (user.photoURL && !localStorage.getItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl'))) {
                setProfilePictureUrl(user.photoURL);
                if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl'), user.photoURL);
            }
          }
        }
      } else {
        setFirebaseUser(null);
        setIsAuthenticated(false);
        if (loginIdentifier) { // If there was a previously logged-in user
            clearUserProfile(loginIdentifier);
        }
        setLoginIdentifier(null);
        setIsProfileSetupComplete(false); // Ensure this is reset
        // Clear states related to user profile
        setFirstName(null);
        setLastName(null);
        setAge(null);
        setProfilePictureUrl(null);
      }
      setIsLoading(false); // Set loading false AFTER all state updates from onAuthStateChanged
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loginIdentifier removed as a dependency

  const loadUserProfile = (identifier: string | null) => {
    if (typeof window !== 'undefined' && identifier) {
      try {
        const storedProfileSetup = localStorage.getItem(getStorageKey(identifier, 'profileSetupComplete'));
        setIsProfileSetupComplete(storedProfileSetup === 'true');
        setFirstName(localStorage.getItem(getStorageKey(identifier, 'userFirstName')));
        setLastName(localStorage.getItem(getStorageKey(identifier, 'userLastName')));
        setAge(localStorage.getItem(getStorageKey(identifier, 'userAge')));
        setProfilePictureUrl(localStorage.getItem(getStorageKey(identifier, 'userProfilePictureUrl')));
      } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
        setIsProfileSetupComplete(false); // Default to false on error
      }
    } else {
      setIsProfileSetupComplete(false);
      setFirstName(null);
      setLastName(null);
      setAge(null);
      setProfilePictureUrl(null);
    }
  };

  const clearUserProfile = (identifier: string | null) => {
      // State clearing is handled in onAuthStateChanged else block
      if (typeof window !== 'undefined' && identifier) {
          localStorage.removeItem(getStorageKey(identifier, 'profileSetupComplete'));
          localStorage.removeItem(getStorageKey(identifier, 'userFirstName'));
          localStorage.removeItem(getStorageKey(identifier, 'userLastName'));
          localStorage.removeItem(getStorageKey(identifier, 'userAge'));
          localStorage.removeItem(getStorageKey(identifier, 'userProfilePictureUrl'));
      }
  };

  useEffect(() => {
    if (isLoading || !mounted) {
      return;
    }

    if (isAuthenticated && loginIdentifier) {
      // Re-check isProfileSetupComplete directly from localStorage or state
      // as it might have been updated by loadUserProfile in onAuthStateChanged
      const setupComplete = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(loginIdentifier, 'profileSetupComplete')) === 'true' : isProfileSetupComplete;

      if (!setupComplete && pathname !== PROFILE_SETUP_PAGE) {
        router.replace(PROFILE_SETUP_PAGE);
      } else if (setupComplete && (AUTH_PAGES.includes(pathname) || pathname === PROFILE_SETUP_PAGE)) {
        router.replace('/my-habits');
      }
    } else if (!isAuthenticated && !AUTH_PAGES.includes(pathname) && pathname !== PROFILE_SETUP_PAGE) {
      router.replace('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isProfileSetupComplete, isLoading, mounted, pathname, loginIdentifier]);


  const loginWithOtp = () => {
    if (typeof window !== 'undefined') {
        const tempPhoneNumber = localStorage.getItem(TEMP_PHONE_NUMBER_KEY);
        if (tempPhoneNumber) {
            // Simulate Firebase auth state change for OTP (since no actual Firebase OTP is implemented)
            // In a real scenario, after OTP verification, Firebase would trigger onAuthStateChanged.
            // For this simulation, we manually set states as if onAuthStateChanged fired.
            setIsLoading(true); // Simulate start of auth process
            const pseudoUser = { 
                uid: tempPhoneNumber, 
                phoneNumber: tempPhoneNumber, 
                email: null, 
                providerData: [{providerId: 'phone'}] 
            } as unknown as FirebaseUser; // Cast for type compatibility
            
            setFirebaseUser(pseudoUser);
            setIsAuthenticated(true);
            setLoginIdentifier(tempPhoneNumber);
            localStorage.setItem(getStorageKey(null, 'lastLoginIdentifier'), tempPhoneNumber); // This might be redundant if loginIdentifier state is primary
            localStorage.removeItem(TEMP_PHONE_NUMBER_KEY);
            loadUserProfile(tempPhoneNumber); // Sets isProfileSetupComplete
            setIsLoading(false); // Simulate end of auth process
        }
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true); // Set loading true before initiating popup
    const provider = new GoogleAuthProvider();
    try {
      // signInWithPopup returns a UserCredential, onAuthStateChanged will handle state updates
      await signInWithPopup(auth, provider);
      // Successful sign-in will trigger onAuthStateChanged.
      // isLoading will be set to false by onAuthStateChanged after it processes the user.
    } catch (error: any) {
      console.error("Google Sign-In failed with popup:", error);
      // Handle specific errors, e.g., popup closed by user
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        // Optionally, show a toast or message for other errors
      }
      setIsLoading(false); // Reset loading state only if an error occurs during the popup phase
    }
  };

  const logout = async () => {
    const currentIdentifier = loginIdentifier; // Capture before Firebase sign out clears it
    setIsLoading(true);
    try {
      await signOut(auth); // This will trigger onAuthStateChanged, which handles state cleanup
      // No need to clear specific user profile from localStorage here,
      // onAuthStateChanged's 'else' block will call clearUserProfile if an identifier was present
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getStorageKey(null, 'lastLoginIdentifier'));
      }
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false); // Ensure loading is false if signOut itself errors
    }
    // onAuthStateChanged will set isLoading to false after processing the null user
    router.replace('/'); // Ensure redirection to home page after logout
  };

  const saveProfile = (profileData: { firstName: string; lastName: string; age: string }) => {
    if (typeof window !== 'undefined' && loginIdentifier) {
      try {
        localStorage.setItem(getStorageKey(loginIdentifier, 'userFirstName'), profileData.firstName);
        localStorage.setItem(getStorageKey(loginIdentifier, 'userLastName'), profileData.lastName);
        localStorage.setItem(getStorageKey(loginIdentifier, 'userAge'), profileData.age);
        localStorage.setItem(getStorageKey(loginIdentifier, 'profileSetupComplete'), 'true');
      } catch (error) {
        console.error("Failed to save profile data to localStorage", error);
      }
    }
    setFirstName(profileData.firstName);
    setLastName(profileData.lastName);
    setAge(profileData.age);
    setIsProfileSetupComplete(true);
    // Redirection is handled by the main useEffect
  };

  const updateProfileImage = (imageUrl: string) => {
    if (typeof window !== 'undefined' && loginIdentifier) {
      try {
        localStorage.setItem(getStorageKey(loginIdentifier, 'userProfilePictureUrl'), imageUrl);
        setProfilePictureUrl(imageUrl);
      } catch (error) {
        console.error("Failed to save profile image to localStorage", error);
      }
    }
  };

  if (!mounted) {
     return <div className="flex items-center justify-center min-h-svh bg-background"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }


  return (
    <AuthContext.Provider value={{
        isAuthenticated,
        firebaseUser,
        firstName,
        lastName,
        age,
        profilePictureUrl,
        loginIdentifier,
        isProfileSetupComplete,
        loginWithOtp,
        signInWithGoogle,
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


    