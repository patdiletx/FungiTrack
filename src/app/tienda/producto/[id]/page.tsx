import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/tienda/AddToCartButton";

type Props = {
    params: { id: string };
};

export default async function ProductoDetailPage({ params }: Props) {
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="relative aspect-square">
                <Image
                    src={`https://placehold.co/600x600.png`}
                    data-ai-hint="mushroom kit gourmet"
                    alt={product.nombre}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                />
            </div>
            <div className="space-y-6">
                <h1 className="font-headline text-4xl md:text-5xl">{product.nombre}</h1>
                <p className="text-3xl font-bold text-primary">${product.precio_clp.toLocaleString('es-CL')}</p>
                
                <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p>
                        Nuestro {product.nombre} es la puerta de entrada al fascinante mundo del cultivo de hongos en casa. 
                        Este kit contiene todo lo necesario para que veas crecer tus propios hongos gourmet, frescos y deliciosos.
                    </p>
                    <ul>
                        <li>Peso del sustrato: {product.peso_gr} gramos.</li>
                        <li>Fácil de usar: ideal para principiantes.</li>
                        <li>Cosecha garantizada siguiendo las instrucciones.</li>
                    </ul>
                </div>

                <div className="pt-4">
                     <AddToCartButton product={product} />
                </div>
            </div>
        </div>
    );
}
