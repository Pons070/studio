
import { NextResponse } from 'next/server';
import { getSheetData, updateSheetData, objectToRow } from '@/lib/google-sheets';
import type { BrandInfo } from '@/lib/types';

const SHEET_NAME = 'Brand';
const HEADERS = ['name', 'logoUrl', 'logoShape', 'phone', 'adminEmail', 'showAddressInAbout', 'showPhoneInAbout', 'address', 'about', 'businessHours', 'youtubeUrl', 'instagramUrl', 'allowOrderUpdates', 'theme', 'blockedCustomerEmails', 'deliveryAreas'];

function parseBrandInfo(row: any): BrandInfo {
    return {
        ...row,
        showAddressInAbout: row.showAddressInAbout === 'TRUE',
        showPhoneInAbout: row.showPhoneInAbout === 'TRUE',
        allowOrderUpdates: row.allowOrderUpdates === 'TRUE',
        address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
        businessHours: typeof row.businessHours === 'string' ? JSON.parse(row.businessHours) : row.businessHours,
        theme: typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme,
        blockedCustomerEmails: typeof row.blockedCustomerEmails === 'string' ? JSON.parse(row.blockedCustomerEmails) : [],
        deliveryAreas: typeof row.deliveryAreas === 'string' ? JSON.parse(row.deliveryAreas) : [],
    };
}

export async function GET() {
  try {
    const data = await getSheetData(`${SHEET_NAME}!A2:P2`);
    if (!data.length) {
      return NextResponse.json({ success: false, message: 'Brand information not found in spreadsheet.' }, { status: 404 });
    }
    const brandInfo = parseBrandInfo(data[0]);
    return NextResponse.json({ success: true, brandInfo });
  } catch (error) {
    console.error("Error in GET /api/brand:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const newBrandInfo: BrandInfo = await request.json();
        
        const updatedRow = objectToRow(HEADERS, newBrandInfo);
        await updateSheetData(`${SHEET_NAME}!A2`, updatedRow);

        return NextResponse.json({ success: true, brandInfo: newBrandInfo });
    } catch (error) {
        console.error("Error in PUT /api/brand:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
