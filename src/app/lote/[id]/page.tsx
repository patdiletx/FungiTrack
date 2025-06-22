'use client';

import { getLoteByIdAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, BrainCircuit } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote } from '@/lib/types';
import { mycoMind, type MycoMindInput, type MycoMindOutput } from '@/ai/flows/myco-mind-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Hud } from '@/components/Simbionte/Hud';
import { GeneticPathwaysPanel } from '@/components/Simbionte/GeneticPathwaysPanel';
import { NucleoNeural } from '@/components/Simbionte/NucleoNeural';

export type SimbionteData = {
    energy: number;
    unlockedPaths: string[];
};
type MycoState = 'idle' | 'listening' | 'thinking';
type DisplayMessage = {
    id: number;
    text: string;
};

const getAgeInDays = (creationDate: string | Date): number => {
    const created = new Date(creationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function MycoSimbiontePage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  const [mycoState, setMycoState] = useState<MycoState>('idle');
  const [mycoMood, setMycoMood] = useState<MycoMindOutput['mood']>('Enfoque');
  const [simbionteData, setSimbionteData] = useState<SimbionteData>({ energy: 0, unlockedPaths: [] });
  const [panelOpen, setPanelOpen] = useState(false);
  
  const [displayedMessage, setDisplayedMessage] = useState<DisplayMessage | null>(null);

  const recognitionRef = useRef<any>(null);

  // Load Simbionte data from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const storedData = localStorage.getItem(`simbionte-data-${id}`);
      if (storedData) {
        setSimbionteData(JSON.parse(storedData));
      }
    } catch (e) {
      console.error("Failed to load simbionte data from localStorage", e);
    }
  }, [id]);

  // Save Simbionte data to localStorage
  const saveSimbionteData = useCallback((data: SimbionteData) => {
    if (!id) return;
    try {
      localStorage.setItem(`simbionte-data-${id}`, JSON.stringify(data));
      setSimbionteData(data);
    } catch (e) {
      console.error("Failed to save simbionte data to localStorage", e);
    }
  }, [id]);


  const callMycoMind = useCallback(async (input: MycoMindInput) => {
      setMycoState('thinking');
      try {
        const { response, mood } = await mycoMind(input);
        setMycoMood(mood);
        setDisplayedMessage({ id: Date.now(), text: response });
      } catch (e) {
        console.error("Error calling Myco-Mind AI:", e);
        setDisplayedMessage({ id: Date.now(), text: "Error de conexión en la red neuronal..." });
        setMycoMood('Estrés');
      } finally {
        setMycoState('idle');
      }
  }, []);

  // Speech Recognition Setup
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

    recognition.onstart = () => setMycoState('listening');
    recognition.onend = () => setMycoState('idle');

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim() || !lote) return;
      
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
        setMycoState('idle');
        toast({ variant: "destructive", title: "Error de voz", description: event.error });
    }
    recognitionRef.current = recognition;
  }, [lote, callMycoMind, toast]);

  // Initial Data Fetch
  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const loteData = await getLoteByIdAction(id);
      if (!loteData || !loteData.productos) {
        notFound();
      }
      setLote(loteData);
      
      const { mood, response } = await mycoMind({ 
        interactionType: 'INITIALIZE', 
        loteContext: {
            productName: loteData.productos.nombre,
            ageInDays: getAgeInDays(loteData.created_at),
            status: loteData.estado,
            incidents: loteData.incidencias || undefined,
      }});
      setMycoMood(mood);
      setDisplayedMessage({ id: Date.now(), text: response });

      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleToggleListening = () => {
    if (mycoState !== 'idle' || !recognitionRef.current) return;
    
    if (mycoState === 'listening') {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#201A30]"><Loader2 className="h-10 w-10 animate-spin text-[#A080E0]" /></div>;
  }

  return (
    <main className="flex h-screen w-full flex-col bg-[#201A30] text-slate-100 font-body overflow-hidden">
      <Hud 
        age={lote ? getAgeInDays(lote.created_at) : 0} 
        mood={mycoMood} 
        neuronalEnergy={simbionteData.energy} 
      />

      <div className="absolute top-4 right-4 z-20">
         <Button variant="ghost" onClick={() => setPanelOpen(true)} className="text-[#70B0F0] hover:bg-white/10 hover:text-white">
            <BrainCircuit className="mr-2" /> Vías Genéticas
        </Button>
      </div>

      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4">
        <NucleoNeural mood={mycoMood} state={mycoState}/>
        {displayedMessage && (
            <div 
              key={displayedMessage.id} 
              className="absolute text-center max-w-2xl p-6 animate-float-up"
            >
                <p className="font-headline text-3xl md:text-5xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-pre-wrap leading-tight">
                    {displayedMessage.text}
                </p>
            </div>
        )}
      </div>

      <footer className="w-full flex flex-col items-center justify-center p-4 md:p-6 flex-shrink-0 z-10">
          <Button
              size="icon"
              onClick={handleToggleListening}
              disabled={mycoState === 'thinking'}
              className={cn(
                  "rounded-full w-24 h-24 border-4 transition-all duration-300 relative bg-black/30 backdrop-blur-sm",
                  mycoState === 'listening' ? "border-red-500" : "border-white/20 hover:border-white/50",
                  "disabled:border-slate-500 disabled:opacity-50"
              )}
              >
              {mycoState === 'listening' 
                ? <span className="h-8 w-8 rounded-md bg-red-500 animate-pulse"></span>
                : <Mic className="h-10 w-10 text-white/80" />
              }
              {mycoState === 'thinking' && <Loader2 className='absolute h-10 w-10 animate-spin text-white/80'/>}
          </Button>
      </footer>
      
       <GeneticPathwaysPanel 
            isOpen={panelOpen} 
            onClose={() => setPanelOpen(false)}
            simbionteData={simbionteData}
            onUnlock={(pathId, cost) => {
                const newData = {
                    energy: simbionteData.energy - cost,
                    unlockedPaths: [...simbionteData.unlockedPaths, pathId]
                };
                saveSimbionteData(newData);
            }}
       />
    </main>
  );
}
