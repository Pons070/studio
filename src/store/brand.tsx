
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { BrandInfo, DeliveryArea } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from 'next-themes';

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
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { theme: activeTheme, systemTheme } = useTheme();

  const fetchBrandInfo = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/brand');
        const data = await response.json();
        if (data.success) {
            setBrandInfo(data.brandInfo);
        } else {
            toast({ title: 'Error', description: 'Could not fetch brand information.', variant: 'destructive' });
        }
    } catch (error) {
        console.error("Failed to fetch brand info", error);
        toast({ title: 'Network Error', description: 'Could not connect to the server.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchBrandInfo();
  }, [fetchBrandInfo]);

  useEffect(() => {
    if (brandInfo?.theme) {
      const root = document.documentElement;
      const theme = brandInfo.theme;
      const effectiveTheme = activeTheme === 'system' ? systemTheme : activeTheme;

      // Only apply custom brand colors in light mode to avoid overriding dark mode styles.
      if (effectiveTheme === 'light') {
        if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor);
        if (theme.backgroundColor) root.style.setProperty('--background', theme.backgroundColor);
        if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
        if (theme.cardColor) root.style.setProperty('--card', theme.cardColor);
      } else {
        // When in dark mode, remove the inline styles so the .dark CSS from globals.css can take over.
        root.style.removeProperty('--primary');
        root.style.removeProperty('--background');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--card');
      }

      // These properties are theme-agnostic and can be applied in both modes.
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
  }, [brandInfo?.theme, activeTheme, systemTheme]);

  const updateBrandInfoOnServer = useCallback(async (updatedInfo: BrandInfo) => {
    try {
        const response = await fetch('/api/brand', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedInfo)
        });
        const data = await response.json();
        if (data.success) {
            setBrandInfo(data.brandInfo);
            return true;
        } else {
            throw new Error(data.message || 'Failed to update brand info.');
        }
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
    <BrandContext.Provider value={{ brandInfo: brandInfo!, isLoading, updateBrandInfo, blockCustomer, unblockCustomer, addDeliveryArea, updateDeliveryArea, deleteDeliveryArea }}>
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
