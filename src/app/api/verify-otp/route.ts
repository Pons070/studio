
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, message: 'Phone number and OTP are required.' }, { status: 400 });
    }

    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
      // OTP is valid, remove it from store after successful verification
      delete otpStore[phoneNumber];
      return NextResponse.json({ success: true, message: 'OTP verified successfully!' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP or phone number.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
