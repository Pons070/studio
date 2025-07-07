
import { NextResponse } from 'next/server';
import type { Address, User } from '@/lib/types';
import { getUsers, updateUserInStore } from '@/lib/user-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    // Create a clone of the user to avoid direct mutation of the store's object reference
    const userToUpdate: User = { ...users[userIndex] };
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
    };
    
    if (!userToUpdate.addresses) {
      userToUpdate.addresses = [];
    }
    
    userToUpdate.addresses.push(newAddress);

    const success = updateUserInStore(userToUpdate);
    if (!success) {
      throw new Error('Failed to update user in store.');
    }

    return NextResponse.json({ success: true, user: userToUpdate });
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
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const userToUpdate: User = { ...users[userIndex] };
        
        if (!userToUpdate.addresses) {
            userToUpdate.addresses = [];
        }
        
        const addressIndex = userToUpdate.addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address to update not found.' }, { status: 404 });
        }

        userToUpdate.addresses[addressIndex] = { ...userToUpdate.addresses[addressIndex], ...addressData };

        const success = updateUserInStore(userToUpdate);
        if (!success) {
          throw new Error('Failed to update user in store.');
        }

        return NextResponse.json({ success: true, user: userToUpdate });
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

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        const userToUpdate: User = { ...users[userIndex] };

        if (!userToUpdate.addresses) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        
        const initialLength = userToUpdate.addresses.length;
        userToUpdate.addresses = userToUpdate.addresses.filter(a => a.id !== addressId);
        
        if (userToUpdate.addresses.length === initialLength) {
             return NextResponse.json({ success: false, message: 'Address to delete not found.' }, { status: 404 });
        }
        
        const success = updateUserInStore(userToUpdate);
        if (!success) {
          throw new Error('Failed to update user in store.');
        }

        return NextResponse.json({ success: true, user: userToUpdate });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
