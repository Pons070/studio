
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { users as mockUsers } from '@/lib/mock-data';
import { useBrand } from './brand';

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  signup: (name: string, email: string, phone: string, password: string) => boolean;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'email' | 'password' | 'addresses'>>) => void;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  deleteUser: () => void;
  deleteUserById: (userId: string) => void;
  resetPassword: (phone: string, newPassword: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'culina-preorder-users';
const CURRENT_USER_STORAGE_KEY = 'culina-preorder-current-user';

// NOTE: This is a MOCK authentication system.
// In a real application, NEVER store passwords in plaintext or in localStorage.
// Use a secure authentication provider like Firebase Auth, NextAuth.js, or Clerk.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { brandInfo } = useBrand();

  useEffect(() => {
    let finalUsers: User[];
    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    
    if (storedUsers && storedUsers !== '[]') {
      finalUsers = JSON.parse(storedUsers);
    } else {
      finalUsers = mockUsers;
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }
    setUsers(finalUsers);

    const storedCurrentUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedCurrentUser) {
      const currentUserData = JSON.parse(storedCurrentUser);
      const userExists = finalUsers.some(u => u.id === currentUserData.id);
      if (userExists) {
          const fullUser = finalUsers.find(u => u.id === currentUserData.id);
          setCurrentUser(fullUser || null);
      } else {
          window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          setCurrentUser(null);
      }
    }
  }, []);

  const persistUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
  }
  
  const persistCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
        const { password, ...userToStore } = user;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }

  const signup = useCallback((name: string, email: string, phone: string, password: string): boolean => {
    const existingUserByEmail = users.find(u => u.email === email);
    if (existingUserByEmail) {
      toast({
        title: "Signup Failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
      return false;
    }

    const existingUserByPhone = users.find(u => u.phone === phone);
    if (existingUserByPhone) {
      toast({
        title: "Signup Failed",
        description: "An account with this phone number already exists.",
        variant: "destructive",
      });
      return false;
    }

    const newUser: User = {
      id: `USER-${Date.now()}`,
      name,
      email,
      password,
      phone,
      addresses: [],
    };
    
    persistUsers([...users, newUser]);
    
    toast({
      title: "Signup Successful!",
      description: "You can now log in with your new account.",
      variant: "success",
    });
    return true;
  }, [users, toast]);

  const login = useCallback((phone: string, password: string): boolean => {
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
      const blockedEmails = brandInfo.blockedCustomerEmails || [];
      if (user.email && blockedEmails.includes(user.email)) {
          toast({
              title: "Account Blocked",
              description: "This account has been blocked. Please contact support.",
              variant: "destructive",
          });
          return false;
      }
      
      persistCurrentUser(user);
      toast({
        title: `Welcome back, ${user.name}!`,
        description: "You have been successfully logged in.",
      });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid phone number or password. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [users, toast, brandInfo.blockedCustomerEmails]);

  const logout = useCallback(() => {
    persistCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  }, [router, toast]);

  const updateUser = useCallback((data: Partial<Omit<User, 'id' | 'email' | 'password' | 'addresses'>>) => {
    if (!currentUser) return;
    
    const userToUpdate = users.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;
    
    const updatedUser: User = { 
      ...userToUpdate,
      ...data,
      password: userToUpdate.password, // Ensure password is preserved
    };
    
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(updatedUsers);
    persistCurrentUser(updatedUser);

    toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
    });
  }, [currentUser, users, toast]);

  const addAddress = useCallback((addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    
    const userToUpdate = users.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;

    const currentAddresses = userToUpdate.addresses || [];
    if (currentAddresses.length >= 6) {
        toast({ title: "Address Limit Reached", description: "You can only have up to 6 addresses.", variant: "destructive" });
        return;
    }

    const newAddress: Address = {
      ...addressData,
      id: crypto.randomUUID(),
      isDefault: currentAddresses.length === 0, // Make first address default
    };

    const updatedAddresses = [...currentAddresses, newAddress];
    const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
    
    const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(newUsers);
    persistCurrentUser(updatedUser);

    toast({ title: "Address Added", description: "Your new address has been saved." });
  }, [currentUser, users, toast]);

  const updateAddress = useCallback((addressData: Address) => {
      if (!currentUser || !addressData.id) return;
      
      const userToUpdate = users.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => addr.id === addressData.id ? addressData : addr);
      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Address Updated", description: "Your address has been successfully updated." });
  }, [currentUser, users, toast]);
  
  const deleteAddress = useCallback((addressId: string) => {
      if (!currentUser) return;

      const userToUpdate = users.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;

      let updatedAddresses = (userToUpdate.addresses || []).filter(addr => addr.id !== addressId);
      
      const wasDefault = userToUpdate.addresses?.find(a => a.id === addressId)?.isDefault;
      if(wasDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);
      
      toast({ title: "Address Deleted", description: "The address has been removed." });
  }, [currentUser, users, toast]);

  const setDefaultAddress = useCallback((addressId: string) => {
      if (!currentUser) return;
      
      const userToUpdate = users.find(u => u.id === currentUser.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
      }));

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Default Address Updated", description: "Your default address has been set." });
  }, [currentUser, users, toast]);
  
  const resetPassword = useCallback((phone: string, newPassword: string): boolean => {
    let userFound = false;
    const updatedUsers = users.map(user => {
        if (user.phone === phone) {
            userFound = true;
            return { ...user, password: newPassword };
        }
        return user;
    });

    if (userFound) {
        persistUsers(updatedUsers);
        toast({
            title: "Password Reset Successful",
            description: "Your password has been updated. Please log in with your new password.",
            variant: "success",
        });
        return true;
    } else {
        toast({
            title: "User Not Found",
            description: "No account was found with that phone number.",
            variant: "destructive",
        });
        return false;
    }
  }, [users, toast]);

  const deleteUser = useCallback(() => {
    if (!currentUser) return;

    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    persistUsers(updatedUsers);

    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    });

    logout();
  }, [currentUser, users, logout, toast]);

  const deleteUserById = useCallback((userId: string) => {
    if (currentUser?.id === userId) {
        toast({
            title: "Action Not Allowed",
            description: "You cannot delete your own account from the customer management panel.",
            variant: "destructive",
        });
        return;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.id !== userId);
    persistUsers(updatedUsers);

    toast({
      title: "Customer Deleted",
      description: `The account for ${userToDelete.name} has been deleted.`,
    });
  }, [currentUser, users, toast]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, users, signup, login, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById, resetPassword }}>
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
