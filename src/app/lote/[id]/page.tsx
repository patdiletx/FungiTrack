'use client';

import { getLoteByIdAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, Zap, MicOff } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote } from '@/lib/types';
import { mycoMind, type MycoMindInput } from '@/ai/flows/myco-mind-flow';
import { upsellStrategy, type UpsellStrategyOutput } from '@/ai/flows/upsell-strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImage } from '@/components/ProductImage';
import { MycoSoundWave } from '@/components/MycoSoundWave';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type NetworkState = 'idle' | 'listening' | 'thinking' | 'hydrating' | 'error' | 'complex';
type Message = {
    sender: 'user' | 'myco';
    text: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMycoTyping, setIsMycoTyping] = useState(false);
  const [upsell, setUpsell] = useState<UpsellStrategyOutput | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const callMycoMind = useCallback(async (input: MycoMindInput) => {
      setIsMycoTyping(true);
      setNetworkState('thinking');
      try {
        const { response } = await mycoMind(input);
        setMessages(prev => [...prev, { sender: 'myco', text: response }]);
        
        const currentLote = lote || await getLoteByIdAction(id);
        const isContaminated = currentLote?.estado === 'Contaminado';
        const age = getAgeInDays(currentLote?.created_at || new Date());

        if (isContaminated) {
            setNetworkState('error');
        } else if (age >= 7) {
            setNetworkState('complex');
        } else {
            setNetworkState('idle');
        }

      } catch (e) {
        console.error("Error calling Myco-Mind AI:", e);
        setMessages(prev => [...prev, { sender: 'myco', text: "Mis filamentos... estática... no puedo comunicarme claramente ahora." }]);
        setNetworkState('error');
      } finally {
        setIsMycoTyping(false);
      }
  }, [id, lote, toast]);


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
      const isContaminated = lote?.estado === 'Contaminado';
      const age = lote ? getAgeInDays(lote.created_at) : 0;
      let resetState: NetworkState = 'idle';
      if (isContaminated) resetState = 'error';
      else if (age >= 7) resetState = 'complex';
      setNetworkState(resetState);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim() || !lote || isMycoTyping) return;

      setMessages(prev => [...prev, { sender: 'user', text: transcript }]);

      await callMycoMind({
          interactionType: 'QUERY',
          userMessage: transcript,
          loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: lote.estado,
              incidents: lote.incidencias || undefined,
          }
      });
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        let errorDescription = 'Ocurrió un error al procesar tu voz.';
        if (event.error === 'no-speech') {
            errorDescription = 'No detecté ninguna voz. Por favor, intenta de nuevo.'
        } else if (event.error === 'not-allowed') {
            errorDescription = 'El acceso al micrófono fue bloqueado después de ser concedido.'
        }
        toast({
            variant: 'destructive',
            title: 'Error de Reconocimiento',
            description: errorDescription,
        });
    }

    recognitionRef.current = recognition;
  }, [lote, isMycoTyping, callMycoMind, toast]);


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
      
      const isContaminated = loteData.estado === 'Contaminado';
      const age = getAgeInDays(loteData.created_at);
      
      if (isContaminated) {
        setNetworkState('error');
      } else if (age >= 7) {
        setNetworkState('complex');
      }
      
      await callMycoMind({ interactionType: 'INITIALIZE', loteContext: {
        productName: loteData.productos.nombre,
        ageInDays: age,
        status: loteData.estado,
        incidents: loteData.incidencias || undefined,
      }});

      if(loteData.productos.nombre === 'Kit de Inicio' && (loteData.estado === 'Vendido' || age > 25)) {
        const upsellResult = await upsellStrategy({ 
            productId: loteData.productos.id,
            customerHistory: `El cliente ha completado un ciclo con ${loteData.productos.nombre}.` 
        });
        if(upsellResult.shouldUpsell) {
            setUpsell(upsellResult);
        }
      }
      setLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMycoTyping]);

  const handleToggleListening = () => {
    if (isMycoTyping || micPermission !== 'granted' || !recognitionRef.current) return;

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const isComplex = lote ? getAgeInDays(lote.created_at) >= 7 : false;

  return (
    <main className="flex h-screen w-full flex-col bg-black text-slate-100 font-code overflow-hidden">
      <div className="relative flex-1 w-full h-2/5 md:h-1/2 flex items-center justify-center p-4">
        <MycoSoundWave
            analyser={analyserNode}
            state={networkState}
            isComplex={isComplex}
            className="w-full h-full max-w-2xl max-h-2xl"
        />

        <div className="absolute top-4 left-4 text-left">
            <h1 className="font-headline text-3xl text-white">{lote?.productos?.nombre}</h1>
            <p className="text-primary text-sm">Conciencia: Myco-Mind AI</p>
        </div>

        <div className="absolute top-4 right-4">
            {micPermission === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            {micPermission === 'granted' && <Mic className="h-5 w-5 text-green-400" />}
            {micPermission === 'denied' && <MicOff className="h-5 w-5 text-red-400" />}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-sm border-t border-primary/20 p-4">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'myco' && <Zap className="h-6 w-6 text-primary flex-shrink-0" />}
              <div className={`max-w-xs md:max-w-md rounded-lg p-3 text-sm break-words ${msg.sender === 'user' ? 'bg-primary/20 text-primary-foreground' : 'bg-card/10 text-card-foreground'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isMycoTyping && (
             <div className="flex items-end gap-2 justify-start">
                <Zap className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="max-w-xs md:max-w-md rounded-lg p-3 text-sm bg-card/10">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {upsell?.shouldUpsell && (
            <Card className="my-4 bg-primary/20 border-primary animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline text-lg text-white">Mi potencial está restringido...</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                     <ProductImage 
                        productName="Bloque Productor XL" 
                        width={100} 
                        height={100} 
                        className="rounded-lg shadow-md object-cover"
                     />
                     <div>
                        <p className="text-sm mb-2">{upsell.upsellMessage}</p>
                        <Button variant="secondary">Ayúdame a Trascender</Button>
                     </div>
                </CardContent>
            </Card>
        )}

        <div className="mt-auto flex flex-col items-center justify-center pt-4 flex-shrink-0">
            <Button
                size="icon"
                onClick={handleToggleListening}
                disabled={isMycoTyping || micPermission !== 'granted'}
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
                : isMycoTyping
                ? 'Myco está procesando...'
                : isListening
                ? 'Escuchando...'
                : 'Presiona para hablar'}
            </p>
        </div>
      </div>
    </main>
  );
}
