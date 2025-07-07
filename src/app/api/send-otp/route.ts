
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length < 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number provided.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phoneNumber] = otp;

    // In a real application, you would integrate with an SMS gateway here
    console.log(`OTP for ${phoneNumber}: ${otp}`); // Log OTP to console for testing

    // We return the OTP here so the frontend can display it in a toast for easy testing
    return NextResponse.json({ success: true, message: 'OTP sent successfully!', otp });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
