
import { NextResponse } from 'next/server';
import type { Order } from '@/lib/types';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { format } from 'date-fns';
import { appendSheetData, objectToRow, getSheetData } from '@/lib/google-sheets';

const BRAND_SHEET_NAME = 'Brand';
const ORDERS_SHEET_NAME = 'Orders';
const HEADERS = ['id', 'customerId', 'customerName', 'address', 'orderDate', 'pickupDate', 'pickupTime', 'status', 'total', 'items', 'reviewId', 'cancellationDate', 'cancellationReason', 'cancelledBy', 'cancellationAction', 'cookingNotes', 'updateRequests', 'appliedCoupon', 'discountAmount', 'deliveryFee'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, ...orderInput } = body;

    if (!customerEmail || !orderInput.customerId) {
        return NextResponse.json({ success: false, message: 'Missing required order information.' }, { status: 400 });
    }
    
    const brandData = await getSheetData(`${BRAND_SHEET_NAME}!A2:B2`);
    const adminEmail = brandData.length ? brandData[0].adminEmail : 'admin@example.com';
    
    const newOrder: Order = {
      ...orderInput,
      id: `ORD-${Date.now()}`,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    };
    
    const newRow = objectToRow(HEADERS, newOrder);
    await appendSheetData(ORDERS_SHEET_NAME, newRow);

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
      console.error("Failed to send one or more order notifications from API:", error);
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
