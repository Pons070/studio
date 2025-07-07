
import { NextResponse } from 'next/server';
import type { Address } from '@/lib/types';

// In a real application, these handlers would interact with a database.
// For this prototype, we'll simulate the API's role: validating input
// and returning a success response with the manipulated data object.
// The actual state persistence is handled on the client-side.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Here you would validate the address data (e.g., using Zod)
    const newAddress: Address = {
      ...body,
      id: `ADDR-${Date.now()}`, // Generate ID on the "server"
      isDefault: body.isDefault || false,
    };
    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body: Address = await request.json();
        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Address ID is required for an update.' }, { status: 400 });
        }
        // In a real app, update the address in the DB. Here we just validate and return it.
        return NextResponse.json({ success: true, address: body });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Address ID is required for deletion.' }, { status: 400 });
        }
        // In a real app, delete the address from the DB. Here, we just confirm the action.
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
