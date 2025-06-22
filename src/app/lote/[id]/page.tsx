'use client';

import { getLoteByIdAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Droplets, Loader2, Zap, Mic, MicOff } from 'lucide-react';
import { useEffect, useState, useRef, FormEvent } from 'react';
import type { Lote } from '@/lib/types';
import { mycoMind, type MycoMindInput } from '@/ai/flows/myco-mind-flow';
import { upsellStrategy, type UpsellStrategyOutput } from '@/ai/flows/upsell-strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImage } from '@/components/ProductImage';
import { MycoSoundWave } from '@/components/MycoSoundWave';
import { useToast } from '@/hooks/use-toast';

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
  const [userInput, setUserInput] = useState('');
  const [isMycoTyping, setIsMycoTyping] = useState(false);
  const [upsell, setUpsell] = useState<UpsellStrategyOutput | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const callMycoMind = async (input: MycoMindInput) => {
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
  };

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
                description: 'La visualización de sonido requiere acceso al micrófono. Por favor, habilita los permisos.',
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

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !lote || isMycoTyping) return;

    setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    const textToSend = userInput;
    setUserInput('');

    await callMycoMind({
        interactionType: 'QUERY',
        userMessage: textToSend,
        loteContext: {
            productName: lote.productos!.nombre,
            ageInDays: getAgeInDays(lote.created_at),
            status: lote.estado,
            incidents: lote.incidencias || undefined,
        }
    });
  };
  
  const handleHydration = async () => {
    if (!lote || isMycoTyping) return;
    setNetworkState('hydrating');
    setMessages(prev => [...prev, { sender: 'user', text: '[Enviaste un estímulo hídrico]' }]);
    
    await callMycoMind({
        interactionType: 'HYDRATION',
        loteContext: {
            productName: lote.productos!.nombre,
            ageInDays: getAgeInDays(lote.created_at),
            status: lote.estado,
            incidents: lote.incidencias || undefined,
        }
    });

    setTimeout(() => {
        const isContaminated = lote.estado === 'Contaminado';
        const age = getAgeInDays(lote.created_at);
        let resetState: NetworkState = 'idle';
        if (isContaminated) resetState = 'error';
        else if (age >= 7) resetState = 'complex';
        setNetworkState(resetState);
    }, 1500);
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

        <div className="mt-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={handleHydration} disabled={isMycoTyping} className="bg-transparent text-white border-blue-400 hover:bg-blue-400/20 hover:text-white">
              <Droplets className="mr-2 h-4 w-4 text-blue-400" /> Enviar Estímulo Hídrico
            </Button>
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Converse con Myco..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => { if(networkState !== 'complex' && networkState !== 'error' && micPermission === 'granted') setNetworkState('listening')}}
                onBlur={() => { if(networkState !== 'complex' && networkState !== 'error') setNetworkState('idle')}}
                className="bg-card/10 border-primary/30 h-12 text-base text-white placeholder:text-gray-400"
                disabled={isMycoTyping}
              />
              <Button type="submit" size="icon" className="h-12 w-12" disabled={isMycoTyping || !userInput.trim()}>
                <Send />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
