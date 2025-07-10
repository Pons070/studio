
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Promotion } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type PromotionContextType = {
  promotions: Promotion[];
  isLoading: boolean;
  addPromotion: (promotion: Omit<Promotion, 'id'>) => Promise<void>;
  updatePromotion: (promotion: Promotion) => Promise<void>;
  deletePromotion: (promotionId: string) => Promise<void>;
};

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/promotions');
      if (!response.ok) throw new Error('Failed to load promotions');
      const data = await response.json();
      setPromotions(data.promotions);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const addPromotion = useCallback(async (promotionData: Omit<Promotion, 'id'>) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });
      if (!response.ok) throw new Error('Failed to add promotion');
      fetchPromotions();
      toast({ title: "Promotion Added" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchPromotions]);

  const updatePromotion = useCallback(async (promotionData: Promotion) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });
      if (!response.ok) throw new Error('Failed to update promotion');
      fetchPromotions();
      toast({ title: "Promotion Updated" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchPromotions]);

  const deletePromotion = useCallback(async (promotionId: string) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promotionId }),
      });
      if (!response.ok) throw new Error('Failed to delete promotion');
      fetchPromotions();
      toast({ title: "Promotion Deleted" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchPromotions]);

  return (
    <PromotionContext.Provider value={{ promotions, isLoading, addPromotion, updatePromotion, deletePromotion }}>
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotions() {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotions must be used within a PromotionProvider');
  }
  return context;
}
