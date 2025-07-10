
import { NextResponse } from 'next/server';
import { getReviews, addReviewToStore, updateReviewInStore, deleteReviewFromStore } from '@/lib/review-store';
import { updateOrderInStore } from '@/lib/order-store';
import type { Review } from '@/lib/types';

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.orderId || !body.rating || !body.comment || !body.customerName) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newReview: Review = {
      ...body,
      id: `REV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
    };
    
    await addReviewToStore(newReview);
    
    // Also update the related order with the new reviewId
    await updateOrderInStore(body.orderId, { reviewId: newReview.id });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body: Review = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Review ID is required.' }, { status: 400 });
        }
        
        const updatedReview = await updateReviewInStore(body);
        if (!updatedReview) {
            return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, review: updatedReview });
    } catch (error) {
        console.error("Error in PUT /api/reviews:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id, orderId } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Review ID is required.' }, { status: 400 });
        }
        
        const deleted = await deleteReviewFromStore(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }

        // Unlink review from order
        if (orderId) {
            await updateOrderInStore(orderId, { reviewId: undefined });
        }
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/reviews:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

