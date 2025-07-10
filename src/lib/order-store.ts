
import type { Order } from './types';

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "user-alice",
    customerName: "Alice",
    address: {
      id: "addr-alice-1",
      label: "Home",
      isDefault: true,
      doorNumber: "4A",
      apartmentName: "Wonderland Apts",
      area: "Rabbit Hole District",
      city: "Curious City",
      state: "Imagi Nation",
      pincode: "12345",
      latitude: 34.0522,
      longitude: -118.2437
    },
    orderDate: "2023-10-26",
    pickupDate: "2023-10-27",
    pickupTime: "18:00",
    status: "Completed",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 2
      },
      {
        id: "6",
        name: "Tiramisu",
        price: 7.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 39.48,
    reviewId: "REV-001"
  },
  {
    id: "ORD-002",
    customerId: "user-diana",
    customerName: "Diana",
    address: {
      id: "addr-diana-1",
      label: "Home",
      isDefault: true,
      doorNumber: "100",
      apartmentName: "Olympus Towers",
      area: "Themyscira Plaza",
      city: "Paradise Island",
      state: "Amazonia",
      pincode: "23456"
    },
    orderDate: "2023-11-15",
    pickupDate: "2023-11-16",
    pickupTime: "19:00",
    status: "Completed",
    items: [
      {
        id: "5",
        name: "Grilled Salmon",
        price: 22,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      },
      {
        id: "2",
        name: "Caprese Salad",
        price: 10.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 32.5,
    reviewId: "REV-004"
  },
  {
    id: "ORD-003",
    customerId: "user-charlie",
    customerName: "Charlie",
    address: {
      id: "addr-charlie-1",
      label: "Work",
      isDefault: true,
      doorNumber: "22B",
      apartmentName: "Chocolate Factory",
      area: "Sweet Street",
      city: "Confectionville",
      state: "Sugarland",
      pincode: "34567",
      latitude: 40.7128,
      longitude: -74.006
    },
    orderDate: "2023-12-01",
    pickupDate: "2023-12-02",
    pickupTime: "12:30",
    status: "Completed",
    items: [
      {
        id: "4",
        name: "Margherita Pizza",
        price: 14.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 2
      },
      {
        id: "1",
        name: "Bruschetta",
        price: 8.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 37.99,
    reviewId: "REV-003"
  },
  {
    id: "ORD-004",
    customerId: "user-eve",
    customerName: "Eve",
    address: {
      id: "addr-eve-1",
      label: "Home",
      isDefault: true,
      doorNumber: "1",
      apartmentName: "Garden House",
      area: "Eden Estates",
      city: "First City",
      state: "Genesis",
      pincode: "45678"
    },
    orderDate: "2024-01-05",
    pickupDate: "2024-01-06",
    pickupTime: "18:30",
    status: "Cancelled",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 15.99,
    cancellationDate: "2024-01-05",
    cancelledBy: "customer",
    cancellationReason: "Change of plans",
    cancellationAction: "refund",
    reviewId: "REV-005"
  },
  {
    id: "ORD-005",
    customerId: "user-bob",
    customerName: "Bob",
    address: {
      id: "addr-bob-1",
      label: "Home",
      isDefault: true,
      doorNumber: "B2",
      apartmentName: "Builder Complex",
      area: "Construct Lane",
      city: "Tool-Town",
      state: "Handy State",
      pincode: "56789"
    },
    orderDate: "2024-02-10",
    pickupDate: "2024-02-11",
    pickupTime: "20:00",
    status: "Completed",
    items: [
      {
        id: "4",
        name: "Margherita Pizza",
        price: 14.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      },
      {
        id: "2",
        name: "Caprese Salad",
        price: 10.5,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 25,
    reviewId: "REV-002"
  },
  {
    id: "ORD-006",
    customerId: "user-alice",
    customerName: "Alice",
    address: {
      id: "addr-alice-1",
      label: "Home",
      isDefault: true,
      doorNumber: "4A",
      apartmentName: "Wonderland Apts",
      area: "Rabbit Hole District",
      city: "Curious City",
      state: "Imagi Nation",
      pincode: "12345",
      latitude: 34.0522,
      longitude: -118.2437
    },
    orderDate: "2024-03-18",
    pickupDate: "2024-03-20",
    pickupTime: "19:30",
    status: "Pending",
    items: [
      {
        id: "3",
        name: "Spaghetti Carbonara",
        price: 15.99,
        imageUrl: "https://placehold.co/600x400.png",
        quantity: 1
      }
    ],
    total: 15.99
  }
];

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
