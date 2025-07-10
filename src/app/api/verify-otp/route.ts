
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import { findUserByPhone, addUser } from '@/lib/user-store';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp, name } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, message: 'Phone number and OTP are required.' }, { status: 400 });
    }

    // This is a mock verification. In a real app, you would have a more secure system.
    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
      // OTP is correct, clear it
      delete otpStore[phoneNumber];

      let user = await findUserByPhone(phoneNumber);

      if (!user) {
        // This is a new user, create an account
        if (!name) {
          return NextResponse.json({ success: false, message: 'Name is required for new user signup.' }, { status: 400 });
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email: `${phoneNumber}@example.com`, // Create a dummy email
          phone: phoneNumber,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addUser(newUser);
        user = newUser;
      }
      
      // Return the user object on successful login/signup
      return NextResponse.json({ success: true, message: 'OTP verified successfully!', user });

    } else {
      // Invalid OTP
      return NextResponse.json({ success: false, message: 'Invalid OTP or phone number.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
