
"use client";

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePromotions } from '@/store/promotions';
import { useAuth } from '@/store/auth';
import { useOrders } from '@/store/orders';
import { Megaphone, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Promotion } from '@/lib/types';

export function PromotionBanner() {
  const { promotions } = usePromotions();
  const { isAuthenticated, currentUser } = useAuth();
  const { orders } = useOrders();
  const [isVisible, setIsVisible] = useState(true);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const customerType = useMemo(() => {
    if (!isAuthenticated || !currentUser) return 'new';
    const hasOrders = orders.some(order => order.customerId === currentUser.id);
    return hasOrders ? 'existing' : 'new';
  }, [isAuthenticated, currentUser, orders]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

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

  }, [promotions, customerType, isAuthenticated, currentUser, orders, isClient]);
  
  if (pathname.startsWith('/admin') || !activePromotion || !isVisible || !isClient) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 w-full max-w-sm">
        <div className="bg-card/90 backdrop-blur-sm p-3.5 rounded-lg shadow-lg border flex items-center gap-3 animate-in fade-in-0 slide-in-from-top-4">
            <Megaphone className="h-5 w-5 text-primary shrink-0" />
            <p className="flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-card-foreground">{activePromotion.title}</span>
                {activePromotion.couponCode && (
                    <span className="ml-1 font-semibold text-primary">Code: {activePromotion.couponCode}</span>
                )}
            </p>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setIsVisible(false)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
}
