
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, getDocs, collection, deleteDoc, query, where, writeBatch } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

type OtpRequestResult = {
  success: boolean;
  isNewUser: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  users: User[];
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtpAndLogin: (otp: string, name?: string) => Promise<boolean>;
  logout: (options?: { idle: boolean }) => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  deleteUserById: (userId: string) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch all users for the admin dashboard
  const fetchAllUsers = useCallback(async () => {
    if (currentUser?.email === 'admin@example.com' && db) {
      try {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(allUsers.filter(u => u.id !== currentUser.id));
      } catch (error) {
          console.error("Failed to fetch all users for admin view", error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Handle auth state changes
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setFirebaseUser(user);
      if (user && db) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // This can happen if user exists in Auth but not Firestore (e.g., interrupted signup).
          // They will be prompted to enter their name on the login screen again.
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const setupRecaptcha = useCallback(() => {
    if (!auth) return null;
    if (typeof window !== 'undefined' && !document.getElementById('recaptcha-container')) {
        // This should not happen if the login page is rendered correctly
        return null;
    }
    
    // Clean up old verifier if it exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      }
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  }, []);

  const requestOtp = useCallback(async (phone: string): Promise<OtpRequestResult> => {
    if (!auth || !db) {
        toast({ title: 'Error', description: 'Firebase is not configured.', variant: 'destructive' });
        return { success: false, isNewUser: false };
    }
    try {
      const q = query(collection(db, "users"), where("phone", "==", phone));
      const querySnapshot = await getDocs(q);
      const isNewUser = querySnapshot.empty;

      const recaptchaVerifier = setupRecaptcha();
      if (!recaptchaVerifier) throw new Error("Recaptcha container not found.");

      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      window.confirmationResult = confirmationResult;

      toast({ title: 'OTP Sent', description: 'A verification code has been sent to your phone.' });
      return { success: true, isNewUser };
    } catch (error) {
      console.error("OTP Error", error);
      toast({ title: 'Error', description: 'Failed to send OTP. Please refresh and try again.', variant: 'destructive' });
      return { success: false, isNewUser: false };
    }
  }, [toast, setupRecaptcha]);
  
  const verifyOtpAndLogin = useCallback(async (otp: string, name?: string): Promise<boolean> => {
    if (!window.confirmationResult) {
      toast({ title: 'Error', description: 'No OTP request found. Please try again.', variant: 'destructive' });
      return false;
    }
    if (!db) {
        toast({ title: 'Error', description: 'Firebase is not configured.', variant: 'destructive' });
        return false;
    }
    
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let appUser: User;
      
      if (!userDoc.exists()) {
        if (!name || !user.phoneNumber) {
          toast({ title: "Registration Failed", description: "Name is required for new users.", variant: "destructive" });
          await user.delete();
          return false;
        }
        appUser = {
          id: user.uid,
          name,
          email: `${user.phoneNumber}@example.com`,
          phone: user.phoneNumber,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, appUser);
      } else {
        appUser = { id: userDoc.id, ...userDoc.data() } as User;
      }
      
      setCurrentUser(appUser);
      toast({ title: `Welcome, ${appUser.name}!`, variant: "success" });
      return true;

    } catch (error) {
      console.error("OTP verification error", error);
      toast({ title: "Login Failed", description: "The OTP is incorrect or has expired.", variant: "destructive" });
      return false;
    }
  }, [toast]);
  
  const logout = useCallback(async (options?: { idle: boolean }) => {
    if (!auth) return;
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push('/login');
      if (options?.idle) {
        toast({ title: "Session Expired", description: "You have been logged out due to inactivity." });
      } else {
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
      }
    } catch (error) {
       toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  }, [router, toast]);

  // Idle timer logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'visibilitychange'];
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (firebaseUser) logout({ idle: true });
      }, 15 * 60 * 1000); // 15 minutes
    };
    if (firebaseUser) {
        events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
        resetTimer();
    }
    return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [firebaseUser, logout]);

  const updateUser = useCallback(async (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => {
    if (!currentUser || !db) return;
    const userDocRef = doc(db, 'users', currentUser.id);
    try {
        await updateDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() });
        const updatedUser = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
        setCurrentUser(updatedUser);
        toast({ title: "Profile Updated" });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  }, [currentUser, toast]);

  const addAddress = useCallback(async (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser || !db) return;
    const userDocRef = doc(db, 'users', currentUser.id);
    const newAddress: Address = {
        ...addressData,
        id: `ADDR-${Date.now()}`,
        isDefault: !currentUser.addresses || currentUser.addresses.length === 0
    };
    try {
        await updateDoc(userDocRef, { addresses: arrayUnion(newAddress) });
        const updatedUser = { ...currentUser, addresses: [...(currentUser.addresses || []), newAddress] };
        setCurrentUser(updatedUser);
        toast({ title: "Address Added" });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to add address.', variant: 'destructive' });
    }
  }, [currentUser, toast]);

  const updateAddress = useCallback(async (addressData: Address) => {
      if (!currentUser || !addressData.id || !db) return;
      const userDocRef = doc(db, 'users', currentUser.id);
      const currentAddresses = currentUser.addresses || [];
      const updatedAddresses = currentAddresses.map(a => a.id === addressData.id ? addressData : a);
      try {
          await updateDoc(userDocRef, { addresses: updatedAddresses });
          const updatedUser = { ...currentUser, addresses: updatedAddresses };
          setCurrentUser(updatedUser);
          toast({ title: "Address Updated" });
      } catch (error) {
          toast({ title: 'Error', description: 'Failed to update address.', variant: 'destructive' });
      }
  }, [currentUser, toast]);
  
  const deleteAddress = useCallback(async (addressId: string) => {
      if (!currentUser || !db) return;
      const userDocRef = doc(db, 'users', currentUser.id);
      const addressToDelete = (currentUser.addresses || []).find(a => a.id === addressId);
      if (!addressToDelete) return;
      
      const batch = writeBatch(db);
      
      try {
          // Temporarily remove the address from the array to determine new default
          let updatedAddresses = (currentUser.addresses || []).filter(a => a.id !== addressId);
          if (addressToDelete.isDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a=>a.isDefault)) {
              updatedAddresses[0].isDefault = true;
          }
          
          batch.update(userDocRef, { addresses: updatedAddresses });
          await batch.commit();

          const updatedUser = { ...currentUser, addresses: updatedAddresses };
          setCurrentUser(updatedUser);
          toast({ title: "Address Deleted" });
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'Failed to delete address.', variant: 'destructive' });
      }
  }, [currentUser, toast]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
      if (!currentUser || !db) return;
      const userDocRef = doc(db, 'users', currentUser.id);
      const updatedAddresses = (currentUser.addresses || []).map(addr => ({ ...addr, isDefault: addr.id === addressId }));
      try {
          await updateDoc(userDocRef, { addresses: updatedAddresses });
          const updatedUser = { ...currentUser, addresses: updatedAddresses };
          setCurrentUser(updatedUser);
          toast({ title: "Default Address Updated" });
      } catch (error) {
          toast({ title: "Error", description: 'Failed to set default address.', variant: "destructive" });
      }
  }, [currentUser, toast]);
  
  const deleteUser = useCallback(async () => {
    if (!currentUser || !firebaseUser || !db || !auth) return;
    try {
        await deleteDoc(doc(db, "users", currentUser.id));
        await firebaseUser.delete();
        toast({ title: "Account Deleted", variant: "destructive" });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete account. Please log out and log back in to try again.', variant: 'destructive' });
    }
  }, [currentUser, firebaseUser, toast]);

  const deleteUserById = useCallback(async (userId: string) => {
    if (!db) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        return;
    }
    try {
      if (currentUser?.id === userId) throw new Error("You cannot delete your own account.");
      await deleteDoc(doc(db, "users", userId));
      // In a real app, you'd trigger a Firebase Function to delete the associated Auth user.
      // For this prototype, we are only deleting the Firestore record.
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Customer Deleted" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message || "Failed to delete user.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const isAuthenticated = !!firebaseUser && !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, firebaseUser, users, requestOtp, verifyOtpAndLogin, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById, isLoading }}>
      {!isLoading && children}
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
