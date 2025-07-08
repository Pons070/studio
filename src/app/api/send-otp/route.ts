
// This API route is deprecated.
// OTP sending is now handled on the client-side via Firebase Authentication.
// See src/store/auth.tsx for the new implementation.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ 
      success: false, 
      message: 'This endpoint is deprecated. Please use the new client-side Firebase Auth flow.' 
    }, { status: 410 });
}
