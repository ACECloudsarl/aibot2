// ChatMessages.jsx - Fixed streaming and responsive content
"use client";

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, Copy, Download, 
  Loader2, FileIcon, FileTextIcon, 
  TableIcon, Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomMarkdown from '@/components/ui/CustomMarkdown';
import { toast } from 'sonner';

export function ChatMessages({ 
  messages, 
  isLoading, 
  handleCopyCode, 
  handleSaveCode 
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  
  // Check if user is near bottom of chat
  const checkIfNearBottom = () => {
    if (!containerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 150;
  };

  // Handle scroll events
  const handleScroll = () => {
    setIsNearBottom(checkIfNearBottom());
  };
  
  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Ensure we maintain scroll position appropriately
  useEffect(() => {
    // Count how many messages are streaming
    const streamingCount = messages.filter(m => m.isStreaming).length;
    
    // Only auto-scroll if:
    // 1. User is already near bottom, or
    // 2. A new message was just added
    if (isNearBottom && messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages.length, isNearBottom]);
  
  // Render message content
  const renderMessageContent = (message) => {
    // Check if the message is an image regardless of the role
    if (message.isImage) {
      return (
        <div className="flex flex-col">
          <div className="max-w-full overflow-hidden">
            <img 
              src={message.content} 
              alt="Uploaded image" 
              className="max-w-full h-auto rounded-md object-contain" 
            />
          </div>
          {message.fileName && (
            <p className="mt-1 text-xs text-muted-foreground">{message.fileName}</p>
          )}
        </div>
      );
    }
  
    // Handle user messages (text or files)
    if (message.role === "user") {
      if (message.isFileProcessing) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>{message.content}</p>
          </div>
        );
      }
      
      if (message.isPdf) {
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <FileIcon className="flex-shrink-0 h-8 w-8 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{message.fileName}</p>
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
            </div>
          </div>
        );
      }
      
      // Default rendering for user text messages
      return <p>{message.content}</p>;
    }
  
    // Loading placeholder for streaming messages
    if (message.isStreaming) {
      return (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-300"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      );
    }
  
    // Assistant messages with custom markdown renderer
    return (
      <div className="w-full overflow-hidden">
        <CustomMarkdown>{message.content || " "}</CustomMarkdown>
      </div>
    );
  };
  

 
  return (
    <div 
      className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 md:px-6 md:py-6"
      ref={containerRef}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <p className="text-muted-foreground max-w-md">
            Start a new conversation or select a chat from the sidebar
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`border-0 ${
                message.role === "user" ? "bg-primary-foreground" : "bg-card"
              } ${message.isStreaming ? "min-h-[100px]" : ""} overflow-hidden w-full`}
            >
              <CardContent className="p-3 sm:p-4 w-full">
                <div className={`prose dark:prose-invert prose-sm sm:prose-base w-full max-w-none break-words ${message.isStreaming ? 'animate-pulse' : ''}`}>
                  {renderMessageContent(message)}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Loading indicator (when not streaming yet) */}
          {isLoading && !messages.some(msg => msg.isStreaming) && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md rounded-full px-4 py-2 border">
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-1 mb-2" />
        </div>
      )}
    </div>
  );
}
