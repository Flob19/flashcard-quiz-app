import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, Wifi } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  url: string;
}

export const QRCode = ({ url }: QRCodeProps) => {
  const [showQR, setShowQR] = useState(false);
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (text: string) => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        // Clear canvas first
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        await QRCodeLib.toCanvas(canvas, text, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        const dataURL = canvas.toDataURL('image/png');
        setQrDataURL(dataURL);
        console.log('QR code generated successfully for:', text);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to simple text display
      setQrDataURL('');
    }
  };

  useEffect(() => {
    if (showQR && url) {
      generateQRCode(url);
    }
  }, [showQR, url]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Smartphone className="h-5 w-5 text-blue-500" />
          Access on Mobile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Scan this QR code with your phone to open the app:
        </div>
        
        {showQR && (
          <div className="flex justify-center">
            <canvas 
              ref={canvasRef}
              className="border border-border rounded-lg"
              style={{ display: 'none' }}
            />
            {qrDataURL && (
              <img 
                src={qrDataURL} 
                alt="QR Code" 
                className="border border-border rounded-lg"
              />
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-500/10"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {showQR ? 'Hide QR' : 'Show QR Code'}
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-500/10"
          >
            <Wifi className="mr-2 h-4 w-4" />
            Copy URL
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <div><strong>URL:</strong> {url}</div>
          <div className="mt-2"><strong>Note:</strong> Make sure your phone is on the same WiFi network as this computer.</div>
        </div>
      </CardContent>
    </Card>
  );
};
