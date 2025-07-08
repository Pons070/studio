
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { MenuItem } from '@/lib/types';

const initialMenuItems: Omit<MenuItem, 'id'>[] = [
  { name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil.', price: 8.99, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'bruschetta appetizer', category: 'Appetizers', isAvailable: true, isFeatured: false },
  { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil.', price: 10.50, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'caprese salad', category: 'Appetizers', isAvailable: true, isFeatured: false },
  { name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper.', price: 15.99, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'spaghetti carbonara', category: 'Main Courses', isAvailable: true, isFeatured: true },
  { name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 14.50, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'margherita pizza', category: 'Main Courses', isAvailable: true, isFeatured: true },
  { name: 'Grilled Salmon', description: 'Served with asparagus and lemon butter sauce.', price: 22.00, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'grilled salmon', category: 'Main Courses', isAvailable: true, isFeatured: true },
  { name: 'Tiramisu', description: 'Coffee-flavored Italian dessert.', price: 7.50, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'tiramisu dessert', category: 'Desserts', isAvailable: true, isFeatured: false },
  { name: 'Panna Cotta', description: 'Sweetened cream thickened with gelatin.', price: 6.99, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'panna cotta', category: 'Desserts', isAvailable: true, isFeatured: false },
  { name: 'Mineral Water', description: 'Still or sparkling water.', price: 3.00, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'water bottle', category: 'Drinks', isAvailable: true, isFeatured: false },
  { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice.', price: 5.50, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'orange juice', category: 'Drinks', isAvailable: true, isFeatured: false },
];

async function seedMenuItems() {
    if (!db) return;
    const menuCollection = collection(db, 'menuItems');
    const batch = writeBatch(db);
    initialMenuItems.forEach(item => {
        const docRef = doc(menuCollection);
        batch.set(docRef, item);
    });
    await batch.commit();
}

// GET - Fetches all menu items, seeding if necessary
export async function GET() {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const menuCollection = collection(db, 'menuItems');
    let menuSnapshot = await getDocs(menuCollection);

    if (menuSnapshot.empty) {
      await seedMenuItems();
      menuSnapshot = await getDocs(menuCollection);
    }
    
    const menuItems = menuSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json({ success: true, menuItems });

  } catch (error) {
    console.error("Error in GET /api/menu:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST - Creates a new menu item
export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const newItemData = {
      ...body,
      aiHint: body.name.toLowerCase(),
      isAvailable: true,
      isFeatured: false,
      imageUrl: body.imageUrl || 'https://placehold.co/600x400.png',
    };
    
    const docRef = await addDoc(collection(db, 'menuItems'), newItemData);
    const newItem: MenuItem = { ...newItemData, id: docRef.id };
    
    return NextResponse.json({ success: true, menuItem: newItem });
  } catch (error) {
    console.error("Error in POST /api/menu:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates an existing menu item
export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const body: MenuItem = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required.' }, { status: 400 });
        }
        
        const { id, ...itemData } = body;
        const itemRef = doc(db, 'menuItems', id);
        await updateDoc(itemRef, itemData);
        
        return NextResponse.json({ success: true, menuItem: body });
    } catch (error) {
        console.error("Error in PUT /api/menu:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a menu item
export async function DELETE(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Menu item ID is required.' }, { status: 400 });
        }
        
        await deleteDoc(doc(db, 'menuItems', id));
        
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error in DELETE /api/menu:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
