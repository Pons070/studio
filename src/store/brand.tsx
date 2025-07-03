"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { BrandInfo } from '@/lib/types';
import { brandInfo as mockBrandInfo } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brandInfo: BrandInfo;
  updateBrandInfo: (newInfo: Partial<BrandInfo>) => void;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-brand';

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandInfo, setBrandInfo] = useState<BrandInfo>(mockBrandInfo);
  const { toast } = useToast();

  useEffect(() => {
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
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brandInfo));
    } catch (error) {
      console.error("Failed to save brand info to localStorage", error);
    }
  }, [brandInfo]);

  useEffect(() => {
    if (brandInfo.theme) {
      const root = document.documentElement;
      const theme = brandInfo.theme;
      
      if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor);
      if (theme.backgroundColor) root.style.setProperty('--background', theme.backgroundColor);
      if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
      if (theme.fontHeadline) root.style.setProperty('--font-headline', theme.fontHeadline);
      if (theme.fontBody) root.style.setProperty('--font-body', theme.fontBody);
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
  }, [brandInfo.theme]);


  const updateBrandInfo = useCallback((newInfo: Partial<BrandInfo>) => {
    setBrandInfo(prevInfo => ({ ...prevInfo, ...newInfo }));
    toast({
      title: "Brand Information Updated",
      description: "Your brand details and theme have been successfully saved.",
    });
  }, [toast]);

  return (
    <BrandContext.Provider value={{ brandInfo, updateBrandInfo }}>
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
