
import { NextResponse } from 'next/server';
import { reviews } from '@/lib/review-store';
import type { Review } from '@/lib/types';

// GET - Fetches all reviews
export async function GET() {
  return NextResponse.json({ success: true, reviews: reviews });
}

// POST - Creates a new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.orderId || !body.rating || !body.comment || !body.customerName) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newReview: Review = {
      ...body,
      id: `REV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isPublished: false, // Reviews should be moderated first
    };
    
    reviews.unshift(newReview);

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing review (e.g., publish status, admin reply)
export async function PUT(request: Request) {
    try {
        const body: Review = await request.json();

        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Review ID is required for an update.' }, { status: 400 });
        }
        
        const index = reviews.findIndex(r => r.id === body.id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }
        
        reviews[index] = body;
        
        return NextResponse.json({ success: true, review: body });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a review
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Review ID is required for deletion.' }, { status: 400 });
        }
        
        const index = reviews.findIndex(r => r.id === id);
        if (index === -1) {
             return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }
        
        reviews.splice(index, 1);
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
