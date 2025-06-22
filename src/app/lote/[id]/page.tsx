'use client';

import { getLoteByIdAction, updateKitSettingsAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, BookHeart } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote, PhotoEntry, Kit, NotificationSettings, Coordinates, KitSettings } from '@/lib/types';
import { mycoMind, type MycoMindOutput } from '@/ai/flows/myco-mind-flow';
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
  const initialCallMade = useRef(false);
  const isInitialMount = useRef(true);
  
  const dynamicStatus = lote ? getDynamicStatus(lote) : 'Cargando...';

  const updateSettings = useCallback(async (newSettings: Partial<Omit<KitSettings, 'id'|'created_at'|'lote_id'>>) => {
      if (!id) return;
      try {
          await updateKitSettingsAction(id, newSettings);
      } catch (e) {
          console.error("Failed to save settings to DB", e);
          toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'No se pudieron guardar los cambios en el servidor.'});
      }
  }, [id, toast]);

  const callMycoMind = useCallback(async (input: any) => {
      if (!lote) return;
      setMycoState('thinking');
      try {
        const aiResponse = await mycoMind({
            ...input,
            loteContext: {
              productName: lote.productos!.nombre,
              ageInDays: getAgeInDays(lote.created_at),
              status: dynamicStatus,
              incidents: undefined, 
              latitude: coordinates?.latitude,
              longitude: coordinates?.longitude,
            }
        });

        if (!aiResponse) {
            throw new Error("Myco-Mind AI returned a null or undefined response.");
        }
        
        updateSettings({ last_ai_response: aiResponse });

        const { response, mood, weather: weatherData } = aiResponse;
        
        setMycoMood(mood);
        if (weatherData) {
            setWeather(weatherData);
        } else {
            setWeather(null);
        }
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
  }, [lote, coordinates, dynamicStatus, updateSettings]);

  // Handle side-effects of coordinates changing (save to DB, call AI)
  useEffect(() => {
    // We don't want this effect to run on the initial render.
    // The initial data load and AI call are handled by other useEffects.
    // This effect is specifically for when the user *changes* the coordinates.
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    if (coordinates) {
        updateSettings({ coordinates: coordinates });
        toast({ title: 'Ubicación guardada', description: 'La IA ahora usará el clima local.' });
        callMycoMind({ 
            interactionType: 'QUERY', 
            userMessage: 'He actualizado mi ubicación. ¿Cómo afecta eso a mi cultivo?' 
        });
    }
  }, [coordinates]); // This dependency is key.

  const onPhotoUpload = (photo: PhotoEntry) => {
    const newHistory = [...photoHistory, photo];
    setPhotoHistory(newHistory);
    updateSettings({ photo_history: newHistory });
  };
  
  const onSettingsChange = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    updateSettings({ notification_settings: settings });
     if(settings.enabled) {
        toast({ title: 'Alertas actualizadas', description: 'Tus recordatorios de cuidado han sido guardados.' });
     }
  };
  
  // This function now ONLY updates the state. The useEffect handles the rest.
  const onCoordinatesChange = (coords: Coordinates) => {
    setCoordinates(coords);
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

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim()) return;
      
      await callMycoMind({
          interactionType: 'QUERY',
          userMessage: transcript,
      });
    };
    recognition.onerror = (event: any) => {
        setMycoState('idle');
        toast({ variant: "destructive", title: "Error de voz", description: event.error });
    }
    recognitionRef.current = recognition;
  }, [callMycoMind, toast]);

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
      
      // Initialize state from DB or defaults
      const settings = loteData.kit_settings?.[0];
      setPhotoHistory(settings?.photo_history || []);
      setNotificationSettings(settings?.notification_settings || defaultNotificationSettings);
      
      // Important: Set initial coordinates BEFORE other effects run
      if (settings?.coordinates) {
        setCoordinates(settings.coordinates);
      } else {
        isInitialMount.current = false; // No initial coords, so we can allow the effect to run on first change
      }

      if (settings?.last_ai_response) {
          const { response, mood, weather: weatherData } = settings.last_ai_response;
          setMycoMood(mood);
          if (weatherData) setWeather(weatherData);
          setDisplayedMessage({ id: Date.now(), text: response });
      }

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

      setLoading(false);
    }
    fetchData();
  }, [id]);

  // Initial MycoMind call
  useEffect(() => {
    if (loading || initialCallMade.current || !lote) {
        return;
    }
    
    const settingsLoaded = lote.kit_settings?.length > 0;
    const lastResponse = settingsLoaded ? lote.kit_settings![0].last_ai_response : null;

    const needsCallForInit = !lastResponse;
    const needsCallForStaleWeather = coordinates && !lastResponse?.weather;

    if (needsCallForInit || needsCallForStaleWeather) {
      initialCallMade.current = true;
      callMycoMind({ 
        interactionType: 'INITIALIZE', 
      });
    }
  }, [lote, loading, callMycoMind, coordinates]);

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

  if (loading) {
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
