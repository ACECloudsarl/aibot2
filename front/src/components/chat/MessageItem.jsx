import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CustomMarkdown from "@/components/ui/CustomMarkdown";

export default function MessageItem({ message }) {
  const [isCopying, setIsCopying] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopyCode = async (code) => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy code");
    } finally {
      setIsCopying(false);
    }
  };

  const handleSaveCode = (code) => {
    // Create blob and download
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-snippet.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code saved to file");
  };

  const handleImageClick = (imageUrl) => {
    setIsImageFullscreen(true);
    // Optional: Create a modal or lightbox for better image viewing
    window.open(imageUrl, '_blank');
  };

  const handleImageError = (e) => {
    console.error("Image failed to load:", message.content);
    setImageError(true);
    
    // Check if there's a URL in metadata we can try instead
    if (message.metadata && message.metadata.imageUrl && message.metadata.imageUrl !== message.content) {
      console.log("Trying alternate URL from metadata:", message.metadata.imageUrl);
      e.target.src = message.metadata.imageUrl;
    } else if (message.metadata && message.metadata.fileUrl && message.metadata.fileUrl !== message.content) {
      console.log("Trying fileUrl from metadata:", message.metadata.fileUrl);
      e.target.src = message.metadata.fileUrl;
    } else {
      e.target.src = "/placeholder-image.png"; // Fallback to a placeholder
      e.target.alt = "Image unavailable";
    }
  };

  // Loading Spinner for uploading/processing states
  const LoadingSpinner = () => (
    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
  );

  // SVG Icons
  const FileIcon = ({ color = "gray", className = "" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );

  const DocumentIcon = ({ color = "blue", className = "" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="13" x2="12" y2="17"/>
      <line x1="10" y1="15" x2="14" y2="15"/>
    </svg>
  );

  const SpreadsheetIcon = ({ color = "green", className = "" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  );

  // Find the best image URL from message data
  const getImageUrl = () => {
    // Check metadata first as it's most likely to have persistent URLs
    if (message.metadata) {
      if (message.metadata.imageUrl) return message.metadata.imageUrl;
      if (message.metadata.fileUrl) return message.metadata.fileUrl;
    }
    // Fall back to content field
    return message.content;
  };

  // Render file processing message
  if (message.isFileProcessing) {
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin">⏳</div>
            <p>{message.content}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render user uploaded image
  if (message.role === "user" && message.isImage) {
    const imageUrl = getImageUrl();
    
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex flex-col relative">
            {/* Upload status indicators */}
            {message.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary URL
              </div>
            )}
            
            {imageError && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-xs z-20">
                Image failed to load
              </div>
            )}
            
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={message.fileName || "User uploaded image"} 
                className="max-w-[300px] max-h-[300px] rounded-md object-contain cursor-pointer" 
                onClick={() => handleImageClick(imageUrl)}
                onError={handleImageError}
              />
            )}
            
            <p className="mt-1 text-xs text-muted-foreground">{message.fileName || "Uploaded image"}</p>
            {message.text && <p className="mt-2">{message.text}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render PDF document
  if (message.role === "user" && message.isPdf) {
    // Check for URL in metadata first
    const fileUrl = message.metadata?.fileUrl || message.content;
    
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 relative">
            {/* Upload status indicators */}
            {message.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary URL
              </div>
            )}
            
            <FileIcon color="red" />
            <div>
              <p className="font-medium">{message.fileName || "PDF Document"}</p>
              <p className="text-xs text-muted-foreground">PDF Document</p>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline"
                >
                  {fileUrl.startsWith('http') ? 'View file' : 'View temporary file'}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render other document types
  if (message.role === "user" && message.isDocument) {
    // Check for URL in metadata first
    const fileUrl = message.metadata?.fileUrl || message.content;
    
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 relative">
            {/* Upload status indicators */}
            {message.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary URL
              </div>
            )}
            
            <DocumentIcon color="blue" />
            <div>
              <p className="font-medium">{message.fileName || "Document"}</p>
              <p className="text-xs text-muted-foreground">Document</p>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline"
                >
                  {fileUrl.startsWith('http') ? 'View file' : 'View temporary file'}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render spreadsheet
  if (message.role === "user" && message.isSpreadsheet) {
    // Check for URL in metadata first
    const fileUrl = message.metadata?.fileUrl || message.content;
    
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 relative">
            {/* Upload status indicators */}
            {message.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary URL
              </div>
            )}
            
            <SpreadsheetIcon color="green" />
            <div>
              <p className="font-medium">{message.fileName || "Spreadsheet"}</p>
              <p className="text-xs text-muted-foreground">Spreadsheet</p>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline"
                >
                  {fileUrl.startsWith('http') ? 'View file' : 'View temporary file'}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render generic file
  if (message.role === "user" && message.isGenericFile) {
    // Check for URL in metadata first
    const fileUrl = message.metadata?.fileUrl || message.content;
    
    return (
      <Card className="border-0 bg-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 relative">
            {/* Upload status indicators */}
            {message.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary URL
              </div>
            )}
            
            <FileIcon color="gray" />
            <div>
              <p className="font-medium">{message.fileName || "File"}</p>
              <p className="text-xs text-muted-foreground">{message.fileType || "File"}</p>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline"
                >
                  {fileUrl.startsWith('http') ? 'View file' : 'View temporary file'}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render AI-generated image
  if (message.role === "assistant" && message.isImage) {
    // Get the best image URL from metadata or content
    const imageUrl = message.metadata?.imageUrl || message.content;
    const imagePrompt = message.metadata?.imagePrompt || message.content;
    
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col relative">
            {/* Image generation status indicators */}
            {message.isGenerating && (
              <div className="flex flex-col items-center justify-center bg-gray-100 rounded-md p-8 min-h-[200px]">
                <LoadingSpinner />
                <span className="text-gray-600 mt-2">Generating image...</span>
              </div>
            )}
            
            {/* Upload status indicators */}
            {message.isUploading && !message.isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-md">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-md">
                  <LoadingSpinner />
                  <span className="text-white text-sm">Uploading to storage...</span>
                </div>
              </div>
            )}
            
            {message.uploadFailed && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-20">
                Upload failed - Using temporary image
              </div>
            )}
            
            {imageError && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-xs z-20">
                Image failed to load
              </div>
            )}
            
            {imageUrl && !message.isGenerating && (
              <img 
                src={imageUrl} 
                alt={imagePrompt || "AI-generated image"} 
                className="max-w-full rounded-md object-contain cursor-pointer" 
                onClick={() => handleImageClick(imageUrl)}
                onError={handleImageError}
              />
            )}
            
            <div className="mt-2 text-xs text-muted-foreground">
              {message.isGenerating ? "Generating image..." : 
               message.isUploading ? "Uploading to storage..." : 
               imagePrompt ? `"${imagePrompt}"` : "AI-generated image"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render regular text messages
  return (
    <Card
      className={`border-0 ${
        message.role === "user" ? "bg-primary-foreground" : "bg-card"
      } ${message.isStreaming ? "border-l-4 border-l-primary" : ""}`}
    >
      <CardContent className="p-4">
        {message.role === "user" ? (
          <p>{message.content}</p>
        ) : (
          <CustomMarkdown>{message.content || " "}</CustomMarkdown>
        )}
      </CardContent>
    </Card>
  );
}