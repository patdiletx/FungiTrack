import type { Metadata } from 'next';
import { ShieldCheck, LockKeyhole, UserCircle, FileText, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Política de Privacidad - FungiGrow Chile',
  description: 'Conoce cómo FungiGrow Chile recolecta, usa y protege tu información personal. Estamos comprometidos con tu privacidad.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-6 lg:px-8 py-12 mb-12">
      <header className="text-center pt-8 pb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 shadow">
          <ShieldCheck className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Política de Privacidad</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          En FungiGrow Chile, tu privacidad es de suma importancia para nosotros. Esta política detalla cómo manejamos tu información personal.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: 27 de Mayo, 2025</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8 text-foreground/80">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <FileText className="h-7 w-7 mr-3 text-primary" />
            Introducción
          </h2>
          <p className="mb-3">
            Bienvenido a la Política de Privacidad de FungiGrow Chile ("FungiGrow", "nosotros", "nuestro"). Estamos comprometidos a proteger la privacidad de nuestros clientes y visitantes del sitio web. Esta política establece cómo recopilamos, usamos, divulgamos y protegemos su información personal cuando visita nuestro sitio web fungigrow.cl (el "Sitio") o utiliza nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <UserCircle className="h-7 w-7 mr-3 text-primary" />
            Información que Recopilamos
          </h2>
          <p className="mb-2">Podemos recopilar y procesar los siguientes datos sobre usted:</p>
          <ul className="list-disc list-inside space-y-1 pl-4 mb-3">
            <li>
              <strong>Información que nos proporciona directamente:</strong> Esto incluye información que proporciona al registrarse en nuestro sitio, realizar un pedido, suscribirse a nuestro boletín informativo, responder a una encuesta o completar un formulario. Por ejemplo, su nombre, dirección de correo electrónico, dirección de envío, número de teléfono e información de pago.
            </li>
            <li>
              <strong>Información que recopilamos automáticamente:</strong> Cuando visita nuestro Sitio, podemos recopilar automáticamente cierta información sobre su dispositivo y su actividad de navegación, como su dirección IP, tipo de navegador, páginas visitadas, tiempo de visita y otra información de diagnóstico.
            </li>
            <li>
              <strong>Cookies y Tecnologías Similares:</strong> Usamos cookies para mejorar su experiencia en nuestro sitio. Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <LockKeyhole className="h-7 w-7 mr-3 text-primary" />
            Cómo Usamos su Información
          </h2>
          <p className="mb-2">Usamos la información que recopilamos para diversos fines, incluyendo:</p>
          <ul className="list-disc list-inside space-y-1 pl-4 mb-3">
            <li>Procesar y completar sus pedidos.</li>
            <li>Proporcionarle información, productos o servicios que nos solicite.</li>
            <li>Mejorar nuestro Sitio y servicios.</li>
            <li>Comunicarnos con usted, incluyendo responder a sus consultas y enviarle información de marketing (si ha optado por recibirla).</li>
            <li>Cumplir con nuestras obligaciones legales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Seguridad de sus Datos</h2>
          <p className="mb-3">
            Hemos implementado medidas de seguridad apropiadas para evitar que su información personal se pierda accidentalmente, se use o se acceda de forma no autorizada, se altere o se divulgue. Sin embargo, ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Sus Derechos</h2>
          <p className="mb-3">
            Dependiendo de su jurisdicción, puede tener ciertos derechos con respecto a su información personal, como el derecho de acceso, corrección, eliminación o restricción del procesamiento.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Cambios a esta Política de Privacidad</h2>
          <p className="mb-3">
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Le recomendamos que revise esta Política de Privacidad periódicamente para cualquier cambio.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-lg my-16">
          <h2 className="text-3xl font-bold text-primary mb-4">¿Preguntas sobre nuestra Política?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Si tiene alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de privacidad, por favor contáctenos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              <Link href="mailto:hola@fungigrow.cl">
                <Mail className="mr-2 h-5 w-5" /> Enviar Email
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full">
              <Link href="/tienda/faq">
                <Phone className="mr-2 h-5 w-5" /> Contactar Soporte
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
