
import { NextResponse } from 'next/server';
import { getUsers, updateUser, findUserById } from '@/lib/user-store';

export async function GET() {
    try {
        const users = getUsers();
        // Filter out admin and soft-deleted users
        const customers = users.filter(user => user.email !== 'admin@example.com' && !user.deletedAt);
        return NextResponse.json({ success: true, users: customers });
    } catch (error) {
        console.error("Error in GET /api/admin/users:", error);
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
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        // Soft delete the user
        const updatedUser = { ...user, deletedAt: new Date().toISOString() };
        updateUser(updatedUser);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/admin/users:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
