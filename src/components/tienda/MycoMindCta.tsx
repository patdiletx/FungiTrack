'use client';

import Image from "next/image";
import { BrainCircuit, CloudSun, BarChart, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function MycoMindCta() {
    return (
        <section id="myco-mind" className="overflow-hidden py-16 bg-muted/50 rounded-lg">
             <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className="relative aspect-square w-full max-w-md mx-auto md:max-w-none">
                       <Image 
                         src="https://placehold.co/600x600.png" 
                         alt="Myco-Mind AI Interface" 
                         fill
                         className="object-contain"
                         data-ai-hint="neural network"
                       />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-primary font-semibold">Tu Asistente de Cultivo Inteligente</p>
                        <h2 className="font-headline text-3xl md:text-4xl font-bold mt-1">Conoce a Myco-Mind</h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            Myco-Mind no es solo una app, es la conciencia de tu cultivo. Esta IA avanzada te proporciona consejos hiper-personalizados para garantizar las condiciones perfectas y una cosecha exitosa.
                        </p>
                        <ul className="mt-6 space-y-4 text-left">
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2">
                                    <BrainCircuit className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h3 className="font-bold">IA Conversacional</h3>
                                    <p className="text-muted-foreground text-sm">Responde tus preguntas, diagnostica problemas y te guía en cada paso del proceso.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                               <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2">
                                    <CloudSun className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h3 className="font-bold">Análisis Ambiental</h3>
                                    <p className="text-muted-foreground text-sm">Adapta los consejos de cuidado a la temperatura y humedad de tu entorno local.</p>
                                </div>
                            </li>
                        </ul>
                        <div className="mt-8">
                            <Button asChild>
                                <Link href="/tienda/myco-mind">
                                    Descubre todo sobre Myco-Mind
                                    <ArrowRight className="ml-2"/>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
