// Add this to your ChatInput.jsx component
// Make sure the file input is properly handled for mobile

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

const ChatInput = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  handleFileUpload,
  handleRecordAudio,
  isRecording,
  isLoading,
  isGeneratingImage,
  generateImage,
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop
}) => {
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [showFileUploadMessage, setShowFileUploadMessage] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height first to calculate properly
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [inputValue]);
  
  // Handlers
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showImagePrompt) {
        handleGenerateImage();
      } else if (showFileUploadMessage) {
        handleUploadWithMessage();
      } else {
        handleSendMessage();
      }
    }
  };
  
  const handleGenerateImage = () => {
    if (imagePrompt.trim() && !isGeneratingImage) {
      generateImage(imagePrompt);
      setImagePrompt("");
      setShowImagePrompt(false);
    } else {
      toast.error("Please enter an image prompt");
    }
  };
  
  const handleUploadWithMessage = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    
    // Create a custom event with our file and message
    const customEvent = {
      target: {
        files: [selectedFile]
      },
      customMessage: uploadMessage
    };
    
    // Call the upload handler with our custom event
    handleFileUpload(customEvent);
    
    // Reset state
    setUploadMessage("");
    setShowFileUploadMessage(false);
    setSelectedFile(null); // Clear selected file
  };
  
  const triggerFileUpload = () => {
    // Reset to default first
    setShowFileUploadMessage(false);
    setUploadMessage("");
    setSelectedFile(null);
    
    // If we're on Android, use a different approach
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      // For Android, create a new file input each time
      // This avoids issues with canceled selections
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = "image/*,application/pdf,.csv,.xls,.xlsx,.doc,.docx";
      
      // Set up the change handler
      tempInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          // Handle the file directly without state changes
          handleFileUpload({
            target: { files: [e.target.files[0]] },
            customMessage: null
          });
        }
        
        // Remove the temporary input
        document.body.removeChild(tempInput);
      };
      
      // Add to body and trigger click
      tempInput.style.display = 'none';
      document.body.appendChild(tempInput);
      tempInput.click();
    } else {
      // Non-Android approach
      if (fileInputRef.current) {
        // Clear the file input first
        fileInputRef.current.value = null;
        fileInputRef.current.click();
      } else {
        console.error("File input reference is not available");
        toast.error("File upload is not available");
      }
    }
  };
  
  // Special handler for mobile file input change
  const onFileInputChange = (e) => {
    // This will only be called for non-Android devices
    // Android uses the temporary input approach instead
    
    console.log("File input change detected");
    
    // Clear selection if canceled
    if (!e.target.files || e.target.files.length === 0) {
      // Reset everything
      setSelectedFile(null);
      setShowFileUploadMessage(false);
      setUploadMessage("");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }
    
    const file = e.target.files[0];
    console.log("File selected:", file.name, file.type);
    
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }
    
    // Process the file - on mobile, directly upload
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      handleFileUpload(e);
      
      // Reset the input
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }, 100);
    } else {
      // Desktop flow - show dialog for images
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        setShowFileUploadMessage(true);
        setUploadMessage("What's in this image?");
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 100);
      } else {
        // For non-images, just upload directly
        handleFileUpload(e);
        setSelectedFile(null);
        
        // Reset input
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
        }, 100);
      }
    }
  };
  
  return (
    <div className="relative w-full border-t bg-background p-4">
      {/* Drag overlay */}
      {isDragging && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Paperclip className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 text-muted-foreground">Drop your file here</p>
          </div>
        </div>
      )}
      
      {/* Image generation mode */}
      {showImagePrompt && (
        <div className="mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Image Generation</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setShowImagePrompt(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="min-h-[80px]"
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
            >
              {isGeneratingImage ? "Generating..." : "Generate Image"}
            </Button>
          </div>
        </div>
      )}
      
      {/* File upload with message mode */}
      {showFileUploadMessage && (
        <div className="mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Add a message with your file</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => {
                setShowFileUploadMessage(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = null; // Clear file input
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={uploadMessage}
            onChange={(e) => setUploadMessage(e.target.value)}
            placeholder="Add instructions about this file..."
            className="min-h-[80px]"
            onKeyDown={handleKeyDown}
            ref={textareaRef}
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleUploadWithMessage}
            >
              Upload with Message
            </Button>
          </div>
        </div>
      )}
      
      {/* Regular chat input */}
      {!showImagePrompt && !showFileUploadMessage && (
        <div 
          className="flex items-end gap-2"
          onDragEnter={handleDragEnter}
        >
          <div className="relative flex-1">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[50px] pr-20 resize-none overflow-hidden"
              onKeyDown={handleKeyDown}
              ref={textareaRef}
              disabled={isLoading}
              rows={1}
            />
            <div className="absolute right-2 bottom-1.5 flex space-x-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setShowImagePrompt(true)}
                disabled={isLoading}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={triggerFileUpload}
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept="image/*,application/pdf,.csv,.xls,.xlsx,.doc,.docx"
              />
              
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${isRecording ? "text-red-500" : ""}`}
                onClick={handleRecordAudio}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Button
            type="button"
            size="icon"
            className="h-[50px] w-[50px] rounded-full"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;