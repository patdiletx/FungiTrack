import { Star } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";

const testimonials = [
    {
        name: "Ana García",
        location: "Santiago, Chile",
        avatar: "https://placehold.co/100x100.png",
        rating: 5,
        text: "¡Increíble! Nunca había cultivado hongos y con Myco-Mind fue súper fácil. La IA me dijo exactamente cuándo regar y ventilar. ¡Ya estoy esperando mi segunda cosecha!"
    },
    {
        name: "Carlos Vera",
        location: "Valparaíso, Chile",
        avatar: "https://placehold.co/100x100.png",
        rating: 5,
        text: "Como chef, la frescura es todo. Cultivar mis propias gírgolas con FungiGrow ha cambiado mis platos. El asistente IA es como tener un micólogo profesional en el bolsillo."
    },
    {
        name: "Sofía Rojas",
        location: "Concepción, Chile",
        avatar: "https://placehold.co/100x100.png",
        rating: 5,
        text: "Tenía dudas sobre cuándo era el momento justo para cosechar. Subí una foto a Myco-Mind y me dio la recomendación perfecta al instante. ¡Un soporte tecnológico impresionante!"
    }
]

export function Testimonials() {
    return (
        <section id="testimonials" className="py-16">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Lo que dicen nuestros cultivadores</h2>
                    <p className="text-muted-foreground mt-2">La comunidad FungiGrow está creciendo (literalmente).</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                       <Card key={index} className="p-6 flex flex-col">
                           <CardContent className="p-0 flex-grow">
                             <div className="flex items-center mb-4">
                               <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                                 <Image src={testimonial.avatar} alt={testimonial.name} fill data-ai-hint="person face" />
                               </div>
                               <div>
                                 <p className="font-bold">{testimonial.name}</p>
                                 <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                               </div>
                             </div>
                             <div className="flex mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}/>
                                ))}
                             </div>
                             <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                           </CardContent>
                       </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
