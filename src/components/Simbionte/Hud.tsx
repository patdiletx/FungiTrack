'use client';
import { cn } from "@/lib/utils";
import { MycoMindOutput } from "@/ai/flows/myco-mind-flow";
import { Zap } from "lucide-react";

interface HudProps {
    age: number;
    mood: MycoMindOutput['mood'];
    neuronalEnergy: number;
}

const moodColors: Record<MycoMindOutput['mood'], string> = {
    'Enfoque': 'bg-[#A080E0]/80 text-white',
    'Euforia': 'bg-yellow-400/80 text-yellow-900',
    'Letargo': 'bg-slate-500/80 text-slate-100',
    'Estrés': 'bg-orange-600/80 text-white',
};


export function Hud({ age, mood, neuronalEnergy }: HudProps) {
    return (
        <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
            <div className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-md transition-colors duration-500",
                moodColors[mood]
            )}>
                <span>Estado: {mood}</span>
            </div>
             <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-md bg-[#70B0F0]/80 text-white">
                <Zap className="h-4 w-4"/>
                <span>{neuronalEnergy} EN</span>
            </div>
        </div>
    )
}
