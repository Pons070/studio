"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { addUser, deleteUserPermanently, findUserByPhone, findUserById, getUsers, updateUser as updateUserInStore } from '@/lib/user-store';

type OtpRequestResult = {
  success: boolean;
  isNewUser: boolean;
  otp?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[]; // For admin view
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtpAndLogin: (phone: string, otp: string, name?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  deleteUserById: (userId: string) => Promise<void>; // Admin action
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // For admin
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const refreshUsers = useCallback(() => {
    const allUsers = getUsers();
    setUsers(allUsers.filter(u => u.email !== 'admin@example.com' && !u.deletedAt));
  }, []);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        // Re-fetch user from store to ensure data is fresh
        const freshUser = findUserById(JSON.parse(storedUser).id);
        setCurrentUser(freshUser || null);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
    } finally {
      setIsLoading(false);
    }
    refreshUsers();
  }, [refreshUsers]);
  
  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [currentUser]);

  const requestOtp = useCallback(async (phone: string): Promise<OtpRequestResult> => {
    const existingUser = findUserByPhone(phone);
    const isNewUser = !existingUser;
    // In a real app, this would be an SMS service. Here we mock it.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${phone}: ${otp}`);
    sessionStorage.setItem(`otp-${phone}`, otp);
    
    toast({ title: 'OTP Sent', description: `For testing, your OTP is: ${otp}` });
    return { success: true, isNewUser, otp };
  }, [toast]);

  const verifyOtpAndLogin = useCallback(async (phone: string, otp: string, name?: string): Promise<boolean> => {
    const storedOtp = sessionStorage.getItem(`otp-${phone}`);
    if (storedOtp === otp) {
      sessionStorage.removeItem(`otp-${phone}`);
      let user = findUserByPhone(phone);
      if (!user) {
        if (!name) {
          toast({ title: 'Login Failed', description: 'Name is required for new user signup.', variant: 'destructive' });
          return false;
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email: `${phone}@example.com`,
          phone: phone,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addUser(newUser);
        user = newUser;
        refreshUsers();
      }
      setCurrentUser(user);
      toast({ title: `Welcome, ${user.name}!`, variant: "success" });
      return true;
    } else {
      toast({ title: 'Login Failed', description: 'Invalid OTP.', variant: 'destructive' });
      return false;
    }
  }, [toast, refreshUsers]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    router.push('/login');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [router, toast]);

  const updateUser = useCallback(async (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    updateUserInStore(updatedUser);
    setCurrentUser(updatedUser);
    refreshUsers();
    toast({ title: "Profile Updated" });
  }, [currentUser, toast, refreshUsers]);
  
  const addAddress = useCallback(async (address: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    const newAddress: Address = {
      ...address,
      id: `ADDR-${Date.now()}`,
      isDefault: !currentUser.addresses || currentUser.addresses.length === 0,
    };
    const updatedAddresses = [...(currentUser.addresses || []), newAddress];
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    updateUserInStore(updatedUser);
    setCurrentUser(updatedUser);
    toast({ title: "Address Added" });
  }, [currentUser, toast]);

  const updateAddress = useCallback(async (address: Address) => {
    if (!currentUser) return;
    let addresses = currentUser.addresses || [];
    const addressIndex = addresses.findIndex(a => a.id === address.id);
    if (addressIndex === -1) return;

    if (address.isDefault) {
        addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses[addressIndex] = { ...addresses[addressIndex], ...address };
    
    const updatedUser = { ...currentUser, addresses };
    updateUserInStore(updatedUser);
    setCurrentUser(updatedUser);
    toast({ title: "Address Updated" });
  }, [currentUser, toast]);

  const deleteAddress = useCallback(async (addressId: string) => {
    if (!currentUser?.addresses) return;
    const addressToDelete = currentUser.addresses.find(a => a.id === addressId);
    if (!addressToDelete) return;
    
    let updatedAddresses = currentUser.addresses.filter(a => a.id !== addressId);
    if (addressToDelete.isDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    updateUserInStore(updatedUser);
    setCurrentUser(updatedUser);
    toast({ title: "Address Deleted" });
  }, [currentUser, toast]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!currentUser?.addresses) return;
    const addressToUpdate = currentUser.addresses.find(a => a.id === addressId);
    if (addressToUpdate) {
      await updateAddress({ ...addressToUpdate, isDefault: true });
    }
  }, [currentUser, updateAddress]);

  const deleteUser = useCallback(async () => {
    if (!currentUser) return;
    deleteUserPermanently(currentUser.id);
    logout();
    toast({ title: "Account Deleted", variant: "destructive" });
  }, [currentUser, logout, toast]);
  
  const deleteUserById = useCallback(async (userId: string) => {
    const user = findUserById(userId);
    if (user && user.email === 'admin@example.com') {
      toast({ title: "Action Not Allowed", description: "Cannot delete the primary admin account.", variant: "destructive"});
      return;
    }
    // Soft delete
    const updatedUser = { ...user, deletedAt: new Date().toISOString() };
    updateUserInStore(updatedUser as User);
    refreshUsers();
    toast({ title: "Customer Deleted" });
  }, [toast, refreshUsers]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, users, requestOtp, verifyOtpAndLogin, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById, isLoading }}>
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