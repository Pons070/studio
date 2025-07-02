"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Order } from '@/lib/types';
import { orders as mockOrders } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

type OrderContextType = {
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReviewToOrder: (orderId: string, reviewId: string) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { toast } = useToast();

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: status } : order
      )
    );
    toast({
        title: "Order Status Updated",
        description: `Order #${orderId} has been updated to "${status}".`,
    });
  };

  const addReviewToOrder = (orderId: string, reviewId: string) => {
      setOrders(prevOrders =>
          prevOrders.map(order =>
              order.id === orderId ? { ...order, reviewId } : order
          )
      );
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus, addReviewToOrder }}>
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
