
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';

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
  
  const refreshUsers = useCallback(async () => {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error("Failed to fetch users.");
        const data = await response.json();
        setUsers(data.users || []);
    } catch (error) {
        console.error("Error refreshing users:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
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
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        toast({ title: 'OTP Sent', description: `For testing, your OTP is: ${result.otp}` });
        return { success: true, isNewUser: result.isNewUser, otp: result.otp };
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive"});
        return { success: false, isNewUser: false };
    }
  }, [toast]);

  const verifyOtpAndLogin = useCallback(async (phone: string, otp: string, name?: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, otp, name }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setCurrentUser(result.user);
        toast({ title: `Welcome, ${result.user.name}!`, variant: "success" });
        return true;
    } catch (error) {
        toast({ title: 'Login Failed', description: (error as Error).message, variant: 'destructive' });
        return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        setCurrentUser(null);
        router.push('/login');
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
        toast({ title: 'Logout Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [router, toast]);

  const updateUser = useCallback(async (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...data }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setCurrentUser(result.user);
        refreshUsers();
        toast({ title: "Profile Updated" });
    } catch (error) {
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [currentUser, toast, refreshUsers]);
  
  const addAddress = useCallback(async (address: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...address }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setCurrentUser(result.user);
        toast({ title: "Address Added" });
    } catch (error) {
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [currentUser, toast]);

  const updateAddress = useCallback(async (address: Address) => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/addresses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...address }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setCurrentUser(result.user);
        toast({ title: "Address Updated" });
    } catch (error) {
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [currentUser, toast]);

  const deleteAddress = useCallback(async (addressId: string) => {
    if (!currentUser?.addresses) return;
    try {
        const response = await fetch('/api/addresses', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, addressId }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setCurrentUser(result.user);
        toast({ title: "Address Deleted" });
    } catch (error) {
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
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
    try {
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id }),
        });
        if (!response.ok) throw new Error('Failed to delete account.');
        logout();
        toast({ title: "Account Deleted", variant: "destructive" });
    } catch (error) {
        toast({ title: 'Deletion Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [currentUser, logout, toast]);
  
  const deleteUserById = useCallback(async (userId: string) => {
    try {
        const response = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to delete user.');
        
        refreshUsers();
        toast({ title: "Customer Deleted" });
    } catch (error) {
        toast({ title: 'Deletion Failed', description: (error as Error).message, variant: 'destructive' });
    }
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
