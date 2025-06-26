import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pedido Iniciado - FungiGrow',
  description: 'Tu pedido en FungiGrow ha sido iniciado exitosamente y estás siendo redirigido al pago.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4 container mx-auto">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl bg-card border rounded-xl">
        <CardHeader className="items-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">¡Pedido Iniciado!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg text-card-foreground/80 mb-6">
            Tu pedido ha sido creado exitosamente. Estás siendo redirigido a la pasarela de pago para completar tu compra.
          </CardDescription>
          <p className="text-sm text-muted-foreground mb-6">
            Si no eres redirigido automáticamente, por favor revisa tu conexión o contacta a nuestro equipo de soporte.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Volver al Inicio
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/tienda">
                <ShoppingBag className="mr-2 h-5 w-5" /> Seguir Comprando
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    