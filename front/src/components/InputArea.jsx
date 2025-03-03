"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, Image as ImageIcon, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function InputArea({ 
  inputValue, 
  onInputChange, 
  onSendMessage, 
  isLoading, 
  onFileUpload, 
  onRecordAudio, 
  isRecording,
  imageDialogOpen,
  setImageDialogOpen,
  imagePrompt,
  setImagePrompt,
  generateImage,
  isGeneratingImage,
  handleKeyDown
}) {
  return (
    <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Textarea
            placeholder="Message..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none pr-24 pl-4 py-3 rounded-lg"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onFileUpload} className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRecordAudio} className={`h-8 w-8 ${isRecording ? "text-red-500" : ""}`}>
              <Mic className="h-4 w-4" />
            </Button>
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Generate Image</DialogTitle>
                  <DialogDescription>
                    Enter a prompt to generate an image using FLUX.1
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="image-prompt" className="block text-sm font-medium">Prompt</label>
                    <Input
                      id="image-prompt"
                      placeholder="A futuristic city with flying cars..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      generateImage(imagePrompt);
                      setImageDialogOpen(false);
                      setImagePrompt("");
                    }}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="default"
              size="icon"
              onClick={onSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
} 
