
import type { Order } from '@/lib/types';
import { initialOrders } from './mock-data';

declare global {
  var ordersStore: Order[] | undefined;
}

// Centralized store access
const getStore = (): Order[] => {
    if (!globalThis.ordersStore) {
        globalThis.ordersStore = initialOrders;
    }
    return globalThis.ordersStore;
}

// ---- Public API for the Order Store ----

export const getOrders = (): Order[] => {
    return getStore();
}

export const findOrderById = (orderId: string): Order | undefined => {
    return getStore().find(o => o.id === orderId);
}

export const addOrderToStore = (newOrder: Order): void => {
    getStore().unshift(newOrder);
}

export const updateOrderInStore = (orderId: string, updates: Partial<Order>): Order | null => {
    const store = getStore();
    const orderIndex = store.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return null;
    }
    const updatedOrder = { ...store[orderIndex], ...updates };
    store[orderIndex] = updatedOrder;
    return updatedOrder;
}
