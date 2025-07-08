
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

// GET - Fetches orders for a specific user
export async function GET(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
  }
  
  try {
    const q = query(collection(db, "orders"), where("customerId", "==", userId));
    const querySnapshot = await getDocs(q);
    const userOrders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing order
export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const body = await request.json();
        const { orderId, ...updates } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
        }
        
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, updates);

        const updatedOrderDoc = await getDoc(orderRef);
        const updatedOrder = { ...updatedOrderDoc.data(), id: updatedOrderDoc.id };
        
        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Error in PUT /api/orders:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
