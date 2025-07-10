
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const allowedFiles = ['brand.json', 'menu.json', 'orders.json', 'users.json', 'reviews.json', 'promotions.json', 'favorites.json'];
const dataDirectory = path.join(process.cwd(), 'data');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    
    if (!fileName) {
        return NextResponse.json({ success: false, message: 'File name is required.' }, { status: 400 });
    }

    if (!allowedFiles.includes(fileName)) {
        return NextResponse.json({ success: false, message: 'Access to this file is not permitted.' }, { status: 403 });
    }

    const filePath = path.join(dataDirectory, fileName);
    
    try {
        await fs.access(filePath);
    } catch (error) {
        return NextResponse.json({ success: false, message: `File not found: ${fileName}` }, { status: 404 });
    }
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return NextResponse.json({ success: true, content: JSON.parse(fileContent) });

  } catch (error) {
    console.error("Error in GET /api/admin/data-files:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
