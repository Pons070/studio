
import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData, findRowIndex, objectToRow } from '@/lib/google-sheets';
import type { Promotion } from '@/lib/types';
import { z } from 'zod';

const SHEET_NAME = 'Promotions';
const HEADERS = ['id', 'title', 'description', 'targetAudience', 'isActive', 'couponCode', 'discountType', 'discountValue', 'minOrderValue', 'startDate', 'endDate', 'activeDays'];

function parsePromotion(row: any): Promotion {
    return {
        ...row,
        isActive: row.isActive === 'TRUE',
        discountValue: parseFloat(row.discountValue),
        minOrderValue: row.minOrderValue ? parseFloat(row.minOrderValue) : undefined,
        activeDays: typeof row.activeDays === 'string' ? JSON.parse(row.activeDays) : row.activeDays,
    };
}

const CreatePromotionSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string().optional(),
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
    const data = await getSheetData(`${SHEET_NAME}!A:L`);
    const promotions = data.map(parsePromotion);
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
    
    const newPromoData: Partial<Promotion> = {
        ...validationResult.data,
        id: `PROMO-${Date.now()}`,
    };

    const newRow = objectToRow(HEADERS, newPromoData);
    await appendSheetData(SHEET_NAME, newRow);
    
    return NextResponse.json({ success: true, promotion: newPromoData as Promotion });
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
        
        const rowIndex = await findRowIndex(SHEET_NAME, promoData.id);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }

        const updatedRow = objectToRow(HEADERS, promoData);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, promotion: promoData });
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
        
        const rowIndex = await findRowIndex(SHEET_NAME, id);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'Promotion not found.' }, { status: 404 });
        }

        const emptyRow = Array(HEADERS.length).fill('');
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, emptyRow);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/promotions:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
