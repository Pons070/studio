
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

async function getFavoritesDoc(userId: string) {
    if (!db) {
        throw new Error("Firestore is not initialized. Check your Firebase configuration.");
    }
    const favRef = doc(db, `users/${userId}/favorites/main`);
    const favDoc = await getDoc(favRef);
    return { favRef, favDoc };
}

// GET - Fetches favorites for a user
export async function GET(request: Request) {
    if (!db) {
        return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    try {
        const { favDoc } = await getFavoritesDoc(userId);
        if (favDoc.exists()) {
            return NextResponse.json({ success: true, favorites: favDoc.data() });
        } else {
            // No favorites document yet, return empty structure
            return NextResponse.json({ success: true, favorites: { itemIds: [], orderIds: [] } });
        }
    } catch (error) {
        console.error("Error in GET /api/favorites:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// POST - Adds a favorite
export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { userId, type, id } = await request.json();
        if (!userId || !type || !id) {
             return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }

        const { favRef, favDoc } = await getFavoritesDoc(userId);
        const fieldToUpdate = type === 'item' ? 'itemIds' : 'orderIds';

        if (favDoc.exists()) {
            await updateDoc(favRef, { [fieldToUpdate]: arrayUnion(id) });
        } else {
            await setDoc(favRef, { [fieldToUpdate]: [id] });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Error in POST /api/favorites:", error);
         return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Removes a favorite
export async function DELETE(request: Request) {
    if (!db) {
        return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { userId, type, id } = await request.json();
         if (!userId || !type || !id) {
             return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }
        
        const { favRef, favDoc } = await getFavoritesDoc(userId);
        if (!favDoc.exists()) {
            return NextResponse.json({ success: true }); // Nothing to delete
        }

        const fieldToUpdate = type === 'item' ? 'itemIds' : 'orderIds';
        await updateDoc(favRef, { [fieldToUpdate]: arrayRemove(id) });
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Error in DELETE /api/favorites:", error);
         return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
