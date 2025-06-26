'use client';

import { ArrowRight, Bot } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

export function MycoMindCta() {
    return (
        <section id="myco-mind" className="py-16">
             <div className="container mx-auto px-4">
                <div className="relative rounded-xl bg-muted/50 p-8 md:p-12 text-center border overflow-hidden">
                    
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent -z-10 opacity-50" />
                    
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Conoce a Myco-Mind</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Tu cultivo tiene conciencia. Nuestra IA actúa como la voz de tu hongo, guiándote en cada paso para asegurar una cosecha perfecta.
                    </p>

                    <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-lg shadow-lg overflow-hidden border my-8">
                         <Image
                            src="https://placehold.co/1200x675.png"
                            data-ai-hint="futuristic biological interface"
                            alt="Interfaz de Myco-Mind AI"
                            fill
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg">
                            <Link href="/kit/demo-lote/1">
                                <Bot className="mr-2"/>
                                Probar la Demo Interactiva
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/tienda/myco-mind">
                                Descubrir sus Capacidades
                                <ArrowRight className="ml-2"/>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
