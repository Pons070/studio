"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Order, CartItem } from '@/lib/types';
import { orders as mockOrders } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';

type OrderContextType = {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, pickupDate: Date, pickupTime: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReviewToOrder: (orderId: string, reviewId: string) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-orders';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { toast } = useToast();

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


  const addOrder = useCallback(async (items: CartItem[], total: number, pickupDate: Date, pickupTime: string) => {
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString().split('T')[0],
        pickupDate: pickupDate.toISOString().split('T')[0],
        pickupTime: pickupTime,
        status: 'Pending',
        total: total,
        items: items,
    };

    // Optimistically update UI
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    try {
        // Send notifications in parallel
        await Promise.all([
            sendOrderNotification({
                order: newOrder,
                notificationType: 'customerConfirmation',
                customerEmail: 'pons070@yahoo.in', // In real app, get from user session
                adminEmail: 'sangkar111@gmail.com'
            }),
            sendOrderNotification({
                order: newOrder,
                notificationType: 'adminNotification',
                customerEmail: 'pons070@yahoo.in',
                adminEmail: 'sangkar111@gmail.com' // In real app, get from config
            })
        ]);
        
        toast({
            title: "Pre-Order Placed!",
            description: "Your order has been successfully submitted. Check your email for confirmation.",
            variant: "default",
            className: "bg-green-500 text-white"
        });

    } catch (error) {
        console.error("Failed to send order notifications:", error);
        toast({
            title: "Notification Error",
            description: "Your order was placed, but we couldn't send the confirmation email.",
            variant: "destructive",
        });
        // Here you might want to handle the error, e.g., rollback the optimistic update if placement is transactional
    }
  }, [toast]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    let notificationOrder: Order | null = null;

    setOrders(prevOrders => {
        const newOrders = prevOrders.map(order => {
            if (order.id === orderId) {
                const updatedOrder = { 
                    ...order, 
                    status: status,
                    ...(status === 'Cancelled' && { cancellationDate: new Date().toISOString().split('T')[0] })
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

    if (notificationOrder) {
        try {
            await sendOrderNotification({
                order: notificationOrder,
                notificationType: 'customerCancellation',
                customerEmail: 'pons070@yahoo.in',
                adminEmail: 'sangkar111@gmail.com'
            });
            toast({
                title: "Order Cancelled",
                description: `Your order #${orderId} has been cancelled and a confirmation email has been sent.`,
            });
        } catch (error) {
            console.error("Failed to send cancellation email:", error);
            toast({
                title: "Order Cancelled",
                description: `Your order #${orderId} has been cancelled, but we failed to send a confirmation email.`,
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

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, addReviewToOrder }}>
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
