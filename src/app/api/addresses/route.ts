
import { NextResponse } from 'next/server';
import { findUserById, updateUser } from '@/lib/user-store';
import type { Address } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
      isDefault: !user.addresses || user.addresses.length === 0,
    };
    
    const updatedAddresses = [...(user.addresses || []), newAddress];
    await updateUser({ ...user, addresses: updatedAddresses });

    return NextResponse.json({ success: true, user: { ...user, addresses: updatedAddresses } });
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
        
        const user = await findUserById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

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
        await updateUser(updatedUser);
        
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

        const user = await findUserById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

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
        await updateUser(updatedUser);

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
