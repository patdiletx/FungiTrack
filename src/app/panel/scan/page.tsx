'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type jsqr from 'jsqr'; // Import type for type-safety, not the library itself
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode as QrCodeIcon, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const jsQrRef = useRef<typeof jsqr | null>(null);

  useEffect(() => {
    // Dynamically import the jsqr library only on the client-side to prevent server crashes
    import('jsqr').then((module) => {
      jsQrRef.current = module.default;
    });

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, habilita los permisos de la cámara en tu navegador para escanear códigos QR.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const jsQR = jsQrRef.current;
      if (jsQR && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d', { willReadFrequently: true });

          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              setIsScanning(false);
              setScanResult(code.data);
              
              try {
                const url = new URL(code.data);
                const pathSegments = url.pathname.split('/');
                const loteId = pathSegments.pop() || pathSegments.pop();
                
                if (pathSegments.includes('lote') && loteId) {
                   toast({ title: "Código QR detectado", description: `Redirigiendo al lote ${loteId.substring(0,8)}...` });
                   router.push(`/panel/lote/${loteId}`);
                } else {
                    throw new Error('QR no es válido para esta aplicación.');
                }
              } catch (e) {
                 toast({ variant: 'destructive', title: "Código QR no válido", description: "El código escaneado no parece ser un enlace de FungiTrack." });
                 setTimeout(() => setIsScanning(true), 2000);
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (hasCameraPermission) {
        animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, isScanning, router, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-foreground">
          Escanear Código QR
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          Apunta la cámara al código QR de un lote para ver sus detalles.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCodeIcon /> Lector de QR</CardTitle>
          <CardDescription>Buscando un código...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {hasCameraPermission === null && <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />}
            
            {hasCameraPermission === false && (
               <Alert variant="destructive" className="w-auto m-4">
                 <CameraOff className="h-4 w-4" />
                 <AlertTitle>Cámara no disponible</AlertTitle>
                 <AlertDescription>
                   Revisa los permisos en tu navegador.
                 </AlertDescription>
               </Alert>
            )}
            
            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !hasCameraPermission })} autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

             <div className="absolute inset-0 bg-black/20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-[250px] aspect-square">
                    <div className='absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg'></div>
                    <div className='absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg'></div>
                    <div className='absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg'></div>
                    <div className='absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg'></div>
                </div>
            </div>

            {!isScanning && scanResult && (
                <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4'>
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4"/>
                    <p className='font-semibold'>¡Código Detectado!</p>
                    <p className='text-sm text-muted-foreground break-all'>{scanResult}</p>
                </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
