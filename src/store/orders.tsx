
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Order, CartItem, Address, UpdateRequest } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';
import { useBrand } from './brand';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth();
  const { brandInfo } = useBrand();
  const { toast } = useToast();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    let url = '/api/orders';
    if (isAdminPath) {
      url = '/api/admin/orders';
    } else if (isAuthenticated && currentUser) {
      url = `/api/orders?userId=${currentUser.id}`;
    } else {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not load orders.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isAuthenticated, isAdminPath, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return undefined;
    }
    
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, total, pickupDate, pickupTime, 
          customerId: currentUser.id, 
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          address: deliveryAddress,
          cookingNotes, appliedCoupon, discountAmount, deliveryFee
        }),
      });
      if (!response.ok) throw new Error('Failed to place order');
      const { order: newOrder } = await response.json();
      
      fetchOrders();
      toast({ title: "Pre-Order Placed!", variant: "success" });
      return newOrder;
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
      return undefined;
    }
  }, [toast, currentUser, fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => {
    const updates: Partial<Order> = { status };
    if (status === 'Cancelled') {
        updates.cancellationDate = new Date().toISOString().split('T')[0];
        updates.cancellationReason = reason;
        updates.cancelledBy = cancelledBy;
        updates.cancellationAction = cancellationAction;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, ...updates }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        const { order: updatedOrder } = await response.json();

        if (updatedOrder && status === 'Cancelled' && customerEmail && brandInfo) {
          await sendOrderNotification({
              order: updatedOrder, notificationType: 'customerCancellation',
              customerEmail: customerEmail, adminEmail: brandInfo.adminEmail
          });
        }

        fetchOrders();
        toast({ title: "Order Status Updated" });
    } catch (error) {
         toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
}, [toast, brandInfo, fetchOrders]);

  const addReviewToOrder = useCallback(async (orderId: string, reviewId: string) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reviewId }),
    });
    fetchOrders();
  }, [fetchOrders]);

  const removeReviewIdFromOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const { reviewId, ...rest } = order;
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reviewId: null }),
    });
    fetchOrders();
  }, [orders, fetchOrders]);

  const addUpdateRequest = useCallback(async (orderId: string, message: string, from: 'customer' | 'admin') => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate || !message.trim()) return;

    const newRequest: UpdateRequest = {
        id: `MSG-${Date.now()}`, message, from, timestamp: new Date().toISOString()
    };
    const updatedRequests = [...(orderToUpdate.updateRequests || []), newRequest];
    
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, updateRequests: updatedRequests }),
    });
    
    fetchOrders();
    toast({ title: "Message Sent!" });
  }, [orders, fetchOrders, toast]);

  return (
    <OrderContext.Provider value={{ orders, isLoading, addOrder, updateOrderStatus, addReviewToOrder, removeReviewIdFromOrder, addUpdateRequest }}>
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

