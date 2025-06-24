import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, CloudSun, BarChart, Camera } from "lucide-react";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import Link from "next/link";

const features = [
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary"/>,
        title: "IA Conversacional",
        description: "Hazle preguntas directamente a tu cultivo. Myco-Mind responde en tiempo real, actuando como la conciencia de la red de micelio, dándote consejos precisos y científicos."
    },
    {
        icon: <CloudSun className="h-8 w-8 text-primary"/>,
        title: "Análisis Ambiental",
        description: "Con tu permiso, la IA utiliza datos de tu clima local para adaptar las recomendaciones de cuidado a la temperatura y humedad de tu entorno, optimizando el crecimiento."
    },
    {
        icon: <Camera className="h-8 w-8 text-primary"/>,
        title: "Diario de Cultivo Visual",
        description: "Sube fotos del progreso de tu kit. Myco-Mind las analiza para darte feedback, y tú creas un increíble historial visual de tu aventura micológica."
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary"/>,
        title: "Diagnóstico Avanzado",
        description: "¿Ves algo extraño? La IA puede analizar una imagen para detectar posibles contaminaciones, ayudándote a actuar rápido y salvar tu cosecha."
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
                    Myco-Mind es más que una aplicación; es una revolucionaria inteligencia artificial que actúa como la voz y el cerebro de tu kit de cultivo. Conecta con la naturaleza de una forma que nunca imaginaste.
                </p>
                <div className="mt-10">
                     <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg">
                        <Link href="/tienda">
                            Explorar Kits con IA
                            <ArrowRight className="ml-2" />
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
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Myco-Mind no es solo un chatbot, es un sistema biológico-digital con funciones específicas para tu éxito.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
