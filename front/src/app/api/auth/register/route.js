// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/mongo/users';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create the user
    const user = await createUser({
      email,
      password,
      full_name: full_name || '',
    });

    // Remove sensitive information
    const safeUser = {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    };

    return NextResponse.json(
      { message: 'User registered successfully', user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}