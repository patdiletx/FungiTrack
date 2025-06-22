'use client';

import { getLoteByIdAction } from '@/lib/actions';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, BookHeart } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Lote } from '@/lib/types';
import { mycoMind, type MycoMindOutput } from '@/ai/flows/myco-mind-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Hud } from '@/components/Simbionte/Hud';
import { NucleoNeural } from '@/components/Simbionte/NucleoNeural';
import { CareProgressPanel } from '@/components/Simbionte/CareProgressPanel';

export type PhotoEntry = {
    url: string;
    date: string;
}

export type Kit = {
    id: string;
    name: string;
}

export type NotificationSettings = {
    enabled: boolean;
    watering: {
        enabled: boolean;
        time: string; // 'HH:mm'
    };
    aeration: {
        enabled: boolean;
        times: string[]; // ['HH:mm', 'HH:mm', ...]
    };
}

export type Coordinates = {
    latitude: number;
    longitude: number;
};

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
    // Producer-set statuses that stop the automatic lifecycle
    if (['Vendido', 'Contaminado'].includes(lote.estado)) {
        return lote.estado;
    }
    
    const age = getAgeInDays(lote.created_at);

    // The user's kit status is determined purely by its age.
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
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);
  const [mycoState, setMycoState] = useState<MycoState>('idle');
  const [mycoMood, setMycoMood] = useState<MycoMindOutput['mood']>('Enfoque');
  
  const [photoHistory, setPhotoHistory] = useState<PhotoEntry[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isCarePanelOpen, setIsCarePanelOpen] = useState(false);
  const [myKits, setMyKits] = useState<Kit[]>([]);
  
  const [displayedMessage, setDisplayedMessage] = useState<DisplayMessage | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const recognitionRef = useRef<any>(null);
  const initialCallMade = useRef(false);
  
  const dynamicStatus = lote ? getDynamicStatus(lote) : 'Cargando...';


  // Load data from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const storedPhotos = localStorage.getItem(`fungi-photos-${id}`);
      if (storedPhotos) {
        setPhotoHistory(JSON.parse(storedPhotos));
      }

      const storedNotifications = localStorage.getItem(`fungi-notifications-${id}`);
      if (storedNotifications) {
        const parsedSettings = JSON.parse(storedNotifications);
        const mergedSettings: NotificationSettings = {
            ...defaultNotificationSettings,
            ...parsedSettings,
            watering: {
                ...defaultNotificationSettings.watering,
                ...(parsedSettings.watering || {}),
            },
            aeration: {
                ...defaultNotificationSettings.aeration,
                ...(parsedSettings.aeration || {}),
            },
        };
        setNotificationSettings(mergedSettings);
      } else {
        setNotificationSettings(defaultNotificationSettings);
      }

      const storedLocation = localStorage.getItem(`fungi-location-${id}`);
      if (storedLocation) {
        setCoordinates(JSON.parse(storedLocation));
      }
      
      const storedResponse = localStorage.getItem(`fungi-last-response-${id}`);
      if (storedResponse) {
          const parsed: MycoMindOutput = JSON.parse(storedResponse);
          setMycoMood(parsed.mood);
          if (parsed.weather) {
              setWeather(parsed.weather);
          }
          setDisplayedMessage({ id: Date.now(), text: parsed.response });
      }

    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    } finally {
        setLocalStorageLoaded(true);
    }
  }, [id]);

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
              latitude: coordinates?.latitude,
              longitude: coordinates?.longitude,
            }
        });

        if (!aiResponse) {
            throw new Error("Myco-Mind AI returned a null or undefined response.");
        }
        
        localStorage.setItem(`fungi-last-response-${id}`, JSON.stringify(aiResponse));

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
  }, [lote, coordinates, dynamicStatus, id]);

  const savePhotoHistory = useCallback((photos: PhotoEntry[]) => {
    if (!id) return;
    try {
      localStorage.setItem(`fungi-photos-${id}`, JSON.stringify(photos));
      setPhotoHistory(photos);
    } catch (e) {
      console.error("Failed to save photo history to localStorage", e);
      toast({ variant: 'destructive', title: 'Error al guardar foto', description: 'No se pudo guardar la foto en el almacenamiento local.'});
    }
  }, [id, toast]);

  const saveNotificationSettings = useCallback((settings: NotificationSettings) => {
      if (!id) return;
      try {
          localStorage.setItem(`fungi-notifications-${id}`, JSON.stringify(settings));
          setNotificationSettings(settings);
          if(settings.enabled) {
            toast({ title: 'Alertas actualizadas', description: 'Tus recordatorios de cuidado han sido guardados.' });
          }
      } catch (e) {
        console.error("Failed to save notification settings", e);
      }
  }, [id, toast]);
  
  const saveCoordinates = useCallback((coords: Coordinates) => {
      if (!id) return;
      try {
          localStorage.setItem(`fungi-location-${id}`, JSON.stringify(coords));
          setCoordinates(coords);
          toast({ title: 'Ubicación guardada', description: 'La IA ahora usará el clima de esta ubicación.' });
          callMycoMind({ interactionType: 'QUERY', userMessage: 'He actualizado mi ubicación. ¿Cómo afecta eso a mi cultivo?' });
      } catch (e) {
          console.error("Failed to save coordinates to localStorage", e);
          toast({ variant: 'destructive', title: 'Error al guardar ubicación'});
      }
  }, [id, toast, callMycoMind]);

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

  // Initial MycoMind call, fires after all data is ready
  useEffect(() => {
    // Make the initial call only when both API data and localStorage are loaded,
    // and only if there isn't a message already displayed from localStorage.
    if (lote && !loading && localStorageLoaded && !initialCallMade.current && !displayedMessage) {
      initialCallMade.current = true;
      callMycoMind({ 
        interactionType: 'INITIALIZE', 
      });
    }
  }, [lote, loading, localStorageLoaded, callMycoMind, displayedMessage]);

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

  if (loading || !localStorageLoaded) {
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
            onPhotoUpload={(photo) => {
                const newHistory = [...photoHistory, photo];
                savePhotoHistory(newHistory);
            }}
            onSettingsChange={saveNotificationSettings}
            coordinates={coordinates}
            onCoordinatesChange={saveCoordinates}
       />
    </main>
  );
}
