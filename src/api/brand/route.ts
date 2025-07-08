
import { NextResponse } from 'next/server';
import { getBrandInfo, setBrandInfo } from '@/lib/brand-store';
import type { BrandInfo } from '@/lib/types';

export async function GET() {
  try {
    const brandInfo = getBrandInfo();
    return NextResponse.json({ success: true, brandInfo });
  } catch (error) {
    console.error("Error in GET /api/brand:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const newBrandInfo: BrandInfo = await request.json();
        setBrandInfo(newBrandInfo);
        return NextResponse.json({ success: true, brandInfo: newBrandInfo });
    } catch (error) {
        console.error("Error in PUT /api/brand:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
