'use client';

import { useCart } from "@/context/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
    const { state, dispatch } = useCart();
    const router = useRouter();
    const subtotal = state.items.reduce((total, item) => total + item.precio_clp * item.quantity, 0);

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity }});
    };

    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id }});
    };
    
    if (state.items.length === 0) {
        return (
             <div className="text-center py-16">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground mt-2 mb-6">Parece que aún no has añadido nada. ¡Explora nuestros kits!</p>
                <Button asChild size="lg">
                    <Link href="/tienda">Ir a la Tienda</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold">Tu Carrito de Compras</h1>
            </header>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    {state.items.map(item => (
                        <Card key={item.id}>
                            <CardContent className="p-4 flex gap-4 items-center">
                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                                    <Image 
                                        src={`https://placehold.co/100x100.png`} 
                                        data-ai-hint="mushroom kit"
                                        alt={item.nombre}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.nombre}</h3>
                                    <p className="text-sm text-muted-foreground">${item.precio_clp.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4"/>
                                    </Button>
                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <p className="font-bold w-24 text-right">${(item.precio_clp * item.quantity).toLocaleString('es-CL')}</p>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                    <Trash2 className="h-5 w-5 text-destructive"/>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                     <Button asChild variant="link" className="text-muted-foreground pl-0">
                        <Link href="/tienda"><ArrowLeft className="mr-2"/> Seguir comprando</Link>
                    </Button>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 shadow-md">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Envío</span>
                                <span>Por calcular</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" onClick={() => router.push('/tienda/checkout')}>
                                Proceder al Pago
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
