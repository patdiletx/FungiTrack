import type { Producto } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
    product: Producto & { stock: number };
}

export function ProductCard({ product }: ProductCardProps) {
    const imageUrl = product.image_url || `https://placehold.co/400x300.png`;
    const imageHint = product.image_url ? undefined : "mushroom kit";

    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <CardHeader className="p-0 border-b">
                <Link href={`/tienda/producto/${product.id}`} className="block">
                    <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                            src={imageUrl}
                            data-ai-hint={imageHint}
                            alt={product.nombre}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
                <Link href={`/tienda/producto/${product.id}`} className="block">
                    <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
                        {product.nombre}
                    </CardTitle>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</p>
                <div className="flex-grow"/>
                <p className="mt-4 text-2xl font-bold text-foreground">${product.precio_clp.toLocaleString('es-CL')}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <AddToCartButton product={product} />
            </CardFooter>
        </Card>
    )
}
