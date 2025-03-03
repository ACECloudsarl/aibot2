// src/contexts/ChatContext.jsx - Modified for Feathers.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { chatAPI, messageAPI, generationAPI } from "@/client/api";
import client from "@/client/feathers";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export function ChatProvider({ children }) {
  const [chatList, setChatList] = useState([]);
  const [currentChat, setCurrentChat] = useState("new");
  const [messages, setMessages] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Load user's chats when authenticated
  useEffect(() => {
    let isMounted = true;

    const loadChats = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setChatList([]);
          setCurrentChat("new");
        }
        return;
      }
      
      setIsLoadingChats(true);
      try {
        const { success, chats, error } = await chatAPI.getChats();
        
        if (!success) {
          throw new Error(error?.message || 'Failed to fetch chats');
        }
        
        if (isMounted) {
          setChatList(chats || []);
          
          // Select the most recent chat if available
          if (chats?.length > 0) {
            setCurrentChat(chats[0]._id);
          } else {
            setCurrentChat("new");
          }
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        if (isMounted) {
          toast.error("Failed to load your chats");
        }
      } finally {
        if (isMounted) {
          setIsLoadingChats(false);
        }
      }
    };
    
    loadChats();
    
    // Setup real-time listeners
    const setupListeners = () => {
      // Listen for new chats
      client.service('chats').on('created', (chat) => {
        if (isMounted && chat.user_id === user?._id) {
          setChatList(prev => [chat, ...prev]);
        }
      });
      
      // Listen for chat updates
      client.service('chats').on('patched', (chat) => {
        if (isMounted && chat.user_id === user?._id) {
          setChatList(prev => prev.map(c => c._id === chat._id ? chat : c));
        }
      });
      
      // Listen for chat deletions
      client.service('chats').on('removed', (chat) => {
        if (isMounted && chat.user_id === user?._id) {
          setChatList(prev => prev.filter(c => c._id !== chat._id));
          
          // If the deleted chat was the current one, set to "new" or the next available
          if (currentChat === chat._id) {
            const remainingChats = chatList.filter(c => c._id !== chat._id);
            if (remainingChats.length > 0) {
              setCurrentChat(remainingChats[0]._id);
            } else {
              setCurrentChat("new");
            }
          }
        }
      });
    };
    
    if (isAuthenticated) {
      setupListeners();
    }
    
    return () => {
      isMounted = false;
      
      // Remove listeners
      if (isAuthenticated) {
        client.service('chats').removeAllListeners('created');
        client.service('chats').removeAllListeners('patched');
        client.service('chats').removeAllListeners('removed');
      }
    };
  }, [isAuthenticated, user]);

  // Load messages when chat changes
  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (currentChat === "new" || !currentChat || !isAuthenticated) {
        if (isMounted) setMessages([]);
        return;
      }
      
      setIsLoadingMessages(true);
      try {
        const { success, messages: chatMessages, error } = await messageAPI.getMessages(currentChat);
        
        if (!success) {
          throw new Error(error?.message || 'Failed to fetch messages');
        }
        
        if (isMounted && chatMessages) {
          const formattedMessages = chatMessages.map(msg => {
            // Base message properties
            const formattedMsg = {
              id: msg._id,
              content: msg.content,
              role: msg.role,
              created_at: msg.created_at,
              isStreaming: false,
              metadata: msg.metadata || {}
            };
            
            // Set type flags based on content_type
            switch (msg.content_type) {
              case 'image':
                formattedMsg.isImage = true;
                break;
              case 'pdf':
                formattedMsg.isPdf = true;
                formattedMsg.fileName = msg.metadata?.fileName || "Document.pdf";
                break;
              case 'document':
                formattedMsg.isDocument = true;
                formattedMsg.fileName = msg.metadata?.fileName || "Document";
                break;
              case 'spreadsheet':
                formattedMsg.isSpreadsheet = true;
                formattedMsg.fileName = msg.metadata?.fileName || "Spreadsheet";
                break;
              case 'file':
                formattedMsg.isGenericFile = true;
                formattedMsg.fileName = msg.metadata?.fileName || "File";
                formattedMsg.fileType = msg.metadata?.fileType;
                break;
            }
            
            return formattedMsg;
          });
          
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        if (isMounted) {
          toast.error("Failed to load chat messages");
        }
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    };
    
    loadMessages();
    
    // Setup real-time message listeners
    const setupMessageListeners = () => {
      // Listen for new messages in this chat
      client.service('message').on('created', (message) => {
        if (isMounted && message.chat_id === currentChat) {
          const formattedMsg = {
            id: message._id,
            content: message.content,
            role: message.role,
            created_at: message.created_at,
            isStreaming: false,
            metadata: message.metadata || {}
          };
          
          // Set type flags based on content_type
          switch (message.content_type) {
            case 'image':
              formattedMsg.isImage = true;
              break;
            case 'pdf':
              formattedMsg.isPdf = true;
              formattedMsg.fileName = message.metadata?.fileName || "Document.pdf";
              break;
            case 'document':
              formattedMsg.isDocument = true;
              formattedMsg.fileName = message.metadata?.fileName || "Document";
              break;
            case 'spreadsheet':
              formattedMsg.isSpreadsheet = true;
              formattedMsg.fileName = message.metadata?.fileName || "Spreadsheet";
              break;
            case 'file':
              formattedMsg.isGenericFile = true;
              formattedMsg.fileName = message.metadata?.fileName || "File";
              formattedMsg.fileType = message.metadata?.fileType;
              break;
          }
          
          setMessages(prev => [...prev, formattedMsg]);
        }
      });
    };
    
    if (isAuthenticated && currentChat !== "new") {
      setupMessageListeners();
    }
    
    return () => {
      isMounted = false;
      
      // Remove message listeners
      if (isAuthenticated) {
        client.service('message').removeAllListeners('created');
      }
    };
  }, [currentChat, isAuthenticated]);

  const createNewChat = async (title = "New Chat", model = null) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to create a chat");
      return null;
    }
    
    try {
      const { success, chat, error } = await chatAPI.createChat(title, model);
      
      if (!success) {
        throw new Error(error?.message || 'Failed to create chat');
      }
      
      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
      return null;
    }
  };

  const addMessage = async (content, role, contentType = 'text', metadata = {}, skipStateUpdate = false, model = null) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to send messages");
      return null;
    }
    
    // Create a new chat if needed
    let chatId = currentChat;
    if (currentChat === "new") {
      const newChat = await createNewChat(
        content.length > 30 ? content.substring(0, 30) + "..." : content,
        model
      );
      if (!newChat) return null;
      chatId = newChat._id;
      setCurrentChat(chatId);
    }
    
    // Create a temporary message for UI
    const tempMessage = {
      id: Date.now(),
      content,
      role,
      created_at: new Date().toISOString(),
      isImage: contentType === 'image',
      isPdf: contentType === 'pdf',
      isDocument: contentType === 'document',
      isSpreadsheet: contentType === 'spreadsheet',
      isGenericFile: contentType === 'file',
      isStreaming: role === 'assistant',
      metadata: { ...metadata, model } // Include model in metadata
    };
    
    // Add to UI only if not skipping state update
    if (!skipStateUpdate) {
      setMessages(prev => [...prev, tempMessage]);
    }
    
    // Save to database
    try {
      const { success, message, error } = await messageAPI.sendMessage(
        chatId, 
        content, 
        role, 
        contentType, 
        { ...metadata, model }
      );
      
      if (!success) {
        throw new Error(error?.message || 'Failed to save message');
      }
      
      // Update the message with the database ID (only if not skipping state update)
      if (!skipStateUpdate) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: message._id, isStreaming: false }
              : msg
          )
        );
      }
      
      return message;
    } catch (error) {
      console.error("Error saving message:", error);
      
      // Remove the temporary message on error (only if not skipping state update)
      if (!skipStateUpdate) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
      
      toast.error("Failed to save message");
      return null;
    }
  };

  const updateChatTitle = async (chatId, title) => {
    try {
      const { success, chat, error } = await chatAPI.updateChat(chatId, { title });
      
      if (!success) {
        throw new Error(error?.message || 'Failed to update chat title');
      }
      
      return chat;
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update chat title");
      return null;
    }
  };

  const updateChatModel = async (chatId, model) => {
    try {
      const { success, chat, error } = await chatAPI.updateChat(chatId, { model });
      
      if (!success) {
        throw new Error(error?.message || 'Failed to update chat model');
      }
      
      return chat;
    } catch (error) {
      console.error("Error updating chat model:", error);
      toast.error("Failed to update chat model");
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const { success, error } = await chatAPI.deleteChat(chatId);
      
      if (!success) {
        throw new Error(error?.message || 'Failed to delete chat');
      }
      
      toast.success("Chat deleted");
      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
      return false;
    }
  };

  const value = {
    chatList,
    setChatList,
    currentChat,
    setCurrentChat,
    messages,
    setMessages,
    isLoadingChats,
    isLoadingMessages,
    createNewChat,
    addMessage,
    deleteChat,
    updateChatTitle,
    updateChatModel
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}