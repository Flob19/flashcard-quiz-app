import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ZoomIn } from 'lucide-react';
import { ImageViewer } from './ImageViewer';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label: string;
}

export const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        setIsUploading(true);
        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            onChange(reader.result as string);
            setIsUploading(false);
          };
          reader.onerror = () => {
            console.error('Error reading pasted image');
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing pasted image:', error);
          setIsUploading(false);
        }
        break;
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Make container focusable for paste events
    container.setAttribute('tabindex', '0');
    
    const handlePasteEvent = (e: ClipboardEvent) => {
      e.preventDefault();
      handlePaste(e);
    };

    container.addEventListener('paste', handlePasteEvent);
    
    // Also listen for global paste events when container is focused
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement === container) {
        e.preventDefault();
        handlePaste(e);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      container.removeEventListener('paste', handlePasteEvent);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, []);

  return (
    <div className="space-y-2" ref={containerRef} tabIndex={0}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-border cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsViewerOpen(true)}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-white/20"
            onClick={() => setIsViewerOpen(true)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB or paste with Cmd+V</p>
            <p className="text-xs text-muted-foreground mt-1">Click here and press Cmd+V to paste an image</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
      
      {/* Image Viewer Modal */}
      {value && (
        <ImageViewer
          src={value}
          alt="Image preview"
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};
