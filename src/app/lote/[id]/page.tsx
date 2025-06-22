'use client';

import { getLoteByIdAction, updateKitSettingsAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, BookHeart } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote, PhotoEntry, Kit, NotificationSettings, Coordinates, KitSettings } from '@/lib/types';
import { mycoMind, type MycoMindOutput, MycoMindInput } from '@/ai/flows/myco-mind-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Hud } from '@/components/Simbionte/Hud';
import { NucleoNeural } from '@/components/Simbionte/NucleoNeural';
import { CareProgressPanel } from '@/components/Simbionte/CareProgressPanel';


type MycoState = 'idle' | 'listening' | 'thinking';
type DisplayMessage = {
    id: number;
    text: string;
};
type WeatherData = {
    temperature: number;
    humidity: number;
};


const defaultNotificationSettings: NotificationSettings = {
    enabled: false,
    watering: { enabled: true, time: '09:00' },
    aeration: { enabled: true, times: ['09:00', '15:00', '21:00'] },
};

const getAgeInDays = (creationDate: string | Date): number => {
    const created = new Date(creationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDynamicStatus = (lote: Lote): string => {
    // Producer-set states take precedence and stop the automatic cycle.
    if (['Vendido', 'Contaminado'].includes(lote.estado)) {
        return lote.estado;
    }
    
    const age = getAgeInDays(lote.created_at);

    if (age <= 14) return 'En Incubación';
    if (age <= 25) return 'En Fructificación';
    return 'Listo para Cosecha';
};


export default function MycoSimbiontePage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [mycoState, setMycoState] = useState<MycoState>('idle');
  const [mycoMood, setMycoMood] = useState<MycoMindOutput['mood']>('Enfoque');
  
  const [photoHistory, setPhotoHistory] = useState<PhotoEntry[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  
  const [isCarePanelOpen, setIsCarePanelOpen] = useState(false);
  const [myKits, setMyKits] = useState<Kit[]>([]);
  
  const [displayedMessage, setDisplayedMessage] = useState<DisplayMessage | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const recognitionRef = useRef<any>(null);
  const dynamicStatus = lote ? getDynamicStatus(lote) : 'Cargando...';

  // This is the core function for interacting with the AI
  const handleAiInteraction = useCallback(async (input: MycoMindInput) => {
    if (!id) return;
    setMycoState('thinking');
    try {
        const aiResponse = await mycoMind(input);
        if (!aiResponse) {
            throw new Error("Myco-Mind AI returned a null or undefined response.");
        }
        
        // Persist the latest AI response to the DB
        await updateKitSettingsAction(id, { last_ai_response: aiResponse });

        // Update the UI state
        const { response, mood, weather: weatherData } = aiResponse;
        setMycoMood(mood);
        setWeather(weatherData ?? null);
        setDisplayedMessage({ id: Date.now(), text: response });
    } catch (e) {
        console.error("Error calling Myco-Mind AI:", e);
        if (e instanceof Error && e.message.includes("null output")) {
             setDisplayedMessage({ id: Date.now(), text: "Red neuronal ocupada. Intenta de nuevo en un momento." });
        } else {
             setDisplayedMessage({ id: Date.now(), text: "Error de conexión en la red neuronal..." });
        }
        setMycoMood('Estrés');
    } finally {
        setMycoState('idle');
    }
  }, [id]);


  const onPhotoUpload = async (photo: PhotoEntry) => {
    const newHistory = [...photoHistory, photo];
    setPhotoHistory(newHistory);
    try {
        await updateKitSettingsAction(id, { photo_history: newHistory });
    } catch(e) {
        console.error("Failed to save photo history", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudo guardar la foto en el servidor.'});
    }
  };
  
  const onSettingsChange = async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    try {
        await updateKitSettingsAction(id, { notification_settings: settings });
        if(settings.enabled) {
            toast({ title: 'Alertas actualizadas', description: 'Tus recordatorios de cuidado han sido guardados.' });
        }
    } catch(e) {
        console.error("Failed to save notification settings", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudieron guardar las alertas en el servidor.'});
    }
  };
  
  const onCoordinatesChange = async (coords: Coordinates) => {
    setCoordinates(coords); // Update UI state immediately
    
    // First, save the new coordinates to the database.
    try {
        await updateKitSettingsAction(id, { coordinates: coords });
        toast({ title: 'Ubicación guardada', description: 'La IA ahora usará el clima local para darte consejos.' });
    } catch(e) {
        console.error("Failed to save coordinates", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudo guardar la ubicación en el servidor.'});
        return; // Stop if saving failed
    }

    // After saving, trigger a new AI interaction with the updated context
    if(lote){
         handleAiInteraction({
            interactionType: 'QUERY',
            userMessage: 'He actualizado mi ubicación. ¿Cómo afecta eso a mi cultivo?',
            loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: getDynamicStatus(lote),
              incidents: lote.incidencias,
              latitude: coords.latitude,
              longitude: coords.longitude,
            }
        });
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim() || !lote) return;
      
      handleAiInteraction({
          interactionType: 'QUERY',
          userMessage: transcript,
          loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: dynamicStatus,
              incidents: lote.incidencias,
              latitude: coordinates?.latitude,
              longitude: coordinates?.longitude,
          }
      });
    };
    recognition.onerror = (event: any) => {
        setMycoState('idle');
        toast({ variant: "destructive", title: "Error de voz", description: event.error });
    }
    recognitionRef.current = recognition;
  }, [handleAiInteraction, toast, lote, coordinates, dynamicStatus]);

  // Single, robust initialization effect
  useEffect(() => {
    if (!id) return;
    let isCancelled = false;

    async function initializePage() {
        setLoading(true);

        // 1. Fetch all data from the server
        const loteData = await getLoteByIdAction(id);
        if (isCancelled || !loteData || !loteData.productos) {
            if(!isCancelled) notFound();
            return;
        }

        // 2. Set all component state based on fetched data
        setLote(loteData);
        
        const settings = loteData.kit_settings?.[0];
        const initialCoords = settings?.coordinates || null;
        setPhotoHistory(settings?.photo_history || []);
        setNotificationSettings(settings?.notification_settings || defaultNotificationSettings);
        setCoordinates(initialCoords);

        try {
            const storedKitsRaw = localStorage.getItem('fungi-my-kits');
            let kits: Kit[] = storedKitsRaw ? JSON.parse(storedKitsRaw) : [];
            if (!kits.some(k => k.id === loteData.id)) {
                kits.push({ id: loteData.id, name: loteData.productos.nombre });
                localStorage.setItem('fungi-my-kits', JSON.stringify(kits));
            }
            setMyKits(kits);
        } catch (e) {
            console.error("Failed to update kit list in localStorage", e);
        }
        
        // 3. Decide AI action: fresh call or restore from cache
        const lastResponse = settings?.last_ai_response;
        const needsFreshCall = !!initialCoords || !lastResponse;

        if (needsFreshCall) {
            const currentDynamicStatus = getDynamicStatus(loteData);
            const mycoMindInput: MycoMindInput = {
                interactionType: 'INITIALIZE',
                loteContext: {
                    productName: loteData.productos!.nombre,
                    ageInDays: getAgeInDays(loteData.created_at),
                    status: currentDynamicStatus,
                    incidents: loteData.incidencias,
                    latitude: initialCoords?.latitude,
                    longitude: initialCoords?.longitude,
                }
            };
            // This is a special case of handleAiInteraction, done manually to avoid stale state
            setMycoState('thinking');
            try {
                const aiResponse = await mycoMind(mycoMindInput);
                if (!aiResponse) throw new Error("AI returned null");
                await updateKitSettingsAction(loteData.id, { last_ai_response: aiResponse });
                setMycoMood(aiResponse.mood);
                setWeather(aiResponse.weather ?? null);
                setDisplayedMessage({ id: Date.now(), text: aiResponse.response });
            } catch (e) {
                console.error("Error during initial AI call:", e);
                setDisplayedMessage({ id: Date.now(), text: "Error de conexión con la red neuronal..." });
                setMycoMood('Estrés');
            } finally {
                setMycoState('idle');
            }
        } else if (lastResponse) {
            // Restore directly from cache
            setMycoMood(lastResponse.mood);
            setWeather(lastResponse.weather ?? null);
            setDisplayedMessage({ id: Date.now(), text: lastResponse.response });
        }
        
        setLoading(false);
    }

    initializePage();

    return () => {
        isCancelled = true;
    };
  }, [id]);


  // Handles scheduling and firing notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !notificationSettings.enabled || Notification.permission !== 'granted') {
      return;
    }

    const checkAndNotify = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { watering, aeration } = notificationSettings;

      if (watering.enabled && watering.time === currentTime) {
        new Notification('💧 Recordatorio de Riego', {
          body: `¡Es hora de regar tu ${lote?.productos?.nombre || 'cultivo'}! La hidratación es clave.`,
          tag: `fungi-watering-${id}`, 
        });
      }

      if (aeration.enabled && aeration.times.includes(currentTime)) {
         new Notification('🌬️ Recordatorio de Ventilación', {
          body: `¡Es hora de ventilar tu ${lote?.productos?.nombre || 'cultivo'}! Un poco de aire fresco le vendrá genial.`,
          tag: `fungi-aeration-${id}-${currentTime}`,
        });
      }
    };

    const intervalId = setInterval(checkAndNotify, 60000); 

    return () => clearInterval(intervalId);

  }, [notificationSettings, lote, id]);

  const handleToggleListening = () => {
    if (mycoState === 'thinking' || !recognitionRef.current) return;
    
    if (mycoState === 'listening') {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };

  if (loading && !displayedMessage) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#201A30]"><Loader2 className="h-10 w-10 animate-spin text-[#A080E0]" /></div>;
  }

  return (
    <main className="relative flex flex-col h-screen w-full bg-[#201A30] text-slate-100 font-body overflow-hidden">
      <NucleoNeural mood={mycoMood} state={mycoState} className="z-0" />
      
      <header className="flex-shrink-0 z-20 flex flex-wrap items-start justify-between gap-4 p-4">
        <Hud
          age={lote ? getAgeInDays(lote.created_at) : 0}
          mood={mycoMood}
          status={dynamicStatus}
          productName={lote?.productos?.nombre || 'Kit de Cultivo'}
          weather={weather}
        />

        <Button variant="ghost" onClick={() => setIsCarePanelOpen(true)} className="text-[#70B0F0] hover:bg-white/10 hover:text-white shrink-0">
          <BookHeart className="mr-2" /> Cuidados y Progreso
        </Button>
      </header>

      <div className="flex-grow w-full flex items-center justify-center z-10 px-8">
        {displayedMessage && (
            <div 
              key={displayedMessage.id} 
              className="text-center w-full max-w-2xl animate-float-up"
            >
                <p className="font-headline text-3xl md:text-5xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-pre-wrap leading-tight">
                    {displayedMessage.text}
                </p>
            </div>
        )}
         {loading && !displayedMessage && (
             <Loader2 className="h-10 w-10 animate-spin text-[#A080E0]/50" />
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
      
       <CareProgressPanel
            isOpen={isCarePanelOpen}
            onClose={() => setIsCarePanelOpen(false)}
            photoHistory={photoHistory}
            notificationSettings={notificationSettings}
            myKits={myKits}
            currentKitId={id}
            onPhotoUpload={onPhotoUpload}
            onSettingsChange={onSettingsChange}
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
       />
    </main>
  );
}
