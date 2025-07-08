
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';

// GET - Fetches all non-admin users
export async function GET() {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        // Exclude admin user and soft-deleted users from the customer list
        const customers = allUsers.filter(u => u.email !== 'admin@example.com' && !u.deletedAt);
        return NextResponse.json({ success: true, users: customers });
    } catch (error) {
        console.error("Error in GET /api/admin/users:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// DELETE - Deletes a user account by an admin
export async function DELETE(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
        }
        
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        if (userDoc.data().email === 'admin@example.com') {
             return NextResponse.json({ success: false, message: 'Cannot delete the primary admin account.' }, { status: 403 });
        }
        
        await deleteDoc(userRef);
        // Note: This only deletes the Firestore record. Deleting the Firebase Auth user
        // requires elevated privileges and should be done via a Firebase Function.
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
