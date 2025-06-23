'use client';

import { useCart } from "@/context/CartProvider";
import { Button } from "@/components/ui/button";
import type { Producto } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
    product: Producto;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { dispatch } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        dispatch({ type: 'ADD_ITEM', payload: product });
        toast({
            title: "¡Añadido al carrito!",
            description: `${product.nombre} está ahora en tu carrito.`,
        });
    }

    return (
        <Button onClick={handleAddToCart} className="w-full">
            <ShoppingCart className="mr-2" />
            Añadir al carrito
        </Button>
    );
}
