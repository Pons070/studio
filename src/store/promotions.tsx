
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Promotion } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { addPromotionToStore, deletePromotionFromStore, getPromotions, updatePromotionInStore } from '@/lib/promotion-store';

type PromotionContextType = {
  promotions: Promotion[];
  isLoading: boolean;
  addPromotion: (promotion: Omit<Promotion, 'id'>) => Promise<void>;
  updatePromotion: (promotion: Promotion) => Promise<void>;
  deletePromotion: (promotionId: string) => Promise<void>;
};

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>(getPromotions());
  const { toast } = useToast();

  const addPromotion = useCallback(async (promotionData: Omit<Promotion, 'id'>) => {
    const newPromo: Promotion = { ...promotionData, id: `PROMO-${Date.now()}` };
    addPromotionToStore(newPromo);
    setPromotions(getPromotions());
    toast({ title: "Promotion Added" });
  }, [toast]);

  const updatePromotion = useCallback(async (promotionData: Promotion) => {
    updatePromotionInStore(promotionData);
    setPromotions(getPromotions());
    toast({ title: "Promotion Updated" });
  }, [toast]);

  const deletePromotion = useCallback(async (promotionId: string) => {
    deletePromotionFromStore(promotionId);
    setPromotions(getPromotions());
    toast({ title: "Promotion Deleted" });
  }, [toast]);

  return (
    <PromotionContext.Provider value={{ promotions, isLoading: false, addPromotion, updatePromotion, deletePromotion }}>
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
