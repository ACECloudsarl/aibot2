"use client";

import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageItem from "@/components/chat/MessageItem";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MessageList({ 
  messages, 
  isLoading, 
  setInputValue,
  isDragging,
  suggestedPrompts = ["Explain quantum computing", "Write a poem about AI", "Help me debug my React code", "Create a marketing strategy"]
}) {
  const messagesEndRef = useRef(null);


  useEffect(() => {
    // Keep track of any blob URLs we create
    const blobUrls = new Set();
    
    // Current messages might contain blob URLs that need cleanup
    messages.forEach(message => {
      if (message.content && typeof message.content === 'string' && 
          message.content.startsWith('blob:')) {
        blobUrls.add(message.content);
      }
    });
    
    // Cleanup function to run when component unmounts or messages change
    return () => {
      blobUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [messages]);
  

  // Log message debug info
  useEffect(() => {
    if (messages.length > 0) {
      const imageMessages = messages.filter(m => m.isImage);
      if (imageMessages.length > 0) {
        console.log("Image messages found:", imageMessages.length);
        // Log the first image message details for debugging
        if (imageMessages[0]) {
          const msg = imageMessages[0];
          console.log("Example image message:", {
            id: msg.id,
            content: msg.content ? (msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content) : 'null',
            hasMetadata: !!msg.metadata,
            imageUrl: msg.metadata?.imageUrl ? (msg.metadata.imageUrl.length > 30 ? msg.metadata.imageUrl.substring(0, 30) + '...' : msg.metadata.imageUrl) : 'null',
            fileUrl: msg.metadata?.fileUrl ? (msg.metadata.fileUrl.length > 30 ? msg.metadata.fileUrl.substring(0, 30) + '...' : msg.metadata.fileUrl) : 'null'
          });
        }
      }
    }
  }, [messages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process messages to ensure they have proper URLs
  const processedMessages = messages.map(message => {
    // Create a copy of the message
    const processed = { ...message };
    
    // If it's an image message, make sure it has the right URL
    if (processed.isImage) {
      // Ensure metadata exists
      if (!processed.metadata) {
        processed.metadata = {};
      }
      
      // Make sure imageUrl exists in metadata
      if (processed.metadata.imageUrl) {
        // If we have an imageUrl in metadata, use it
        if (!processed.content || !processed.content.startsWith('http')) {
          processed.content = processed.metadata.imageUrl;
        }
      } else if (processed.metadata.fileUrl) {
        // If we have a fileUrl but no imageUrl, use that
        processed.metadata.imageUrl = processed.metadata.fileUrl;
        if (!processed.content || !processed.content.startsWith('http')) {
          processed.content = processed.metadata.fileUrl;
        }
      } else if (processed.content && processed.content.startsWith('http')) {
        // If content is a URL, add it to metadata
        processed.metadata.imageUrl = processed.content;
      }
    }
    
    // Do the same for files
    if (processed.isPdf || processed.isDocument || processed.isSpreadsheet || processed.isGenericFile) {
      // Ensure metadata exists
      if (!processed.metadata) {
        processed.metadata = {};
      }
      
      if (processed.metadata.fileUrl) {
        // Use fileUrl if available
        if (!processed.content || !processed.content.startsWith('http')) {
          processed.content = processed.metadata.fileUrl;
        }
      } else if (processed.content && processed.content.startsWith('http')) {
        // If content is a URL, add it to metadata
        processed.metadata.fileUrl = processed.content;
      }
    }
    
    return processed;
  });

  // Show empty state if no messages
  if (processedMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">How can I help you today?</h2>
        <p className="text-muted-foreground max-w-md">
          Ask me anything or select from the suggested prompts below
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
          {suggestedPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              className="rounded-full"
              onClick={() => setInputValue(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Create a Map to deduplicate messages by ID
  const uniqueMessages = new Map();
  
  // Only keep the last message for each ID
  processedMessages.forEach(message => {
    uniqueMessages.set(message.id, message);
  });
  
  // Convert back to array and sort by original order
  const dedupedMessages = Array.from(uniqueMessages.values());

  return (
    <>
      {dedupedMessages.map((message, index) => (
        <MessageItem 
          key={`${message.id}-${index}`} // Use compound key for safety
          message={message} 
        />
      ))}
      
      <div ref={messagesEndRef} />
      
      {/* Loading indicator when not streaming */}
      {isLoading && !dedupedMessages.some(msg => msg.isStreaming) && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}