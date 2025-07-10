
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Order, CartItem, Address, UpdateRequest } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';
import { useBrand } from './brand';
import { format } from 'date-fns';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { addOrderToStore, getOrders, updateOrderInStore } from '@/lib/order-store';

type OrderContextType = {
  orders: Order[];
  isLoading: boolean;
  addOrder: (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => void;
  addReviewToOrder: (orderId: string, reviewId: string) => void;
  removeReviewIdFromOrder: (orderId: string) => void;
  addUpdateRequest: (orderId: string, message: string, from: 'customer' | 'admin') => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { brandInfo } = useBrand();
  const { toast } = useToast();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  // Load orders directly and filter based on user
  const allOrders = getOrders();
  const [orders, setOrders] = useState<Order[]>(() => {
    if (isAdminPath) return allOrders;
    if (currentUser) return allOrders.filter(o => o.customerId === currentUser.id);
    return [];
  });

  useEffect(() => {
    if (isAdminPath) {
      setOrders(getOrders());
    } else if (currentUser) {
      setOrders(getOrders().filter(o => o.customerId === currentUser.id));
    } else {
      setOrders([]);
    }
  }, [currentUser, isAdminPath]);

  const refreshOrders = useCallback(() => {
    if (isAdminPath) {
      setOrders(getOrders());
    } else if (currentUser) {
      setOrders(getOrders().filter(o => o.customerId === currentUser.id));
    } else {
      setOrders([]);
    }
  }, [isAdminPath, currentUser]);

  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return undefined;
    }
    
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        address: deliveryAddress,
        orderDate: format(new Date(), 'yyyy-MM-dd'),
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        pickupTime,
        status: 'Pending',
        total,
        items,
        cookingNotes: cookingNotes || undefined,
        updateRequests: [],
        appliedCoupon,
        discountAmount,
        deliveryFee,
    };

    addOrderToStore(newOrder);
    refreshOrders();

    toast({ title: "Pre-Order Placed!", variant: "success" });

    // Send notifications without waiting for them to complete
    Promise.all([
      sendOrderNotification({
        order: newOrder,
        notificationType: 'customerConfirmation',
        customerEmail: currentUser.email,
        adminEmail: brandInfo?.adminEmail || 'admin@example.com',
      }),
      sendOrderNotification({
        order: newOrder,
        notificationType: 'adminNotification',
        customerEmail: currentUser.email,
        adminEmail: brandInfo?.adminEmail || 'admin@example.com',
      }),
    ]).catch(error => {
      // Log errors but don't block the response to the user
      console.error("Failed to send one or more order notifications:", error);
    });

    return newOrder;
  }, [toast, currentUser, brandInfo, refreshOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => {
    const updates: Partial<Order> = { status };
    if (status === 'Cancelled') {
        updates.cancellationDate = format(new Date(), 'yyyy-MM-dd');
        updates.cancellationReason = reason;
        updates.cancelledBy = cancelledBy;
        updates.cancellationAction = cancellationAction;
    }
    
    const updatedOrder = updateOrderInStore(orderId, updates);
    refreshOrders();
    
    if (updatedOrder && status === 'Cancelled' && customerEmail && brandInfo) {
        await sendOrderNotification({
            order: updatedOrder, notificationType: 'customerCancellation',
            customerEmail: customerEmail, adminEmail: brandInfo.adminEmail
        });
    }
    toast({ title: "Order Status Updated" });
}, [toast, brandInfo, refreshOrders]);

  const addReviewToOrder = useCallback((orderId: string, reviewId: string) => {
    updateOrderInStore(orderId, { reviewId });
    refreshOrders();
  }, [refreshOrders]);

  const removeReviewIdFromOrder = useCallback((orderId: string) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if(currentOrder) {
      const { reviewId, ...rest } = currentOrder;
      updateOrderInStore(orderId, rest);
      refreshOrders();
    }
  }, [orders, refreshOrders]);

  const addUpdateRequest = useCallback((orderId: string, message: string, from: 'customer' | 'admin') => {
    const orderToUpdate = getOrders().find(o => o.id === orderId);
    if (!orderToUpdate || !message.trim()) return;

    const newRequest: UpdateRequest = {
        id: `MSG-${Date.now()}`, message, from, timestamp: new Date().toISOString()
    };
    const updatedRequests = [...(orderToUpdate.updateRequests || []), newRequest];

    updateOrderInStore(orderId, { updateRequests: updatedRequests });
    refreshOrders();
    toast({ title: "Message Sent!" });
  }, [refreshOrders, toast]);

  return (
    <OrderContext.Provider value={{ orders, isLoading: false, addOrder, updateOrderStatus, addReviewToOrder, removeReviewIdFromOrder, addUpdateRequest }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within a OrderProvider');
  }
  return context;
}
