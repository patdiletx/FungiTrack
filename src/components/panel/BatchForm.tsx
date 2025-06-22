'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Lote, Producto } from '@/lib/types';
import { createLote, updateLote } from '@/lib/mock-db';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { SubstrateCalculator } from './SubstrateCalculator';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  id_producto: z.string().uuid('Por favor, selecciona un producto.'),
  unidades_producidas: z.coerce.number().int().positive('La cantidad debe ser un número positivo.'),
  notas_sustrato: z.string().optional(),
});

const updateFormSchema = z.object({
  estado: z.string().min(1, 'El estado es requerido.'),
  incidencias: z.string().optional(),
});


interface BatchFormProps {
  productos: Producto[];
  lote?: Lote | null;
}

export function BatchForm({ productos, lote }: BatchFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isUpdateMode = !!lote;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_producto: '',
      unidades_producidas: 1,
      notas_sustrato: '',
    },
  });

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      estado: lote?.estado || '',
      incidencias: lote?.incidencias || '',
    },
  });

  const watchedProductId = useWatch({
    control: form.control,
    name: 'id_producto',
  });

  const {formState: { isSubmitting }} = form;
  const {formState: { isSubmitting: isUpdating }} = updateForm;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newLote = await createLote({
        ...values,
        created_at: new Date().toISOString(),
      });
      toast({
        title: "Lote Creado Exitosamente",
        description: `El lote para ${values.unidades_producidas} unidades ha sido registrado.`,
      });
      router.push(`/panel/lote/${newLote.id}`);
      router.refresh(); // To update dashboard list
    } catch (error) {
      toast({
        title: "Error al crear lote",
        description: "Hubo un problema al guardar los datos. Inténtalo de nuevo.",
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

  const handleFormulaCalculated = (formulaString: string) => {
    form.setValue('notas_sustrato', formulaString, { shouldValidate: true });
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="id_producto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecciona un producto a fabricar" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} ({p.peso_gr}gr)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unidades_producidas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidades Producidas</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className='space-y-6'>
            <Separator />
            <SubstrateCalculator
                productos={productos}
                id_producto={watchedProductId}
                onFormulaCalculated={handleFormulaCalculated}
            />
            <Separator />
        </div>

        <FormField
          control={form.control}
          name="notas_sustrato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas sobre el Sustrato</FormLabel>
              <FormControl>
                <Textarea rows={8} placeholder="Describe la composición o cualquier detalle relevante... O usa el asistente de arriba para generar una fórmula." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Registrar Lote
        </Button>
      </form>
    </Form>
  );
}
