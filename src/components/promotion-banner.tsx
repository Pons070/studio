
"use client";

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePromotions } from '@/store/promotions';
import { useAuth } from '@/store/auth';
import { useOrders } from '@/store/orders';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Promotion } from '@/lib/types';

export function PromotionBanner() {
  const { promotions } = usePromotions();
  const { isAuthenticated, currentUser } = useAuth();
  const { orders } = useOrders();
  const [isVisible, setIsVisible] = useState(true);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const pathname = usePathname();

  const customerType = useMemo(() => {
    if (!isAuthenticated || !currentUser) return 'new';
    const hasOrders = orders.some(order => order.customerId === currentUser.id);
    return hasOrders ? 'existing' : 'new';
  }, [isAuthenticated, currentUser, orders]);

  useEffect(() => {
    const isDateActive = (promo: Promotion) => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (promo.startDate && promo.startDate > todayStr) {
            return false; // Not started yet
        }
        if (promo.endDate && promo.endDate < todayStr) {
            return false; // Expired
        }
        return true;
    };

    const isDayActive = (promo: Promotion) => {
        if (!promo.activeDays || promo.activeDays.length === 0) {
            return true; // Active on all days if not specified
        }
        const today = new Date().getDay(); // Sunday - 0, Monday - 1, ...
        return promo.activeDays.includes(today);
    }

    const activePromos = promotions.filter(p => p.isActive && isDateActive(p) && isDayActive(p));
    
    const specificPromotion = activePromos.find(p => p.targetAudience === customerType);
    if (specificPromotion) {
        setActivePromotion(specificPromotion);
        return;
    }

    const allUsersPromotion = activePromos.find(p => p.targetAudience === 'all');
    setActivePromotion(allUsersPromotion || null);

  }, [promotions, customerType, isAuthenticated, currentUser, orders]);
  
  if (pathname.startsWith('/admin') || !activePromotion || !isVisible) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <Alert className="bg-accent/50 border-accent/50 text-accent-foreground relative pr-10">
        <Megaphone className="h-4 w-4 text-accent" />
        <AlertTitle className="font-bold text-accent">{activePromotion.title}</AlertTitle>
        <AlertDescription>
          {activePromotion.description}
        </AlertDescription>
         <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-accent/50 hover:text-accent hover:bg-transparent"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
      </Alert>
    </div>
  );
}
