
import { NextResponse } from 'next/server';
import type { Address } from '@/lib/types';
import { users } from '@/lib/user-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const user = users[userIndex];
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
    };
    
    if (!user.addresses) {
      user.addresses = [];
    }
    
    user.addresses.push(newAddress);
    
    // Explicitly update the user in the global store array
    users[userIndex] = user;

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
        
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const user = users[userIndex];
        
        if (!user.addresses) {
            user.addresses = [];
        }
        
        const addressIndex = user.addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address to update not found.' }, { status: 404 });
        }

        user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...addressData };

        // Explicitly update the user in the global store array
        users[userIndex] = user;

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

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        const user = users[userIndex];

        if (!user.addresses) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        
        const initialLength = user.addresses.length;
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        
        if (user.addresses.length === initialLength) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        
        // Explicitly update the user in the global store array
        users[userIndex] = user;

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
