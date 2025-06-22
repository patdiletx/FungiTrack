import { getLoteById } from '@/lib/mock-db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';
import { Separator } from '@/components/ui/separator';
import { Calendar, Droplets, Package, Sun, Thermometer, Wind } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { UpsellSection } from '@/components/UpsellSection';

type Props = {
  params: { id: string };
};

const isKitDeInicio = (productName: string | undefined) => {
    return productName === 'Kit de Inicio';
}

export default async function PublicLotePage({ params }: Props) {
  const lote = await getLoteById(params.id);

  if (!lote || !lote.productos) {
    notFound();
  }

  const { productos } = lote;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-background font-body">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <header className="text-center">
            <FungiTrackLogo className="justify-center mb-4" />
            <h1 className="font-headline text-4xl md:text-5xl text-foreground">
                ¡Gracias por elegirnos!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Aquí está la información de tu producto.
            </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Image 
                    src={`https://placehold.co/400x400.png`}
                    data-ai-hint="oyster mushrooms"
                    alt={productos.nombre}
                    width={120} 
                    height={120}
                    className="rounded-lg object-cover shadow-md"
                />
                <div className="text-center md:text-left">
                    <CardTitle className="font-headline text-3xl">{productos.nombre}</CardTitle>
                    <CardDescription className="font-body">
                        Lote de producción: {lote.id.substring(0,8)}...
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Fecha de Elaboración</span>
                </div>
                <span className="font-mono text-sm">{format(new Date(lote.created_at), "dd 'de' MMMM, yyyy", { locale: es })}</span>
            </div>
            <Separator />
            <div>
                <h3 className="font-headline text-xl mb-3">Instrucciones de Cuidado</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50"><Droplets className="h-5 w-5 text-primary"/><span>Rociar 2-3 veces al día.</span></div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50"><Sun className="h-5 w-5 text-primary"/><span>Luz solar indirecta.</span></div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50"><Thermometer className="h-5 w-5 text-primary"/><span>Temp. ideal: 18-24°C.</span></div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50"><Wind className="h-5 w-5 text-primary"/><span>Evitar corrientes de aire.</span></div>
                </div>
            </div>
          </CardContent>
        </Card>

        {isKitDeInicio(productos.nombre) && (
            <UpsellSection productId={productos.id} />
        )}

        <footer className="text-center text-muted-foreground text-xs">
            <p>FungiTrack &copy; {new Date().getFullYear()}</p>
            <p>Un producto de FungiGrow Advisor.</p>
        </footer>
      </div>
    </main>
  );
}
