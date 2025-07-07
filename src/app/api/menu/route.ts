
import { NextResponse } from 'next/server';
import { menuItems } from '@/lib/menu-store';
import type { MenuItem } from '@/lib/types';

// GET - Fetches all menu items
export async function GET() {
  return NextResponse.json({ success: true, menuItems });
}

// POST - Creates a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.price || !body.category) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newItem: MenuItem = {
      ...body,
      id: `MENU-${Date.now()}`,
      aiHint: body.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: body.imageUrl || 'https://placehold.co/600x400.png',
    };

    menuItems.unshift(newItem);

    return NextResponse.json({ success: true, menuItem: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing menu item
export async function PUT(request: Request) {
    try {
        const body: MenuItem = await request.json();

        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required for an update.' }, { status: 400 });
        }
        
        const index = menuItems.findIndex(item => item.id === body.id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }

        menuItems[index] = body;
        
        return NextResponse.json({ success: true, menuItem: body });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a menu item
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required for deletion.' }, { status: 400 });
        }
        
        const index = menuItems.findIndex(item => item.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Menu item not found.' }, { status: 404 });
        }
        
        menuItems.splice(index, 1);
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
