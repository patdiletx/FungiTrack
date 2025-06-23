import { Package, Scan, Bot, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const steps = [
    {
        icon: <Package className="h-10 w-10 text-primary"/>,
        title: "1. Elige tu Kit",
        description: "Selecciona tu variedad de hongo favorita y recibe en casa todo lo necesario para empezar."
    },
    {
        icon: <Scan className="h-10 w-10 text-primary"/>,
        title: "2. Escanea el QR",
        description: "Usa tu móvil para escanear el código único de tu kit y activar a tu asistente personal."
    },
    {
        icon: <Bot className="h-10 w-10 text-primary"/>,
        title: "3. Conecta con Myco-Mind",
        description: "Tu IA te dará consejos personalizados sobre riego, luz y temperatura según tu entorno."
    },
    {
        icon: <Sprout className="h-10 w-10 text-primary"/>,
        title: "4. ¡Cosecha!",
        description: "Sigue las indicaciones de la IA, observa la magia y disfruta de tus propios hongos frescos."
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-16 bg-muted rounded-lg">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Cultivar Nunca Fue Tan Fácil</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Nuestro proceso está diseñado para que cualquiera pueda tener éxito, sin importar su experiencia.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center flex flex-col items-center">
                            <div className="mb-4 flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold font-headline">{step.title}</h3>
                            <p className="text-muted-foreground mt-2">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
