"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChat } from "@/contexts/ChatContext";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Header from "@/components/layout/Header";
import ChatContainer from "@/components/chat/ChatContainer";
import ApiService from "@/services/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [models, setModels] = useState([]);
  const [currentView, setCurrentView] = useState("chat");
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { 
    chatList,
    setCurrentChat,
    createNewChat,
    isLoadingMessages
  } = useChat();

  const apiServiceRef = useRef(null);
  
  // Initialize API service and models only once
  useEffect(() => {
    if (!apiServiceRef.current) {
      apiServiceRef.current = new ApiService();
    }
    
    const availableModels = apiServiceRef.current.getModels();
    setModels(availableModels);
    
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    }
    
    setIsInitialized(true);
  }, [selectedModel]);

  // Page visibility detection for mobile tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    // Add visibility listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Set current chat based on route parameter, with safeguards
  useEffect(() => {
    let isMounted = true;
    
    // Only update if the ID exists and the page is visible
    if (id && isPageVisible && isInitialized) {
      // Use an async function to control timing
      const updateCurrentChat = async () => {
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (isMounted) {
          setCurrentChat(id);
        }
      };
      
      updateCurrentChat();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, setCurrentChat, isPageVisible, isInitialized]);

  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (status !== "loading" && status !== "authenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Create a new chat and navigate to it
  const handleCreateNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      // Use _id instead of id for MongoDB documents
      router.push(`/c/${newChat._id}`);
      setIsMobileMenuOpen(false);
    }
  };

  // Navigate to an existing chat
  const handleSelectChat = (chatId) => {
    router.push(`/c/${chatId}`);
    setIsMobileMenuOpen(false);
  };

  // If not mounted or still authenticating, show loading state
  if (!mounted || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentChat={id}
        setCurrentChat={handleSelectChat}
        chatList={chatList}
        createNewChat={handleCreateNewChat}
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        currentChat={id}
        setCurrentChat={handleSelectChat}
        chatList={chatList}
        createNewChat={handleCreateNewChat}
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
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
        
        {isLoadingMessages && !isPageVisible ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ChatContainer 
            chatId={id}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isPageVisible={isPageVisible}
          />
        )}
      </div>
    </div>
  );
}