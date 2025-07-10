
"use client";

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePromotions } from '@/store/promotions';
import { useAuth } from '@/store/auth';
import { useOrders } from '@/store/orders';
import { X } from 'lucide-react';
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

  const promotionText = (
    <span className="text-sm">
        <span className="font-semibold">{activePromotion.title}</span>
        {activePromotion.couponCode && (
            <span className="ml-2 font-bold">Use Code: {activePromotion.couponCode}</span>
        )}
    </span>
  );

  return (
    <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-10 items-center justify-between">
                <div className="flex flex-1 items-center gap-4 overflow-hidden">
                    <div className="flex animate-marquee whitespace-nowrap">
                        <span className="mx-4">{promotionText}</span>
                        <span className="mx-4">{promotionText}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  );
}
