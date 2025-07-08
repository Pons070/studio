
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';

type OtpRequestResult = {
  success: boolean;
  isNewUser: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtpAndLogin: (phone: string, otp: string, name?: string) => Promise<boolean>;
  logout: (options?: { idle: boolean }) => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => void;
  deleteUser: () => Promise<void>;
  deleteUserById: (userId: string) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'culina-preorder-current-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch all users for the admin dashboard
  useEffect(() => {
    const fetchAllUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch all users for admin view", error);
        }
    }
    // Only the admin user should fetch the full user list
    if (currentUser?.email === 'admin@example.com') {
        fetchAllUsers();
    }
  }, [currentUser]);

  const persistCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
        const { password, ...userToStore } = user;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(async (options?: { idle: boolean }) => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout API call failed, proceeding with client-side logout:", error);
    } finally {
        persistCurrentUser(null);
        if (options?.idle) {
            toast({
                title: "Session Expired",
                description: "You have been logged out due to inactivity.",
            });
        } else {
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
        }
        router.push('/login');
    }
  }, [router, toast, persistCurrentUser]);

  // Idle timer logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'visibilitychange'];
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.localStorage.getItem(CURRENT_USER_STORAGE_KEY)) {
          logout({ idle: true });
        }
      }, 15 * 60 * 1000); // 15 minutes
    };
    if (currentUser) {
        events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
        resetTimer();
    }
    return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser, logout]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    const storedUserRaw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUserRaw) {
        try {
            setCurrentUser(JSON.parse(storedUserRaw));
        } catch (e) {
            console.error("Failed to parse current user from storage", e);
            window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
    }
    setIsLoading(false);
  }, []);

  const requestOtp = useCallback(async (phone: string): Promise<OtpRequestResult> => {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({ title: 'Error', description: result.message || 'Failed to send OTP.', variant: 'destructive' });
        return { success: false, isNewUser: result.isNewUser || false };
      }
      
      toast({ title: 'OTP Sent', description: `A verification code has been sent. (Hint: It's ${result.otp})` });
      return { success: true, isNewUser: result.isNewUser };

    } catch (error) {
      toast({ title: 'Network Error', description: 'Could not connect to the server to send OTP.', variant: 'destructive' });
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

      if (!response.ok || !result.success) {
        toast({ title: "Login Failed", description: result.message || "The OTP is incorrect.", variant: "destructive" });
        return false;
      }
      
      const userToLogin: User = result.user;
      persistCurrentUser(userToLogin);
      
      toast({ title: `Welcome, ${userToLogin.name}!`, description: "You have been logged in.", variant: "success" });
      return true;

    } catch (error) {
      toast({ title: 'Network Error', description: 'Could not connect to the server to verify OTP.', variant: 'destructive' });
      return false;
    }
  }, [toast, persistCurrentUser]);

  const updateUser = useCallback(async (data: Partial<Omit<User, 'id' | 'password' | 'addresses'>>) => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...data }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        
        persistCurrentUser(result.user);
        toast({ title: "Profile Updated", description: "Your details have been saved." });
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message || 'Failed to update profile.', variant: 'destructive' });
    }
  }, [currentUser, toast, persistCurrentUser]);

  const addAddress = useCallback(async (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...addressData }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        
        const updatedUser: User = result.user;
        const newAddress = updatedUser.addresses?.slice(-1)[0];

        if (updatedUser.addresses && updatedUser.addresses.length === 1) {
            updatedUser.addresses[0].isDefault = true;
        }

        persistCurrentUser(updatedUser);
        toast({ title: "Address Added", description: "Your new address has been saved." });
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message || 'Failed to add address.', variant: 'destructive' });
    }
  }, [currentUser, toast, persistCurrentUser]);

  const updateAddress = useCallback(async (addressData: Address) => {
      if (!currentUser || !addressData.id) return;
      try {
          const response = await fetch('/api/addresses', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id, ...addressData }),
          });
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.message);
          
          persistCurrentUser(result.user);
          toast({ title: "Address Updated" });
      } catch (error) {
          toast({ title: 'Error', description: (error as Error).message || 'Failed to update address.', variant: 'destructive' });
      }
  }, [currentUser, toast, persistCurrentUser]);
  
  const deleteAddress = useCallback(async (addressId: string) => {
      if (!currentUser) return;
      try {
          const response = await fetch('/api/addresses', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id, addressId }),
          });
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.message);

          const updatedUser: User = result.user;
          if (updatedUser.addresses && updatedUser.addresses.length > 0 && !updatedUser.addresses.some(a => a.isDefault)) {
              updatedUser.addresses[0].isDefault = true;
          }

          persistCurrentUser(updatedUser);
          toast({ title: "Address Deleted" });
      } catch (error) {
          toast({ title: 'Error', description: (error as Error).message || 'Failed to delete address.', variant: 'destructive' });
      }
  }, [currentUser, toast, persistCurrentUser]);

  const setDefaultAddress = useCallback((addressId: string) => {
      if (!currentUser) return;
      const updatedAddresses = (currentUser.addresses || []).map(addr => ({ ...addr, isDefault: addr.id === addressId }));
      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      
      // This is a UI-only operation before saving, so a PUT seems excessive.
      // But for consistency let's use the API.
      // For now, let's keep it client-side for speed.
      persistCurrentUser(updatedUser);
      toast({ title: "Default Address Updated" });
  }, [currentUser, toast, persistCurrentUser]);
  
  const deleteUser = useCallback(async () => {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        
        toast({ title: "Account Deleted", variant: "destructive" });
        logout();
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message || 'Failed to delete account.', variant: 'destructive' });
    }
  }, [currentUser, logout, toast]);

  const deleteUserById = useCallback(async (userId: string) => {
    try {
      if (currentUser?.id === userId) throw new Error("You cannot delete your own account.");
      const response = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Customer Deleted" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message || "Failed to delete user.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, users, requestOtp, verifyOtpAndLogin, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById, isLoading }}>
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
