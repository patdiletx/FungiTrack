'use client';

import { useCart } from "@/context/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Loader2, Truck, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder } from "@/lib/actions";

// --- Shipping Logic ---

type ShippingZone = "Centro" | "Santiago" | "Extremo";
type ShippingSize = 'XS' | 'S' | 'M' | 'L';
type RegionDetail = { nombre: string, zona: ShippingZone };

const ORIGIN_REGION_NAME = "La Araucanía";
const ORIGIN_ZONE: ShippingZone = "Centro";

const REGIONES_CHILE_ZONAS: RegionDetail[] = [
  { nombre: "Arica y Parinacota", zona: "Extremo" },
  { nombre: "Tarapacá", zona: "Extremo" },
  { nombre: "Antofagasta", zona: "Extremo" },
  { nombre: "Atacama", zona: "Centro" },
  { nombre: "Coquimbo", zona: "Centro" },
  { nombre: "Valparaíso", zona: "Centro" },
  { nombre: "Metropolitana de Santiago", zona: "Santiago" },
  { nombre: "Libertador General Bernardo O'Higgins", zona: "Centro" },
  { nombre: "Maule", zona: "Centro" },
  { nombre: "Ñuble", zona: "Centro" },
  { nombre: "Biobío", zona: "Centro" },
  { nombre: ORIGIN_REGION_NAME, zona: ORIGIN_ZONE },
  { nombre: "Los Ríos", zona: "Centro" },
  { nombre: "Los Lagos", zona: "Centro" },
  { nombre: "Aysén del General Carlos Ibáñez del Campo", zona: "Extremo" },
  { nombre: "Magallanes y de la Antártica Chilena", zona: "Extremo" },
];

const SHIPPING_COSTS_TABLE = {
  Centro: {
    Santiago: { XS: 4300, S: 5600, M: 7300, L: 9200 },
    Centro: {
      sameRegion: { XS: 3100, S: 4200, M: 4800, L: 5400 },
      differentRegion: { XS: 4300, S: 5600, M: 7300, L: 9200 },
    },
    Extremo: { XS: 5200, S: 9500, M: 14500, L: 17000 },
  },
};

const getShippingSize = (totalWeightGr: number): ShippingSize => {
  if (totalWeightGr <= 1000) return 'XS';
  if (totalWeightGr <= 3000) return 'S';
  if (totalWeightGr <= 5000) return 'M';
  return 'L';
};

const checkoutSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre completo es requerido."),
  email: z.string().email("Debe ser un email válido."),
  rut: z.string().min(8, "El RUT es requerido."),
  telefono: z.string().min(8, "El teléfono es requerido."),
  direccion: z.string().min(5, "La dirección es requerida."),
  comuna: z.string().min(3, "La comuna es requerida."),
  region: z.string().min(1, "La región es requerida para calcular el envío."),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;


