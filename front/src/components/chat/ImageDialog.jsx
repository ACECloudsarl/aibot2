// ImageDialog.jsx - Updated version with proper title
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Loader2, ImageIcon } from "lucide-react";
  import { useState } from "react";
  
  export function ImageDialog({ isOpen, onOpenChange, onGenerateImage, isGenerating }) {
    const [imagePrompt, setImagePrompt] = useState("");
  
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Image</DialogTitle>
            <DialogDescription>
              Enter a prompt to generate an image
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image-prompt">Prompt</Label>
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
                onGenerateImage(imagePrompt);
                setImagePrompt("");
              }}
              disabled={isGenerating || !imagePrompt.trim()}
            >
              {isGenerating ? (
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
    );
  }