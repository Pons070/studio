
import { NextResponse } from 'next/server';
import { getSheetValues, convertRowsToObjects, findRowIndex, updateSheetData, objectToRow } from '@/lib/google-sheets';
import type { Address, User } from '@/lib/types';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const userData = await getUser(userId);
    if (!userData) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const { user, rowIndex } = userData;
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
      isDefault: !user.addresses || user.addresses.length === 0,
    };
    
    const updatedAddresses = [...(user.addresses || []), newAddress];
    const updatedUser = { ...user, addresses: updatedAddresses };
    const updatedRow = objectToRow(HEADERS, updatedUser);

    await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in POST /api/addresses:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body: Address & { userId: string } = await request.json();
        const { userId, ...addressData } = body;

        if (!userId || !addressData.id) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required.' }, { status: 400 });
        }
        
        const userData = await getUser(userId);
        if (!userData) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const { user, rowIndex } = userData;
        let addresses = user.addresses || [];
        
        const addressIndex = addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }
        
        if (addressData.isDefault) {
            addresses = addresses.map(a => ({...a, isDefault: false }));
        }
        
        addresses[addressIndex] = { ...addresses[addressIndex], ...addressData };

        const updatedUser = { ...user, addresses };
        const updatedRow = objectToRow(HEADERS, updatedUser);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);
        
        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Error in PUT /api/addresses:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId, addressId } = await request.json();
        if (!userId || !addressId) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required.' }, { status: 400 });
        }

        const userData = await getUser(userId);
        if (!userData) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const { user, rowIndex } = userData;
        const addresses = user.addresses || [];
        
        const addressToDelete = addresses.find(a => a.id === addressId);
        if (!addressToDelete) {
             return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }
        
        let updatedAddresses = addresses.filter(a => a.id !== addressId);
        
        if (addressToDelete.isDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
            updatedAddresses[0].isDefault = true;
        }
        
        const updatedUser = { ...user, addresses: updatedAddresses };
        const updatedRow = objectToRow(HEADERS, updatedUser);
        await updateSheetData(`${SHEET_NAME}!A${rowIndex}`, updatedRow);

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
