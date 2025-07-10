
import { NextResponse } from 'next/server';
import { getPromotions, addPromotionToStore, updatePromotionInStore, deletePromotionFromStore } from '@/lib/promotion-store';
import type { Promotion } from '@/lib/types';
import { z } from 'zod';

const CreatePromotionSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string(),
  targetAudience: z.enum(['all', 'new', 'existing']),
  isActive: z.boolean(),
  couponCode: z.string().min(1, { message: 'Coupon code is required.' }),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().gte(0, { message: 'Discount value cannot be negative.' }),
  minOrderValue: z.number().gte(0, { message: 'Minimum order value cannot be negative.' }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).optional(),
});

const UpdatePromotionSchema = CreatePromotionSchema.extend({
    id: z.string().min(1, { message: 'Promotion ID is required.' })
});


export async function GET() {
  try {
    const promotions = await getPromotions();
    return NextResponse.json({ success: true, promotions });
  } catch (error) {
    console.error("Error in GET /api/promotions:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = CreatePromotionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const newPromo: Promotion = {
        ...validationResult.data,
        id: `PROMO-${Date.now()}`,
    };

    await addPromotionToStore(newPromo);
    
    return NextResponse.json({ success: true, promotion: newPromo });
  } catch (error) {
    console.error("Error in POST /api/promotions:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const validationResult = UpdatePromotionSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ success: false, message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const promoData = validationResult.data;
        const updatedPromo = await updatePromotionInStore(promoData);
        if (!updatedPromo) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, promotion: updatedPromo });
    } catch (error) {
        console.error("Error in PUT /api/promotions:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Promotion ID is required.' }, { status: 400 });
        }
        
        const deleted = await deletePromotionFromStore(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/promotions:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
