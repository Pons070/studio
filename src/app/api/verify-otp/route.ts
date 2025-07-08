
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import { getSheetData, appendSheetData, objectToRow } from '@/lib/google-sheets';
import type { User } from '@/lib/types';

const SHEET_NAME = 'Users';
const HEADERS = ['id', 'name', 'email', 'phone', 'addresses', 'createdAt', 'updatedAt', 'deletedAt'];

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp, name } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, message: 'Phone number and OTP are required.' }, { status: 400 });
    }

    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
      delete otpStore[phoneNumber];

      const usersData = await getSheetData(`${SHEET_NAME}!A:H`);
      let user = usersData.find(u => u.phone === phoneNumber && !u.deletedAt);

      if (!user) {
        if (!name) {
          return NextResponse.json({ success: false, message: 'Name is required for new user signup.' }, { status: 400 });
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email: `${phoneNumber}@example.com`,
          phone: phoneNumber,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const newRow = objectToRow(HEADERS, newUser);
        await appendSheetData(SHEET_NAME, newRow);
        user = newUser;
      }
      
      return NextResponse.json({ success: true, message: 'OTP verified successfully!', user });

    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP or phone number.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
