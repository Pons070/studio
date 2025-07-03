
"use client";

import { useState, useMemo } from 'react';
import { usePromotions } from '@/store/promotions';
import { useAuth } from '@/store/auth';
import { useOrders } from '@/store/orders';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone, X } from 'lucide-react';
import { Button } from './ui/button';

export function PromotionBanner() {
  const { promotions } = usePromotions();
  const { isAuthenticated, currentUser } = useAuth();
  const { orders } = useOrders();
  const [isVisible, setIsVisible] = useState(true);

  const customerType = useMemo(() => {
    if (!isAuthenticated || !currentUser) return 'new';
    const hasOrders = orders.some(order => order.customerId === currentUser.id);
    return hasOrders ? 'existing' : 'new';
  }, [isAuthenticated, currentUser, orders]);

  const activePromotion = useMemo(() => {
    const activePromos = promotions.filter(p => p.isActive);
    
    // Find a promotion specifically for the customer type
    const specificPromotion = activePromos.find(p => p.targetAudience === customerType);
    if (specificPromotion) return specificPromotion;

    // Fallback to a promotion for 'all' users
    const allUsersPromotion = activePromos.find(p => p.targetAudience === 'all');
    return allUsersPromotion || null;

  }, [promotions, customerType]);
  
  if (!activePromotion || !isVisible) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <Alert className="bg-accent/20 border-accent/50 text-accent-foreground relative pr-10">
        <Megaphone className="h-4 w-4 text-accent" />
        <AlertTitle className="font-bold text-accent">{activePromotion.title}</AlertTitle>
        <AlertDescription>
          {activePromotion.description}
        </AlertDescription>
         <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-accent/70 hover:text-accent hover:bg-transparent"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
      </Alert>
    </div>
  );
}
