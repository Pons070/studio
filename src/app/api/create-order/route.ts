
import { NextResponse } from 'next/server';
import type { Order } from '@/lib/types';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { format } from 'date-fns';
import { orders } from '@/lib/order-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For a prototype, we'll trust the client sends the correct data structure.
    // In a production app, you would add robust validation here (e.g., with Zod).
    const { customerEmail, ...orderInput } = body;

    if (!customerEmail || !orderInput.customerId) {
        return NextResponse.json({ success: false, message: 'Missing required order information.' }, { status: 400 });
    }

    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}`,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    };

    // Add to our in-memory store
    orders.unshift(newOrder);

    // Fire-and-forget notifications
    Promise.all([
      sendOrderNotification({
        order: newOrder,
        notificationType: 'customerConfirmation',
        customerEmail: customerEmail,
        adminEmail: 'sangkar111@gmail.com',
      }),
      sendOrderNotification({
        order: newOrder,
        notificationType: 'adminNotification',
        customerEmail: customerEmail,
        adminEmail: 'sangkar111@gmail.com',
      }),
    ]).catch(error => {
      // This logging is important for debugging background tasks
      console.error("Failed to send one or more order notifications from API:", error);
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
