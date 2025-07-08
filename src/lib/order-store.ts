
import type { Order } from '@/lib/types';
import { findUserBy } from './user-store';
import { getMenuItems } from './menu-store';

declare global {
  var ordersStore: Order[] | undefined;
}

const lazyCreateInitialOrders = (): Order[] => {
    const menuItems = getMenuItems();
    const findUser = (name: string) => findUserBy(u => u.name === name);
    const findMenuItem = (name: string) => menuItems.find(m => m.name === name);

    const alice = findUser('Alice');
    const bob = findUser('Bob');
    const charlie = findUser('Charlie');
    const diana = findUser('Diana');
    const eve = findUser('Eve');

    const bruschetta = findMenuItem('Bruschetta');
    const carbonara = findMenuItem('Spaghetti Carbonara');
    const pizza = findMenuItem('Margherita Pizza');
    const tiramisu = findMenuItem('Tiramisu');
    const salmon = findMenuItem('Grilled Salmon');
    const caprese = findMenuItem('Caprese Salad');

    // This check is important to prevent crashes if any item is not found.
    if (!alice || !bob || !charlie || !diana || !eve || !bruschetta || !carbonara || !pizza || !tiramisu || !salmon || !caprese) {
        console.error("One or more entities for mock orders not found. Seeding with empty orders.");
        return [];
    }

    return [
      {
        id: 'ORD-001',
        customerId: alice.id,
        customerName: alice.name,
        address: alice.addresses![0],
        orderDate: '2023-10-26',
        pickupDate: '2023-10-27',
        pickupTime: '18:00',
        status: 'Completed',
        items: [
          { ...carbonara, quantity: 2 },
          { ...tiramisu, quantity: 1 },
        ],
        total: carbonara.price * 2 + tiramisu.price,
        reviewId: 'REV-001',
      },
      {
        id: 'ORD-002',
        customerId: diana.id,
        customerName: diana.name,
        address: diana.addresses![0],
        orderDate: '2023-11-15',
        pickupDate: '2023-11-16',
        pickupTime: '19:00',
        status: 'Completed',
        items: [
          { ...salmon, quantity: 1 },
          { ...caprese, quantity: 1 },
        ],
        total: salmon.price + caprese.price,
        reviewId: 'REV-004',
      },
      {
        id: 'ORD-003',
        customerId: charlie.id,
        customerName: charlie.name,
        address: charlie.addresses![0],
        orderDate: '2023-12-01',
        pickupDate: '2023-12-02',
        pickupTime: '12:30',
        status: 'Completed',
        items: [
            { ...pizza, quantity: 2 },
            { ...bruschetta, quantity: 1 }
        ],
        total: pizza.price * 2 + bruschetta.price,
        reviewId: 'REV-003',
      },
      {
        id: 'ORD-004',
        customerId: eve.id,
        customerName: eve.name,
        address: eve.addresses![0],
        orderDate: '2024-01-05',
        pickupDate: '2024-01-06',
        pickupTime: '18:30',
        status: 'Cancelled',
        items: [
          { ...carbonara, quantity: 1 }
        ],
        total: carbonara.price,
        cancellationDate: '2024-01-05',
        cancelledBy: 'customer',
        cancellationReason: 'Change of plans',
        cancellationAction: 'refund',
        reviewId: 'REV-005'
      },
      {
        id: 'ORD-005',
        customerId: bob.id,
        customerName: bob.name,
        address: bob.addresses![0],
        orderDate: '2024-02-10',
        pickupDate: '2024-02-11',
        pickupTime: '20:00',
        status: 'Completed',
        items: [
          { ...pizza, quantity: 1 },
          { ...caprese, quantity: 1 },
        ],
        total: pizza.price + caprese.price,
        reviewId: 'REV-002',
      },
      {
        id: 'ORD-006',
        customerId: alice.id,
        customerName: alice.name,
        address: alice.addresses![0],
        orderDate: '2024-03-18',
        pickupDate: '2024-03-20',
        pickupTime: '19:30',
        status: 'Pending',
        items: [
          { ...carbonara, quantity: 1 },
        ],
        total: carbonara.price,
      }
    ];
};

// Centralized store access
const getStore = (): Order[] => {
    if (!globalThis.ordersStore) {
        globalThis.ordersStore = lazyCreateInitialOrders();
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
