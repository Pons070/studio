
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Address, User } from '@/lib/types';
import { users as mockUsers } from '@/lib/mock-data';

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

  const persistUsers = useCallback((updatedUsers: User[]) => {
    setUsers(updatedUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }, []);

  const persistCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
        const { password, ...userToStore } = user;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback((options?: { idle: boolean }) => {
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
  }, [router, toast, persistCurrentUser]);

  // Idle timer logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'visibilitychange',
    ];

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Check if user is still logged in before logging out
        const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUser) {
          logout({ idle: true });
        }
      }, 15 * 60 * 1000); // 15 minutes
    };
    
    // Only set up the timer if the user is logged in.
    if (currentUser) {
        events.forEach(event => {
            window.addEventListener(event, resetTimer, { passive: true });
        });
        resetTimer(); // Initialize timer
    }

    // Cleanup function
    return () => {
        clearTimeout(timeoutId);
        events.forEach(event => {
            window.removeEventListener(event, resetTimer);
        });
    };
  }, [currentUser, logout]);


  useEffect(() => {
    const storedUsersRaw = window.localStorage.getItem(USERS_STORAGE_KEY);
    const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : mockUsers;
    setUsers(users);

    if (!storedUsersRaw) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }
    
    const storedCurrentUserRaw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedCurrentUserRaw) {
        const currentUserData = JSON.parse(storedCurrentUserRaw);
        const fullUser = users.find((u: User) => u.id === currentUserData.id);
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

    let userToLogin: User | undefined;
    
    // Always read the latest user list from storage
    const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
    userToLogin = currentUsers.find(u => u.phone === phone);

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


  const updateUser = useCallback((data: Partial<Omit<User, 'id' | 'email' | 'password' | 'addresses'>>) => {
     // Always read the latest user list from storage before updating
    const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
    const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
    
    if (!currentUserData) return;
    
    let userToUpdate = currentUsers.find(u => u.id === currentUserData.id);
    if (!userToUpdate) return;
    
    const updatedUser: User = { 
      ...userToUpdate,
      ...data,
      password: userToUpdate.password,
    };
    
    const updatedUsers = currentUsers.map(u => u.id === currentUserData.id ? updatedUser : u);
    persistUsers(updatedUsers);
    persistCurrentUser(updatedUser);

    toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
    });
  }, [toast, persistUsers, persistCurrentUser]);

  const addAddress = useCallback((addressData: Omit<Address, 'id' | 'isDefault'>) => {
    const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
    const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
    
    if (!currentUserData) return;

    let userToUpdate = currentUsers.find(u => u.id === currentUserData.id);
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
    
    const newUsers = currentUsers.map(u => u.id === currentUserData.id ? updatedUser : u);
    persistUsers(newUsers);
    persistCurrentUser(updatedUser);

    toast({ title: "Address Added", description: "Your new address has been saved." });
  }, [toast, persistUsers, persistCurrentUser]);

  const updateAddress = useCallback((addressData: Address) => {
      if (!currentUser || !addressData.id) return;
      
      const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
      const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
      const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
    
      if (!currentUserData || !addressData.id) return;
      
      let userToUpdate = currentUsers.find(u => u.id === currentUserData.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => addr.id === addressData.id ? addressData : addr);
      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUserData.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Address Updated", description: "Your address has been successfully updated." });
  }, [currentUser, toast, persistUsers, persistCurrentUser]);
  
  const deleteAddress = useCallback((addressId: string) => {
      const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
      const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
      const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
    
      if (!currentUserData) return;
      
      let userToUpdate = currentUsers.find(u => u.id === currentUserData.id);
      if (!userToUpdate) return;

      let updatedAddresses = (userToUpdate.addresses || []).filter(addr => addr.id !== addressId);
      
      const wasDefault = userToUpdate.addresses?.find(a => a.id === addressId)?.isDefault;
      if(wasDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUserData.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);
      
      toast({ title: "Address Deleted", description: "The address has been removed." });
  }, [toast, persistUsers, persistCurrentUser]);

  const setDefaultAddress = useCallback((addressId: string) => {
      const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
      const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
      const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
    
      if (!currentUserData) return;
      
      let userToUpdate = currentUsers.find(u => u.id === currentUserData.id);
      if (!userToUpdate) return;
      
      const updatedAddresses = (userToUpdate.addresses || []).map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
      }));

      const updatedUser = { ...userToUpdate, addresses: updatedAddresses };
      
      const newUsers = currentUsers.map(u => u.id === currentUserData.id ? updatedUser : u);
      persistUsers(newUsers);
      persistCurrentUser(updatedUser);

      toast({ title: "Default Address Updated", description: "Your default address has been set." });
  }, [toast, persistUsers, persistCurrentUser]);
  
  const deleteUser = useCallback(() => {
    const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
    const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;

    if (!currentUserData) return;

    const updatedUsers = currentUsers.filter(u => u.id !== currentUserData.id);
    persistUsers(updatedUsers);

    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    });

    logout();
  }, [logout, toast, persistUsers]);

  const deleteUserById = useCallback((userId: string) => {
    const currentUserFromStorage = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const currentUserData: User | null = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;

    if (currentUserData?.id === userId) {
        toast({
            title: "Action Not Allowed",
            description: "You cannot delete your own account from the customer management panel.",
            variant: "destructive",
        });
        return;
    }
    
    const usersFromStorage = window.localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers: User[] = usersFromStorage ? JSON.parse(usersFromStorage) : [];

    const userToDelete = currentUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = currentUsers.filter(u => u.id !== userId);
    persistUsers(updatedUsers);

    toast({
      title: "Customer Deleted",
      description: `The account for ${userToDelete.name} has been deleted.`,
    });
  }, [toast, persistUsers]);

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
