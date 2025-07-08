
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { BrandInfo } from '@/lib/types';

// This is the initial data that will be seeded into Firestore on first load.
const initialBrandInfo: BrandInfo = {
  name: 'CulinaPreOrder',
  logoUrl: '',
  logoShape: 'square',
  phone: '123-456-7890',
  adminEmail: 'admin@example.com',
  showAddressInAbout: true,
  showPhoneInAbout: true,
  address: {
    label: 'Main Branch',
    doorNumber: '123',
    apartmentName: 'Foodie Building',
    area: 'Flavor Town',
    city: 'Metropolis',
    state: 'Culinary State',
    pincode: '12345',
  },
  about:
    'CulinaPreOrder was born from a passion for exquisite food and a desire to make fine dining accessible. We believe in quality ingredients, handcrafted recipes, and the convenience of pre-ordering, allowing you to enjoy gourmet meals without the wait.',
  businessHours: {
    status: 'open',
    message: 'We are temporarily closed. Please check back later!',
  },
  youtubeUrl: '',
  instagramUrl: '',
  allowOrderUpdates: true,
  theme: {
    primaryColor: '222.2 47.4% 11.2%',
    backgroundColor: '0 0% 100%',
    accentColor: '210 40% 96.1%',
    cardColor: '0 0% 100%',
    cardOpacity: 1,
    borderRadius: 0.5,
    backgroundImageUrl: '',
  },
  blockedCustomerEmails: [],
  deliveryAreas: [
    { id: 'da-1', pincode: '12345', areaName: 'Flavor Town', cost: 50 },
    { id: 'da-2', pincode: '23456', areaName: 'Paradise Island', cost: 75 },
    { id: 'da-3', pincode: '34567', areaName: 'Confectionville', cost: 60 },
  ],
};


// GET - Fetches the current brand information, seeding it if it doesn't exist
export async function GET() {
  if (!db) {
    return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
  }
  try {
    const brandRef = doc(db, 'brand', 'info');
    let brandDoc = await getDoc(brandRef);

    if (!brandDoc.exists()) {
      await setDoc(brandRef, initialBrandInfo);
      brandDoc = await getDoc(brandRef);
    }
    
    return NextResponse.json({ success: true, brandInfo: brandDoc.data() });
  } catch (error) {
    console.error("Error in GET /api/brand:", error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT - Updates the brand information
export async function PUT(request: Request) {
    if (!db) {
      return NextResponse.json({ success: false, message: 'Firebase not configured.' }, { status: 500 });
    }
    try {
        const newBrandInfo: BrandInfo = await request.json();
        
        const brandRef = doc(db, 'brand', 'info');
        await setDoc(brandRef, newBrandInfo, { merge: true });

        return NextResponse.json({ success: true, brandInfo: newBrandInfo });
    } catch (error) {
        console.error("Error in PUT /api/brand:", error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
