"use client";

import { Menu, Sun, Moon, ImageIcon, BarChart, PlusCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Header({ 
  setIsMobileMenuOpen, 
  selectedModel, 
  setSelectedModel, 
  models,
  onCreateImage,
  usageLimit = 15000,
  usageCount = 12500
}) {
  const { theme, setTheme } = useTheme();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  // Get currently selected model details
  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  
  // Group models by provider for better organization
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.id.split('/')[0];
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {});
  
  // Calculate usage percentage
  const usagePercentage = Math.min(100, Math.round((usageCount / usageLimit) * 100));
  
  // Get icon for model based on provider
  const getModelIcon = (modelId) => {
    const provider = modelId.split('/')[0];
    switch (provider) {
      case 'anthropic':
        return '✨';
      case 'meta-llama':
        return '🦙';
      case 'mistralai':
        return '🌪️';
      case 'google':
        return '🔍';
      case 'Qwen':
        return '🧠';
      default:
        return '🤖';
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Improved Model Selector */}
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            onOpenChange={setIsSelectOpen}
          >
            <SelectTrigger className="w-[180px] md:w-[220px] gap-2">
              <span className="truncate flex items-center">
                <span className="text-lg mr-1">{getModelIcon(currentModel.id)}</span>
                <SelectValue placeholder="Select AI Model" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedModels).map(([provider, providerModels]) => (
                <div key={provider} className="py-1">
                  <div className="text-xs text-muted-foreground px-2 py-1 uppercase">
                    {provider}
                  </div>
                  {providerModels.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="flex items-center">
                      <span className="text-lg mr-2">{getModelIcon(model.id)}</span>
                      <span>{model.name}</span>
                      {model.vision && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-1">Vision</span>
                      )}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          
          {/* New Create Button (desktop only) */}
          <div className="hidden md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => {}}>
                  <span className="flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Chat
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateImage}>
                  <span className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Image
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Usage Meter */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-2 w-32">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {Math.round(usageCount / 1000)}K
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-medium">Usage: {usageCount.toLocaleString()} / {usageLimit.toLocaleString()} tokens</p>
                  <p className="text-muted-foreground mt-1">Resets in 2 days</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Docs Button (desktop only) */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden md:flex"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}