
import { initialOrders } from './mock-data';
import type { Order } from './types';

let orders: Order[] = [...initialOrders];

// ---- Public API for the Order Store ----

export const getOrders = (): Order[] => {
    return orders;
}

export const findOrderById = (orderId: string): Order | undefined => {
    return orders.find(o => o.id === orderId);
}

export const addOrderToStore = (newOrder: Order): void => {
    orders.unshift(newOrder);
}

export const updateOrderInStore = (orderId: string, updates: Partial<Order>): Order | null => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return null;
    }
    const updatedOrder = { ...orders[orderIndex], ...updates };
    orders[orderIndex] = updatedOrder;
    return updatedOrder;
}
