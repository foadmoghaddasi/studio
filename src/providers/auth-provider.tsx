
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TEMP_PHONE_NUMBER_KEY } from '@/components/auth/welcome-form';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithRedirect, // Changed from signInWithPopup
  signOut,
  onAuthStateChanged,
  getRedirectResult, // Added to handle redirect result
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
  if (!identifier) return `roozberooz_global_${key}`;
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
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const processAuth = async () => {
      setIsLoading(true); // Set loading true at the start of auth processing
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User signed in via redirect.
          // onAuthStateChanged will also fire, so this can be used for additional
          // processing or error handling specific to the redirect if needed.
          console.log("User signed in via redirect:", result.user.email);
        }
      } catch (error) {
        console.error("Error getting redirect result:", error);
        // Handle specific redirect errors, e.g., auth/account-exists-with-different-credential
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // setIsLoading(true); // isLoading is already true from processAuth or signInWithGoogle
        if (user) {
          setFirebaseUser(user);
          setIsAuthenticated(true);
          const currentIdentifier = user.email || user.phoneNumber || user.uid;
          setLoginIdentifier(currentIdentifier);
          loadUserProfile(currentIdentifier); // This also sets isProfileSetupComplete from localStorage

          // Pre-fill profile from Google if it's the first time for this identifier
          // and profile is not yet set up, and data is not already in localStorage.
          if (user.providerData.some(p => p.providerId === GoogleAuthProvider.PROVIDER_ID) && currentIdentifier) {
            const storedProfileSetup = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'profileSetupComplete')) : null;
            const isSetup = storedProfileSetup === 'true';

            if (!isSetup) {
              const nameParts = user.displayName?.split(' ') || [];
              const googleFirstName = nameParts[0] || null;
              const googleLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

              const localFirstName = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'userFirstName')) : null;
              if (!localFirstName && googleFirstName) {
                  setFirstName(googleFirstName);
                  if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userFirstName'), googleFirstName);
              }

              const localLastName = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'userLastName')) : null;
              if (!localLastName && googleLastName) {
                  setLastName(googleLastName);
                  if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userLastName'), googleLastName);
              }
              
              const localProfilePic = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl')) : null;
              if (!localProfilePic && user.photoURL) {
                  setProfilePictureUrl(user.photoURL);
                  if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl'), user.photoURL);
              }
            }
          }
        } else {
          setFirebaseUser(null);
          setIsAuthenticated(false);
          if (loginIdentifier) {
              clearUserProfile(loginIdentifier); // This clears profile data from state
          }
          setLoginIdentifier(null);
          setIsProfileSetupComplete(false);
        }
        setIsLoading(false); // Set loading false after auth state is fully processed
      });
      return () => unsubscribe();
    };

    processAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadUserProfile = (identifier: string | null) => {
    if (typeof window !== 'undefined' && identifier) {
      try {
        const storedProfileSetup = localStorage.getItem(getStorageKey(identifier, 'profileSetupComplete'));
        setIsProfileSetupComplete(storedProfileSetup === 'true'); // Update state here
        setFirstName(localStorage.getItem(getStorageKey(identifier, 'userFirstName')));
        setLastName(localStorage.getItem(getStorageKey(identifier, 'userLastName')));
        setAge(localStorage.getItem(getStorageKey(identifier, 'userAge')));
        setProfilePictureUrl(localStorage.getItem(getStorageKey(identifier, 'userProfilePictureUrl')));
      } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
      }
    } else {
      // If no identifier, ensure profile state is cleared
      setIsProfileSetupComplete(false);
      setFirstName(null);
      setLastName(null);
      setAge(null);
      setProfilePictureUrl(null);
    }
  };

  const clearUserProfile = (identifier: string | null) => {
      setFirstName(null);
      setLastName(null);
      setAge(null);
      setProfilePictureUrl(null);
      setIsProfileSetupComplete(false);

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
      // as it might have been updated by loadUserProfile
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
            setIsAuthenticated(true);
            
            const currentIdentifier = tempPhoneNumber;
            const previousIdentifier = loginIdentifier;
            
            setLoginIdentifier(currentIdentifier);
            localStorage.setItem(getStorageKey(null, 'lastLoginIdentifier'), currentIdentifier);
            localStorage.removeItem(TEMP_PHONE_NUMBER_KEY);

            if (previousIdentifier && currentIdentifier !== previousIdentifier) {
                clearUserProfile(previousIdentifier);
                setIsProfileSetupComplete(false);
                setFirstName(null);
                setLastName(null);
                setAge(null);
                setProfilePictureUrl(null);
                 loadUserProfile(currentIdentifier); // Load if any data exists for new ID
            } else {
                loadUserProfile(currentIdentifier);
            }
            // setIsLoading(false); // Let onAuthStateChanged handle this
        }
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true); // Set loading true before initiating redirect
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // Page will redirect, so no setIsLoading(false) here.
      // It will be handled by onAuthStateChanged / getRedirectResult after redirect.
    } catch (error) {
      console.error("Error initiating Google sign-in with redirect:", error);
      // Handle errors that occur *before* the redirect (e.g., network issue, misconfiguration)
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentIdentifier = loginIdentifier; // Capture before clearing
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle resetting:
      // firebaseUser, isAuthenticated, loginIdentifier, isProfileSetupComplete
      // clearUserProfile will be called by onAuthStateChanged with the new null loginIdentifier logic
      // No need to clear localStorage items related to specific user here as they are keyed by identifier.
      // Only clear the global lastLoginIdentifier if needed.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getStorageKey(null, 'lastLoginIdentifier')); // Clear global last login
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // setIsLoading(false); // onAuthStateChanged will handle this
      router.replace('/'); // Ensure redirection to home page after logout
    }
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
    // router.push('/my-habits'); // Redirection is handled by the main useEffect
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

