
import { NextResponse } from 'next/server';
import type { Address } from '@/lib/types';
import { findUserById, updateUser } from '@/lib/user-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const user = findUserById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
    };
    
    if (!user.addresses) {
      user.addresses = [];
    }
    
    // Set as default if it's the first address
    if (user.addresses.length === 0) {
        newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    
    updateUser(user);

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
    console.error("Error in POST /api/addresses:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body: Address & { userId: string } = await request.json();
        const { userId, ...addressData } = body;

        if (!userId || !addressData.id) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required for an update.' }, { status: 400 });
        }
        
        const user = findUserById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        if (!user.addresses) {
            user.addresses = [];
        }
        
        const addressIndex = user.addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address to update not found.' }, { status: 404 });
        }

        user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...addressData };

        updateUser(user);

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        console.error("Error in PUT /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId, addressId } = await request.json();
        if (!userId || !addressId) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required for deletion.' }, { status: 400 });
        }

        const user = findUserById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        if (!user.addresses) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        
        const addressToDelete = user.addresses.find(a => a.id === addressId);
        if (!addressToDelete) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        const wasDefault = addressToDelete?.isDefault;
        
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        
        // If the deleted address was the default, make the first one the new default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        updateUser(user);

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
