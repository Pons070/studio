
import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData, findRowIndex, objectToRow } from '@/lib/google-sheets';
import type { Review } from '@/lib/types';

const SHEET_NAME = 'Reviews';
const ORDERS_SHEET_NAME = 'Orders';
const HEADERS = ['id', 'orderId', 'customerName', 'rating', 'comment', 'date', 'adminReply', 'isPublished'];

function parseReview(row: any): Review {
    return {
        ...row,
        rating: parseInt(row.rating, 10),
        isPublished: row.isPublished === 'TRUE',
    };
}

export async function GET() {
  try {
    const data = await getSheetData(`${SHEET_NAME}!A:H`);
    const reviews = data.map(parseReview);
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

    const reviewData: Partial<Review> = {
      ...body,
      id: `REV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
    };
    
    const newRow = objectToRow(HEADERS, reviewData);
    await appendSheetData(SHEET_NAME, newRow);
    
    // Also update the related order with the new reviewId
    const orderRowIndex = await findRowIndex(ORDERS_SHEET_NAME, body.orderId);
    if (orderRowIndex !== -1) {
        await updateSheetData(`${ORDERS_SHEET_NAME}!K${orderRowIndex}`, [reviewData.id || '']);
    }

    return NextResponse.json({ success: true, review: reviewData as Review });
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
        
        const rowIndex = await findRowIndex(SHEET_NAME, body.id);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }

        const updatedRow = objectToRow(HEADERS, body);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, review: body });
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
        
        const rowIndex = await findRowIndex(SHEET_NAME, id);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
        }

        // Clear the review row
        const emptyRow = Array(HEADERS.length).fill('');
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, emptyRow);

        // Unlink review from order
        if (orderId) {
            const orderRowIndex = await findRowIndex(ORDERS_SHEET_NAME, orderId);
            if (orderRowIndex !== -1) {
                await updateSheetData(`${ORDERS_SHEET_NAME}!K${orderRowIndex}`, ['']);
            }
        }
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/reviews:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
