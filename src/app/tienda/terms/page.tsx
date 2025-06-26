import type { Metadata } from 'next';
import { FileText, ShieldCheck, AlertTriangle, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - FungiGrow Chile',
  description: 'Lee nuestros términos y condiciones de uso para los servicios y productos de FungiGrow Chile.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-6 lg:px-8 py-12 mb-12">
      <header className="text-center pt-8 pb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 shadow">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Términos y Condiciones</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Por favor, lee atentamente nuestros términos y condiciones antes de utilizar nuestros servicios o adquirir nuestros productos.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: 28 de Mayo, 2025</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8 text-foreground/80">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <ShieldCheck className="h-7 w-7 mr-3 text-primary" />
            1. Aceptación de los Términos
          </h2>
          <p className="mb-3">
            Al acceder y utilizar el sitio web de FungiGrow Chile (en adelante, "el Sitio") y adquirir nuestros productos o servicios, usted acepta estar sujeto a estos Términos y Condiciones (en adelante, "Términos"), todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable. Si no está de acuerdo con alguno de estos términos, se le prohíbe usar o acceder a este sitio.
          </p>
       
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Uso del Sitio y Productos</h2>
          <p className="mb-3">
            Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el Sitio para visualización transitoria personal y no comercial únicamente. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4 mb-3">
            <li>Modificar o copiar los materiales.</li>
            <li>Usar los materiales para cualquier propósito comercial, o para cualquier exhibición pública (comercial o no comercial).</li>
            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el Sitio.</li>
            <li>Eliminar cualquier derecho de autor u otras anotaciones de propiedad de los materiales.</li>
          </ul>
          <p className="mb-3">
            Esta licencia terminará automáticamente si usted viola alguna de estas restricciones y puede ser terminada por FungiGrow Chile en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Productos y Servicios</h2>
          <p className="mb-3">
            Nos esforzamos por describir y mostrar nuestros productos y servicios con la mayor precisión posible. Sin embargo, no garantizamos que las descripciones de productos, precios, disponibilidad u otro contenido del sitio sea exacto, completo, confiable, actual o libre de errores. Nos reservamos el derecho de corregir cualquier error, inexactitud u omisión y de cambiar o actualizar información o cancelar pedidos si alguna información en el Servicio o en cualquier sitio web relacionado es inexacta en cualquier momento sin previo aviso (incluso después de que haya enviado su pedido).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitación de Responsabilidad</h2>
          <p className="mb-3">
            En ningún caso FungiGrow Chile o sus proveedores serán responsables por cualquier daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surjan del uso o la incapacidad de usar los materiales en el Sitio o relacionados con nuestros productos, incluso si FungiGrow Chile o un representante autorizado de FungiGrow Chile ha sido notificado oralmente o por escrito de la posibilidad de tal daño.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Modificaciones a los Términos</h2>
          <p className="mb-3">
            FungiGrow Chile puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Ley Aplicable</h2>
          <p className="mb-3">
            Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes de Chile y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales en esa Estado o ubicación.
          </p>
        </section>

        <section className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-lg my-16">
          <h2 className="text-3xl font-bold text-primary mb-4">¿Preguntas sobre nuestros Términos?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos.
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
