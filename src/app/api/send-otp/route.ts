
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import { getSheetData } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length < 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number provided.' }, { status: 400 });
    }

    const usersData = await getSheetData('Users!A:H');
    const existingUser = usersData.find(u => u.phone === phoneNumber && !u.deletedAt);
    const isNewUser = !existingUser;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phoneNumber] = otp;

    // In a real app, you would send this OTP via an SMS service (e.g., Twilio).
    // For this prototype, we log it to the console and return it in the response for easy testing.
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully!', otp, isNewUser });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
