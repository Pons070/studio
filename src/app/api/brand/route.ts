
import { NextResponse } from 'next/server';
import { getBrandInfo, setBrandInfo } from '@/lib/brand-store';
import type { BrandInfo } from '@/lib/types';

// GET - Fetches the current brand information
export async function GET() {
  return NextResponse.json({ success: true, brandInfo: getBrandInfo() });
}

// PUT - Updates the brand information
export async function PUT(request: Request) {
    try {
        const newBrandInfo: BrandInfo = await request.json();
        
        // In a real app, you would validate the incoming data with Zod
        
        setBrandInfo(newBrandInfo);

        return NextResponse.json({ success: true, brandInfo: newBrandInfo });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
