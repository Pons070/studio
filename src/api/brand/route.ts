
import { NextResponse } from 'next/server';
import type { BrandInfo } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/brand.json');

async function getBrandData(): Promise<BrandInfo> {
    const jsonData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
}

export async function GET() {
  try {
    const brandInfo = await getBrandData();
    return NextResponse.json({ success: true, brandInfo });
  } catch (error) {
    console.error("Error in GET /api/brand:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const newBrandInfo: BrandInfo = await request.json();
        await fs.writeFile(dataFilePath, JSON.stringify(newBrandInfo, null, 2));
        return NextResponse.json({ success: true, brandInfo: newBrandInfo });
    } catch (error) {
        console.error("Error in PUT /api/brand:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
