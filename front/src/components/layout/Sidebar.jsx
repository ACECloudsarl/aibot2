"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, Plus, Settings, LogOut, Moon, Sun, CreditCard,
  MessageCircle, ImageIcon, LayoutGrid, History, Sparkles,
  BookOpen, Keyboard, ChevronDown
} from "lucide-react";
 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
 
export default function Sidebar({ 
  currentChat, 
  chatList, 
  createNewChat,
  selectedModel,
  setSelectedModel,
  models = [],
  currentView,
  setCurrentView,
 }) {
  const { theme, setTheme } = useTheme();
  const { profile, logout } = useAuth();
  const router = useRouter();

  // Top 5 featured models with icons
  const featuredModels = [
    { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus", icon: "✨" },
    { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B", icon: "🦙" },
    { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet", icon: "🎵" },
    { id: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo", name: "Llama Vision", icon: "👁️" },
    { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", icon: "🌪️" }
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Today";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handleCreateNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      router.push(`/c/${newChat.id}`);
    }
  };

  const handleViewChange = (view) => {
    if (view === "generations") {
      router.push("/generations");
    } else if (view === "chat") {
      // If switching to chat and we have current chat, navigate there
      if (currentChat) {
        router.push(`/c/${currentChat}`);
      } else if (chatList.length > 0) {
        // Otherwise navigate to the first chat
        router.push(`/c/${chatList[0].id}`);
      } else {
        // Or create a new chat
        handleCreateNewChat();
      }
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-72 border-r bg-background">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Chat</h1>
        </div>
        <Badge variant="outline" className="text-xs">
          12,500 / 15,000 tokens
        </Badge>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-auto px-2 py-2 space-y-1">
        <h2 className="text-sm font-medium mb-2 text-muted-foreground px-2">Recent Chats</h2>
        {chatList.map((chat) => (
          <Link 
            key={chat.id} 
            href={`/c/${chat.id}`}
            className="block w-full"
          >
            <Button
              variant={currentChat === chat.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal h-auto py-2"
            >
              <div className="flex items-center w-full">
                <History className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="truncate flex-1">
                  <div className="truncate text-sm">{chat.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(chat.created_at || chat.date)}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
      
      <Separator className="my-2" />
      
      {/* Chat Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <Button 
            onClick={handleCreateNewChat}
            variant="default" 
            className="w-2/3 justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          
          <Button 
            variant="outline" 
            className="w-1/3 justify-center"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex border rounded-md overflow-hidden mt-2">
          <Button 
            variant="ghost" 
            className={`flex-1 rounded-none border-r h-8 text-xs px-2 ${currentView === "chat" ? "bg-primary/10" : ""}`}
            onClick={() => handleViewChange("chat")}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Chat
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 rounded-none h-8 text-xs px-2 ${currentView === "generations" ? "bg-primary/10" : ""}`}
            onClick={() => handleViewChange("generations")}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
            Images
          </Button>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      {/* AI Model Selection */}
      <div className="px-3 pb-2">
        <h2 className="text-sm font-medium mb-2 text-muted-foreground px-1">AI Models</h2>
        <div className="grid grid-cols-1 gap-1">
          {featuredModels.map((model) => (
            <Button
              key={model.id}
              variant={selectedModel === model.id ? "secondary" : "ghost"}
              className="justify-start h-9 px-2 text-sm"
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex items-center w-full">
                <span className="text-lg mr-2">{model.icon}</span>
                <span className="truncate">{model.name}</span>
              </div>
            </Button>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-between h-9 px-2 text-sm">
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  More Models
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {models && models
                .filter(model => !featuredModels.some(fm => fm.id === model.id))
                .map((model) => (
                  <DropdownMenuItem 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    {model.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link href="/generations" className="block">
        <Button
          className={`flex items-center w-full gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
            currentView === "generations" ? "bg-primary/10 text-primary" : "hover:bg-muted"
          }`}
        >
          <ImageIcon className="h-5 w-5" />
          <span>Generated Images</span>
        </Button>
      </Link>
      
      {/* Footer */}
      <div className="p-3 border-t">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm">Dark Mode</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{profile?.full_name || "User Account"}</span>
              </div>
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}