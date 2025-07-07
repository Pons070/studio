
import type { Order } from '@/lib/types';
import { orders as mockOrders } from '@/lib/mock-data';

// This is an in-memory "database" for demonstration.
// In a real app, this would be a proper database connection.
// The state will reset when the server restarts.
export let orders: Order[] = [...mockOrders];
