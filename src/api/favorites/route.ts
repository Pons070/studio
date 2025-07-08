
import { NextResponse } from 'next/server';
import { getSheetData, findRowIndex, updateSheetData } from '@/lib/google-sheets';

const SHEET_NAME = 'Favorites';

async function getFavorites(userId: string) {
    const data = await getSheetData(`${SHEET_NAME}!A:C`);
    const favs = data.find((row: any) => row.userId === userId);
    if (favs) {
        return {
            itemIds: favs.itemIds ? JSON.parse(favs.itemIds) : [],
            orderIds: favs.orderIds ? JSON.parse(favs.orderIds) : [],
        };
    }
    return { itemIds: [], orderIds: [] };
}

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

        const rowIndex = await findRowIndex(SHEET_NAME, userId);
        const currentFavorites = await getFavorites(userId);
        const fieldToUpdate = type === 'item' ? 'itemIds' : 'orderIds';
        const updatedIds = [...new Set([...currentFavorites[fieldToUpdate], id])];
        currentFavorites[fieldToUpdate] = updatedIds;

        const rowData = [userId, JSON.stringify(currentFavorites.itemIds), JSON.stringify(currentFavorites.orderIds)];

        if (rowIndex !== -1) {
            await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, rowData);
        } else {
            await updateSheetData(SHEET_NAME, rowData);
        }
        
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
        
        const rowIndex = await findRowIndex(SHEET_NAME, userId);
        if (rowIndex === -1) {
            return NextResponse.json({ success: true }); // Nothing to delete
        }
        
        const currentFavorites = await getFavorites(userId);
        const fieldToUpdate = type === 'item' ? 'itemIds' : 'orderIds';
        currentFavorites[fieldToUpdate] = currentFavorites[fieldToUpdate].filter((favId: string) => favId !== id);

        const rowData = [userId, JSON.stringify(currentFavorites.itemIds), JSON.stringify(currentFavorites.orderIds)];
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, rowData);
        
        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Error in DELETE /api/favorites:", error);
         return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
