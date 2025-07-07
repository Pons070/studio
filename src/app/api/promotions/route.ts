
import { NextResponse } from 'next/server';
import { promotions } from '@/lib/promotion-store';
import type { Promotion } from '@/lib/types';

// GET - Fetches all promotions
export async function GET() {
  return NextResponse.json({ success: true, promotions: promotions });
}

// POST - Creates a new promotion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.couponCode || !body.discountType) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newPromotion: Promotion = {
      ...body,
      id: `PROMO-${Date.now()}`,
    };
    
    promotions.unshift(newPromotion);

    return NextResponse.json({ success: true, promotion: newPromotion });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing promotion
export async function PUT(request: Request) {
    try {
        const body: Promotion = await request.json();

        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Promotion ID is required for an update.' }, { status: 400 });
        }
        
        const index = promotions.findIndex(p => p.id === body.id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }
        
        promotions[index] = body;
        
        return NextResponse.json({ success: true, promotion: body });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a promotion
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Promotion ID is required for deletion.' }, { status: 400 });
        }
        
        const index = promotions.findIndex(p => p.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }

        promotions.splice(index, 1);
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
