import type { Producto } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
    product: Producto & { stock: number };
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0">
                <Link href={`/tienda/producto/${product.id}`} className="block">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={`https://placehold.co/400x400.png`}
                            data-ai-hint="mushroom kit"
                            alt={product.nombre}
                            fill
                            className="object-cover"
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
                <p className="mt-2 text-lg font-bold text-primary">${product.precio_clp.toLocaleString('es-CL')}</p>
                <p className="text-sm text-muted-foreground">{product.stock} disponibles</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <AddToCartButton product={product} />
            </CardFooter>
        </Card>
    )
}
