
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
    <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-4 text-center">
            <Megaphone className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm">
                <span className="font-semibold">{activePromotion.title}</span>
                {activePromotion.couponCode && (
                    <span className="ml-2 font-bold">Use Code: {activePromotion.couponCode}</span>
                )}
            </p>
             <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 -mr-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                onClick={() => setIsVisible(false)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
}
