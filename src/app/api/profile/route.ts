
import { NextResponse } from 'next/server';
import { users } from '@/lib/mock-data'; // Use mock-data as a "database"
import type { User } from '@/lib/types';

// PUT - Updates a user's profile info
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone } = body;

    if (!userId || !name || !phone) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    // In a real app, find and update user in DB. Here, we just simulate.
    const user = users.find(u => u.id === userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    // Create a new object for the updated user to avoid modifying the imported mock data directly
    const updatedUser = { ...user, name, phone };

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
        
        // In a real app, you'd delete from the DB.
        console.log(`Simulating deletion of user: ${userId}`);
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
