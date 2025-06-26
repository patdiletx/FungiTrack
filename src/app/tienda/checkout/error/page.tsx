import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ShoppingCart, Home } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error en el Pedido - FungiGrow',
  description: 'Hubo un problema al iniciar tu pedido en FungiGrow.',
};

export default function CheckoutErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4 container mx-auto">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl bg-card border rounded-xl">
        <CardHeader className="items-center">
           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">Falló la Iniciación del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg text-card-foreground/80 mb-6">
            Encontramos un error al intentar crear tu pedido para el pago. Por favor, inténtalo de nuevo.
          </CardDescription>
          <p className="text-sm text-muted-foreground mb-6">
            Si el problema persiste, por favor contacta a nuestro equipo de soporte para asistencia.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full" variant="default" size="lg">
              <Link href="/tienda/carrito">
                <ShoppingCart className="mr-2 h-5 w-5" /> Intentar de Nuevo Desde el Carrito
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    