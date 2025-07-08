
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import type { Address, User } from '@/lib/types';

async function getUserDoc(userId: string) {
    if (!db) {
        throw new Error("Firestore is not initialized. Check your Firebase configuration.");
    }
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return { userRef, userDoc };
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const { userRef, userDoc } = await getUserDoc(userId);
    if (!userDoc.exists()) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    
    const currentUserData = userDoc.data() as User;
    
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Date.now()}`,
      isDefault: !currentUserData.addresses || currentUserData.addresses.length === 0,
    };
    
    await updateDoc(userRef, {
        addresses: arrayUnion(newAddress)
    });

    const finalUser = { ...currentUserData, addresses: [...(currentUserData.addresses || []), newAddress]};

    return NextResponse.json({ success: true, user: finalUser });
  } catch (error) {
    console.error("Error in POST /api/addresses:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const body: Address & { userId: string } = await request.json();
        const { userId, ...addressData } = body;

        if (!userId || !addressData.id) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required.' }, { status: 400 });
        }
        
        const { userRef, userDoc } = await getUserDoc(userId);
        if (!userDoc.exists()) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        const currentUserData = userDoc.data() as User;
        let addresses = currentUserData.addresses || [];
        
        const addressIndex = addresses.findIndex(a => a.id === addressData.id);
        if (addressIndex === -1) {
            return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }
        
        if (addressData.isDefault) {
            addresses = addresses.map(a => ({...a, isDefault: false }));
        }
        
        addresses[addressIndex] = { ...addresses[addressIndex], ...addressData };

        await updateDoc(userRef, { addresses });
        
        const finalUser = { ...currentUserData, addresses };
        return NextResponse.json({ success: true, user: finalUser });

    } catch (error) {
        console.error("Error in PUT /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const { userId, addressId } = await request.json();
        if (!userId || !addressId) {
            return NextResponse.json({ success: false, message: 'User ID and Address ID are required.' }, { status: 400 });
        }

        const { userRef, userDoc } = await getUserDoc(userId);
        if (!userDoc.exists()) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
        
        const currentUserData = userDoc.data() as User;
        const addresses = currentUserData.addresses || [];
        
        const addressToDelete = addresses.find(a => a.id === addressId);
        if (!addressToDelete) {
             return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
        }
        
        let updatedAddresses = addresses.filter(a => a.id !== addressId);
        
        if (addressToDelete.isDefault && updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
            updatedAddresses[0].isDefault = true;
        }
        
        await updateDoc(userRef, { addresses: updatedAddresses });
        
        const finalUser = { ...currentUserData, addresses: updatedAddresses };

        return NextResponse.json({ success: true, user: finalUser });
    } catch (error) {
        console.error("Error in DELETE /api/addresses:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
