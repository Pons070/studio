
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { users as mockUsers } from '@/lib/mock-data';
import { useBrand } from './brand';

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
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'email' | 'password' | 'addresses'>>) => void;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  deleteUser: () => void;
  deleteUserById: (userId: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'culina-preorder-users';
const CURRENT_USER_STORAGE_KEY = 'culina-preorder-current-user';

// NOTE: This is a MOCK authentication system.
// The OTP is hardcoded for simulation purposes.
const MOCK_OTP = '123456';
let otpStore: { [phone: string]: string } = {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { brandInfo } = useBrand();

  const persistUsers = useCallback((updatedUsers: User[]) => {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  }, []);

  const persistCurrentUser = useCallback((user: User | null) => {
    if (user) {
        const { password, ...userToStore } = user;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    const loadedUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    setUsers(loadedUsers);

    if (!storedUsers) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }

    const storedCurrentUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedCurrentUser) {
        const currentUserData = JSON.parse(storedCurrentUser);
        const fullUser = loadedUsers.find((u: User) => u.id === currentUserData.id);
        setCurrentUser(fullUser || null);
    }
  }, []);

  const requestOtp = useCallback(async (phone: string): Promise<OtpRequestResult> => {
    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userExists = currentUsers.some(u => u.phone === phone);

    // Simulate sending OTP
    otpStore[phone] = MOCK_OTP;
    
    console.log(`SIMULATING OTP for ${phone}: ${MOCK_OTP}`);

    toast({
      title: 'OTP Sent',
      description: `A verification code has been sent to +91 ${phone}. (Hint: It's ${MOCK_OTP})`,
    });
    
    return { success: true, isNewUser: !userExists };

  }, [toast]);

  const verifyOtpAndLogin = useCallback(async (phone: string, otp: string, name?: string): Promise<boolean> => {
    if (otpStore[phone] !== otp) {
      toast({
        title: "Login Failed",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    // OTP is correct, clear it
    delete otpStore[phone];

    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    let userToLogin = currentUsers.find(u => u.phone === phone);

    // If user doesn't exist, it's a signup
    if (!userToLogin) {
      if (!name) {
         toast({ title: "Signup Failed", description: "Please provide your name to create an account.", variant: "destructive" });
         return false;
      }
      const newUser: User = {
        id: `USER-${Date.now()}`,
        name,
        email: `${phone}@culinapreorder.com`, // Placeholder email
        phone,
        addresses: [],
      };
      
      const updatedUsers = [...currentUsers, newUser];
      persistUsers(updatedUsers);
      userToLogin = newUser;

      toast({ title: "Account Created!", description: "Welcome! You have been logged in.", variant: "success" });
    } else {
        toast({ title: `Welcome back, ${userToLogin.name}!`, description: "You have been logged in.", variant: "success" });
    }
    
    persistCurrentUser(userToLogin);
    return true;

  }, [toast, persistUsers, persistCurrentUser]);


  const logout = useCallback(() => {
    persistCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  }, [router, toast, persistCurrentUser]);

  const updateUser = useCallback((data: Partial<Omit<User, 'id' | 'email' | 'password' | 'addresses'>>) => {
    if (!currentUser) return;
    
    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    let userToUpdate = currentUsers.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;
    
    const updatedUser: User = { 
      ...userToUpdate,
      ...data,
      password: userToUpdate.password,
    };
    
    const updatedUsers = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(updatedUsers);
    persistCurrentUser(updatedUser);

    toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
    });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);

  const addAddress = useCallback((addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    
    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    let userToUpdate = currentUsers.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;

    const currentAddresses = userToUpdate.addresses || [];
    if (currentAddresses.length >= 6) {
        toast({ title: "Address Limit Reached", description: "You can only have up to 6 addresses.", variant: "destructive" });
        return;
    }

    const newAddress: Address = {
      ...addressData,
      id: crypto.randomUUID(),
      isDefault: currentAddresses.length === 0,
    };

    const updatedAddresses = [...currentAddresses, newAddress];
    const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
    
    const newUsers = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(newUsers);
    persistCurrentUser(updatedUser);

    toast({ title: "Address Added", description: "Your new address has been saved." });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);

  const updateAddress = useCallback((addressData: Address) => {
      if (!currentUser || !addressData.id) return;
      
      const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      let userToUpdate = currentUsers.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => addr.id === addressData.id ? addressData : addr);
      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Address Updated", description: "Your address has been successfully updated." });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);
  
  const deleteAddress = useCallback((addressId: string) => {
      if (!currentUser) return;
      
      const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      let userToUpdate = currentUsers.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;

      let updatedAddresses = (userToUpdate.addresses || []).filter(addr => addr.id !== addressId);
      
      const wasDefault = userToUpdate.addresses?.find(a => a.id === addressId)?.isDefault;
      if(wasDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);
      
      toast({ title: "Address Deleted", description: "The address has been removed." });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);

  const setDefaultAddress = useCallback((addressId: string) => {
      if (!currentUser) return;
      
      const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      let userToUpdate = currentUsers.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
      }));

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Default Address Updated", description: "Your default address has been set." });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);
  
  const deleteUser = useCallback(() => {
    if (!currentUser) return;

    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const updatedUsers = currentUsers.filter(u => u.id !== currentUser.id);
    persistUsers(updatedUsers);

    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    });

    logout();
  }, [currentUser, logout, toast, persistUsers]);

  const deleteUserById = useCallback((userId: string) => {
    if (currentUser?.id === userId) {
        toast({
            title: "Action Not Allowed",
            description: "You cannot delete your own account from the customer management panel.",
            variant: "destructive",
        });
        return;
    }

    const currentUsers: User[] = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userToDelete = currentUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = currentUsers.filter(u => u.id !== userId);
    persistUsers(updatedUsers);

    toast({
      title: "Customer Deleted",
      description: `The account for ${userToDelete.name} has been deleted.`,
    });
  }, [currentUser, toast, persistUsers]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, users, requestOtp, verifyOtpAndLogin, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById }}>
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
