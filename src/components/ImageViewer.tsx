import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, RotateCw, Download, X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ src, alt = "Image", isOpen, onClose }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  // Touch handlers for mobile
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      // Two touches - start pinch zoom
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      // Single touch - continue dragging
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleChange = currentDistance / lastTouchDistance;
        setScale(prev => Math.max(0.1, Math.min(5, prev * scaleChange)));
      }
      setLastTouchDistance(currentDistance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        handleRotate();
        break;
      case '0':
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRotate}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleDownload}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Close button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image container */}
          <div
            className="flex items-center justify-center w-full h-full overflow-hidden cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-none select-none touch-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto'
              }}
              draggable={false}
            />
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
            Zoom: {Math.round(scale * 100)}% | Rotation: {rotation}° | 
            <span className="ml-2 text-xs opacity-70">
              Desktop: mouse wheel to zoom, drag to move, R to rotate, 0 to reset, Esc to close<br/>
              Mobile: pinch to zoom, drag to move, use buttons for rotate/reset
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
