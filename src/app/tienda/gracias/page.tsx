import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GraciasPage() {
    return (
        <div className="text-center py-16 flex flex-col items-center">
            <CheckCircle2 className="h-20 w-20 text-chart-2 mb-6"/>
            <h1 className="font-headline text-5xl">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground mt-4 text-lg max-w-md">
                Tu pedido ha sido recibido. Hemos enviado un correo de confirmación con los detalles. 
                ¡Prepara tu espacio para una increíble aventura micológica!
            </p>
            <Button asChild size="lg" className="mt-8">
                <Link href="/tienda">Volver a la Tienda</Link>
            </Button>
        </div>
    )
}
