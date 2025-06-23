'use client';

import { getProductByIdAction } from "@/lib/actions";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/tienda/AddToCartButton";
import { useEffect, useState } from "react";
import type { Producto } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function ProductoDetailPage() {
    const params = useParams<{ id: string }>();
    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            setLoading(true);
            const p = await getProductByIdAction(params.id as string);
            if (!p) {
                notFound();
            }
            setProduct(p);
            setLoading(false);
        };
        fetchProduct();
    }, [params.id]);

    if (loading || !product) {
        return <ProductDetailSkeleton />;
    }

    const imageUrl = product.image_url || `https://placehold.co/600x600.png`;
    const imageHint = product.image_url ? undefined : "mushroom kit gourmet";


    return (
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="relative aspect-square bg-card rounded-lg shadow-lg overflow-hidden">
                <Image
                    src={imageUrl}
                    data-ai-hint={imageHint}
                    alt={product.nombre}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="space-y-6">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">{product.nombre}</h1>
                <p className="text-4xl font-bold text-primary">${product.precio_clp.toLocaleString('es-CL')}</p>
                
                <div className="prose prose-stone max-w-none text-muted-foreground">
                    <p>
                        Nuestro {product.nombre} es la puerta de entrada al fascinante mundo del cultivo de hongos en casa. 
                        Este kit contiene todo lo necesario para que veas crecer tus propios hongos gourmet, frescos y deliciosos.
                    </p>
                    <p>
                        Lo mejor de todo es que cada kit incluye acceso gratuito a **Myco-Mind**, tu asistente de IA personal. Simplemente escanea el QR de tu kit y obtén consejos de cuidado personalizados, diagnóstico de problemas y respuestas a todas tus preguntas.
                    </p>
                    <ul>
                        <li>Peso del sustrato: {product.peso_gr} gramos.</li>
                        <li>Fácil de usar: ideal para principiantes.</li>
                        <li>Cosecha garantizada siguiendo las instrucciones y la guía de la IA.</li>
                    </ul>
                </div>
                
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-4">
                        <label htmlFor="quantity" className="font-medium">Cantidad:</label>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                                <Minus className="h-4 w-4"/>
                             </Button>
                             <Input 
                                id="quantity"
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 h-10 text-center font-bold"
                                min="1"
                             />
                             <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q+1)}>
                                <Plus className="h-4 w-4"/>
                             </Button>
                        </div>
                    </div>
                     <AddToCartButton product={product} quantity={quantity} />
                </div>
            </div>
        </div>
    );
}

const ProductDetailSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
             <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="pt-4">
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    </div>
);
