
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import { findUserByPhone } from '@/lib/user-store';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length < 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number provided.' }, { status: 400 });
    }

    // Check if user exists to tell the UI if it should ask for a name
    const existingUser = findUserByPhone(phoneNumber);
    const isNewUser = !existingUser;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phoneNumber] = otp;

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully!', otp, isNewUser });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
