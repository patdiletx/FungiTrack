'use client';

import { useEffect, useState } from 'react';
import { getLoteById } from '@/lib/mock-db';
import { Lote } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode } from '@/components/QrCode';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';

export default function PrintPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getLoteById(id)
        .then(data => {
          if (data) {
            setLote(data);
          } else {
            notFound();
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Generando etiquetas...</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!lote) {
    return notFound();
  }

  const publicUrl = `${window.location.origin}/lote/${lote.id}`;

  return (
    <>
      <div className="p-4 bg-background-muted no-print sticky top-0 z-10 border-b bg-background">
          <div className='container mx-auto flex justify-between items-center'>
            <div>
              <h1 className="text-xl font-headline">Vista de Impresión</h1>
              <p className='text-muted-foreground text-sm'>Lote: {lote.id}</p>
            </div>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
      </div>
      <div id="print-area" className="p-0 grid grid-cols-2 sm:grid-cols-3 gap-0 break-after-page">
        {Array.from({ length: lote.unidades_producidas }).map((_, i) => (
          <div key={i} className="border border-dashed border-gray-400 flex flex-col items-center justify-center text-center text-black p-2 w-min justify-self-center" style={{backgroundColor: '#F5F5DC'}}>
            <QrCode value={publicUrl} size={200} />
            <div className='mt-2 space-y-1'>
                <p className="text-base font-bold leading-tight">{lote.productos?.nombre}</p>
                <p className="text-sm leading-tight">Lote: {lote.id.substring(0, 8)}</p>
                <p className="text-sm leading-tight">Fecha: {format(new Date(lote.created_at), 'dd/MM/yy', { locale: es })}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
