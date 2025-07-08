
import { NextResponse } from 'next/server';
import { getSheetData, findRowIndex, updateSheetData, objectToRow } from '@/lib/google-sheets';
import type { Order } from '@/lib/types';

const SHEET_NAME = 'Orders';
const HEADERS = ['id', 'customerId', 'customerName', 'address', 'orderDate', 'pickupDate', 'pickupTime', 'status', 'total', 'items', 'reviewId', 'cancellationDate', 'cancellationReason', 'cancelledBy', 'cancellationAction', 'cookingNotes', 'updateRequests', 'appliedCoupon', 'discountAmount', 'deliveryFee'];

function parseOrder(row: any): Order {
    return {
        ...row,
        total: parseFloat(row.total),
        discountAmount: row.discountAmount ? parseFloat(row.discountAmount) : undefined,
        deliveryFee: row.deliveryFee ? parseFloat(row.deliveryFee) : undefined,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
        updateRequests: typeof row.updateRequests === 'string' ? JSON.parse(row.updateRequests) : row.updateRequests,
    };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
  }
  
  try {
    const data = await getSheetData(`${SHEET_NAME}!A:T`);
    const userOrders = data.filter((row: any) => row.customerId === userId).map(parseOrder);
    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { orderId, ...updates } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
        }
        
        const rowIndex = await findRowIndex(SHEET_NAME, orderId);
        if (rowIndex === -1) {
             return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }
        
        const data = await getSheetData(`${SHEET_NAME}!A${rowIndex}:T${rowIndex}`);
        if (!data.length) {
            return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }
        const existingOrder = parseOrder(data[0]);

        const updatedOrderData = { ...existingOrder, ...updates };
        const updatedRow = objectToRow(HEADERS, updatedOrderData);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, order: updatedOrderData });
    } catch (error) {
        console.error("Error in PUT /api/orders:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
