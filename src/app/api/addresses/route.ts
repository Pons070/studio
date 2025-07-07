
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

    const user = users.find(u => u.id === userId);
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
    
    user.addresses.push(newAddress);

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
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
        
        const user = users.find(u => u.id === userId);
        if (!user || !user.addresses) {
            return NextResponse.json({ success: false, message: 'User or addresses not found.' }, { status: 404 });
        }
        
        const addressIndex = user.addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }

        user.addresses[addressIndex] = addressData;

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId, addressId } = await request.json();
        if (!userId || !addressId) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required for deletion.' }, { status: 400 });
        }

        const user = users.find(u => u.id === userId);
        if (!user || !user.addresses) {
            return NextResponse.json({ success: false, message: 'User or addresses not found.' }, { status: 404 });
        }
        
        const initialLength = user.addresses.length;
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        
        if (user.addresses.length === initialLength) {
             return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
