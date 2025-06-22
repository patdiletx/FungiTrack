'use client';
import { cn } from "@/lib/utils";
import { type MycoMindOutput } from "@/ai/flows/myco-mind-flow";
import { Thermometer, Droplets } from "lucide-react";

interface HudProps {
    age: number;
    mood: MycoMindOutput['mood'];
    status: string;
    productName: string;
    weather: { temperature: number; humidity: number } | null;
}

const moodTextColors: Record<MycoMindOutput['mood'], string> = {
    'Enfoque': 'text-primary',
    'Euforia': 'text-yellow-400',
    'Letargo': 'text-slate-400',
    'Estrés': 'text-orange-500',
};

const statusTextColors: { [key: string]: string } = {
    'En Incubación': 'text-cyan-400',
    'En Fructificación': 'text-green-400',
    'Listo para Cosecha': 'text-yellow-400',
    'Listo para Venta': 'text-lime-400',
    'Vendido': 'text-slate-400',
    'Contaminado': 'text-red-500',
}


export function Hud({ age, mood, status, productName, weather }: HudProps) {
    return (
        <div className="rounded-lg px-4 py-2 text-sm font-semibold backdrop-blur-md bg-black/30 border border-white/10 text-white shadow-lg shrink-0">
            <h2 className="font-headline text-lg text-primary">{productName}</h2>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
                <p><span className="font-bold">Edad:</span> {age} días</p>
                <p><span className="font-bold">Estado:</span> <span className={cn(statusTextColors[status] || 'text-white', 'font-bold')}>{status}</span></p>
                <p><span className="font-bold">Humor IA:</span> <span className={cn(moodTextColors[mood], 'font-bold')}>{mood}</span></p>
                {weather && (
                    <div className="flex items-center gap-4 pt-1">
                        <p className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-orange-400" /> {weather.temperature.toFixed(1)}°C</p>
                        <p className="flex items-center gap-1"><Droplets className="h-4 w-4 text-sky-400" /> {weather.humidity}%</p>
                    </div>
                )}
            </div>
        </div>
    )
}
