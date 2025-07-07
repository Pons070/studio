

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { BrandInfo, DeliveryArea } from '@/lib/types';
import { brandInfo as mockBrandInfo } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brandInfo: BrandInfo;
  updateBrandInfo: (newInfo: Partial<BrandInfo>) => void;
  blockCustomer: (email: string) => void;
  unblockCustomer: (email: string) => void;
  addDeliveryArea: (area: Omit<DeliveryArea, 'id'>) => void;
  updateDeliveryArea: (area: DeliveryArea) => void;
  deleteDeliveryArea: (areaId: string) => void;
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

  const addDeliveryArea = useCallback((areaData: Omit<DeliveryArea, 'id'>) => {
    setBrandInfo(prevInfo => {
      const newArea: DeliveryArea = { ...areaData, id: `DA-${Date.now()}` };
      const updatedAreas = [...(prevInfo.deliveryAreas || []), newArea];
      return { ...prevInfo, deliveryAreas: updatedAreas };
    });
    toast({ title: 'Delivery Area Added', description: `Added new delivery area for pincode ${areaData.pincode}.` });
  }, [toast]);

  const updateDeliveryArea = useCallback((areaData: DeliveryArea) => {
    setBrandInfo(prevInfo => {
      const updatedAreas = (prevInfo.deliveryAreas || []).map(area => area.id === areaData.id ? areaData : area);
      return { ...prevInfo, deliveryAreas: updatedAreas };
    });
    toast({ title: 'Delivery Area Updated', description: `Details for pincode ${areaData.pincode} updated.` });
  }, [toast]);

  const deleteDeliveryArea = useCallback((areaId: string) => {
    setBrandInfo(prevInfo => {
      const updatedAreas = (prevInfo.deliveryAreas || []).filter(area => area.id !== areaId);
      return { ...prevInfo, deliveryAreas: updatedAreas };
    });
    toast({ title: 'Delivery Area Removed', description: 'The delivery area has been deleted.' });
  }, [toast]);


  return (
    <BrandContext.Provider value={{ brandInfo, updateBrandInfo, blockCustomer, unblockCustomer, addDeliveryArea, updateDeliveryArea, deleteDeliveryArea }}>
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
