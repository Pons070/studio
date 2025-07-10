
import { NextResponse } from 'next/server';
import { getOrders, updateOrderInStore, findOrderById } from '@/lib/order-store';
import type { Order } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
  }
  
  try {
    const allOrders = await getOrders();
    const userOrders = allOrders.filter(order => order.customerId === userId);
    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { orderId, ...updates } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
        }
        
        const updatedOrder = await updateOrderInStore(orderId, updates);

        if (!updatedOrder) {
             return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Error in PUT /api/orders:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
