
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { BrandInfo, DeliveryArea } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brandInfo: BrandInfo | null;
  isLoading: boolean;
  updateBrandInfo: (newInfo: BrandInfo) => Promise<void>;
  blockCustomer: (email: string) => Promise<void>;
  unblockCustomer: (email: string) => Promise<void>;
  addDeliveryArea: (area: Omit<DeliveryArea, 'id'>) => Promise<void>;
  updateDeliveryArea: (area: DeliveryArea) => Promise<void>;
  deleteDeliveryArea: (areaId: string) => Promise<void>;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandInfo, setBrandInfoState] = useState<BrandInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBrandInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/brand');
      if (!response.ok) {
        throw new Error('Failed to fetch brand information');
      }
      const data = await response.json();
      setBrandInfoState(data.brandInfo);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load brand information.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBrandInfo();
  }, [fetchBrandInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const styleId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    const theme = brandInfo?.theme;

    if (!theme) {
        styleTag.innerHTML = '';
        return;
    }

    const css = `
      :root {
        ${theme.primaryColor ? `--primary: ${theme.primaryColor};` : ''}
        ${theme.backgroundColor ? `--background: ${theme.backgroundColor};` : ''}
        ${theme.accentColor ? `--accent: ${theme.accentColor};` : ''}
        ${theme.cardColor ? `--card: ${theme.cardColor};` : ''}
        ${theme.cardOpacity !== undefined ? `--card-alpha: ${theme.cardOpacity};` : ''}
        ${theme.borderRadius !== undefined ? `--radius: ${theme.borderRadius}rem;` : ''}
        ${theme.backgroundImageUrl ? `--background-image: url(${theme.backgroundImageUrl});` : '--background-image: none;'}
      }
    `;
    styleTag.innerHTML = css;
    
  }, [brandInfo?.theme]);

  const updateBrandInfoOnServer = useCallback(async (updatedInfo: BrandInfo) => {
    try {
        const response = await fetch('/api/brand', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedInfo),
        });
        if (!response.ok) throw new Error('Failed to update brand info on server');
        setBrandInfoState(updatedInfo);
        return true;
    } catch (error) {
        console.error("Failed to update brand info on server", error);
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
        return false;
    }
  }, [toast]);

  const updateBrandInfo = useCallback(async (newInfo: BrandInfo) => {
    const success = await updateBrandInfoOnServer(newInfo);
    if (success) {
        toast({ title: "Brand Information Updated" });
    }
  }, [updateBrandInfoOnServer, toast]);

  const blockCustomer = useCallback(async (email: string) => {
    if (!brandInfo) return;
    const currentBlocked = brandInfo.blockedCustomerEmails || [];
    if (currentBlocked.includes(email)) return;
    const newBlockedEmails = [...currentBlocked, email];
    const success = await updateBrandInfoOnServer({ ...brandInfo, blockedCustomerEmails: newBlockedEmails });
    if (success) {
        toast({ title: "Customer Blocked", variant: "destructive" });
    }
  }, [brandInfo, updateBrandInfoOnServer, toast]);

  const unblockCustomer = useCallback(async (email: string) => {
      if (!brandInfo) return;
      const currentBlocked = brandInfo.blockedCustomerEmails || [];
      const newBlockedEmails = currentBlocked.filter(e => e !== email);
      const success = await updateBrandInfoOnServer({ ...brandInfo, blockedCustomerEmails: newBlockedEmails });
      if (success) {
          toast({ title: "Customer Unblocked" });
      }
  }, [brandInfo, updateBrandInfoOnServer, toast]);

  const addDeliveryArea = useCallback(async (areaData: Omit<DeliveryArea, 'id'>) => {
    if (!brandInfo) return;
    const newArea: DeliveryArea = { ...areaData, id: `DA-${Date.now()}` };
    const updatedAreas = [...(brandInfo.deliveryAreas || []), newArea];
    const success = await updateBrandInfoOnServer({ ...brandInfo, deliveryAreas: updatedAreas });
    if (success) {
        toast({ title: 'Delivery Area Added' });
    }
  }, [brandInfo, updateBrandInfoOnServer, toast]);

  const updateDeliveryArea = useCallback(async (areaData: DeliveryArea) => {
    if (!brandInfo) return;
    const updatedAreas = (brandInfo.deliveryAreas || []).map(area => area.id === areaData.id ? areaData : area);
    const success = await updateBrandInfoOnServer({ ...brandInfo, deliveryAreas: updatedAreas });
    if (success) {
        toast({ title: 'Delivery Area Updated' });
    }
  }, [brandInfo, updateBrandInfoOnServer, toast]);

  const deleteDeliveryArea = useCallback(async (areaId: string) => {
    if (!brandInfo) return;
    const updatedAreas = (brandInfo.deliveryAreas || []).filter(area => area.id !== areaId);
    const success = await updateBrandInfoOnServer({ ...brandInfo, deliveryAreas: updatedAreas });
    if (success) {
        toast({ title: 'Delivery Area Removed' });
    }
  }, [brandInfo, updateBrandInfoOnServer, toast]);

  return (
    <BrandContext.Provider value={{ brandInfo, isLoading, updateBrandInfo, blockCustomer, unblockCustomer, addDeliveryArea, updateDeliveryArea, deleteDeliveryArea }}>
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

