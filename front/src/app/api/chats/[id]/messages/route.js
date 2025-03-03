// app/api/chats/[id]/messages/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getChatById } from '@/lib/mongo/chats';
import { getChatMessages, saveMessage } from '@/lib/mongo/messages';
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
  const chatId = params.id;

  // Check chat ownership
  try {
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return NextResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    if (chat.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error checking chat ownership:', error);
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    );
  }

  try {
    const messages = await getChatMessages(chatId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const session = await getServerSession(nextAuthOptions);

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const chatId = params.id;

  // Check chat ownership
  try {
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return NextResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    if (chat.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error checking chat ownership:', error);
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { content, role, content_type = 'text', metadata = {} } = body;
    
    if (!content || !role) {
      return NextResponse.json(
        { message: 'Content and role are required' },
        { status: 400 }
      );
    }
    
    const message = await saveMessage(chatId, {
      content,
      role,
      content_type,
      metadata
    });
    
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { message: 'Failed to save message' },
      { status: 500 }
    );
  }
}