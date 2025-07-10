
import { NextResponse } from 'next/server';
import { getUsers, findUserById, updateUser } from '@/lib/user-store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const getAdmin = searchParams.get('admin');

    try {
        const users = await getUsers();
        if (getAdmin === 'true') {
            const adminUser = users.find(user => user.email === 'admin@example.com');
            return NextResponse.json({ success: true, user: adminUser });
        }
        
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
        
        const user = await findUserById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        if (user.email === 'admin@example.com') {
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        // Soft delete the user
        const updatedUser = { ...user, deletedAt: new Date().toISOString() };
        await updateUser(updatedUser);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/admin/users:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
