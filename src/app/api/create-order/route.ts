
import { NextResponse } from 'next/server';
import { addOrderToStore } from '@/lib/order-store';
import type { Order } from '@/lib/types';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { getBrandInfo } from '@/lib/brand-store';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, ...orderInput } = body;

    if (!customerEmail || !orderInput.customerId) {
        return NextResponse.json({ success: false, message: 'Missing required order information.' }, { status: 400 });
    }
    
    const brandInfo = await getBrandInfo();
    const adminEmail = brandInfo?.adminEmail || 'admin@example.com';
    
    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}`,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    };
    
    await addOrderToStore(newOrder);

    // Send notifications without waiting for them to complete
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
      // Log errors but don't block the response to the user
      console.error("Failed to send one or more order notifications from API:", error);
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
