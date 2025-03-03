// app/api/generations/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserGenerations, createGeneration } from '@/lib/mongo/generations';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/auth';

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
    const generations = await getUserGenerations(userId);
    return NextResponse.json({ generations });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const { chatId, prompt, url, model, metadata = {} } = body;
    
    if (!chatId || !prompt || !url) {
      return NextResponse.json(
        { message: 'Chat ID, prompt, and URL are required' },
        { status: 400 }
      );
    }
    
    const generation = await createGeneration(userId, chatId, prompt, url, model, metadata);
    return NextResponse.json({ generation }, { status: 201 });
  } catch (error) {
    console.error('Error creating generation:', error);
    return NextResponse.json(
      { message: 'Failed to create generation' },
      { status: 500 }
    );
  }
}