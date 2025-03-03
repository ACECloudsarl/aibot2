"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AI_MODELS } from '@/lib/constants';

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  className 
}) {
  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select AI Model" />
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}