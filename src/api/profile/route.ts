
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// PUT - Updates a user's profile info
export async function PUT(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...profileData, updatedAt: new Date().toISOString() });
    
    const updatedUserDoc = await getDoc(userRef);
    const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() };

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE - Deletes a user account (soft delete)
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
            return NextResponse.json({ success: false, message: 'Admin account cannot be deleted.' }, { status: 403 });
        }
        
        // This is a hard delete now with Firestore. In a real app, you might want a soft delete flag.
        // But for prototype consistency with Auth user deletion, we do a hard delete of the profile.
        // The client-side logic in useAuth handles deleting the actual Firebase Auth user.
        await deleteDoc(userRef);
        
        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error("Error in DELETE /api/profile:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
