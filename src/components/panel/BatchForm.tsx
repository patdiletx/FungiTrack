'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Lote, Producto, LoteSustrato } from '@/lib/types';
import { createLote, updateLote } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Package } from 'lucide-react';
import Link from 'next/link';

const createFormSchema = z.object({
  id_lote_sustrato: z.string().uuid('Por favor, selecciona un lote de sustrato.'),
  id_producto: z.string().uuid('Por favor, selecciona un producto.'),
  unidades_producidas: z.coerce.number().int().positive('La cantidad debe ser un número positivo.'),
});

const updateFormSchema = z.object({
  estado: z.string().min(1, 'El estado es requerido.'),
  incidencias: z.string().optional(),
});


interface BatchFormProps {
  lotesSustrato?: LoteSustrato[];
  productos?: Producto[];
  lote?: Lote | null;
}

export function BatchForm({ lotesSustrato, productos, lote }: BatchFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isUpdateMode = !!lote;
  const isCreateMode = !lote;

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      id_lote_sustrato: '',
      id_producto: '',
      unidades_producidas: 1,
    },
  });

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      estado: lote?.estado || '',
      incidencias: lote?.incidencias || '',
    },
  });
  
  const {formState: { isSubmitting }} = createForm;
  const {formState: { isSubmitting: isUpdating }} = updateForm;
  

  async function onSubmit(values: z.infer<typeof createFormSchema>) {
    try {
      const newLote = await createLote(values);
      toast({
        title: "Lote de Producción Creado",
        description: `El lote para ${values.unidades_producidas} unidades ha sido registrado.`,
      });
      router.push(`/panel/lote/${newLote.id}`);
    } catch (error) {
      toast({
        title: "Error al crear lote",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar los datos. Inténtalo de nuevo.",
        variant: 'destructive',
      });
    }
  }

  async function onUpdate(values: z.infer<typeof updateFormSchema>) {
    if (!lote) return;
    try {
      await updateLote(lote.id, values);
       toast({
        title: "Lote Actualizado",
        description: `El estado del lote ha sido cambiado a "${values.estado}".`,
      });
      router.refresh();
    } catch (error) {
       toast({
        title: "Error al actualizar",
        description: "Hubo un problema al guardar los cambios. Inténtalo de nuevo.",
        variant: 'destructive',
      });
    }
  }

  if (isUpdateMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Actualizar Estado del Lote</CardTitle>
          <CardDescription>Modifica el estado actual o registra incidencias.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-6">
              <FormField
                control={updateForm.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Lote</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En Incubación">En Incubación</SelectItem>
                        <SelectItem value="En Fructificación">En Fructificación</SelectItem>
                        <SelectItem value="Listo para Venta">Listo para Venta</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                        <SelectItem value="Contaminado">Contaminado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="incidencias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registro de Incidencias</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Se detectó mancha verde en 2 unidades..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  // Create Mode
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Package /> Crear Lote de Producción</CardTitle>
            <CardDescription>Asigna unidades de un producto a un lote de sustrato existente.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={createForm.control}
                        name="id_lote_sustrato"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>1. Selecciona el Lote de Sustrato</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Elige el lote de sustrato a utilizar" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {lotesSustrato?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No hay lotes de sustrato. <Link href="/panel/sustratos" className="underline">Crea uno</Link>.</p>}
                                    {lotesSustrato?.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.formulaciones?.nombre} ({s.peso_total_kg} kg) - {new Date(s.created_at).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={createForm.control}
                        name="id_producto"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>2. Selecciona el Producto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona un producto a fabricar" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {productos?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nombre} ({p.peso_gr}gr)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={createForm.control}
                        name="unidades_producidas"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>3. Ingresa la Cantidad de Unidades</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ej: 50" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Registrar Lote de Producción
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
