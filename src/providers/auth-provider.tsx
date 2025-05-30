
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TEMP_PHONE_NUMBER_KEY } from '@/components/auth/welcome-form';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
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
  loginWithOtp: () => void; // Renamed for clarity
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  saveProfile: (profileData: { firstName: string; lastName: string; age: string }) => void;
  updateProfileImage: (imageUrl: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys
const AUTH_STORAGE_KEY_PREFIX = 'roozberooz_user_'; // Prefix for user-specific data

const getStorageKey = (identifier: string | null, key: string) => {
  if (!identifier) return `roozberooz_global_${key}`; // Fallback, though should ideally always have identifier
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        setIsAuthenticated(true);
        const currentIdentifier = user.email || user.phoneNumber || user.uid; // Prefer email for Google, phone for OTP, uid as fallback
        setLoginIdentifier(currentIdentifier);
        loadUserProfile(currentIdentifier);
      } else {
        setFirebaseUser(null);
        setIsAuthenticated(false);
        // Clear user-specific data, but keep global flags like "has a user ever logged in on this browser" if needed
        // For now, we clear most things on logout, which happens below in the logout function
        if (loginIdentifier) { // if there was a logged-in user
            clearUserProfile(loginIdentifier); // Clear previous user's profile from state
        }
        setLoginIdentifier(null);
        setIsProfileSetupComplete(false); // Reset profile setup status
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loginIdentifier removed to avoid loop with onAuthStateChanged

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
      }
    }
  };
  
  const clearUserProfile = (identifier: string | null) => {
      setFirstName(null);
      setLastName(null);
      setAge(null);
      setProfilePictureUrl(null);
      setIsProfileSetupComplete(false); // Also reset this in state

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
      if (!isProfileSetupComplete && pathname !== PROFILE_SETUP_PAGE) {
        router.replace(PROFILE_SETUP_PAGE);
      } else if (isProfileSetupComplete && (AUTH_PAGES.includes(pathname) || pathname === PROFILE_SETUP_PAGE)) {
        router.replace('/my-habits');
      }
    } else if (!isAuthenticated && !AUTH_PAGES.includes(pathname) && pathname !== PROFILE_SETUP_PAGE) {
      router.replace('/');
    }
  }, [isAuthenticated, isProfileSetupComplete, isLoading, mounted, pathname, router, loginIdentifier]);


  const loginWithOtp = () => { // Placeholder for OTP confirmation logic if Firebase Phone Auth is used
    // This function would typically be called AFTER OTP verification
    // For now, we assume onAuthStateChanged handles the user state after phone auth
    // If not using Firebase Phone Auth, this needs manual setup:
    if (typeof window !== 'undefined') {
        const tempPhoneNumber = localStorage.getItem(TEMP_PHONE_NUMBER_KEY);
        if (tempPhoneNumber) {
            // This is a simplified OTP flow without actual Firebase Phone Auth
            // In a real scenario, Firebase Phone Auth would set the user in onAuthStateChanged
            setIsAuthenticated(true); // Manually set for non-Firebase phone auth
            
            const currentIdentifier = tempPhoneNumber;
            const previousIdentifier = loginIdentifier;
            
            setLoginIdentifier(currentIdentifier);
            localStorage.setItem(getStorageKey(null, 'lastLoginIdentifier'), currentIdentifier); // Store globally for next load
            localStorage.removeItem(TEMP_PHONE_NUMBER_KEY);

            if (previousIdentifier && currentIdentifier !== previousIdentifier) {
                clearUserProfile(previousIdentifier); // Clear old user's data
                setIsProfileSetupComplete(false); // New user needs profile setup
                setFirstName(null);
                setLastName(null);
                setAge(null);
                setProfilePictureUrl(null);
            } else {
                loadUserProfile(currentIdentifier);
            }
            setIsLoading(false); // Ensure loading is false
        }
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const currentIdentifier = user.email; // Google sign-in uses email as identifier
      const previousIdentifier = loginIdentifier;

      setFirebaseUser(user); // Handled by onAuthStateChanged
      setIsAuthenticated(true); // Handled by onAuthStateChanged
      setLoginIdentifier(currentIdentifier);
      
      if (typeof window !== 'undefined' && currentIdentifier) {
        localStorage.setItem(getStorageKey(null, 'lastLoginIdentifier'), currentIdentifier);
      }

      if (previousIdentifier && currentIdentifier !== previousIdentifier) {
        clearUserProfile(previousIdentifier); // Clear old user's data
        setIsProfileSetupComplete(false); 
        // Pre-fill from Google if it's a "new" user context for this browser
        setFirstName(user.displayName?.split(' ')[0] || null); // Basic split for first name
        setProfilePictureUrl(user.photoURL || null);
        // Save pre-filled data
        if (typeof window !== 'undefined' && currentIdentifier) {
            if (user.displayName) localStorage.setItem(getStorageKey(currentIdentifier, 'userFirstName'), user.displayName.split(' ')[0]);
            if (user.photoURL) localStorage.setItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl'), user.photoURL);
        }
      } else {
        loadUserProfile(currentIdentifier); // Load existing profile if any for this identifier
         // If profile is not setup, but google gives us info, prefill
        if (currentIdentifier && !isProfileSetupComplete) {
            const storedFirstName = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'userFirstName')) : null;
            const storedProfilePic = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl')) : null;

            if (!storedFirstName && user.displayName) {
                setFirstName(user.displayName.split(' ')[0] || null);
                if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userFirstName'), user.displayName.split(' ')[0]);
            }
            if (!storedProfilePic && user.photoURL) {
                setProfilePictureUrl(user.photoURL || null);
                if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentIdentifier, 'userProfilePictureUrl'), user.photoURL);
            }
        }
      }
      // Redirection is handled by useEffect
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // Handle error (e.g., display a toast message)
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth); // Firebase sign out
      // onAuthStateChanged will handle resetting state
      // Clear the global lastLoginIdentifier
      if (typeof window !== 'undefined') {
          // Do not clear user-specific profile data on logout,
          // so if they log back in with the same ID, profile is preserved.
          // However, we should clear the 'lastLoginIdentifier' to avoid auto-loading wrong profile.
          // localStorage.removeItem(getStorageKey(null, 'lastLoginIdentifier')); // Let onAuthStateChanged handle clearing
      }
      // State clearing is handled by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
       // Ensure redirection to home page after logout
      router.replace('/');
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

  if (!mounted) { // Don't render children until client has mounted to avoid hydration issues
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
