
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
        const data = await response.json();
        if (data.success) {
            setPromotions(data.promotions);
        } else {
            toast({ title: 'Error', description: 'Could not fetch promotions.', variant: 'destructive' });
        }
    } catch (error) {
        console.error("Failed to fetch promotions", error);
        toast({ title: 'Network Error', description: 'Could not connect to server for promotions.', variant: 'destructive' });
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
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      
      setPromotions(prev => [result.promotion, ...prev]);
      toast({ title: "Promotion Added" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast]);

  const updatePromotion = useCallback(async (promotionData: Promotion) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      
      setPromotions(prev => prev.map(p => (p.id === promotionData.id ? result.promotion : p)));
      toast({ title: "Promotion Updated" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast]);

  const deletePromotion = useCallback(async (promotionId: string) => {
    try {
      const response = await fetch('/api/promotions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promotionId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      
      setPromotions(prev => prev.filter(p => p.id !== promotionId));
      toast({ title: "Promotion Deleted" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast]);

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
