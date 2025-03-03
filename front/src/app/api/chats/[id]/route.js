// app/api/chats/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getChatById, updateChat, deleteChat } from '@/lib/mongo/chats';
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

  try {
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return NextResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (chat.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { message: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

  try {
    const body = await request.json();
    const { title, model } = body;
    const updates = {};
    
    if (title !== undefined) {
      updates.title = title;
    }
    
    if (model !== undefined) {
      updates.model = model;
    }
    
    // Get the chat to check ownership
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return NextResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (chat.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const updatedChat = await updateChat(chatId, updates);
    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { message: 'Failed to update chat' },
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
  const chatId = params.id;

  try {
    // Get the chat to check ownership
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return NextResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (chat.user_id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { message: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}