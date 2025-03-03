// app/api/chats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserChats, createChat } from '@/lib/mongo/chats';
 
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
    const chats = await getUserChats(userId);
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch chats' },
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
    const { title, model } = body;
    
    if (!title) {
      return NextResponse.json(
        { message: 'Chat title is required' },
        { status: 400 }
      );
    }

    const chat = await createChat(userId, title, model);
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { message: 'Failed to create chat' },
      { status: 500 }
    );
  }
}