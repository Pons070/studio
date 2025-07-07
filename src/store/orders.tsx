
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Order, CartItem, Address, UpdateRequest } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';
import { format } from 'date-fns';
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
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser && !isAdminPath) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      const endpoint = isAdminPath ? '/api/admin/orders' : `/api/orders?userId=${currentUser?.id}`;
      
      try {
        // Admins need a current user to be logged in, even if the API doesn't use the ID.
        // For customer paths, we definitely need a user.
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          toast({ title: "Error", description: "Could not fetch orders.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({ title: "Network Error", description: "Failed to connect to the server for orders.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [currentUser, toast, isAdminPath]);

  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return undefined;
    }
    
    const orderInput = {
        customerId: currentUser.id, customerName: currentUser.name, customerEmail: currentUser.email,
        address: deliveryAddress, pickupDate: format(pickupDate, 'yyyy-MM-dd'), pickupTime, total, items,
        cookingNotes: cookingNotes || undefined, updateRequests: [], appliedCoupon, discountAmount, deliveryFee,
    };

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderInput),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        const newOrder: Order = result.order;
        setOrders(prev => [newOrder, ...prev]);
        toast({ title: "Pre-Order Placed!", variant: "success" });
        return newOrder;
    } catch (error) {
        toast({ title: 'Order Failed', description: (error as Error).message, variant: 'destructive' });
        return undefined;
    }
  }, [toast, currentUser]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => {
    const updates: Partial<Order> = { status };
    if (status === 'Cancelled') {
        updates.cancellationDate = format(new Date(), 'yyyy-MM-dd');
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
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        const updatedOrder: Order = result.order;
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        
        if (status === 'Cancelled' && customerEmail) {
            await sendOrderNotification({
                order: updatedOrder, notificationType: 'customerCancellation',
                customerEmail: customerEmail, adminEmail: 'sangkar111@gmail.com'
            });
        }
        toast({ title: "Order Status Updated" });
    } catch (error) {
        toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
}, [toast]);

  const addReviewToOrder = useCallback(async (orderId: string, reviewId: string) => {
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, reviewId }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewId } : o));
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  }, [toast]);

  const removeReviewIdFromOrder = useCallback(async (orderId: string) => {
     try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, reviewId: undefined }),
        });
        if (!response.ok) throw new Error('Failed to unlink review');
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewId: undefined } : o));
    } catch (error) {
        console.error("Failed to unlink review from order:", (error as Error).message);
    }
  }, []);

  const addUpdateRequest = useCallback(async (orderId: string, message: string, from: 'customer' | 'admin') => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate || !message.trim()) return;

    const newRequest: UpdateRequest = {
        id: `MSG-${Date.now()}`, message, from, timestamp: new Date().toISOString()
    };
    const updatedRequests = [...(orderToUpdate.updateRequests || []), newRequest];

    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, updateRequests: updatedRequests }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        setOrders(prev => prev.map(o => (o.id === orderId ? result.order : o)));
        toast({ title: "Message Sent!" });
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  }, [orders, toast]);

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
