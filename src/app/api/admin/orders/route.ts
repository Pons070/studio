
import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/order-store';
import type { Order } from '@/lib/types';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders: orders });
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
