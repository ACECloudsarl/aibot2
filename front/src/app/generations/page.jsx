"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import AppLayout from "@/components/layout/AppLayout";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Header from "@/components/layout/Header";
import GenerationComponents from "@/components/generations/GenerationsComponent";
import ApiService from "@/services/api";

export default function GenerationsPage() {
  const [selectedModel, setSelectedModel] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [models, setModels] = useState([]);
  const [currentView, setCurrentView] = useState("generations");
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    chatList,
    createNewChat,
  } = useChat();
  
  // Initialize API service and models
  useEffect(() => {
    const apiService = new ApiService();
    const availableModels = apiService.getModels();
    setModels(availableModels);
    setSelectedModel(availableModels[0].id);
  }, []);

  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Create a new chat and navigate to it
  const handleCreateNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      router.push(`/c/${newChat.id}`);
      setIsMobileMenuOpen(false);
    }
  };

  // Navigate to an existing chat
  const handleSelectChat = (chatId) => {
    router.push(`/c/${chatId}`);
    setIsMobileMenuOpen(false);
  };

  // Handle view change
  const handleViewChange = (view) => {
    if (view === "chat") {
      // If we're switching to chat view, redirect to the most recent chat or create new one
      if (chatList.length > 0) {
        router.push(`/c/${chatList[0].id}`);
      } else {
        handleCreateNewChat();
      }
    } else {
      setCurrentView(view);
    }
  };

  if (!mounted || authLoading) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentChat=""
        setCurrentChat={handleSelectChat}
        chatList={chatList}
        createNewChat={handleCreateNewChat}
        currentView={currentView}
        setCurrentView={handleViewChange}
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        currentChat=""
        setCurrentChat={handleSelectChat}
        chatList={chatList}
        createNewChat={handleCreateNewChat}
        currentView={currentView}
        setCurrentView={handleViewChange}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={models}
          currentView={currentView}
        />
        
        <GenerationComponents />
      </div>
    </div>
  );
}