
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Promotion } from '@/lib/types';
import { z } from 'zod';

// Schema for creating promotions (ID is not needed)
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

// Schema for updating promotions (ID is required)
const UpdatePromotionSchema = CreatePromotionSchema.extend({
    id: z.string().min(1, { message: 'Promotion ID is required.' })
});


const initialPromotions: Omit<Promotion, 'id'>[] = [
  { title: '🎉 Welcome Offer for New Customers!', description: 'Get 15% off your first order with us. We are so happy to have you!', targetAudience: 'new', isActive: true, couponCode: 'WELCOME15', discountType: 'percentage', discountValue: 15 },
  { title: 'Weekday Special for Regulars!', description: 'Enjoy a free dessert on us as a thank you for your continued support. Valid on weekdays.', targetAudience: 'existing', isActive: true, couponCode: 'SWEETTREAT', discountType: 'flat', discountValue: 7.50, minOrderValue: 20, startDate: '2024-06-01', activeDays: [1, 2, 3, 4, 5] },
  { title: 'Summer Special - All Customers', description: 'Get a free drink with any main course ordered this month.', targetAudience: 'all', isActive: false, couponCode: 'SUMMERDRINK', discountType: 'flat', discountValue: 3.00, startDate: '2023-07-01', endDate: '2023-07-31' },
];

async function seedPromotions() {
    if (!db) return;
    const promotionsCollection = collection(db, 'promotions');
    const batch = writeBatch(db);
    initialPromotions.forEach(item => {
        const docRef = doc(promotionsCollection);
        batch.set(docRef, item);
    });
    await batch.commit();
}

// GET - Fetches all promotions, seeding if necessary
export async function GET() {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const promotionsCollection = collection(db, 'promotions');
    let snapshot = await getDocs(promotionsCollection);

    if (snapshot.empty) {
      await seedPromotions();
      snapshot = await getDocs(promotionsCollection);
    }
    
    const promotions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json({ success: true, promotions });
  } catch (error) {
    console.error("Error in GET /api/promotions:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST - Creates a new promotion
export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const validationResult = CreatePromotionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validationResult.data;
    
    const docRef = await addDoc(collection(db, 'promotions'), validatedData);
    const newPromotion: Promotion = { ...validatedData, id: docRef.id };
    
    return NextResponse.json({ success: true, promotion: newPromotion });
  } catch (error) {
    console.error("Error in POST /api/promotions:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing promotion
export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const body = await request.json();
        const validationResult = UpdatePromotionSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ success: false, message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { id, ...promoData } = validationResult.data;
        const promoRef = doc(db, 'promotions', id);
        await updateDoc(promoRef, promoData);
        
        return NextResponse.json({ success: true, promotion: validationResult.data });
    } catch (error) {
        console.error("Error in PUT /api/promotions:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a promotion
export async function DELETE(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Promotion ID is required.' }, { status: 400 });
        }
        
        await deleteDoc(doc(db, 'promotions', id));
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/promotions:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
