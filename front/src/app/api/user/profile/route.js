// app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserById, updateUserProfile } from '@/lib/mongo/users';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/auth';
import { hash } from 'bcryptjs';

export async function GET(request) {
  const session = await getServerSession(nextAuthOptions);

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const profile = {
      id: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await getServerSession(nextAuthOptions);

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const updates = { ...body };
    
    // Don't allow email updates through this endpoint
    if (updates.email) {
      delete updates.email;
    }
    
    // If updating password, hash it
    if (updates.password) {
      updates.password = await hash(updates.password, 12);
    }

    const updatedUser = await updateUserProfile(userId, updates);
    
    // Remove sensitive information
    const profile = {
      id: updatedUser._id.toString(),
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      avatar_url: updatedUser.avatar_url,
      created_at: updatedUser.created_at,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}