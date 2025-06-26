import type { Metadata } from 'next';
import { Truck, Package, RefreshCw, MapPin, Clock, ShieldCheck } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Envíos y Devoluciones - FungiGrow Chile',
  description: 'Información sobre nuestras políticas de envío para kits de cultivo de hongos FungiGrow, costos, tiempos de entrega y proceso de devoluciones. Ubicados en Villarrica, Chile.',
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-6 lg:px-8 py-12 mb-12">
      <header className="text-center pt-8 pb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 shadow">
          <Truck className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Envíos y Devoluciones</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Todo lo que necesitas saber sobre cómo recibir tus kits FungiGrow y nuestra política de devoluciones.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-foreground mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start">
          <Package className="h-8 w-8 mr-3 text-primary" />
          Política de Envíos
        </h2>
        <div className="space-y-8">
          <div className="p-6 bg-card rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary/80" />
              Cobertura y Costos
            </h3>
            <p className="text-muted-foreground mb-2">
              Realizamos envíos de nuestros kits de cultivo FungiGrow a gran parte de Chile desde nuestra base en Villarrica, Región de la Araucanía. Utilizamos <strong className="text-foreground">Blue Express</strong> como nuestra principal plataforma de envíos para garantizar una entrega eficiente y confiable.
            </p>
            <p className="text-muted-foreground mb-2">
              Los costos de envío se calculan dinámicamente en tu <Link href="/tienda/carrito" className="text-primary hover:underline font-medium">carrito de compras</Link> al ingresar tu región de destino. Estos costos se basan en el peso total de los kits en tu pedido y la zona de destino, tal como se detalla en nuestra guía de tarifas de envío (visible en la página del carrito).
            </p>
             <p className="text-muted-foreground">
              Actualmente, los talleres no incurren en costos de envío. Si tu pedido incluye un taller y un kit de cultivo, el costo de envío se calculará únicamente en base al peso del kit.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary/80" />
              Tiempos de Entrega
            </h3>
            <p className="text-muted-foreground mb-2">
              Una vez confirmado tu pago, preparamos tu pedido con el mayor cuidado. El tiempo de preparación suele ser de 1 a 2 días hábiles.
            </p>
            <p className="text-muted-foreground mb-2">
              Los tiempos de entrega estimados por <strong className="text-foreground">Blue Express</strong> son:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
              <li><strong>Región Metropolitana y Zona Centro:</strong> 2-5 días hábiles.</li>
              <li><strong>Zonas Extremas (Norte y Sur):</strong> 5-10 días hábiles.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Recibirás un número de seguimiento por correo electrónico una vez que tu pedido sea despachado para que puedas rastrearlo directamente en el sitio de Blue Express.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              <em>Nota: Estos son tiempos estimados y pueden variar debido a factores externos o alta demanda.</em>
            </p>
          </div>
           <div className="p-6 bg-card rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center">
              <ShieldCheck className="h-6 w-6 mr-2 text-primary/80" />
              Empaque y Cuidado
            </h3>
            <p className="text-muted-foreground">
              Nuestros kits de cultivo se empacan cuidadosamente para asegurar que lleguen en perfectas condiciones, listos para que inicies tu aventura micológica. Utilizamos materiales que protegen el micelio y el sustrato durante el transporte.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-foreground mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start">
          <RefreshCw className="h-8 w-8 mr-3 text-primary" />
          Política de Devoluciones
        </h2>
        <Accordion type="single" collapsible className="w-full bg-card p-4 md:p-6 rounded-lg shadow-md border">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium hover:text-primary">¿Qué hago si mi kit llega dañado?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              Si tu kit de cultivo FungiGrow llega dañado debido al transporte, por favor contáctanos dentro de las primeras 48 horas posteriores a la recepción. Envíanos un correo a <a href="mailto:hola@fungigrow.cl" className="text-primary hover:underline">hola@fungigrow.cl</a> con fotos del daño y tu número de pedido. Evaluaremos tu caso para ofrecerte una solución, que podría ser un reemplazo del kit.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium hover:text-primary">Mi kit no produce hongos, ¿puedo devolverlo?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              El éxito del cultivo de hongos depende de seguir las instrucciones y mantener las condiciones ambientales adecuadas (humedad, temperatura, luz indirecta). Nuestros kits están diseñados para ser de alto rendimiento. Si sigues todas las instrucciones y tu kit no muestra signos de crecimiento después de un tiempo prudente (generalmente 15-20 días para la primera fructificación de Ostras), contáctanos.
              <br/><br/>
              No aceptamos devoluciones de kits que ya han sido abiertos y activados, a menos que se pueda demostrar un defecto de fábrica en el micelio o sustrato. Te pediremos fotos y detalles de tu proceso de cultivo para ayudarte a solucionar problemas. En casos justificados de defecto, podemos ofrecer un reemplazo.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium hover:text-primary">¿Cómo es el proceso de devolución o reemplazo?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              1. Contáctanos a <a href="mailto:hola@fungigrow.cl" className="text-primary hover:underline">hola@fungigrow.cl</a> con tu número de pedido y el motivo de tu solicitud.
              <br/>
              2. Te responderemos en un plazo de 1-2 días hábiles con los pasos a seguir.
              <br/>
              3. Si se aprueba una devolución o reemplazo, te indicaremos cómo proceder con el envío del producto (si aplica).
              <br/>
              4. Los reembolsos (si aplican) se procesarán al mismo método de pago original una vez recibido y verificado el producto devuelto. Los reemplazos se enviarán lo antes posible.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium hover:text-primary">¿Los talleres tienen devolución?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
             Las inscripciones a talleres pueden cancelarse con derecho a reembolso completo hasta 7 días antes de la fecha del taller. Cancelaciones entre 7 días y 48 horas antes del taller tendrán un reembolso del 50%. No se realizarán reembolsos por cancelaciones con menos de 48 horas de anticipación o por no asistencia. Si FungiGrow cancela un taller, se ofrecerá un reembolso completo o la opción de reprogramar.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      
      <section className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-xl my-16">
        <h2 className="text-3xl font-bold text-primary mb-4">¿Preguntas sobre Envíos o Devoluciones?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Si tienes alguna duda específica sobre tu envío, el estado de tu pedido o necesitas iniciar un proceso de devolución, nuestro equipo de soporte está aquí para ayudarte.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/tienda/faq">Contactar a Soporte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
