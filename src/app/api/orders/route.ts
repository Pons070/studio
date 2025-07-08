
import { NextResponse } from 'next/server';
import { getOrders, updateOrderInStore } from '@/lib/order-store';
import type { Order } from '@/lib/types';

// GET - Fetches orders for a specific user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
  }
  
  const allOrders = getOrders();
  const userOrders = allOrders.filter(o => o.customerId === userId);
  return NextResponse.json({ success: true, orders: userOrders });
}


// PUT - Updates an existing order
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { orderId, ...updates } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required for an update.' }, { status: 400 });
        }
        
        const updatedOrder = updateOrderInStore(orderId, updates);

        if (!updatedOrder) {
            return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
