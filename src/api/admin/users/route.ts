
import { NextResponse } from 'next/server';
import { getSheetData, updateSheetData, findRowIndex, objectToRow } from '@/lib/google-sheets';
import type { User } from '@/lib/types';

const SHEET_NAME = 'Users';
const HEADERS = ['id', 'name', 'email', 'phone', 'addresses', 'createdAt', 'updatedAt', 'deletedAt'];

export async function GET() {
    try {
        const data = await getSheetData(`${SHEET_NAME}!A:H`);
        const customers = data.filter((row: any) => row.email !== 'admin@example.com' && !row.deletedAt);
        return NextResponse.json({ success: true, users: customers });
    } catch (error) {
        console.error("Error in GET /api/admin/users:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
        }
        
        const rowIndex = await findRowIndex(SHEET_NAME, userId);
        if (rowIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const data = await getSheetData(`${SHEET_NAME}!A${rowIndex}:H${rowIndex}`);
        if (!data.length) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        if (data[0].email === 'admin@example.com') {
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        const updatedUser = { ...data[0], deletedAt: new Date().toISOString() };
        const updatedRow = objectToRow(HEADERS, updatedUser);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/admin/users:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
