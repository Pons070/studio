
import fs from 'fs';
import path from 'path';
import type { Order } from './types';

const dataFilePath = path.join(process.cwd(), 'data/orders.json');
let ordersCache: Order[] | null = null;

function getStore(): Order[] {
    if (ordersCache) {
        return ordersCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        ordersCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Error: Orders data file not found at ${dataFilePath}. Please ensure it exists.`);
            return [];
        }
        throw error;
    }
}

function saveStore(data: Order[]): void {
    ordersCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Public API for the Order Store ----

export const getOrders = (): Order[] => {
    return getStore();
}

export const findOrderById = (orderId: string): Order | undefined => {
    return getStore().find(o => o.id === orderId);
}

export const addOrderToStore = (newOrder: Order): void => {
    const store = getStore();
    store.unshift(newOrder);
    saveStore(store);
}

export const updateOrderInStore = (orderId: string, updates: Partial<Order>): Order | null => {
    const store = getStore();
    const orderIndex = store.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return null;
    }
    const updatedOrder = { ...store[orderIndex], ...updates };
    store[orderIndex] = updatedOrder;
    saveStore(store);
    return updatedOrder;
}
