
import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData, findRowIndex, objectToRow } from '@/lib/google-sheets';
import type { MenuItem } from '@/lib/types';

const SHEET_NAME = 'Menu';
const HEADERS = ['id', 'name', 'description', 'price', 'imageUrl', 'category', 'aiHint', 'isAvailable', 'isFeatured'];

function parseMenuItem(row: any): MenuItem {
    return {
        ...row,
        price: parseFloat(row.price),
        isAvailable: row.isAvailable === 'TRUE',
        isFeatured: row.isFeatured === 'TRUE',
    };
}

export async function GET() {
  try {
    const data = await getSheetData(`${SHEET_NAME}!A:I`);
    const menuItems = data.map(parseMenuItem);
    return NextResponse.json({ success: true, menuItems });
  } catch (error) {
    console.error("Error in GET /api/menu:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newItemData: Partial<MenuItem> = {
      ...body,
      id: `ITEM-${Date.now()}`,
      aiHint: body.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: body.imageUrl || 'https://placehold.co/600x400.png',
    };
    
    const newRow = objectToRow(HEADERS, newItemData);
    await appendSheetData(SHEET_NAME, newRow);
    
    return NextResponse.json({ success: true, menuItem: newItemData as MenuItem });
  } catch (error) {
    console.error("Error in POST /api/menu:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body: MenuItem = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required.' }, { status: 400 });
        }
        
        const rowIndex = await findRowIndex(SHEET_NAME, body.id);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }

        const updatedRow = objectToRow(HEADERS, body);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, menuItem: body });
    } catch (error) {
        console.error("Error in PUT /api/menu:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required.' }, { status: 400 });
        }
        
        const rowIndex = await findRowIndex(SHEET_NAME, id);
        if (rowIndex === -1) {
             return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }

        const emptyRow = Array(HEADERS.length).fill('');
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, emptyRow);
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/menu:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
