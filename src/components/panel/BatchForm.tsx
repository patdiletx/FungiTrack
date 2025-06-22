'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Lote, Producto, Formulacion } from '@/lib/types';
import { createLote, updateLote } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, FlaskConical } from 'lucide-react';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  id_producto: z.string().uuid('Por favor, selecciona un producto.'),
  id_formulacion: z.string().uuid('Por favor, selecciona una formulación.'),
  unidades_producidas: z.coerce.number().int().positive('La cantidad debe ser un número positivo.'),
  notas_sustrato: z.string().optional(),
});

const updateFormSchema = z.object({
  estado: z.string().min(1, 'El estado es requerido.'),
  incidencias: z.string().optional(),
});


interface BatchFormProps {
  productos: Producto[];
  formulaciones?: Formulacion[];
  lote?: Lote | null;
}

export function BatchForm({ productos, formulaciones, lote }: BatchFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isUpdateMode = !!lote;
  const isCreateMode = !lote;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_producto: '',
      id_formulacion: '',
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
  
  const {formState: { isSubmitting }} = form;
  const {formState: { isSubmitting: isUpdating }} = updateForm;
  
  const watchedProductId = useWatch({ control: form.control, name: 'id_producto' });
  const watchedFormulationId = useWatch({ control: form.control, name: 'id_formulacion' });
  const watchedUnidades = useWatch({ control: form.control, name: 'unidades_producidas' });

  useEffect(() => {
    if (!isCreateMode || !formulaciones || !productos) return;

    const producto = productos.find(p => p.id === watchedProductId);
    const formulacion = formulaciones.find(f => f.id === watchedFormulationId);

    if (producto && formulacion && watchedUnidades > 0) {
      const totalFinalWeightGr = producto.peso_gr * watchedUnidades;
      const spawnRate = (producto.spawn_rate_porcentaje ?? 0) / 100;
      
      const totalBaseSubstrateWeightGr = spawnRate > 0 ? totalFinalWeightGr / (1 + spawnRate) : totalFinalWeightGr;
      const spawnWeightGr = totalFinalWeightGr - totalBaseSubstrateWeightGr;
      const humedadObjetivo = (formulacion.humedad_objetivo_porcentaje ?? 0) / 100;

      let formulaString = `Fórmula: ${formulacion.nombre} (Puntuación: ${formulacion.puntuacion}/10)\n`;
      formulaString += `Basado en ${watchedUnidades} unidades de ${producto.nombre} (${producto.peso_gr}gr c/u).\n\n`;
      
      formulaString += `--- Resumen de Pesos (Seco) ---\n`;
      formulaString += `- Sustrato Base: ${(totalBaseSubstrateWeightGr / 1000).toFixed(2)} kg\n`;
      if (spawnWeightGr > 0) {
        formulaString += `- Inóculo (Spawn): ${(spawnWeightGr / 1000).toFixed(2)} kg (Tasa del ${producto.spawn_rate_porcentaje}%)\n`;
      }
      formulaString += `- Peso Total Seco: ${(totalFinalWeightGr / 1000).toFixed(2)} kg\n\n`;

      if (humedadObjetivo > 0) {
          const aguaNecesariaGr = (totalFinalWeightGr / (1 - humedadObjetivo)) - totalFinalWeightGr;
          const pesoTotalHumedoGr = totalFinalWeightGr + aguaNecesariaGr;
          formulaString += `--- Hidratación (Humedad Objetivo: ${formulacion.humedad_objetivo_porcentaje}%) ---\n`;
          formulaString += `- Agua a Añadir: ${(aguaNecesariaGr / 1000).toFixed(2)} litros\n`;
          formulaString += `- Peso Total Húmedo Estimado: ${(pesoTotalHumedoGr / 1000).toFixed(2)} kg\n\n`;
      }
      
      formulaString += '--- Composición Sustrato Base (Seco) ---\n';

      formulacion.ingredientes.forEach(ing => {
        const ingredientWeightKg = (totalBaseSubstrateWeightGr * (ing.porcentaje / 100)) / 1000;
        formulaString += `- ${ing.nombre} (${ing.porcentaje}%): ${ingredientWeightKg.toFixed(2)} kg\n`;
      });


      if (formulacion.notas) {
        formulaString += `\n--- Notas Adicionales ---\n${formulacion.notas}`;
      }

      form.setValue('notas_sustrato', formulaString);
    }

  }, [watchedProductId, watchedFormulationId, watchedUnidades, productos, formulaciones, form, isCreateMode]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newLote = await createLote(values);
      toast({
        title: "Lote Creado Exitosamente",
        description: `El lote para ${values.unidades_producidas} unidades ha sido registrado.`,
      });
      router.push(`/panel/lote/${newLote.id}`);
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
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="id_producto"
            render={({ field }) => (
                <FormItem>
                <FormLabel>1. Selecciona el Producto</FormLabel>
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
                <FormLabel>2. Ingresa la Cantidad de Unidades</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="Ej: 50" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Separator />

        <div className='space-y-4'>
            <div className='flex items-center gap-2'>
                <FlaskConical className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-semibold'>Formulación del Sustrato</h3>
            </div>
            <FormField
                control={form.control}
                name="id_formulacion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>3. Selecciona una Formulación Base</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Elige la receta para el sustrato" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {formulaciones?.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.nombre} (P: {f.puntuacion}/10)</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
            control={form.control}
            name="notas_sustrato"
            render={({ field }) => (
                <FormItem>
                <FormLabel>4. Revisa las Notas (autogeneradas)</FormLabel>
                <FormControl>
                    <Textarea rows={15} placeholder="Los cálculos de la receta aparecerán aquí automáticamente después de seleccionar producto, unidades y formulación..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Registrar Lote
        </Button>
      </form>
    </Form>
  );
}
