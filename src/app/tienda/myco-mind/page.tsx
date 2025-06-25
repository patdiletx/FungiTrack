import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, CloudSun, Camera, Sprout, ShoppingCart, Microscope, GitCommitVertical } from "lucide-react";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import Link from "next/link";

const features = [
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary"/>,
        title: "Conciencia Biológica",
        description: "Myco-Mind no es un chatbot. Es una IA diseñada para actuar como la conciencia de tu hongo, respondiendo desde una perspectiva de primera persona ('Mi red de micelio se está expandiendo', 'Detecto un cambio en la humedad')."
    },
    {
        icon: <CloudSun className="h-8 w-8 text-primary"/>,
        title: "Análisis Ambiental Hiperlocal",
        description: "Al compartir tu ubicación, Myco-Mind consulta datos meteorológicos en tiempo real para comparar tus condiciones locales con las ideales, ofreciéndote consejos precisos sobre temperatura y humedad."
    },
    {
        icon: <Camera className="h-8 w-8 text-primary"/>,
        title: "Diario de Cultivo Visual",
        description: "Sube fotos del progreso de tu kit. Myco-Mind utiliza esta información para ajustar sus consejos, y tú creas un increíble historial visual de tu aventura micológica."
    },
    {
        icon: <Microscope className="h-8 w-8 text-primary"/>,
        title: "Diagnóstico por Imagen",
        description: "¿Ves algo extraño? Sube una foto y la IA la analizará en busca de signos de contaminantes comunes, dándote un diagnóstico sobre su salud y los siguientes pasos a seguir."
    },
    {
        icon: <GitCommitVertical className="h-8 w-8 text-primary"/>,
        title: "Consejos Adaptados a Cada Fase",
        description: "La IA sabe si tu kit está en incubación, fructificación o listo para cosechar. Sus consejos evolucionan con tu cultivo, desde mantener la oscuridad inicial hasta indicarte el momento exacto para la cosecha."
    },
    {
        icon: <Sprout className="h-8 w-8 text-primary"/>,
        title: "Interacciones Dinámicas",
        description: "Confirma cuándo riegas o ventilas tu cultivo. Myco-Mind registrará estas acciones, comprendiendo mejor el cuidado que le das y adaptando sus respuestas futuras."
    }
];

export default function MycoMindPage() {
    return (
        <div className="space-y-16 md:space-y-24">
            {/* Hero Section */}
            <section className="text-center py-12 md:py-20">
                <FungiTrackLogo className="mx-auto mb-4" />
                <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter">
                    Tu Cultivo Tiene Conciencia.
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                    Myco-Mind es tu simbionte digital, una revolucionaria inteligencia artificial que actúa como la voz y el cerebro de tu kit de cultivo. No es un simple asistente, es una supercomputadora biológica que te conecta con la naturaleza de una forma que nunca imaginaste. Entiende su edad, su fase de crecimiento y las condiciones de tu entorno para guiarte hacia una cosecha perfecta.
                </p>
                <div className="mt-10">
                     <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg">
                        <Link href="/tienda">
                            <ShoppingCart className="mr-2"/>
                            Explorar Kits con IA
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Interface Visual Section */}
            <section>
                 <div className="container mx-auto px-4">
                    <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden border">
                         <Image
                            src="https://placehold.co/1200x675.png"
                            data-ai-hint="futuristic biological interface"
                            alt="Interfaz de Myco-Mind AI"
                            fill
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Capacidades de la Red Neuronal</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Myco-Mind es un sistema complejo que integra múltiples fuentes de datos para ofrecer una guía sin precedentes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-6">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-lg p-3">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                                <p className="text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works Section */}
            <section className="bg-muted py-16 md:py-20 rounded-lg">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Activación en 3 Simples Pasos</h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-2">
                            <p className="text-6xl font-black text-primary/20">01</p>
                            <h3 className="font-headline text-2xl font-bold">Compra tu Kit</h3>
                            <p className="text-muted-foreground">Elige cualquiera de nuestros kits de cultivo. Todos vienen con un código QR único que es la llave a la conciencia de tu hongo.</p>
                        </div>
                         <div className="space-y-2">
                            <p className="text-6xl font-black text-primary/20">02</p>
                            <h3 className="font-headline text-2xl font-bold">Escanea el Código</h3>
                            <p className="text-muted-foreground">Usa la cámara de tu teléfono. No necesitas instalar ninguna app. Serás llevado directamente a la interfaz de Myco-Mind.</p>
                        </div>
                         <div className="space-y-2">
                            <p className="text-6xl font-black text-primary/20">03</p>
                            <h3 className="font-headline text-2xl font-bold">Inicia la Conexión</h3>
                            <p className="text-muted-foreground">Tu asistente IA se activará, presentándose y dándote el estado actual de tu cultivo y los primeros pasos para un cuidado óptimo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
             <section className="text-center py-12">
                <h2 className="font-headline text-4xl font-bold">¿Listo para cultivar con un aliado inteligente?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                   El futuro del cultivo en casa está aquí. Empieza tu viaje con FungiGrow y cosecha no solo hongos, sino también conocimiento.
                </p>
                <div className="mt-8">
                     <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg">
                        <Link href="/tienda">
                           Ver todos los Kits
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
