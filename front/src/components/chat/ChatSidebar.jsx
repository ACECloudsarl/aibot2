"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Menu, Settings, LogOut, CreditCard } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function ChatSidebar({ isMobile = false, onClose }) {
  const { chatList, createNewChat, loadChat, currentChat, deleteChat } = useChat();
  const { user, logout } = useAuth();

  const handleCreateNewChat = () => {
    createNewChat();
    if (isMobile && onClose) onClose();
  };

  const handleSelectChat = (chatId) => {
    loadChat(chatId);
    if (isMobile && onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url || "/avatar.png"} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="p-4">
        <Button 
          onClick={handleCreateNewChat} 
          variant="outline" 
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {chatList.map((chat) => (
          <div key={chat.id} className="flex items-center group">
            <Button
              variant={currentChat === chat.id ? "secondary" : "ghost"}
              className="flex-1 justify-between"
              onClick={() => handleSelectChat(chat.id)}
            >
              <span className="truncate max-w-[200px]">{chat.title}</span>
              <span className="text-xs text-muted-foreground">{chat.date}</span>
            </Button>
            {currentChat === chat.id && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-1 opacity-0 group-hover:opacity-100"
                onClick={() => deleteChat(chat.id)}
              >
                <LogOut className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <ThemeToggle />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Account</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => {}}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}