// app/api/generations/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getGenerationById, deleteGeneration } from '@/lib/mongo/generations';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function GET(request, { params }) {
  const session = await getServerSession(nextAuthOptions);

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const generationId = params.id;

  try {
    const generation = await getGenerationById(generationId);
    
    if (!generation) {
      return NextResponse.json(
        { message: 'Generation not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (generation.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ generation });
  } catch (error) {
    console.error('Error fetching generation:', error);
    return NextResponse.json(
      { message: 'Failed to fetch generation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(nextAuthOptions);

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const generationId = params.id;

  try {
    // Get the generation to check ownership
    const generation = await getGenerationById(generationId);
    
    if (!generation) {
      return NextResponse.json(
        { message: 'Generation not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (generation.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await deleteGeneration(generationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting generation:', error);
    return NextResponse.json(
      { message: 'Failed to delete generation' },
      { status: 500 }
    );
  }
}