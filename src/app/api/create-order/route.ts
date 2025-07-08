
import { NextResponse } from 'next/server';
import type { Order } from '@/lib/types';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { format } from 'date-fns';
import { addOrderToStore } from '@/lib/order-store';
import { getBrandInfo } from '@/lib/brand-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For a prototype, we'll trust the client sends the correct data structure.
    // In a production app, you would add robust validation here (e.g., with Zod).
    const { customerEmail, ...orderInput } = body;

    if (!customerEmail || !orderInput.customerId) {
        return NextResponse.json({ success: false, message: 'Missing required order information.' }, { status: 400 });
    }
    
    const brandInfo = getBrandInfo();
    const adminEmail = brandInfo.adminEmail || 'admin@example.com';

    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}`,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    };

    // Add to our in-memory store
    addOrderToStore(newOrder);

    // Fire-and-forget notifications
    Promise.all([
      sendOrderNotification({
        order: newOrder,
        notificationType: 'customerConfirmation',
        customerEmail: customerEmail,
        adminEmail: adminEmail,
      }),
      sendOrderNotification({
        order: newOrder,
        notificationType: 'adminNotification',
        customerEmail: customerEmail,
        adminEmail: adminEmail,
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
