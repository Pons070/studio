
import { NextResponse } from 'next/server';
import { getFavorites, toggleFavorite } from '@/lib/favorites-store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    try {
        const favorites = await getFavorites(userId);
        return NextResponse.json({ success: true, favorites });
    } catch (error) {
        console.error("Error in GET /api/favorites:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, type, id } = await request.json();
        if (!userId || !type || !id) {
             return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }

        await toggleFavorite(userId, type, id, true); // forceAdd = true
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Error in POST /api/favorites:", error);
         return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId, type, id } = await request.json();
         if (!userId || !type || !id) {
             return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }
        
        await toggleFavorite(userId, type, id, false); // forceAdd = false (so it removes)
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Error in DELETE /api/favorites:", error);
         return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
