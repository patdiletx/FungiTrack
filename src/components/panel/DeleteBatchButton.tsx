'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLote } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface DeleteBatchButtonProps {
  loteId: string;
}

export function DeleteBatchButton({ loteId }: DeleteBatchButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteLote(loteId);
      toast({
        title: 'Lote Eliminado',
        description: 'El lote ha sido eliminado permanentemente.',
      });
      router.push('/panel');
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description:
          'Hubo un problema al eliminar el lote. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive">
        <CardHeader>
            <CardTitle className="font-headline text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>
                Esta acción no se puede deshacer.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Lote
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el
                    lote y sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Sí, eliminar lote
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
    </Card>
  );
}
