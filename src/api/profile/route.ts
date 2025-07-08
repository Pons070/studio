
import { NextResponse } from 'next/server';
import { getSheetValues, convertRowsToObjects, findRowIndex, updateSheetData, objectToRow } from '@/lib/google-sheets';
import type { User } from '@/lib/types';

const SHEET_NAME = 'Users';
const HEADERS = ['id', 'name', 'email', 'phone', 'addresses', 'createdAt', 'updatedAt', 'deletedAt'];

async function getUser(userId: string): Promise<{user: User, rowIndex: number} | null> {
    const rowIndex = await findRowIndex(SHEET_NAME, userId);
    if (rowIndex === -1) return null;
    const rows = await getSheetValues(`${SHEET_NAME}!A${rowIndex}:H${rowIndex}`);
    if (!rows.length) return null;
    
    const userObject = convertRowsToObjects(HEADERS, rows)[0];
    const user = { ...userObject, addresses: typeof userObject.addresses === 'string' ? JSON.parse(userObject.addresses) : [] };
    return { user, rowIndex };
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }
    
    const userData = await getUser(userId);
    if (!userData) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const { user, rowIndex } = userData;

    const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
    const updatedRow = objectToRow(HEADERS, updatedUser);

    await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
        }
        
        const userData = await getUser(userId);
        if (!userData) {
             return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        const { user, rowIndex } = userData;
        
        if (user.email === 'admin@example.com') {
            return NextResponse.json({ success: false, message: 'Admin account cannot be deleted.' }, { status: 403 });
        }
        
        const updatedUser = { ...user, deletedAt: new Date().toISOString() };
        const updatedRow = objectToRow(HEADERS, updatedUser);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/profile:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
