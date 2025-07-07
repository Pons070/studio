
import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import { users } from '@/lib/user-store';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp, name } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, message: 'Phone number and OTP are required.' }, { status: 400 });
    }

    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
      delete otpStore[phoneNumber];

      let user = users.find(u => u.phone === phoneNumber && !u.deletedAt);

      if (!user) {
        // This is a new user
        if (!name) {
          return NextResponse.json({ success: false, message: 'Name is required for new user signup.' }, { status: 400 });
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          // Create a dummy email for prototype purposes
          email: `${phoneNumber}@example.com`,
          phone: phoneNumber,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        users.push(newUser);
        user = newUser;
      }
      
      // The frontend expects the full user object to log in
      const { password, ...userToReturn } = user;
      return NextResponse.json({ success: true, message: 'OTP verified successfully!', user: userToReturn });

    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP or phone number.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
