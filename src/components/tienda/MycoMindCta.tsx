'use client';

import Image from "next/image"

export function MycoMindCta() {
    return (
        <section id="myco-mind" className="overflow-hidden">
             <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="relative aspect-square max-w-md mx-auto md:max-w-none">
                       <Image 
                         src="https://placehold.co/600x600.png" 
                         alt="Myco-Mind AI Interface" 
                         fill
                         className="object-contain"
                         data-ai-hint="neural network"
                       />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold">Conoce a Myco-Mind</h2>
                        <p className="text-primary font-semibold mt-1">Tu Asistente de Cultivo Inteligente</p>
                        <p className="mt-4 text-muted-foreground text-lg">
                            Myco-Mind no es solo una app, es la conciencia de tu cultivo. Esta IA avanzada te proporciona consejos hiper-personalizados basados en la edad de tu kit, la fase de crecimiento e incluso el clima de tu localidad para garantizar las condiciones perfectas.
                        </p>
                        <ul className="mt-4 space-y-2 text-left inline-block">
                            <li className="flex items-center gap-3"><Checkmark/> Diagnóstico de problemas en tiempo real.</li>
                            <li className="flex items-center gap-3"><Checkmark/> Consejos de riego y ventilación.</li>
                            <li className="flex items-center gap-3"><Checkmark/> Respuestas a todas tus preguntas de cultivo.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Checkmark() {
    return (
        <svg className="h-6 w-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}
