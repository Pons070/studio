
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // For mock purposes, password is stored. It's not secure.
  phone?: string;
  address?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  signup: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'email'>>) => void;
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
      const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      const storedCurrentUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to load auth data from localStorage", error);
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
      address: '',
    };
    
    persistUsers([...users, newUser]);
    
    toast({
      title: "Signup Successful!",
      description: "You can now log in with your new account.",
      className: "bg-green-500 text-white"
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

  const updateUser = useCallback((data: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...data };
    persistCurrentUser(updatedUser);

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    persistUsers(updatedUsers);

    toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
    });

  }, [currentUser, users, toast]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, signup, login, logout, updateUser }}>
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
