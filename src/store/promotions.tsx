
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Promotion } from '@/lib/types';
import { promotions as mockPromotions } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type PromotionContextType = {
  promotions: Promotion[];
  addPromotion: (promotion: Omit<Promotion, 'id' | 'isActive'>) => void;
  updatePromotion: (promotion: Promotion) => void;
  deletePromotion: (promotionId: string) => void;
};

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-promotions';

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setPromotions(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load promotions from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(promotions));
    } catch (error) {
      console.error("Failed to save promotions to localStorage", error);
    }
  }, [promotions]);

  const addPromotion = useCallback((promotionData: Omit<Promotion, 'id' | 'isActive'>) => {
    const newPromotion: Promotion = {
      ...promotionData,
      id: `PROMO-${Date.now()}`,
      isActive: true,
    };
    setPromotions(prev => [newPromotion, ...prev]);
    toast({
      title: "Promotion Added",
      description: `The promotion "${newPromotion.title}" has been created.`,
    });
  }, [toast]);

  const updatePromotion = useCallback((promotionData: Promotion) => {
    setPromotions(prev =>
      prev.map(p => (p.id === promotionData.id ? promotionData : p))
    );
    toast({
      title: "Promotion Updated",
      description: `The promotion "${promotionData.title}" has been updated.`,
    });
  }, [toast]);

  const deletePromotion = useCallback((promotionId: string) => {
    setPromotions(prev => prev.filter(p => p.id !== promotionId));
    toast({
      title: "Promotion Deleted",
      description: `The promotion has been removed.`,
    });
  }, [toast]);

  return (
    <PromotionContext.Provider value={{ promotions, addPromotion, updatePromotion, deletePromotion }}>
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
