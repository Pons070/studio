
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Review } from '@/lib/types';

// NOTE: Seeding reviews is complex as they are tied to specific orders and customers.
// In this new Firestore-based system, reviews will be added through the app's UI.
// An empty collection will be returned initially.

// GET - Fetches all reviews
export async function GET() {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const reviewsCollection = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsCollection);
    const reviews = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST - Creates a new review
export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    if (!body.orderId || !body.rating || !body.comment || !body.customerName) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const reviewData = {
      ...body,
      date: new Date().toISOString().split('T')[0],
      isPublished: false, // Reviews should be moderated first
    };
    
    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    const newReview: Review = { ...reviewData, id: docRef.id };
    
    // Also update the related order with the new reviewId
    await updateDoc(doc(db, 'orders', body.orderId), { reviewId: newReview.id });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing review (e.g., publish status, admin reply)
export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const body: Review = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Review ID is required.' }, { status: 400 });
        }
        
        const { id, ...reviewData } = body;
        const reviewRef = doc(db, 'reviews', id);
        await updateDoc(reviewRef, reviewData);
        
        return NextResponse.json({ success: true, review: body });
    } catch (error) {
        console.error("Error in PUT /api/reviews:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a review
export async function DELETE(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { id, orderId } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Review ID is required.' }, { status: 400 });
        }
        
        const reviewRef = doc(db, 'reviews', id);
        const orderRef = doc(db, 'orders', orderId);

        const batch = writeBatch(db);
        batch.delete(reviewRef);
        batch.update(orderRef, { reviewId: null }); // Unlink review from order
        await batch.commit();
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/reviews:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
