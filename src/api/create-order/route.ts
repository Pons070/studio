
import { NextResponse } from 'next/server';
import type { Order } from '@/lib/types';
import { sendOrderNotification } from '@/ai/flows/order-notification-flow';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const { customerEmail, ...orderInput } = body;

    if (!customerEmail || !orderInput.customerId) {
        return NextResponse.json({ success: false, message: 'Missing required order information.' }, { status: 400 });
    }
    
    const brandRef = doc(db, 'brand', 'info');
    const brandDoc = await getDoc(brandRef);
    const adminEmail = brandDoc.exists() ? brandDoc.data().adminEmail : 'admin@example.com';

    const orderData: Omit<Order, 'id'> = {
      ...orderInput,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    };
    
    // Add to Firestore and get the new document reference
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    const newOrder: Order = {
        ...orderData,
        id: docRef.id,
    };

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
      console.error("Failed to send one or more order notifications from API:", error);
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
