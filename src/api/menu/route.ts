
import { NextResponse } from 'next/server';
import { getMenuItems, addMenuItemToStore, updateMenuItemInStore, deleteMenuItemFromStore } from '@/lib/menu-store';
import type { MenuItem } from '@/lib/types';

export async function GET() {
  try {
    const menuItems = getMenuItems();
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

    const newItem: MenuItem = {
      ...body,
      id: `ITEM-${Date.now()}`,
      aiHint: body.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: body.imageUrl || 'https://placehold.co/600x400.png',
    };
    
    addMenuItemToStore(newItem);
    
    return NextResponse.json({ success: true, menuItem: newItem });
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
        
        const updatedItem = updateMenuItemInStore(body);
        if (!updatedItem) {
            return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, menuItem: updatedItem });
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
        
        const deleted = deleteMenuItemFromStore(id);
        if (!deleted) {
             return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/menu:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
