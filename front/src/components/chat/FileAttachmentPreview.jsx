import { 
    X, 
    FileIcon, 
    FileTextIcon, 
    TableIcon, 
    ImageIcon 
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  
  export default function FileAttachmentPreview({ 
    file, 
    onRemove 
  }) {
    if (!file) return null;
  
    // Generate preview based on file type
    const renderPreview = () => {
      if (file.type.startsWith('image/')) {
        return (
          <div className="relative group">
            <img 
              src={URL.createObjectURL(file)} 
              alt={file.name}
              className="w-full h-auto max-h-32 rounded-md object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      
      // For non-image files
      let Icon = FileIcon;
      let iconColor = "text-gray-500";
      
      if (file.type === 'application/pdf') {
        Icon = FileIcon;
        iconColor = "text-red-500";
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.csv')) {
        Icon = TableIcon;
        iconColor = "text-green-500";
      } else if (file.type.includes('document') || file.type.includes('word')) {
        Icon = FileTextIcon;
        iconColor = "text-blue-500";
      }
      
      return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 group relative">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    };
    
    // Helper function to format file size
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    };
    
    return (
      <div className="w-full mb-2">
        {renderPreview()}
      </div>
    );
  }