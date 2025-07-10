
import fs from 'fs';
import path from 'path';
import type { Order } from './types';

const dataFilePath = path.join(process.cwd(), 'data/orders.json');

function readData(): Order[] {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: Order[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function getOrders(): Order[] {
  return readData();
}

export function findOrderById(orderId: string): Order | undefined {
    return readData().find(order => order.id === orderId);
}

export function addOrderToStore(newOrder: Order): void {
  const orders = readData();
  orders.push(newOrder);
  writeData(orders);
}

export function updateOrderInStore(orderId: string, updates: Partial<Order>): Order | null {
  const orders = readData();
  const index = orders.findIndex(order => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    writeData(orders);
    return orders[index];
  }
  return null;
}
