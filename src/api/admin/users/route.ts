
import { NextResponse } from 'next/server';
import { users } from '@/lib/user-store';

// DELETE - Deletes a user account by an admin
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

        // Prevent admin from deleting themselves
        if (users[userIndex].email === 'admin@example.com') {
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        users[userIndex].deletedAt = new Date().toISOString();
        users[userIndex].updatedAt = new Date().toISOString();
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
