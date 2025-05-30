
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TEMP_PHONE_NUMBER_KEY } from '@/components/auth/welcome-form';
import { auth } from '@/lib/firebase';
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
  loginIdentifier: string | null; // Can be phone number or email
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
  if (!identifier) {
    // Fallback for a very brief period if identifier is not yet set, though unlikely for user-specific data
    // console.warn("Attempted to get storage key without a user identifier for key:", key);
    // return `roozberooz_global_${key}`; // This should ideally not be used for user-specific data.
    // Or handle it more gracefully, perhaps by not attempting to access localStorage
    return null; 
  }
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
      setIsLoading(true); // Set loading true while processing auth state change
      if (user) {
        setFirebaseUser(user);
        setIsAuthenticated(true);
        const currentIdentifier = user.email || user.phoneNumber || user.uid;
        setLoginIdentifier(currentIdentifier);
        loadUserProfile(currentIdentifier); // This also sets isProfileSetupComplete

        // Prefill profile from Google if it's a new Google sign-in and profile isn't setup
        const isGoogleSignIn = user.providerData.some(p => p.providerId === GoogleAuthProvider.PROVIDER_ID);
        if (isGoogleSignIn && currentIdentifier) {
          const profileSetupKey = getStorageKey(currentIdentifier, 'profileSetupComplete');
          const storedProfileSetup = profileSetupKey ? localStorage.getItem(profileSetupKey) : null;
          const isSetup = storedProfileSetup === 'true';

          if (!isSetup) {
            const nameParts = user.displayName?.split(' ') || [];
            const googleFirstName = nameParts[0] || null;
            const googleLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
            const googlePhotoURL = user.photoURL || null;

            const firstNameKey = getStorageKey(currentIdentifier, 'userFirstName');
            const lastNameKey = getStorageKey(currentIdentifier, 'userLastName');
            const photoUrlKey = getStorageKey(currentIdentifier, 'userProfilePictureUrl');

            if (googleFirstName && firstNameKey && !localStorage.getItem(firstNameKey)) {
                setFirstName(googleFirstName);
                localStorage.setItem(firstNameKey, googleFirstName);
            }
            if (googleLastName && lastNameKey && !localStorage.getItem(lastNameKey)) {
                setLastName(googleLastName);
                localStorage.setItem(lastNameKey, googleLastName);
            }
            if (googlePhotoURL && photoUrlKey && !localStorage.getItem(photoUrlKey)) {
                setProfilePictureUrl(googlePhotoURL);
                localStorage.setItem(photoUrlKey, googlePhotoURL);
            }
          }
        }
      } else {
        setFirebaseUser(null);
        setIsAuthenticated(false);
        // Don't clear user-specific localStorage here on general sign-out,
        // only if a specific user's data needs invalidation.
        // clearUserProfile(loginIdentifier); // This was too broad
        setLoginIdentifier(null);
        setIsProfileSetupComplete(false);
        setFirstName(null);
        setLastName(null);
        setAge(null);
        setProfilePictureUrl(null);
      }
      setIsLoading(false); // Set loading false AFTER all state updates from onAuthStateChanged
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const loadUserProfile = (identifier: string | null) => {
    if (typeof window !== 'undefined' && identifier) {
      try {
        const profileSetupKey = getStorageKey(identifier, 'profileSetupComplete');
        const storedProfileSetup = profileSetupKey ? localStorage.getItem(profileSetupKey) : null;
        setIsProfileSetupComplete(storedProfileSetup === 'true');

        const firstNameKey = getStorageKey(identifier, 'userFirstName');
        if (firstNameKey) setFirstName(localStorage.getItem(firstNameKey));
        
        const lastNameKey = getStorageKey(identifier, 'userLastName');
        if (lastNameKey) setLastName(localStorage.getItem(lastNameKey));

        const ageKey = getStorageKey(identifier, 'userAge');
        if (ageKey) setAge(localStorage.getItem(ageKey));

        const picUrlKey = getStorageKey(identifier, 'userProfilePictureUrl');
        if (picUrlKey) setProfilePictureUrl(localStorage.getItem(picUrlKey));

      } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
        setIsProfileSetupComplete(false);
        setFirstName(null);
        setLastName(null);
        setAge(null);
        setProfilePictureUrl(null);
      }
    } else {
      setIsProfileSetupComplete(false);
      setFirstName(null);
      setLastName(null);
      setAge(null);
      setProfilePictureUrl(null);
    }
  };

  const clearUserProfileOnLogout = (identifier: string | null) => {
      if (typeof window !== 'undefined' && identifier) {
          const profileSetupKey = getStorageKey(identifier, 'profileSetupComplete');
          if(profileSetupKey) localStorage.setItem(profileSetupKey, 'false'); // Mark as not setup, but don't delete data

          // Keep user name, age, pic etc. so if they log back in with same identifier, it's there
          // This implies that profileSetupComplete is the main gatekeeper for the setup form.
      }
  };


  useEffect(() => {
    if (isLoading || !mounted) {
      return;
    }

    if (isAuthenticated && loginIdentifier) {
      // Re-check isProfileSetupComplete directly from localStorage or state
      const profileSetupKey = getStorageKey(loginIdentifier, 'profileSetupComplete');
      const setupComplete = profileSetupKey ? localStorage.getItem(profileSetupKey) === 'true' : isProfileSetupComplete;

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


  const loginWithOtp = () => { // This is a simulated OTP login
    if (typeof window !== 'undefined') {
        const tempPhoneNumber = localStorage.getItem(TEMP_PHONE_NUMBER_KEY);
        if (tempPhoneNumber) {
            setIsLoading(true); 
            // Simulate Firebase auth state change for OTP
            const pseudoUser = { 
                uid: tempPhoneNumber, 
                phoneNumber: tempPhoneNumber, 
                email: null, 
                providerData: [{providerId: 'phone', uid: tempPhoneNumber, phoneNumber: tempPhoneNumber, email: null, displayName: null, photoURL: null }] 
            } as unknown as FirebaseUser; 
            
            setFirebaseUser(pseudoUser);
            setIsAuthenticated(true);
            setLoginIdentifier(tempPhoneNumber);
            const permLoginIdKey = getStorageKey(tempPhoneNumber, 'loginIdentifier'); // Store identifier more permanently tied to the user
            if(permLoginIdKey) localStorage.setItem(permLoginIdKey, tempPhoneNumber);
            
            localStorage.removeItem(TEMP_PHONE_NUMBER_KEY);
            loadUserProfile(tempPhoneNumber); 
            setIsLoading(false); 
        } else {
          console.warn("OTP login attempted without temporary phone number.");
        }
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest, including setting isLoading to false eventually.
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Google Sign-In: Popup closed by user.");
        // User cancelled the sign-in, this is expected.
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log("Google Sign-In: Popup request cancelled.");
      } else {
        console.error("Google Sign-In failed with popup:", error);
        // Optionally, show a toast message to the user for other errors
      }
      setIsLoading(false); // Reset loading state if popup phase itself errors out or is cancelled.
    }
  };

  const logout = async () => {
    const currentIdentifierForLogout = loginIdentifier;
    setIsLoading(true);
    try {
      await signOut(auth); // This will trigger onAuthStateChanged
      // onAuthStateChanged will clear: firebaseUser, isAuthenticated, loginIdentifier, isProfileSetupComplete, firstName, lastName, age, profilePictureUrl
      // It also calls clearUserProfileOnLogout if an identifier was present.
      if (currentIdentifierForLogout) {
         clearUserProfileOnLogout(currentIdentifierForLogout); // Ensure profile setup status is reset for this identifier.
      }
      // No need to clear specific user profile from localStorage here, onAuthStateChanged manages this.
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false); 
    }
    // onAuthStateChanged will set isLoading to false eventually.
    // router.replace('/'); // Redirection is handled by the main useEffect
  };

  const saveProfile = (profileData: { firstName: string; lastName: string; age: string }) => {
    if (typeof window !== 'undefined' && loginIdentifier) {
      try {
        const firstNameKey = getStorageKey(loginIdentifier, 'userFirstName');
        if(firstNameKey) localStorage.setItem(firstNameKey, profileData.firstName);

        const lastNameKey = getStorageKey(loginIdentifier, 'userLastName');
        if(lastNameKey) localStorage.setItem(lastNameKey, profileData.lastName);
        
        const ageKey = getStorageKey(loginIdentifier, 'userAge');
        if(ageKey) localStorage.setItem(ageKey, profileData.age);

        const profileSetupKey = getStorageKey(loginIdentifier, 'profileSetupComplete');
        if(profileSetupKey) localStorage.setItem(profileSetupKey, 'true');
        
        setFirstName(profileData.firstName);
        setLastName(profileData.lastName);
        setAge(profileData.age);
        setIsProfileSetupComplete(true);
        // Redirection is handled by the main useEffect

      } catch (error) {
        console.error("Failed to save profile data to localStorage", error);
      }
    } else {
      console.warn("Attempted to save profile without a login identifier.");
    }
  };

  const updateProfileImage = (imageUrl: string) => {
    if (typeof window !== 'undefined' && loginIdentifier) {
      try {
        const picUrlKey = getStorageKey(loginIdentifier, 'userProfilePictureUrl');
        if(picUrlKey) {
          localStorage.setItem(picUrlKey, imageUrl);
          setProfilePictureUrl(imageUrl);
        }
      } catch (error) {
        console.error("Failed to save profile image to localStorage", error);
      }
    } else {
       console.warn("Attempted to update profile image without a login identifier.");
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
