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


  const updateBrandInfo = useCallback((newInfo: Partial<BrandInfo>) => {
    setBrandInfo(prevInfo => ({ ...prevInfo, ...newInfo }));
    toast({
      title: "Brand Information Updated",
      description: "Your brand details have been successfully saved.",
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
