
import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/order-store';

// GET - Fetches all orders for the admin dashboard
export async function GET() {
  // In a real app, you would add authentication to ensure only admins can access this.
  return NextResponse.json({ success: true, orders: getOrders() });
}
