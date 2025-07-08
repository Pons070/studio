
import { NextResponse } from 'next/server';
import { findUserById, updateUser as updateUserInStore } from '@/lib/user-store';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }
    
    const user = findUserById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
    updateUserInStore(updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
        }
        
        const user = findUserById(userId);
        if (!user) {
             return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        if (user.email === 'admin@example.com') {
            return NextResponse.json({ success: false, message: 'Admin account cannot be deleted.' }, { status: 403 });
        }
        
        // Soft delete the user
        const updatedUser = { ...user, deletedAt: new Date().toISOString() };
        updateUserInStore(updatedUser);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/profile:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
