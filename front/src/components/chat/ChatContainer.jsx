//ChatContainer.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import ApiService from "@/services/api";
import TitleGenerator from "@/services/titleGenerator";
import R2StorageService from "@/services/R2StorageService";

export default function ChatContainer({ selectedModel, onModelChange = () => {} }) {
  // State
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState(Date.now());
  
  // Refs
  const syncInProgressRef = useRef(false);
  const chatAreaRef = useRef(null);
  const recognition = useRef(null);
  const apiService = useRef(new ApiService());
  const titleGenerator = useRef(new TitleGenerator());
  const titleGeneratedRef = useRef(false);
  const r2Service = useRef(new R2StorageService());

  // Contexts
  const { user } = useAuth();
  const { 
    messages, 
    setMessages, 
    addMessage, 
    currentChat,
    updateChatTitle,
    updateChatModel,
    chatList
  } = useChat();

  // Update timestamp on activity
  useEffect(() => {
    setLastActivityTimestamp(Date.now());
  }, [inputValue, messages.length]);

  // Sync model with chat
  useEffect(() => {
    if (syncInProgressRef.current) return;
    
    const syncModelWithChat = () => {
      if (currentChat && currentChat !== "new") {
        const chat = chatList.find(c => c.id === currentChat);
        if (chat && chat.model && chat.model !== selectedModel) {
          syncInProgressRef.current = true;
          onModelChange(chat.model);
          setTimeout(() => {
            syncInProgressRef.current = false;
          }, 500);
        }
      }
    };
    
    syncModelWithChat();
  }, [currentChat, chatList, selectedModel, onModelChange]);

  // Save model selection to chat
  useEffect(() => {
    if (syncInProgressRef.current) return;
    
    const saveModelSelection = async () => {
      if (currentChat === "new" || !currentChat) return;
      
      const currentChatData = chatList.find(chat => chat.id === currentChat);
      if (currentChatData && currentChatData.model !== selectedModel) {
        syncInProgressRef.current = true;
        await updateChatModel(currentChat, selectedModel);
        setTimeout(() => {
          syncInProgressRef.current = false;
        }, 500);
      }
    };
    
    if (selectedModel) {
      saveModelSelection();
    }
  }, [selectedModel, currentChat, chatList, updateChatModel]);

  // Stuck state recovery
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isLoading && Date.now() - lastActivityTimestamp > 10000) {
        setIsLoading(false);
        toast.info("Resetting communication state...");
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isLoading, lastActivityTimestamp]);

  // Generate title for the chat
  useEffect(() => {
    const generateTitleIfNeeded = async () => {
      if (
        currentChat && 
        currentChat !== "new" && 
        messages.length >= 2 && 
        !titleGeneratedRef.current
      ) {
        const currentChatData = chatList.find(chat => chat.id === currentChat);
        
        if (
          currentChatData && 
          (currentChatData.title === "New Chat" || 
           currentChatData.title.startsWith("Chat ") ||
           currentChatData.title.length < 10)
        ) {
          try {
            titleGeneratedRef.current = true;
            const generatedTitle = await titleGenerator.current.generateTitle(messages);
            
            if (generatedTitle && generatedTitle !== currentChatData.title) {
              await updateChatTitle(currentChat, generatedTitle);
              toast.success("Chat renamed to: " + generatedTitle);
            }
          } catch (error) {
            console.error("Failed to generate title:", error);
            titleGeneratedRef.current = false;
          }
        }
      }
    };
    
    if (messages.length >= 2) {
      generateTitleIfNeeded();
    }
  }, [currentChat, messages, chatList, updateChatTitle]);

  // Reset title generation flag on chat change
  useEffect(() => {
    titleGeneratedRef.current = false;
  }, [currentChat]);


 


  // ======== Utility Functions ========
  
  const resetChatState = () => {
    setIsLoading(false);
    setMessages(prev => prev.map(msg => ({...msg, isStreaming: false})));
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // ======== File Handling ========
  
  // Combined file handling function
  const processFile = async (file, customMessage = null) => {
    try {
      // Check file size limit - 10MB
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      toast.info("Processing file...");
      
      // Check if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log(`Processing file on ${isMobile ? 'mobile' : 'desktop'} device`);
      
      // Get appropriate model
      const models = apiService.current.getModels();
      const currentModel = models.find(model => model.id === selectedModel);
      
      let modelToUse = selectedModel;
      if (!currentModel || !currentModel.vision) {
        const visionModel = apiService.current.getVisionModel();
        if (visionModel) {
          modelToUse = visionModel.id;
          toast.info(`Switched to ${visionModel.name} to process files`);
          onModelChange(visionModel.id);
        } else {
          toast.error("No vision model available");
          return;
        }
      }
      
      // Determine file type
      let fileType = 'file';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.csv')) {
        fileType = 'spreadsheet';
      } else if (file.type.includes('document') || file.type.includes('word')) {
        fileType = 'document';
      }
      
      // Create temporary file URL for display
      const tempFileUrl = isMobile ? null : URL.createObjectURL(file);
      const tempId = Date.now();
      
      // Add temporary message to UI
      setMessages(prev => [...prev, {
        id: tempId,
        content: isMobile ? file.name : tempFileUrl,
        fileName: file.name,
        fileType: file.type,
        role: "user",
        isImage: fileType === 'image',
        isPdf: fileType === 'pdf',
        isSpreadsheet: fileType === 'spreadsheet',
        isDocument: fileType === 'document',
        isGenericFile: fileType === 'file',
        isUploading: true
      }]);
      
      // Ensure we have a valid chat ID
      let targetChatId = currentChat;
      if (targetChatId === "new") {
        const newChat = await createNewChat(`File: ${file.name}`, modelToUse);
        if (newChat) {
          targetChatId = newChat.id;
        } else {
          throw new Error("Failed to create a new chat for the file upload");
        }
      }
      
      // Upload file to R2 storage
      let fileUrl;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', file.type);
        formData.append('isGenerated', 'false');
        
        if (fileType === 'image') {
          formData.append('prompt', file.name);
          formData.append('userId', user.id);
          formData.append('chatId', targetChatId);
          formData.append('model', modelToUse);
        }
        
        toast.info("Uploading file to R2 storage...");
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        fileUrl = data.url;
        toast.success("File uploaded successfully to R2");
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { 
              ...msg, 
              content: fileUrl, 
              isUploading: false 
            } : msg
          )
        );
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        toast.error("Failed to upload file to R2 storage");
        
        // Use temporary URL as fallback
        fileUrl = tempFileUrl;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { 
              ...msg, 
              isUploading: false, 
              uploadFailed: true 
            } : msg
          )
        );
        
        // If upload failed completely, abort
        if (!fileUrl) {
          toast.error("File processing failed");
          return;
        }
      }
      
      // Save file message to database
      const savedFileMessage = await addMessage(
        file.name,
        "user",
        fileType,
        { 
          fileName: file.name, 
          fileType: file.type, 
          fileUrl: fileUrl
        },
        false,
        modelToUse
      );
      
      if (savedFileMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, id: savedFileMessage.id } : msg
          )
        );
      }
      
      // Create appropriate prompt
      let prompt;
      if (customMessage && customMessage.trim()) {
        prompt = customMessage;
      } else {
        if (fileType === 'image') {
          prompt = "What's in this image?";
        } else if (fileType === 'pdf') {
          prompt = "Analyze this PDF document and summarize its content.";
        } else if (fileType === 'spreadsheet') {
          prompt = "Analyze this spreadsheet and summarize the key data insights.";
        } else if (fileType === 'document') {
          prompt = "Analyze this document and summarize its content.";
        } else {
          prompt = "What's in this file?";
        }
      }
      
      // Add user prompt message
      await addMessage(prompt, "user", "text", {}, false, modelToUse);
      
      // Create streaming response placeholder
      const tempResponseId = Date.now() + 1;
      setMessages(prev => [...prev, { 
        id: tempResponseId, 
        content: isMobile ? "Analyzing file..." : "", 
        role: "assistant", 
        isStreaming: true 
      }]);
      
      // Call API with file URL (direct R2 URL)
      toast.info("Sending to AI for analysis...");
      
      try {
        // Use the R2 URL directly
        const response = await apiService.current.analyzeFile(
          fileUrl, 
          file.type, 
          prompt,
          modelToUse,
          isMobile ? [] : messages.slice(-10) // Limit context size on mobile
        );
        
        let fullContent = "";
        
        // Process the response stream
        for await (const token of response) {
          const newContent = token.choices[0]?.delta?.content || "";
          fullContent += newContent;
          
          // On mobile, update UI less frequently to reduce rendering
          if (!isMobile || fullContent.length % 50 === 0) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempResponseId ? { ...msg, content: fullContent } : msg
              )
            );
          }
        }
        
        // Ensure final content is set
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempResponseId
              ? { ...msg, content: fullContent, isStreaming: false }
              : msg
          )
        );
        
        // Save to database
        const savedMessage = await addMessage(
          fullContent, 
          "assistant", 
          "text", 
          {}, 
          true, 
          modelToUse
        );
        
        if (savedMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempResponseId ? { ...msg, id: savedMessage.id } : msg
            )
          );
        }
        
        toast.success("AI analysis complete");
      } catch (error) {
        console.error("API error:", error);
        
        const errorMessage = `Failed to analyze file: ${error.message || "The selected model might not support this file type."}`;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempResponseId
              ? { ...msg, content: errorMessage, isStreaming: false }
              : msg
          )
        );
        
        await addMessage(
          errorMessage, 
          "assistant", 
          "text",
          {},
          true,
          modelToUse
        );
        
        toast.error("Analysis failed");
      }
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("File analysis error:", error);
      toast.error("Failed to analyze file: " + (error.message || "Unknown error"));
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const customMessage = event.customMessage;
    
    if (!event.target.files || !event.target.files.length) {
      toast.error("No file selected");
      return;
    }
    
    const file = event.target.files[0];
    
    // Check file size limit - 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    processFile(file, customMessage || null);
  };

  // ======== Audio Recording ========
  
  const handleRecordAudio = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      // Check microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      // Initialize speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast.error("Speech recognition is not supported in your browser");
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      
      recognition.current.onstart = () => {
        setIsRecording(true);
        toast.info("Listening...");
      };
      
      recognition.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInputValue(transcript);
          } else {
            setInputValue(transcript);
          }
        }
      };
      
      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event);
        toast.error(`Microphone error: ${event.error}`);
        setIsRecording(false);
      };
      
      recognition.current.onend = () => {
        setIsRecording(false);
      };
      
      recognition.current.start();
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
      toast.success("Recording stopped");
    }
  };

  // ======== Message Handling ========
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Check if adding text to uploaded image
    if (messages.length > 0 && 
        messages[messages.length - 1].role === "user" && 
        messages[messages.length - 1].isImage && 
        inputValue.trim()) {
      
      const imageMessage = messages[messages.length - 1];
      
      // Update image message with text
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 ? { ...msg, text: inputValue } : msg
      ));
      
      // Process image with text if we have base64
      if (imageMessage.base64) {
        const tempId = Date.now();
        setMessages(prev => [...prev, { 
          id: tempId, 
          content: "", 
          role: "assistant", 
          isStreaming: true
        }]);
      
        try {
          const prompt = inputValue;
          const modelToUse = selectedModel;
      
          const response = await apiService.current.analyzeFile(
            imageMessage.base64, 
            imageMessage.fileType, 
            prompt,
            modelToUse,
            messages
          );
          
          let fullContent = "";
          for await (const token of response) {
            const newContent = token.choices[0]?.delta?.content || "";
            fullContent += newContent;
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempId ? { ...msg, content: fullContent } : msg
              )
            );
          }
          
          // Update final message
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId
                ? { ...msg, content: fullContent, isStreaming: false }
                : msg
            )
          );
          
          // Save to database
          const savedMessage = await addMessage(fullContent, "assistant", "text", {}, true, selectedModel);
          if (savedMessage) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
              )
            );
          }
        } catch (error) {
          console.error("Image analysis error:", error);
          toast.error("Failed to analyze image with text");
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      }
      
      setInputValue("");
      return;
    }

    // Regular message flow
    const userInput = inputValue;
    setInputValue("");
    
    // Add user message
    await addMessage(userInput, "user", "text", {}, false, selectedModel);
    setIsLoading(true);
    
    try {
      // Check for image generation request
      const isImageRequest = apiService.current.checkIfImageGenerationRequest(userInput);
      
      if (isImageRequest) {
        // Extract and generate image
        const imagePrompt = apiService.current.extractImagePrompt(userInput);
        const acknowledgeMsg = `I'll generate an image based on: "${imagePrompt}"`;
        await addMessage(acknowledgeMsg, "assistant", "text");
        await generateImage(imagePrompt);
      } else {
        // Regular chat response
        const tempId = Date.now() + 1;
        setMessages(prev => [...prev, { 
          id: tempId, 
          content: "", 
          role: "assistant", 
          isStreaming: true 
        }]);
        
        // Get AI response
        const response = await apiService.current.generateChatResponse(
          userInput, 
          selectedModel,
          messages
        );
        
        let fullContent = "";
        for await (const token of response) {
          const newContent = token.choices[0]?.delta?.content || "";
          fullContent += newContent;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? { ...msg, content: fullContent } : msg
            )
          );
        }
        
        // Update final message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, content: fullContent, isStreaming: false } : msg
          )
        );
        
        // Save to database
        const savedMessage = await addMessage(fullContent, "assistant", "text", {}, true, selectedModel);
        if (savedMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
            )
          );
        }
        
        // Check for image suggestion in response
        if (fullContent.includes("FLUX") && 
            (fullContent.includes("image") || fullContent.includes("picture") || 
             fullContent.includes("generate") || fullContent.includes("visualization"))) {
          
          const matches = fullContent.match(/"([^"]*)"/);
          if (matches && matches[1]) {
            const imagePrompt = matches[1];
            await addMessage(`I'll generate that image for you...`, "assistant", "text");
            await generateImage(imagePrompt);
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to get response");
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  // ======== Image Generation ========
  
  const generateImage = async (prompt) => {
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      toast.info("Generating image...");
      
      // Create placeholder
      const tempId = Date.now();
      setMessages(prev => [...prev, {
        id: tempId,
        content: null,
        role: "assistant",
        isImage: true,
        isGenerating: true
      }]);
      
      // Generate image
      const imageData = await apiService.current.generateImage(prompt);
      const tempImageUrl = `data:image/png;base64,${imageData}`;
      
      // Update placeholder with base64
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { 
            ...msg, 
            content: tempImageUrl, 
            isGenerating: false,
            isUploading: true 
          } : msg
        )
      );
      
      // Ensure we have a valid chat ID
      let targetChatId = currentChat;
      if (targetChatId === "new") {
        const newChat = await createNewChat("Image Generation: " + prompt.substring(0, 30), selectedModel);
        if (newChat) {
          targetChatId = newChat.id;
        } else {
          throw new Error("Failed to create a new chat for the image");
        }
      }
      
      // Upload to storage
      let imageUrl;
      try {
        toast.info("Uploading generated image...");
        
        // Create blob from base64
        const byteCharacters = atob(imageData);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('fileType', 'image/png');
        formData.append('isGenerated', 'true');
        formData.append('prompt', prompt);
        formData.append('userId', user.id);
        formData.append('chatId', targetChatId);
        formData.append('model', selectedModel);
        
        // Upload
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        imageUrl = data.url;
        toast.success("Image uploaded successfully");
        
        // Update with storage URL
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, content: imageUrl, isUploading: false } : msg
          )
        );
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        toast.error("Failed to upload image to storage");
        imageUrl = tempImageUrl;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, isUploading: false, uploadFailed: true } : msg
          )
        );
      }
      
      // Save to database
      const savedMessage = await addMessage(
        prompt, 
        "assistant", 
        "image", 
        { 
          imagePrompt: prompt, 
          imageUrl: imageUrl,
          hasBase64: false
        }, 
        true, 
        selectedModel
      );
      
      // Update UI with database ID
      if (savedMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
          )
        );
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate image");
      setMessages(prev => prev.filter(msg => !(msg.isGenerating && msg.isImage)));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ======== Drag and Drop Handlers ========
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // ======== Render ========
  
  return (
    <>
      <main 
        className={`flex-1 overflow-auto p-4 md:p-6 space-y-4 ${isDragging ? "bg-primary/10" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={chatAreaRef}
      >
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          setInputValue={setInputValue}
          isDragging={isDragging}
        />
      </main>
      
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleRecordAudio={handleRecordAudio}
        isRecording={isRecording}
        isDragging={isDragging}
        isLoading={isLoading}
        isGeneratingImage={isGeneratingImage}
        generateImage={generateImage}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    </>
  );
}