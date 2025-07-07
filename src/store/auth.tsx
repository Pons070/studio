

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { users as mockUsers } from '@/lib/mock-data';

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  signup: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
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
// In a real application, NEVER store passwords in plaintext or in localStorage.
// Use a secure authentication provider like Firebase Auth, NextAuth.js, or Clerk.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    try {
      let finalUsers: User[];
      const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      
      if (storedUsers) {
        finalUsers = JSON.parse(storedUsers);
      } else {
        // If no users in storage, seed with mock data
        finalUsers = mockUsers;
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      }
      setUsers(finalUsers);

      const storedCurrentUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedCurrentUser) {
        const currentUserData = JSON.parse(storedCurrentUser);
        // Make sure the current user from storage still exists in our user list
        const userExists = finalUsers.some(u => u.id === currentUserData.id);
        if (userExists) {
            const fullUser = finalUsers.find(u => u.id === currentUserData.id);
            setCurrentUser(fullUser || null);
        } else {
            // Current user was deleted or data is out of sync, log them out.
            window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
            setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error("Failed to load auth data from localStorage", error);
      // Fallback to mock data if storage is corrupted
      setUsers(mockUsers);
    }
  }, []);

  const persistUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
  }
  
  const persistCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
        // In a real app, you would store a JWT token, not the user object.
        const { password, ...userToStore } = user;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }

  const signup = useCallback((name: string, email: string, password: string): boolean => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      toast({
        title: "Signup Failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
      return false;
    }

    const newUser: User = {
      id: `USER-${Date.now()}`,
      name,
      email,
      password,
      phone: '',
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

  const login = useCallback((email: string, password: string): boolean => {
    // This is mock logic. In a real app, passwords would be hashed.
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      persistCurrentUser(user);
      toast({
        title: `Welcome back, ${user.name}!`,
        description: "You have been successfully logged in.",
      });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [users, toast]);

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

    // Find the full user object from the main `users` array to preserve the password
    const userToUpdate = users.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;

    // Create the updated user object, preserving the existing password
    const updatedUser: User = { 
      ...userToUpdate, // This has the password
      ...data,         // This has the new name/phone
    };

    // Update the currentUser state (this will also persist it to localStorage)
    persistCurrentUser(updatedUser);

    // Update the main users list with the full user object (including password)
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(updatedUsers);

    toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
    });
  }, [currentUser, users, toast]);

  const addAddress = useCallback((addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!currentUser) return;
    
    const currentAddresses = currentUser.addresses || [];
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
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    persistCurrentUser(updatedUser);
    persistUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    toast({ title: "Address Added", description: "Your new address has been saved." });
  }, [currentUser, users, toast]);

  const updateAddress = useCallback((addressData: Address) => {
      if (!currentUser || !addressData.id) return;
      
      const updatedAddresses = (currentUser.addresses || []).map(addr => addr.id === addressData.id ? addressData : addr);
      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      
      persistCurrentUser(updatedUser);
      persistUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

      toast({ title: "Address Updated", description: "Your address has been successfully updated." });
  }, [currentUser, users, toast]);
  
  const deleteAddress = useCallback((addressId: string) => {
      if (!currentUser) return;

      const updatedAddresses = (currentUser.addresses || []).filter(addr => addr.id !== addressId);
      
      // If the deleted address was the default, make the first one in the list the new default.
      const wasDefault = currentUser.addresses?.find(a => a.id === addressId)?.isDefault;
      if(wasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      
      persistCurrentUser(updatedUser);
      persistUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      
      toast({ title: "Address Deleted", description: "The address has been removed." });
  }, [currentUser, users, toast]);

  const setDefaultAddress = useCallback((addressId: string) => {
      if (!currentUser) return;
      
      const updatedAddresses = (currentUser.addresses || []).map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
      }));

      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      
      persistCurrentUser(updatedUser);
      persistUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

      toast({ title: "Default Address Updated", description: "Your default address has been set." });
  }, [currentUser, users, toast]);

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
  }, [currentUser, users, toast, logout]);

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
  }, [users, currentUser, toast]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, users, signup, login, logout, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteUser, deleteUserById }}>
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
