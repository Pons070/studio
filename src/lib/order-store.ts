
import type { Order } from './types';
import { firestore } from './firebase';

const ordersCollection = firestore.collection('orders');

export async function getOrders(): Promise<Order[]> {
  try {
    const snapshot = await ordersCollection.get();
    return snapshot.docs.map(doc => doc.data() as Order);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function findOrderById(orderId: string): Promise<Order | undefined> {
  try {
    const doc = await ordersCollection.doc(orderId).get();
    return doc.exists ? doc.data() as Order : undefined;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return undefined;
  }
}

export async function addOrderToStore(newOrder: Order): Promise<void> {
  try {
    await ordersCollection.doc(newOrder.id).set(newOrder);
  } catch (error) {
    console.error("Error adding order:", error);
  }
}

export async function updateOrderInStore(orderId: string, updates: Partial<Order>): Promise<Order | null> {
  try {
    const docRef = ordersCollection.doc(orderId);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as Order;
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return null;
  }
}
