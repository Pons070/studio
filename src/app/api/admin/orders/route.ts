
import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';
import type { Order } from '@/lib/types';

const SHEET_NAME = 'Orders';

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


export async function GET() {
  try {
    const data = await getSheetData(`${SHEET_NAME}!A:T`);
    const orders = data.map(parseOrder);
    return NextResponse.json({ success: true, orders: orders });
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