export default function CarritoPage() {
    const { state, dispatch } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [shippingCost, setShippingCost] = useState(0);

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        mode: 'onChange',
        defaultValues: {
            nombreCompleto: "",
            email: "",
            rut: "",
            telefono: "",
            direccion: "",
            comuna: "",
            region: "",
        },
    });
    
    const { watch, control } = form;
    const watchedRegion = watch("region");

    const totalShippableWeight = useCallback(() => {
        return state.items.reduce((total, item) => total + (item.peso_gr * item.quantity), 0);
    }, [state.items])();
    
    useEffect(() => {
        if (!watchedRegion) {
            setShippingCost(0);
            return;
        }

        const destinationRegionDetail = REGIONES_CHILE_ZONAS.find(r => r.nombre === watchedRegion);
        if (!destinationRegionDetail) {
            setShippingCost(0);
            return;
        }
        
        const destinationZone = destinationRegionDetail.zona;
        const shippingSize = getShippingSize(totalShippableWeight);
        let calculatedCost = 0;

        if (ORIGIN_ZONE === 'Centro') {
            if (destinationZone === 'Santiago') {
                calculatedCost = SHIPPING_COSTS_TABLE.Centro.Santiago[shippingSize];
            } else if (destinationZone === 'Centro') {
                calculatedCost = watchedRegion === ORIGIN_REGION_NAME
                    ? SHIPPING_COSTS_TABLE.Centro.Centro.sameRegion[shippingSize]
                    : SHIPPING_COSTS_TABLE.Centro.Centro.differentRegion[shippingSize];
            } else if (destinationZone === 'Extremo') {
                calculatedCost = SHIPPING_COSTS_TABLE.Centro.Extremo[shippingSize];
            }
        }
        setShippingCost(calculatedCost || 0);

    }, [watchedRegion, totalShippableWeight]);
    

    const subtotal = state.items.reduce((total, item) => total + item.precio_clp * item.quantity, 0);
    const total = subtotal + shippingCost;

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity }});
    };

    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id }});
    };

    const onSubmit = (values: CheckoutFormData) => {
        startTransition(async () => {
            try {
                await createOrder(values, state.items, subtotal, shippingCost, total);
                toast({
                    title: "¡Pedido realizado!",
                    description: "Gracias por tu compra. Te hemos enviado un email de confirmación.",
                });
                dispatch({ type: 'CLEAR_CART' });
                router.push("/tienda/gracias");
            } catch (error) {
                toast({
                    title: "Error al crear el pedido",
                    description: error instanceof Error ? error.message : "No se pudo completar el pedido. Inténtalo de nuevo.",
                    variant: "destructive"
                });
            }
        });
    }
    
    if (state.items.length === 0) {
        return (
             <div className="text-center py-16">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground mt-2 mb-6">Parece que aún no has añadido nada. ¡Explora nuestros kits!</p>
                <Button asChild size="lg">
                    <Link href="/">Ir a la Tienda</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold">Tu Carrito de Compras</h1>
            </header>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Truck /> Información de Envío y Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={control} name="nombreCompleto" render={({ field }) => (
                                    <FormItem><FormLabel>Nombre Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="tu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={control} name="rut" render={({ field }) => (
                                        <FormItem><FormLabel>RUT *</FormLabel><FormControl><Input placeholder="Ej: 12345678-9" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={control} name="telefono" render={({ field }) => (
                                        <FormItem><FormLabel>Teléfono *</FormLabel><FormControl><Input placeholder="Ej: +56912345678" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={control} name="direccion" render={({ field }) => (
                                    <FormItem><FormLabel>Dirección *</FormLabel><FormControl><Input placeholder="Ej: Calle Falsa 123, Depto 4B" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={control} name="comuna" render={({ field }) => (
                                        <FormItem><FormLabel>Comuna *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={control} name="region" render={({ field }) => (
                                        <FormItem><FormLabel>Región *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona una región" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {REGIONES_CHILE_ZONAS.map((region) => (
                                                        <SelectItem key={region.nombre} value={region.nombre}>{region.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage /></FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cart Items */}
                        <div className="space-y-4">
                            <h2 className="font-headline text-2xl font-bold">Tus Productos</h2>
                            {state.items.map(item => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 flex gap-4 items-center">
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                                            <Image 
                                                src={item.image_url || `https://placehold.co/100x100.png`} 
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
                                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                                <Minus className="h-4 w-4"/>
                                            </Button>
                                            <span className="w-6 text-center font-bold">{item.quantity}</span>
                                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <p className="font-bold w-24 text-right">${(item.precio_clp * item.quantity).toLocaleString('es-CL')}</p>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-5 w-5 text-destructive"/>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                         <Button asChild variant="link" className="text-muted-foreground pl-0">
                            <Link href="/"><ArrowLeft className="mr-2"/> Seguir comprando</Link>
                        </Button>
                    </div>
                    
                    {/* Order Summary */}
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
                                    <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-CL')}` : (watchedRegion ? 'Gratis' : 'Por calcular')}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 animate-spin"/> : <CreditCard />}
                                    {isPending ? "Procesando..." : "Realizar Pedido"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </Form>
        </div>
    );
}
