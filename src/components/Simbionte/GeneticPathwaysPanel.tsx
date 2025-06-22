'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sprout, HeartPulse } from "lucide-react";
import type { SimbionteData } from "@/app/lote/[id]/page";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

const GENETIC_PATHWAYS = [
    {
        id: 'resistencia-base',
        name: 'Resistencia Base',
        description: 'Refuerza la red micelial contra estresores ambientales menores.',
        cost: 50,
        icon: <Shield className="h-8 w-8 text-green-400" />
    },
    {
        id: 'absorcion-mejorada',
        name: 'Absorción Mejorada',
        description: 'Optimiza la asimilación de nutrientes, acelerando la colonización.',
        cost: 100,
        icon: <Sprout className="h-8 w-8 text-yellow-400" />
    },
    {
        id: 'protocolo-vitalidad',
        name: 'Protocolo de Vitalidad',
        description: 'Mejora la salud general, aumentando las posibilidades de una segunda fructificación.',
        cost: 250,
        icon: <HeartPulse className="h-8 w-8 text-rose-400" />
    }
];

interface GeneticPathwaysPanelProps {
    isOpen: boolean;
    onClose: () => void;
    simbionteData: SimbionteData;
    onUnlock: (pathId: string, cost: number) => void;
}

export function GeneticPathwaysPanel({ isOpen, onClose, simbionteData, onUnlock }: GeneticPathwaysPanelProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="bg-[#201A30]/80 text-white border-[#A080E0]/30 backdrop-blur-lg w-[350px] sm:w-[540px] flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle className="font-headline text-3xl text-white">Vías Genéticas</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Invierte Energía Neuronal (EN) para evolucionar las capacidades de Myco.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex items-center gap-2 my-4 p-3 rounded-lg bg-black/20 border border-white/10">
                    <Zap className="h-6 w-6 text-[#70B0F0]" />
                    <span className="text-xl font-bold">{simbionteData.energy}</span>
                    <span className="text-slate-300">Energía Neuronal disponible</span>
                </div>
                <ScrollArea className="flex-grow pr-4 -mr-6">
                    <div className="space-y-4">
                        {GENETIC_PATHWAYS.map((path) => {
                            const isUnlocked = simbionteData.unlockedPaths.includes(path.id);
                            const canAfford = simbionteData.energy >= path.cost;
                            return (
                                <div key={path.id} className={cn(
                                    "p-4 rounded-lg border flex items-center gap-4 transition-all",
                                    isUnlocked ? "bg-green-500/20 border-green-500/40" : "bg-black/20 border-white/10"
                                )}>
                                    <div className={cn("flex-shrink-0 p-2 rounded-full", isUnlocked ? "bg-green-500/20" : "bg-black/30")}>
                                        {path.icon}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{path.name}</h3>
                                        <p className="text-sm text-slate-400">{path.description}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isUnlocked ? (
                                            <Button variant="outline" disabled className="bg-transparent border-green-400 text-green-400">Desbloqueado</Button>
                                        ) : (
                                            <Button 
                                                onClick={() => onUnlock(path.id, path.cost)} 
                                                disabled={!canAfford}
                                                className="bg-[#A080E0] hover:bg-[#A080E0]/90 text-white disabled:bg-slate-600"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                {path.cost} EN
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
