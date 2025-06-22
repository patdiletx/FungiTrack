'use client';

import { getLoteByIdAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, MicOff } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote } from '@/lib/types';
import { mycoMind, type MycoMindInput } from '@/ai/flows/myco-mind-flow';
import { MycoSoundWave } from '@/components/MycoSoundWave';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type NetworkState = 'idle' | 'listening' | 'thinking' | 'hydrating' | 'error';
type DisplayMessage = {
    id: number;
    text: string;
    sender: 'user' | 'myco';
};

const getAgeInDays = (creationDate: string | Date): number => {
    const created = new Date(creationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function MycoMindPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkState, setNetworkState] = useState<NetworkState>('idle');
  const [displayedMessage, setDisplayedMessage] = useState<DisplayMessage | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (displayedMessage && messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
    }
    if (displayedMessage) {
        messageTimeoutRef.current = setTimeout(() => {
            setDisplayedMessage(null);
        }, 10000); // Message visible for 10 seconds
    }
    return () => {
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
    }
  }, [displayedMessage]);


  const callMycoMind = useCallback(async (input: MycoMindInput, showMessage: boolean) => {
      setNetworkState('thinking');
      try {
        const { response } = await mycoMind(input);
        if (showMessage) {
            setDisplayedMessage({ id: Date.now(), text: response, sender: 'myco' });
        }
        setNetworkState(lote?.estado === 'Contaminado' ? 'error' : 'idle');
      } catch (e) {
        console.error("Error calling Myco-Mind AI:", e);
        if (showMessage) {
            setDisplayedMessage({ id: Date.now(), text: "Mis filamentos... estática... no puedo comunicarme claramente ahora.", sender: 'myco' });
        }
        setNetworkState('error');
      }
  }, [lote]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Navegador no compatible',
        description: 'El reconocimiento de voz no es compatible con tu navegador.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setNetworkState('listening');
    };

    recognition.onend = () => {
      setIsListening(false);
      setNetworkState(lote?.estado === 'Contaminado' ? 'error' : 'idle');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim() || !lote) return;

      setDisplayedMessage({ id: Date.now(), text: `"${transcript}"`, sender: 'user' });

      await callMycoMind({
          interactionType: 'QUERY',
          userMessage: transcript,
          loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: lote.estado,
              incidents: lote.incidencias || undefined,
          }
      }, true);
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setNetworkState('error');
        let errorDescription = 'Ocurrió un error al procesar tu voz.';
        if (event.error === 'no-speech') {
            errorDescription = 'No detecté ninguna voz. Por favor, intenta de nuevo.'
        } else if (event.error === 'not-allowed') {
            errorDescription = 'El acceso al micrófono fue bloqueado.'
        }
        setDisplayedMessage({ id: Date.now(), text: errorDescription, sender: 'myco'});
    }

    recognitionRef.current = recognition;
  }, [lote, callMycoMind, toast]);


  useEffect(() => {
    const getMicPermission = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('La API de medios no es soportada en este navegador.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            
            setAnalyserNode(analyser);
            setMicPermission('granted');

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMicPermission('denied');
            toast({
                variant: 'destructive',
                title: 'Acceso al Micrófono Denegado',
                description: 'La interacción por voz y la visualización de sonido requieren acceso al micrófono.',
            });
        }
    };
    getMicPermission();

    return () => {
        audioContextRef.current?.close().catch(console.error);
    }
  }, [toast]);


  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const loteData = await getLoteByIdAction(id);
      if (!loteData || !loteData.productos) {
        notFound();
      }
      setLote(loteData);
      setNetworkState(loteData.estado === 'Contaminado' ? 'error' : 'idle');
      
      // Warm up the AI but don't show the initial message.
      await callMycoMind({ 
        interactionType: 'INITIALIZE', 
        loteContext: {
            productName: loteData.productos.nombre,
            ageInDays: getAgeInDays(loteData.created_at),
            status: loteData.estado,
            incidents: loteData.incidencias || undefined,
      }}, false);

      setLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleListening = () => {
    if (networkState === 'thinking' || micPermission !== 'granted' || !recognitionRef.current) return;

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'En Incubación':
        case 'En Fructificación':
            return 'secondary';
        case 'Listo para Venta':
        case 'Vendido':
            return 'default';
        case 'Contaminado':
            return 'destructive';
        default:
            return 'outline';
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <main className="flex h-screen w-full flex-col bg-black text-slate-100 font-code overflow-hidden">
      
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-20">
        <div className="text-left">
            <h1 className="font-headline text-2xl md:text-3xl text-white">{lote?.productos?.nombre}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
                <Badge variant={getStatusVariant(lote?.estado || '')}>{lote?.estado}</Badge>
                {lote && <Badge variant="outline" className="border-white/30 text-white/80">{getAgeInDays(lote.created_at)} días de edad</Badge>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            {micPermission === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            {micPermission === 'granted' && <Mic className="h-5 w-5 text-green-400" />}
            {micPermission === 'denied' && <MicOff className="h-5 w-5 text-red-400" />}
        </div>
      </header>
      
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4">
        <MycoSoundWave
            analyser={analyserNode}
            state={networkState}
            className="w-full h-full max-w-4xl max-h-4xl"
        />

        {displayedMessage && (
            <div 
              key={displayedMessage.id} 
              className={cn(
                "absolute text-center max-w-lg p-4 animate-in fade-in-50 duration-500",
                {"animate-out fade-out-50 duration-1000 fill-mode-forwards": !displayedMessage}
              )}
            >
                <p className={cn("font-headline text-2xl md:text-4xl drop-shadow-lg", 
                    displayedMessage.sender === 'user' ? "text-primary" : "text-white"
                )}>
                    {displayedMessage.text}
                </p>
            </div>
        )}
      </div>

      <footer className="mt-auto flex flex-col items-center justify-center p-4 md:p-6 flex-shrink-0 z-10">
          <Button
              size="icon"
              onClick={handleToggleListening}
              disabled={networkState === 'thinking' || micPermission !== 'granted'}
              className={cn(
                  "rounded-full w-20 h-20 border-2 transition-all duration-300 relative",
                  isListening ? "border-red-500 bg-red-500/20 text-red-500" : "border-primary bg-primary/10 text-primary",
                  "disabled:border-muted disabled:bg-muted/10 disabled:text-muted-foreground"
              )}
              >
              <Mic className="h-8 w-8" />
              {isListening && (
                  <span className="absolute h-full w-full rounded-full bg-red-500/50 animate-ping"></span>
              )}
          </Button>
          <p className="mt-2 h-4 text-xs text-muted-foreground">
            {micPermission === 'denied'
              ? 'Permiso de micrófono denegado'
              : networkState === 'thinking'
              ? 'Myco está procesando...'
              : isListening
              ? 'Escuchando...'
              : 'Presiona para hablar'}
          </p>
      </footer>
    </main>
  );
}
