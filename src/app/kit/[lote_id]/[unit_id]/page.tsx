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
    // This status is now independent from the producer's lot status.
    const age = getAgeInDays(lote.created_at);
    if (age <= 14) return 'En Incubación';
    if (age <= 25) return 'En Fructificación';
    return 'Listo para Cosecha';
};


export default function MycoSimbiontePage() {
  const params = useParams();
  const loteId = params.lote_id as string;
  const unitId = parseInt(params.unit_id as string, 10);
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

  // This is the core function for USER-INITIATED interactions with the AI
  const handleAiInteraction = useCallback(async (input: MycoMindInput) => {
    if (!loteId || !unitId) return;
    setMycoState('thinking');
    try {
        const aiResponse = await mycoMind(input);
        if (!aiResponse) {
            throw new Error("Myco-Mind AI returned a null or undefined response.");
        }
        
        await updateKitSettingsAction(loteId, unitId, { last_ai_response: aiResponse });

        const { response, mood, weather: weatherData } = aiResponse;
        setMycoMood(mood);
        setWeather(weatherData ?? null);
        setDisplayedMessage({ id: Date.now(), text: response });
    } catch (e) {
        console.error("Error calling Myco-Mind AI:", e);
        const errorMessage = e instanceof Error && e.message.includes("null output")
            ? "Red neuronal ocupada. Intenta de nuevo en un momento."
            : "Error de conexión en la red neuronal...";
        setDisplayedMessage({ id: Date.now(), text: errorMessage });
        setMycoMood('Estrés');
    } finally {
        setMycoState('idle');
    }
  }, [loteId, unitId]);


  const onPhotoUpload = async (photo: PhotoEntry) => {
    const newHistory = [...photoHistory, photo];
    setPhotoHistory(newHistory);
    try {
        await updateKitSettingsAction(loteId, unitId, { photo_history: newHistory });
    } catch(e) {
        console.error("Failed to save photo history", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudo guardar la foto en el servidor.'});
    }
  };
  
  const onSettingsChange = async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    try {
        await updateKitSettingsAction(loteId, unitId, { notification_settings: settings });
        if(settings.enabled) {
            toast({ title: 'Alertas actualizadas', description: 'Tus recordatorios de cuidado han sido guardados.' });
        }
    } catch(e) {
        console.error("Failed to save notification settings", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudieron guardar las alertas en el servidor.'});
    }
  };
  
  const onCoordinatesChange = useCallback(async (coords: Coordinates) => {
    setCoordinates(coords);
    
    try {
        await updateKitSettingsAction(loteId, unitId, { coordinates: coords });
        toast({ title: 'Ubicación guardada', description: 'La IA ahora usará el clima local para darte consejos.' });
    } catch(e) {
        console.error("Failed to save coordinates", e);
        toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudo guardar la ubicación en el servidor.'});
        return; 
    }

    if(lote){
         handleAiInteraction({
            interactionType: 'QUERY',
            userMessage: 'He actualizado mi ubicación. ¿Cómo afecta eso a mi cultivo?',
            loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: getDynamicStatus(lote),
              unitIndex: unitId,
              incidents: undefined,
              latitude: coords.latitude,
              longitude: coords.longitude,
            }
        });
    }
  }, [loteId, unitId, lote, handleAiInteraction]);

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
              unitIndex: unitId,
              incidents: undefined,
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
  }, [handleAiInteraction, toast, lote, coordinates, dynamicStatus, unitId]);

  // Single, robust initialization effect
  useEffect(() => {
    if (!loteId || !unitId) return;
    let isMounted = true;

    async function initializePage() {
        setLoading(true);
        setMycoState('thinking');

        // Step 1: Fetch all data for this specific unit
        const loteData = await getLoteByIdAction(loteId, unitId);

        if (!isMounted) return;
        if (!loteData || !loteData.productos) {
            notFound();
            return;
        }
        
        // Step 2: Populate base state
        const settings = loteData.kit_settings?.[0]; // We fetch only one setting
        const coords = settings?.coordinates || null;
        const lastResponse = settings?.last_ai_response || null;

        setLote(loteData);
        setPhotoHistory(settings?.photo_history || []);
        setNotificationSettings(settings?.notification_settings || defaultNotificationSettings);
        setCoordinates(coords);
        
        try {
            const storedKitsRaw = localStorage.getItem('fungi-my-kits');
            let kits: Kit[] = storedKitsRaw ? JSON.parse(storedKitsRaw) : [];
            // Check if this specific unit is already in the list
            if (!kits.some(k => k.id === loteData.id && k.unit === unitId)) {
                kits.push({ id: loteData.id, unit: unitId, name: loteData.productos.nombre });
                localStorage.setItem('fungi-my-kits', JSON.stringify(kits));
            }
            if (isMounted) setMyKits(kits);
        } catch (e) {
            console.error("Failed to update kit list in localStorage", e);
        }
        
        // Step 3: Decide if a fresh AI call is needed
        const needsFreshCall = !lastResponse || (!!coords && !lastResponse.weather);

        if (needsFreshCall) {
            try {
                // Step 4a: Make the AI call with guaranteed fresh data
                const mycoMindInput: MycoMindInput = {
                    interactionType: 'INITIALIZE',
                    loteContext: {
                        productName: loteData.productos!.nombre,
                        ageInDays: getAgeInDays(loteData.created_at),
                        status: getDynamicStatus(loteData),
                        unitIndex: unitId,
                        incidents: undefined, 
                        latitude: coords?.latitude,
                        longitude: coords?.longitude,
                    }
                };
                const aiResponse = await mycoMind(mycoMindInput);
                if (!aiResponse) throw new Error("AI returned null response.");

                await updateKitSettingsAction(loteId, unitId, { last_ai_response: aiResponse });
                
                // Step 4b: Update the UI with the new AI response
                if(isMounted) {
                    const { response, mood, weather: weatherData } = aiResponse;
                    setMycoMood(mood);
                    setWeather(weatherData ?? null);
                    setDisplayedMessage({ id: Date.now(), text: response });
                }
            } catch (e) {
                console.error("Error during initial AI interaction:", e);
                if (isMounted) {
                    setDisplayedMessage({ id: Date.now(), text: "Error de conexión inicial." });
                    setMycoMood('Estrés');
                }
            }
        } else {
            // Step 4c: Restore from the valid cached response
            if (isMounted) {
                setMycoMood(lastResponse.mood);
                setWeather(lastResponse.weather ?? null);
                setDisplayedMessage({ id: Date.now(), text: lastResponse.response });
            }
        }

        // Step 5: Finalize loading state
        if (isMounted) {
            setLoading(false);
            setMycoState('idle');
        }
    }

    initializePage();

    return () => {
        isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId, unitId]);


  // Handles scheduling and firing notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !notificationSettings.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const checkAndNotify = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { watering, aeration } = notificationSettings;
      const uniqueTag = `${loteId}-${unitId}`;

      if (watering.enabled && watering.time === currentTime) {
        new Notification('💧 Recordatorio de Riego', {
          body: `¡Es hora de regar tu ${lote?.productos?.nombre || 'cultivo'}! La hidratación es clave.`,
          tag: `fungi-watering-${uniqueTag}`, 
        });
      }

      if (aeration.enabled && aeration.times.includes(currentTime)) {
         new Notification('🌬️ Recordatorio de Ventilación', {
          body: `¡Es hora de ventilar tu ${lote?.productos?.nombre || 'cultivo'}! Un poco de aire fresco le vendrá genial.`,
          tag: `fungi-aeration-${uniqueTag}-${currentTime}`,
        });
      }
    };

    const intervalId = setInterval(checkAndNotify, 60000); 

    return () => clearInterval(intervalId);

  }, [notificationSettings, lote, loteId, unitId]);

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
    <main className="relative flex flex-col h-screen w-full bg-[#201A30] text-slate-100 font-body">
      <NucleoNeural mood={mycoMood} state={mycoState} className="z-0" />
      
      <header className="flex-shrink-0 z-20 flex flex-wrap items-start justify-between gap-4 p-4">
        <Hud
          age={lote ? getAgeInDays(lote.created_at) : 0}
          mood={mycoMood}
          status={dynamicStatus}
          productName={lote ? `${lote.productos?.nombre} #${unitId}` : 'Kit de Cultivo'}
          weather={weather}
        />

        <Button variant="ghost" onClick={() => setIsCarePanelOpen(true)} className="text-[#70B0F0] hover:bg-white/10 hover:text-white shrink-0">
          <BookHeart className="mr-2" /> Cuidados y Progreso
        </Button>
      </header>

      <div className="flex-grow w-full flex flex-col justify-center z-10 px-8 py-4 overflow-y-auto min-h-0">
        {displayedMessage && (
            <div 
              key={displayedMessage.id} 
              className="text-center w-full max-w-2xl animate-float-up mx-auto"
            >
                <p className="font-headline text-3xl md:text-5xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-pre-wrap leading-tight">
                    {displayedMessage.text}
                </p>
            </div>
        )}
         {loading && !displayedMessage && (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#A080E0]/50" />
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
      
       <CareProgressPanel
            isOpen={isCarePanelOpen}
            onClose={() => setIsCarePanelOpen(false)}
            photoHistory={photoHistory}
            notificationSettings={notificationSettings}
            myKits={myKits}
            currentKitId={loteId}
            currentUnitId={unitId}
            onPhotoUpload={onPhotoUpload}
            onSettingsChange={onSettingsChange}
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
       />
    </main>
  );
}
