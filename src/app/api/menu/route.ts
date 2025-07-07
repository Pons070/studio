
import { NextResponse } from 'next/server';
import { menuItems } from '@/lib/mock-data'; // Use mock-data as a "database" for GET
import type { MenuItem } from '@/lib/types';

// In this prototype, we're not persisting changes on the server.
// The client-side state in MenuProvider will be the source of truth after the initial load.
// These API routes simulate a real backend's behavior: validating input and returning objects.

// GET - Fetches all menu items
export async function GET() {
  // In a real app, this would fetch from a database.
  // Here, we return the initial mock data. The client will handle updates in its state.
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

    // Simulate creating a new menu item on the server
    const newItem: MenuItem = {
      ...body,
      id: `MENU-${Date.now()}`,
      aiHint: body.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: body.imageUrl || 'https://placehold.co/600x400.png',
    };

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
        
        // In a real app, you'd find the item in the DB and update it.
        // Here, we just validate and return the received object, assuming the client sent valid data.
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
        
        // In a real app, you'd delete from the DB.
        // We just confirm the action.
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
