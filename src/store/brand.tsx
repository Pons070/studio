

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { BrandInfo } from '@/lib/types';
import { brandInfo as mockBrandInfo } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brandInfo: BrandInfo;
  updateBrandInfo: (newInfo: Partial<BrandInfo>) => void;
  blockCustomer: (email: string) => void;
  unblockCustomer: (email: string) => void;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-brand';

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandInfo, setBrandInfo] = useState<BrandInfo>(mockBrandInfo);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setBrandInfo(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load brand info from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brandInfo));
      } catch (error) {
        console.error("Failed to save brand info to localStorage", error);
      }
    }
  }, [brandInfo, isMounted]);

  useEffect(() => {
    if (isMounted && brandInfo.theme) {
      const root = document.documentElement;
      const theme = brandInfo.theme;
      
      if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor);
      if (theme.backgroundColor) root.style.setProperty('--background', theme.backgroundColor);
      if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
      if (theme.cardColor) root.style.setProperty('--card', theme.cardColor);
      if (theme.cardOpacity !== undefined) root.style.setProperty('--card-alpha', String(theme.cardOpacity));
      if (theme.borderRadius !== undefined) root.style.setProperty('--radius', `${theme.borderRadius}rem`);

      if (theme.backgroundImageUrl) {
        document.body.style.backgroundImage = `url(${theme.backgroundImageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = 'none';
      }
    }
  }, [brandInfo.theme, isMounted]);


  const updateBrandInfo = useCallback((newInfo: Partial<BrandInfo>) => {
    setBrandInfo(prevInfo => ({ ...prevInfo, ...newInfo }));
    toast({
      title: "Brand Information Updated",
      description: "Your brand details and theme have been successfully saved.",
    });
  }, [toast]);

  const blockCustomer = useCallback((email: string) => {
    setBrandInfo(prevInfo => {
        const currentBlocked = prevInfo.blockedCustomerEmails || [];
        if (currentBlocked.includes(email)) {
            return prevInfo; // Already blocked
        }
        const newBlockedEmails = [...currentBlocked, email];
        toast({
            title: "Customer Blocked",
            description: `Future orders and access for ${email} will be prevented.`,
            variant: "destructive"
        });
        return { ...prevInfo, blockedCustomerEmails: newBlockedEmails };
    });
  }, [toast]);

  const unblockCustomer = useCallback((email: string) => {
      setBrandInfo(prevInfo => {
          const currentBlocked = prevInfo.blockedCustomerEmails || [];
          const newBlockedEmails = currentBlocked.filter(e => e !== email);
          toast({
              title: "Customer Unblocked",
              description: `${email} can now access the store and place orders again.`,
          });
          return { ...prevInfo, blockedCustomerEmails: newBlockedEmails };
      });
  }, [toast]);

  return (
    <BrandContext.Provider value={{ brandInfo, updateBrandInfo, blockCustomer, unblockCustomer }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
