// pages/api/chats/index.js
import { getServerSession } from 'next-auth/next';
import { getUserChats, createChat } from '@/lib/mongo/chats';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  // GET request to fetch user's chats
  if (req.method === 'GET') {
    try {
      const chats = await getUserChats(userId);
      return res.status(200).json({ chats });
    } catch (error) {
      console.error('Error fetching chats:', error);
      return res.status(500).json({ message: 'Failed to fetch chats' });
    }
  }

  // POST request to create a new chat
  if (req.method === 'POST') {
    try {
      const { title, model } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: 'Chat title is required' });
      }

      const chat = await createChat(userId, title, model);
      return res.status(201).json({ chat });
    } catch (error) {
      console.error('Error creating chat:', error);
      return res.status(500).json({ message: 'Failed to create chat' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// pages/api/chats/[id].js
import { getServerSession } from 'next-auth/next';
import { getChatById, updateChat, deleteChat } from '@/lib/mongo/chats';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const chatId = req.query.id;

  // GET request to fetch a specific chat
  if (req.method === 'GET') {
    try {
      const chat = await getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check ownership
      if (chat.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      return res.status(200).json({ chat });
    } catch (error) {
      console.error('Error fetching chat:', error);
      return res.status(500).json({ message: 'Failed to fetch chat' });
    }
  }

  // PUT request to update a chat
  if (req.method === 'PUT') {
    try {
      const { title, model } = req.body;
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
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check ownership
      if (chat.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedChat = await updateChat(chatId, updates);
      return res.status(200).json({ chat: updatedChat });
    } catch (error) {
      console.error('Error updating chat:', error);
      return res.status(500).json({ message: 'Failed to update chat' });
    }
  }

  // DELETE request to delete a chat
  if (req.method === 'DELETE') {
    try {
      // Get the chat to check ownership
      const chat = await getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check ownership
      if (chat.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await deleteChat(chatId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting chat:', error);
      return res.status(500).json({ message: 'Failed to delete chat' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// pages/api/chats/[id]/messages.js
import { getServerSession } from 'next-auth/next';
import { getChatById } from '@/lib/mongo/chats';
import { getChatMessages, saveMessage } from '@/lib/mongo/messages';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const chatId = req.query.id;

  // Check chat ownership
  try {
    const chat = await getChatById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    if (chat.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    console.error('Error checking chat ownership:', error);
    return res.status(500).json({ message: 'Failed to process request' });
  }

  // GET request to fetch messages
  if (req.method === 'GET') {
    try {
      const messages = await getChatMessages(chatId);
      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
  }

  // POST request to save a message
  if (req.method === 'POST') {
    try {
      const { content, role, content_type = 'text', metadata = {} } = req.body;
      
      if (!content || !role) {
        return res.status(400).json({ message: 'Content and role are required' });
      }
      
      const message = await saveMessage(chatId, {
        content,
        role,
        content_type,
        metadata
      });
      
      return res.status(201).json({ message });
    } catch (error) {
      console.error('Error saving message:', error);
      return res.status(500).json({ message: 'Failed to save message' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// pages/api/generations/index.js
import { getServerSession } from 'next-auth/next';
import { getUserGenerations, createGeneration } from '@/lib/mongo/generations';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  // GET request to fetch user's generations
  if (req.method === 'GET') {
    try {
      const generations = await getUserGenerations(userId);
      return res.status(200).json({ generations });
    } catch (error) {
      console.error('Error fetching generations:', error);
      return res.status(500).json({ message: 'Failed to fetch generations' });
    }
  }

  // POST request to create a new generation
  if (req.method === 'POST') {
    try {
      const { chatId, prompt, url, model, metadata = {} } = req.body;
      
      if (!chatId || !prompt || !url) {
        return res.status(400).json({ message: 'Chat ID, prompt, and URL are required' });
      }
      
      const generation = await createGeneration(userId, chatId, prompt, url, model, metadata);
      return res.status(201).json({ generation });
    } catch (error) {
      console.error('Error creating generation:', error);
      return res.status(500).json({ message: 'Failed to create generation' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// pages/api/generations/[id].js
import { getServerSession } from 'next-auth/next';
import { getGenerationById, deleteGeneration } from '@/lib/mongo/generations';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const generationId = req.query.id;

  // GET request to fetch a specific generation
  if (req.method === 'GET') {
    try {
      const generation = await getGenerationById(generationId);
      
      if (!generation) {
        return res.status(404).json({ message: 'Generation not found' });
      }
      
      // Check ownership
      if (generation.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      return res.status(200).json({ generation });
    } catch (error) {
      console.error('Error fetching generation:', error);
      return res.status(500).json({ message: 'Failed to fetch generation' });
    }
  }

  // DELETE request to delete a generation
  if (req.method === 'DELETE') {
    try {
      // Get the generation to check ownership
      const generation = await getGenerationById(generationId);
      
      if (!generation) {
        return res.status(404).json({ message: 'Generation not found' });
      }
      
      // Check ownership
      if (generation.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await deleteGeneration(generationId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting generation:', error);
      return res.status(500).json({ message: 'Failed to delete generation' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}