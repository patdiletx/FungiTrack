'use client';

import { useCart } from "@/context/CartProvider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface CartSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
    const { state, dispatch } = useCart();
    const subtotal = state.items.reduce((total, item) => total + item.precio_clp * item.quantity, 0);

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity }});
    };

    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id }});
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">Tu Carrito</SheetTitle>
                </SheetHeader>
                {state.items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                        <p className="text-muted-foreground">Tu carrito está vacío.</p>
                        <Button asChild onClick={() => onOpenChange(false)}>
                            <Link href="/tienda">Seguir Comprando</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-4">
                                {state.items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
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
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                                        <Minus className="h-4 w-4"/>
                                                    </Button>
                                                    <span className="w-4 text-center">{item.quantity}</span>
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                                        <Plus className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Separator className="my-4"/>
                        <SheetFooter className="space-y-4">
                             <div className="flex justify-between font-bold text-lg">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                             </div>
                            <Button asChild size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                                <Link href="/tienda/carrito">Ir al Carrito</Link>
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
