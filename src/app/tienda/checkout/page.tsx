'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const checkoutSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto."),
    email: z.string().email("Email inválido."),
    address: z.string().min(5, "La dirección es muy corta."),
    city: z.string().min(2, "La ciudad es muy corta."),
    country: z.string().min(2, "El país es muy corto."),
});

export default function CheckoutPage() {
    const { state, dispatch } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    const subtotal = state.items.reduce((total, item) => total + item.precio_clp * item.quantity, 0);

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { name: "", email: "", address: "", city: "", country: "Chile" },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
        console.log("Mock purchase:", { values, items: state.items });
        toast({
            title: "¡Pedido realizado!",
            description: "Gracias por tu compra. Te hemos enviado un email de confirmación.",
        });
        dispatch({ type: 'CLEAR_CART' });
        router.push("/tienda/gracias");
    };
    
    if (state.items.length === 0 && !isSubmitting) {
        router.replace('/');
        return null;
    }

    return (
        <div className="space-y-8">
             <header>
                <h1 className="font-headline text-4xl font-bold">Finalizar Compra</h1>
            </header>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Información de Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form" className="space-y-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="country" render={({ field }) => (
                                            <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </form>
                             </Form>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                    <Card className="sticky top-20 shadow-md">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Tu Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {state.items.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{item.nombre} x{item.quantity}</span>
                                    <span className="font-medium">${(item.precio_clp * item.quantity).toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : null}
                                {isSubmitting ? "Procesando..." : "Realizar Pedido"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
