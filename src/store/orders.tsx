

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Order, CartItem, Address, UpdateRequest } from '@/lib/types';
import { orders as mockOrders } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { useAuth } from './auth';
import { format } from 'date-fns';

type OrderContextType = {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => void;
  addReviewToOrder: (orderId: string, reviewId: string) => void;
  removeReviewIdFromOrder: (orderId: string) => void;
  addUpdateRequest: (orderId: string, message: string, from: 'customer' | 'admin') => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-orders';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setOrders(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load orders from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("Failed to save orders to localStorage", error);
    }
  }, [orders]);


  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string, deliveryAddress: Address, cookingNotes?: string, appliedCoupon?: string, discountAmount?: number, deliveryFee?: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return undefined;
    }
    
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        address: deliveryAddress,
        orderDate: format(new Date(), 'yyyy-MM-dd'),
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        pickupTime: pickupTime,
        status: 'Pending',
        total: total,
        items: items,
        cookingNotes: cookingNotes || undefined,
        updateRequests: [],
        appliedCoupon: appliedCoupon,
        discountAmount: discountAmount,
        deliveryFee: deliveryFee,
    };

    // Optimistically update UI
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    toast({
        title: "Pre-Order Placed!",
        description: "Your order has been successfully submitted. You will receive an email confirmation shortly.",
        variant: "success",
    });

    // Fire-and-forget notifications without awaiting them
    Promise.all([
        sendOrderNotification({
            order: newOrder,
            notificationType: 'customerConfirmation',
            customerEmail: currentUser.email,
            adminEmail: 'sangkar111@gmail.com'
        }),
        sendOrderNotification({
            order: newOrder,
            notificationType: 'adminNotification',
            customerEmail: currentUser.email,
            adminEmail: 'sangkar111@gmail.com' // In real app, get from config
        })
    ]).catch(error => {
        // Log background error without disturbing the user
        console.error("Failed to send order notifications in background:", error);
    });
        
    return newOrder;
  }, [toast, currentUser]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], cancelledBy?: 'admin' | 'customer', reason?: string, customerEmail?: string, cancellationAction?: 'refund' | 'donate') => {
    let notificationOrder: Order | null = null;
    
    setOrders(prevOrders => {
        const newOrders = prevOrders.map(order => {
            if (order.id === orderId) {
                const updatedOrder: Order = { 
                    ...order, 
                    status: status,
                    ...(status === 'Cancelled' && { 
                        cancellationDate: format(new Date(), 'yyyy-MM-dd'),
                        cancellationReason: reason,
                        cancelledBy: cancelledBy,
                        cancellationAction: cancellationAction,
                    })
                };
                if (status === 'Cancelled') {
                    notificationOrder = updatedOrder;
                }
                return updatedOrder;
            }
            return order;
        });
        return newOrders;
    });

    if (notificationOrder && customerEmail) {
        try {
            await sendOrderNotification({
                order: notificationOrder,
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
}, [toast]);

  const addReviewToOrder = useCallback((orderId: string, reviewId: string) => {
      setOrders(prevOrders =>
          prevOrders.map(order =>
              order.id === orderId ? { ...order, reviewId } : order
          )
      );
  }, []);

  const removeReviewIdFromOrder = useCallback((orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, reviewId: undefined } : order
      )
    );
  }, []);

  const addUpdateRequest = useCallback((orderId: string, message: string, from: 'customer' | 'admin') => {
    if (!message.trim()) return;

    const newRequest: UpdateRequest = {
        id: `MSG-${Date.now()}`,
        message,
        from,
        timestamp: new Date().toISOString(),
    };

    setOrders(prevOrders =>
        prevOrders.map(order => {
            if (order.id === orderId) {
                const updatedRequests = [...(order.updateRequests || []), newRequest];
                return { ...order, updateRequests: updatedRequests };
            }
            return order;
        })
    );

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
  }, [toast]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, addReviewToOrder, removeReviewIdFromOrder, addUpdateRequest }}>
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
