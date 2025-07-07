
import { NextResponse } from 'next/server';
import { getUsers, updateUserInStore, removeUserFromStore } from '@/lib/user-store';

// PUT - Updates a user's profile info
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone } = body;

    if (!userId || !name || !phone) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const updatedUser = { ...users[userIndex], name, phone };
    const success = updateUserInStore(updatedUser);
    if (!success) {
        throw new Error('Failed to update user in store.');
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE - Deletes a user account
export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required for deletion.' }, { status: 400 });
        }
        
        const success = removeUserFromStore(userId);
        if (!success) {
             return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
