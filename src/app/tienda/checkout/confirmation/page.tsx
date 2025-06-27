"use client";

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShoppingBag, Home } from 'lucide-react';
import { useCart } from '@/context/CartProvider';

interface ConfirmationStatusDetails {
  status: 'success' | 'failure' | 'pending' | 'loading' | 'error' | 'unknown';
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
    const flowStatus = searchParams.get('status');
    const flowMessage = searchParams.get('message') || '';
    const flowOrderId = searchParams.get('orderId');

    let newDetails: ConfirmationStatusDetails;
    let pageTitle = "Estado del Pedido - FungiGrow";
    
    const updatePageDetails = (details: ConfirmationStatusDetails, title: string) => {
        setDetails(details);
        if (typeof document !== 'undefined') {
            document.title = title;
        }
    };

    if (!flowOrderId) {
        newDetails = {
            status: 'error',
            title: 'Error de Confirmación',
            message: 'No se encontró un identificador de orden en la URL. Por favor, contacta a soporte si el problema persiste.',
        };
        pageTitle = "Error de Confirmación - FungiGrow";
    } else if (flowStatus === 'success' || flowStatus === 'paid' || flowStatus === 'PAID') {
        dispatch({ type: 'CLEAR_CART' });
        newDetails = {
            status: 'success',
            title: '¡Pago Exitoso!',
            message: flowMessage || '¡Gracias por tu pedido! Tu pago ha sido confirmado. Recibirás un correo con los detalles.',
        };
        pageTitle = "Pago Exitoso - FungiGrow";
    } else if (flowStatus === 'failure' || flowStatus === 'rejected' || flowStatus === 'cancelled' || flowStatus === 'REJECTED' || flowStatus === 'CANCELLED') {
        newDetails = {
            status: 'failure',
            title: 'Pago Fallido o Cancelado',
            message: flowMessage || 'El pago no pudo ser procesado o fue cancelado. Puedes intentar nuevamente.',
        };
        pageTitle = "Pago Fallido - FungiGrow";
    } else if (flowStatus === 'pending' || flowStatus === 'PENDING_PAYMENT' || flowStatus === 'pending_payment') {
        newDetails = {
            status: 'pending',
            title: 'Pago Pendiente',
            message: flowMessage || 'Tu pago está pendiente. Te notificaremos cuando se complete.',
        };
        pageTitle = "Pago Pendiente - FungiGrow";
    } else {
        newDetails = {
            status: 'error',
            title: 'Estado Desconocido',
            message: flowMessage || `El estado de tu pedido es desconocido. Por favor, contacta a soporte con tu número de orden: ${flowOrderId}`,
        };
        pageTitle = "Estado Desconocido - FungiGrow";
    }

    updatePageDetails(newDetails, pageTitle);

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
