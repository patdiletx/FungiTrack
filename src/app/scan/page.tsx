'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type jsqr from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode as QrCodeIcon, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';

export default function PublicScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionState, setPermissionState] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const jsQrRef = useRef<typeof jsqr | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    import('jsqr').then((module) => {
      jsQrRef.current = module.default;
    });
  }, []);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Cámara no soportada',
          description: 'Tu navegador no soporta el acceso a la cámara.',
        });
        setPermissionState('denied');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setPermissionState('granted');
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setPermissionState('denied');
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, habilita los permisos de la cámara en la configuración de tu navegador.',
        });
      }
    };

    requestCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const scanLoop = useCallback(() => {
    if (isProcessing) return;

    const jsQR = jsQrRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (jsQR && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        setIsProcessing(true);
        setScanResult(code.data);

        try {
          const url = new URL(code.data);
          const pathSegments = url.pathname.split('/');
          const loteId = pathSegments.pop() || pathSegments.pop();

          if (pathSegments.includes('lote') && loteId) {
            toast({ title: 'Código QR detectado', description: `Iniciando Myco-Mind AI...` });
            router.push(`/lote/${loteId}`);
            return;
          } else {
            throw new Error('QR no es válido para esta aplicación.');
          }
        } catch (e) {
          toast({ variant: 'destructive', title: 'Código QR no válido', description: 'El código escaneado no es un enlace de FungiTrack válido.' });
          setTimeout(() => setIsProcessing(false), 2000);
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(scanLoop);
  }, [isProcessing, router, toast]);

  useEffect(() => {
    if (permissionState === 'granted') {
      animationFrameId.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [permissionState, scanLoop]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center text-center mb-8">
            <FungiTrackLogo className="mb-4" />
            <h1 className="font-headline text-4xl md:text-5xl text-foreground">
              Escanear Kit
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-body">
              Apunta la cámara al código QR para conversar con tu cultivo.
            </p>
        </div>

        <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
                <video
                ref={videoRef}
                className={cn('w-full h-full object-cover', {
                    hidden: permissionState !== 'granted',
                })}
                autoPlay
                playsInline
                muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {permissionState === 'pending' && <Loader2 className="absolute h-10 w-10 animate-spin text-muted-foreground" />}
                
                {permissionState === 'denied' && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive" className="w-auto">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Cámara no disponible</AlertTitle>
                    <AlertDescription>
                        Revisa los permisos en tu navegador.
                    </AlertDescription>
                    </Alert>
                </div>
                )}
                
                {permissionState === 'granted' && (
                <div className="absolute inset-0 bg-black/20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-[250px] aspect-square">
                        <div className='absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg'></div>
                        <div className='absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg'></div>
                        <div className='absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg'></div>
                        <div className='absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg'></div>
                    </div>
                </div>
                )}

                {isProcessing && scanResult && (
                    <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4'>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4"/>
                        <p className='font-semibold'>¡Código Detectado!</p>
                        <p className='text-sm text-muted-foreground break-all'>{scanResult}</p>
                    </div>
                )}
            </div>
        </div>
    </main>
  );
}
