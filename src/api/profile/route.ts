
import { NextResponse } from 'next/server';
import { users } from '@/lib/user-store';

// PUT - Updates a user's profile info
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone, email } = body;

    if (!userId || !name || !phone || !email) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const userIndex = users.findIndex(u => u.id === userId && !u.deletedAt);
    if (userIndex === -1) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    users[userIndex] = { ...users[userIndex], name, phone, email, updatedAt: new Date().toISOString() };

    return NextResponse.json({ success: true, user: users[userIndex] });
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
        
        const userIndex = users.findIndex(u => u.id === userId && !u.deletedAt);
        if (userIndex === -1) {
             return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        users[userIndex].deletedAt = new Date().toISOString();
        users[userIndex].updatedAt = new Date().toISOString();
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
