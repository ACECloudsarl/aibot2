"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useAuth();
  const { chatList, createNewChat, isLoadingChats } = useChat();
   
  // Check if user is authenticated
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Handle chat navigation
    const handleInitialNavigation = async () => {
      if (!isLoadingChats) {
        if (chatList.length > 0) {
          // Navigate to most recent chat
          // Use _id instead of id for MongoDB documents
          router.push(`/c/${chatList[0]._id}`);
        } else {
          // Create a new chat and navigate to it
          const newChat = await createNewChat("New Chat");
          if (newChat) {
            router.push(`/c/${newChat._id}`);
          }
        }
      }
    };

    if (isAuthenticated) {
      handleInitialNavigation();
    }
  }, [isAuthenticated, isLoading, isLoadingChats, chatList, router, createNewChat]);

  // Show loading screen while determining where to navigate
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}