// src/client/api.js - Updated for Feathers.js
import client from './feathers';

// Authentication API
export const authAPI = {
  // Register a new user
  register: async (email, password, fullName) => {
    try {
      const user = await client.service('users').create({
        email,
        password,
        full_name: fullName || ''
      });
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      const response = await client.authenticate({
        strategy: 'local',
        email,
        password
      });
      return { success: true, user: response.user, accessToken: response.accessToken };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  },

  // Logout the current user
  logout: async () => {
    try {
      await client.logout();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  },

  // Check if user is authenticated
  reAuthenticate: async () => {
    try {
      const response = await client.reAuthenticate();
      return { success: true, user: response.user, accessToken: response.accessToken };
    } catch (error) {
      // Not authenticated
      console.log('User not authenticated');
      return { success: false };
    }
  }
};

// User Profile API
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const user = await client.service('users').get('current');
      return { success: true, profile: user };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error };
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const user = await client.service('users').patch('current', updates);
      return { success: true, profile: user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }
  }
};

// Chats API
export const chatAPI = {
  // Get user's chats
  getChats: async () => {
    try {
      const chats = await client.service('chats').find({
        query: {
          $sort: { updated_at: -1 }
        }
      });
      return { success: true, chats: chats.data };
    } catch (error) {
      console.error('Get chats error:', error);
      return { success: false, error, chats: [] };
    }
  },

  // Get a single chat
  getChat: async (chatId) => {
    try {
      const chat = await client.service('chats').get(chatId);
      return { success: true, chat };
    } catch (error) {
      console.error('Get chat error:', error);
      return { success: false, error };
    }
  },

  // Create a new chat
  createChat: async (title, model = null) => {
    try {
      const chat = await client.service('chats').create({
        title,
        model
      });
      return { success: true, chat };
    } catch (error) {
      console.error('Create chat error:', error);
      return { success: false, error };
    }
  },

  // Update chat title
  updateChat: async (chatId, updates) => {
    try {
      const chat = await client.service('chats').patch(chatId, updates);
      return { success: true, chat };
    } catch (error) {
      console.error('Update chat error:', error);
      return { success: false, error };
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    try {
      await client.service('chats').remove(chatId);
      return { success: true };
    } catch (error) {
      console.error('Delete chat error:', error);
      return { success: false, error };
    }
  }
};

// Messages API
export const messageAPI = {
  // Get chat messages
  getMessages: async (chatId) => {
    try {
      const messages = await client.service('message').find({
        query: {
          chat_id: chatId,
          $sort: { created_at: 1 }
        }
      });
      return { success: true, messages: messages.data };
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, error, messages: [] };
    }
  },

  // Send a message
  sendMessage: async (chatId, content, role = 'user', contentType = 'text', metadata = {}) => {
    try {
      const message = await client.service('message').create({
        chat_id: chatId,
        content,
        role,
        content_type: contentType,
        metadata
      });
      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error };
    }
  },

  // Update a message
  updateMessage: async (messageId, updates) => {
    try {
      const message = await client.service('message').patch(messageId, updates);
      return { success: true, message };
    } catch (error) {
      console.error('Update message error:', error);
      return { success: false, error };
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      await client.service('message').remove(messageId);
      return { success: true };
    } catch (error) {
      console.error('Delete message error:', error);
      return { success: false, error };
    }
  }
};

// Generations API
export const generationAPI = {
  // Get user's generations
  getGenerations: async () => {
    try {
      const generations = await client.service('generations').find({
        query: {
          $sort: { created_at: -1 }
        }
      });
      return { success: true, generations: generations.data };
    } catch (error) {
      console.error('Get generations error:', error);
      return { success: false, error, generations: [] };
    }
  },

  // Get chat generations
  getChatGenerations: async (chatId) => {
    try {
      const generations = await client.service('generations').find({
        query: {
          chat_id: chatId,
          $sort: { created_at: -1 }
        }
      });
      return { success: true, generations: generations.data };
    } catch (error) {
      console.error('Get chat generations error:', error);
      return { success: false, error, generations: [] };
    }
  },

  // Create a new generation
  createGeneration: async (chatId, prompt, url, model = null, metadata = {}) => {
    try {
      const generation = await client.service('generations').create({
        chat_id: chatId,
        prompt,
        url,
        model,
        metadata
      });
      return { success: true, generation };
    } catch (error) {
      console.error('Create generation error:', error);
      return { success: false, error };
    }
  },

  // Delete a generation
  deleteGeneration: async (generationId) => {
    try {
      await client.service('generations').remove(generationId);
      return { success: true };
    } catch (error) {
      console.error('Delete generation error:', error);
      return { success: false, error };
    }
  }
};

// Upload API
export const uploadAPI = {
  // Upload a file
  uploadFile: async (file, isGenerated = false, chatId = null, prompt = null, model = null) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', file.type);
      formData.append('isGenerated', isGenerated.toString());
      
      if (chatId) formData.append('chatId', chatId);
      if (prompt) formData.append('prompt', prompt);
      if (model) formData.append('model', model);
      
      // Use REST endpoint for file upload instead of feathers client
      const response = await fetch(`${client.io.io.uri}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client.authentication.storage.getItem('auth-jwt')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error };
    }
  }
};

// AI Service for interacting with OpenAI and other providers
export const aiAPI = {
  // Generate chat completion
  async generateChatResponse(message, model, messageHistory = []) {
    try {
      // This will need to be implemented in your backend
      // For now, simulate the API call
      console.log('Generating chat response with model:', model);
      
      // In a real implementation, this would call your backend service
      // For example, you could create a `ai` service in Feathers
      
      // Demo implementation
      const response = {
        content: `This is a simulated response for message: "${message}" using model: ${model}`,
        role: 'assistant'
      };
      
      return { success: true, response };
    } catch (error) {
      console.error('Chat API Error:', error);
      return { success: false, error };
    }
  },

  // Generate image
  async generateImage(prompt) {
    try {
      // In a real implementation, this would call your backend service
      console.log('Generating image for prompt:', prompt);
      
      // Demo implementation - return a placeholder
      return { 
        success: true, 
        imageData: 'placeholder_base64_data'
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return { success: false, error };
    }
  }
};

// Setup real-time listeners
export const setupRealTimeListeners = () => {
  // Listen for new messages
  client.service('message').on('created', message => {
    console.log('New message received:', message);
    // You would dispatch an action or update state here
  });
  
  // Listen for new chats
  client.service('chats').on('created', chat => {
    console.log('New chat created:', chat);
    // You would dispatch an action or update state here
  });
  
  // Listen for chat updates
  client.service('chats').on('patched', chat => {
    console.log('Chat updated:', chat);
    // You would dispatch an action or update state here
  });
  
  // Listen for new generations
  client.service('generations').on('created', generation => {
    console.log('New generation created:', generation);
    // You would dispatch an action or update state here
  });
};

export default client;