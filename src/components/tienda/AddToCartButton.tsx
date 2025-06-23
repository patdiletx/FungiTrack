'use client';

import { useCart } from "@/context/CartProvider";
import { Button } from "@/components/ui/button";
import type { Producto } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
    product: Producto;
    quantity?: number;
}

export function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
    const { dispatch } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
        toast({
            title: "¡Añadido al carrito!",
            description: `${quantity} x ${product.nombre} está(n) ahora en tu carrito.`,
        });
    }

    return (
        <Button onClick={handleAddToCart} size="lg" className="w-full">
            <ShoppingCart className="mr-2" />
            Añadir al carrito
        </Button>
    );
}
