"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { BrandInfo } from '@/lib/types';
import { brandInfo as mockBrandInfo } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brandInfo: BrandInfo;
  updateBrandInfo: (newInfo: Partial<BrandInfo>) => void;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandInfo, setBrandInfo] = useState<BrandInfo>(mockBrandInfo);
  const { toast } = useToast();

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
