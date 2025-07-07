

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/orders?userId=${currentUser.id}`);
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({ title: "Network Error", description: "Failed to connect to the server for your orders.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [currentUser, toast]);

  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return undefined;
    }
    
    const orderInput = {
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        address: deliveryAddress,
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        pickupTime: pickupTime,
        total: total,
        items: items,
        cookingNotes: cookingNotes || undefined,
        updateRequests: [],
        appliedCoupon: appliedCoupon,
        discountAmount: discountAmount,
        deliveryFee: deliveryFee,
    };

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderInput),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({
                title: 'Order Failed',
                description: result.message || 'There was an error placing your order.',
                variant: 'destructive',
            });
            return undefined;
        }

        const newOrder: Order = result.order;

        setOrders(prevOrders => [newOrder, ...prevOrders]);

        toast({
            title: "Pre-Order Placed!",
            description: "Your order has been successfully submitted. You will receive an email confirmation shortly.",
            variant: "success",
        });
        
        return newOrder;

    } catch (error) {
        console.error("Failed to call create-order API:", error);
        toast({
            title: 'Network Error',
            description: 'Could not connect to the server to place your order.',
            variant: 'destructive',
        });
        return undefined;
    }
  }, [toast, currentUser]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
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

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to update order.", variant: "destructive" });
            return;
        }

        const updatedOrder: Order = result.order;
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        
        if (status === 'Cancelled' && customerEmail) {
            try {
                await sendOrderNotification({
                    order: updatedOrder,
                    notificationType: 'customerCancellation',
                    customerEmail: customerEmail,
                    adminEmail: 'sangkar111@gmail.com'
                });
                toast({
                    title: "Order Cancelled",
                    description: `Order #${orderId} has been cancelled and a confirmation email has been sent.`,
                });
            } catch (error) {
                console.error("Failed to send cancellation email:", error);
                toast({
                    title: "Order Cancelled",
                    description: `Order #${orderId} has been cancelled, but we failed to send a confirmation email.`,
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: "Order Status Updated",
                description: `Order #${orderId} has been updated to "${status}".`,
            });
        }
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to update order.', variant: 'destructive' });
    }
}, [orders, toast]);

  const addReviewToOrder = useCallback(async (orderId: string, reviewId: string) => {
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, reviewId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to link review to order.", variant: "destructive" });
            return;
        }
        
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, reviewId } : order
            )
        );
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server.', variant: 'destructive' });
    }
  }, [toast]);

  const removeReviewIdFromOrder = useCallback(async (orderId: string) => {
     try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, reviewId: undefined }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            // Silently fail is okay here, as it's a cleanup operation
            console.error("Failed to unlink review from order:", result.message);
            return;
        }

        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, reviewId: undefined } : order
          )
        );
    } catch (error) {
        console.error("Network error while unlinking review:", error);
    }
  }, []);

  const addUpdateRequest = useCallback(async (orderId: string, message: string, from: 'customer' | 'admin') => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate || !message.trim()) return;

    const newRequest: UpdateRequest = {
        id: `MSG-${Date.now()}`,
        message,
        from,
        timestamp: new Date().toISOString(),
    };

    const updatedRequests = [...(orderToUpdate.updateRequests || []), newRequest];

    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, updateRequests: updatedRequests }),
        });
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to send message.", variant: "destructive" });
            return;
        }

        setOrders(prev => prev.map(o => (o.id === orderId ? result.order : o)));

        if (from === 'admin') {
          toast({
            title: "Reply Sent!",
            description: "Your reply has been sent to the customer.",
          });
        } else {
          toast({
            title: "Message Sent!",
            description: "Your inquiry has been sent to the restaurant.",
          });
        }
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to send message.', variant: 'destructive' });
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
