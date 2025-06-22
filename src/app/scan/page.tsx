'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type jsqr from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { QrCode as QrCodeIcon, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';
import { Button } from '@/components/ui/button';

export default function PublicScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<'welcome' | 'scanning' | 'denied' | 'processing'>('welcome');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const jsQrRef = useRef<typeof jsqr | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    import('jsqr').then((module) => {
      jsQrRef.current = module.default;
    });
  }, []);
  
  const startScan = () => {
    setView('scanning');
  };

  useEffect(() => {
    // Cleanup camera stream on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  
  useEffect(() => {
    if (view === 'scanning') {
      const enableCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast({
            variant: 'destructive',
            title: 'Cámara no soportada',
            description: 'Tu navegador no soporta el acceso a la cámara.',
          });
          setView('denied');
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
             setView('denied');
             toast({
                variant: 'destructive',
                title: 'Error de interfaz',
                description: 'No se pudo inicializar el visor de la cámara.',
             });
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setView('denied');
          toast({
            variant: 'destructive',
            title: 'Acceso a la cámara denegado',
            description: 'Por favor, habilita los permisos de la cámara en la configuración de tu navegador.',
          });
        }
      };
      enableCamera();
    }
  }, [view, toast]);


  const scanLoop = useCallback(() => {
    if (view !== 'scanning') return;

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
        setView('processing');
        setScanResult(code.data);

        try {
          const url = new URL(code.data);
          const pathSegments = url.pathname.split('/');
          const loteId = pathSegments.pop() || pathSegments.pop();

          if (pathSegments.includes('lote') && loteId) {
            toast({ title: 'Simbiosis Establecida', description: `Iniciando conexión con Myco...` });
            router.push(`/lote/${loteId}`);
            return; // Stop the loop
          } else {
            throw new Error('QR no es válido para esta aplicación.');
          }
        } catch (e) {
          toast({ variant: 'destructive', title: 'Código QR no válido', description: 'El código escaneado no es un enlace de FungiTrack válido.' });
          setTimeout(() => setView('scanning'), 2000);
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(scanLoop);
  }, [view, router, toast]);

  useEffect(() => {
    if (view === 'scanning') {
      animationFrameId.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [view, scanLoop]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#201A30] text-slate-200">
        <canvas ref={canvasRef} className="hidden" />

        {view === 'welcome' && (
             <div className="flex flex-col items-center text-center animate-in fade-in duration-1000">
                <h1 className="font-headline text-6xl md:text-8xl text-white">
                  Simbionte Myco
                </h1>
                <p className="mt-4 text-lg text-slate-400 font-body">
                  Una experiencia de co-evolución.
                </p>
                <Button onClick={startScan} size="lg" className="mt-8 bg-[#A080E0] text-white hover:bg-[#A080E0]/90 rounded-full px-12 py-6 text-xl">
                    Iniciar Simbiosis
                </Button>
            </div>
        )}

        {(view === 'scanning' || view === 'denied' || view === 'processing') && (
            <div className="absolute inset-0 w-full h-full animate-in fade-in">
                <video
                ref={videoRef}
                className={cn('w-full h-full object-cover', { hidden: view !== 'scanning' })}
                autoPlay
                playsInline
                muted
                />
                
                {view === 'scanning' && (
                    <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center">
                        <div className="relative w-3/4 max-w-xs aspect-square">
                            <div className='absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-[#A080E0] rounded-tl-2xl'></div>
                            <div className='absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-[#A080E0] rounded-tr-2xl'></div>
                            <div className='absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-[#A080E0] rounded-bl-2xl'></div>
                            <div className='absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-[#A080E0] rounded-br-2xl'></div>
                             <p className='absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/80'>Escanea el código de tu kit</p>
                        </div>
                    </div>
                )}
                
                {view === 'denied' && (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 gap-4 p-4 text-center">
                        <CameraOff className='w-16 h-16 text-red-500'/>
                        <h2 className='text-2xl font-bold'>Cámara no disponible</h2>
                        <p className='text-muted-foreground'>Revisa los permisos de cámara en tu navegador para continuar.</p>
                        <Button onClick={startScan} size="lg" className="mt-4 bg-[#A080E0] text-white hover:bg-[#A080E0]/90">
                            Reintentar
                        </Button>
                    </div>
                )}

                 {view === 'processing' && (
                    <div className='absolute inset-0 bg-[#201A30]/90 flex flex-col items-center justify-center text-center p-4 gap-4'>
                        <Loader2 className="h-12 w-12 animate-spin text-[#A080E0]"/>
                        <p className='font-semibold text-xl'>Conectando con la red...</p>
                        <p className='text-sm text-slate-400 break-all max-w-sm truncate'>{scanResult}</p>
                    </div>
                )}
            </div>
        )}
    </main>
  );
}
