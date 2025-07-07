
import { NextResponse } from 'next/server';
import { getUsers, removeUserFromStore } from '@/lib/user-store';

// DELETE - Deletes a user account by an admin
export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required for deletion.' }, { status: 400 });
        }
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        // Prevent admin from deleting themselves
        if (users[userIndex].email === 'admin@example.com') {
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        const success = removeUserFromStore(userId);
        if (!success) {
            throw new Error('Failed to remove user from store.');
        }
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
