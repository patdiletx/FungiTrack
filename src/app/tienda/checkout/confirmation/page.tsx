"use client";

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShoppingBag, Home } from 'lucide-react';
import { useCart } from '@/context/CartProvider';

interface ConfirmationStatusDetails {
  status: 'success' | 'failure' | 'pending' | 'loading' | 'unknown' | 'error';
  message: string;
  title: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { dispatch } = useCart();
  const [details, setDetails] = useState<ConfirmationStatusDetails>({ 
    status: 'loading', 
    message: 'Procesando el estado de tu pedido...',
    title: 'Procesando...'
  });

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const messageParam = searchParams.get('message') || searchParams.get('reason'); // Combine message and reason

    let pageTitle = "Estado del Pedido - FungiGrow";
    let newDetails: ConfirmationStatusDetails;

    if (paymentStatus === 'success') {
      dispatch({ type: 'CLEAR_CART' });
      newDetails = {
        status: 'success',
        title: '¡Pago Exitoso!',
        message: messageParam || '¡Gracias por tu pedido! Tu pago ha sido confirmado.',
      };
      pageTitle = "Pago Exitoso - FungiGrow";
    } else if (paymentStatus === 'failure') {
      newDetails = {
        status: 'failure',
        title: 'Pago Fallido',
        message: messageParam || 'Hubo un problema con tu pago. Por favor, inténtalo de nuevo o contacta a soporte.',
      };
      pageTitle = "Pago Fallido - FungiGrow";
    } else if (paymentStatus === 'error') { 
      let errorMessage = "Hubo un error procesando tu pago.";
      if (messageParam) { 
        errorMessage += ` Detalles: ${messageParam}.`;
      }
      errorMessage += " Por favor, inténtalo de nuevo o contacta a soporte.";
      newDetails = {
        status: 'error',
        title: 'Error Procesando el Pago',
        message: errorMessage,
      };
      pageTitle = "Error de Pago - FungiGrow";
    }
     else if (paymentStatus === 'pending') {
      newDetails = {
        status: 'pending',
        title: 'Pago Pendiente',
        message: messageParam || 'Tu pago está actualmente pendiente. Te notificaremos una vez que el estado se actualice.',
      };
       pageTitle = "Pago Pendiente - FungiGrow";
    } else { 
      newDetails = {
        status: 'unknown',
        title: 'Estado del Pedido Desconocido',
        message: messageParam || 'No se pudo determinar el estado del pedido. Por favor, revisa tus pedidos o contacta a soporte.',
      };
       pageTitle = "Estado del Pedido - FungiGrow";
    }
    setDetails(newDetails);

    if (typeof document !== 'undefined') {
        document.title = pageTitle;
    }

  }, [searchParams, dispatch]);

  if (details.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <h1 className="text-2xl font-semibold text-foreground">{details.title}</h1>
        <p className="text-muted-foreground">{details.message}</p>
      </div>
    );
  }

  const IconComponent = 
    details.status === 'success' ? CheckCircle :
    details.status === 'failure' || details.status === 'error' ? XCircle :
    details.status === 'pending' ? AlertTriangle :
    AlertTriangle; 

  const iconColorClass = 
    details.status === 'success' ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' :
    details.status === 'failure' || details.status === 'error' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' :
    details.status === 'pending' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' :
    'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'; 
  
  const titleColorClass =
    details.status === 'success' ? 'text-primary' :
    details.status === 'failure' || details.status === 'error' ? 'text-destructive' :
    details.status === 'pending' ? 'text-yellow-700 dark:text-yellow-400' : 
    'text-yellow-700 dark:text-yellow-400'; 


  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 shadow-xl text-center bg-card border rounded-xl">
      <CardHeader className="items-center">
        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${iconColorClass}`}>
          <IconComponent className="h-12 w-12" />
        </div>
        <CardTitle className={`text-3xl font-bold ${titleColorClass}`}>
          {details.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-lg text-card-foreground/80">
          {details.message}
        </CardDescription>
         <p className="text-sm text-muted-foreground pt-2">
          {(details.status === 'failure' || details.status === 'error') && "Puedes intentar realizar tu pedido nuevamente desde el carrito."}
          {details.status === 'pending' && "Si tienes alguna pregunta, por favor contacta a nuestro soporte."}
          {details.status === 'success' && "Deberías recibir una confirmación por correo electrónico en breve."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-8">
        {details.status === 'success' || details.status === 'pending' ? (
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
            <Link href="/tienda">
              <ShoppingBag className="mr-2 h-5 w-5" /> Seguir Comprando
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link href="/tienda/carrito">
              Volver al Carrito
            </Link>
          </Button>
        )}
        <Button asChild variant={details.status === 'success' || details.status === 'pending' ? 'outline' : 'default'} className="w-full" size="lg">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" /> Volver al Inicio
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 container mx-auto px-6 lg:px-8 min-h-[calc(100vh-10rem)]">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <h1 className="text-2xl font-semibold text-foreground">Cargando Confirmación...</h1>
        </div>
      }>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}

    