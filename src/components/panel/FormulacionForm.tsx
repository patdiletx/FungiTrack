'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Formulacion } from '@/lib/types';
import { createFormulacion, updateFormulacion } from '@/lib/mock-db';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const ingredienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.'),
  porcentaje: z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100'),
});

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  descripcion: z.string().optional(),
  puntuacion: z.coerce.number().int().min(0, 'Mínimo 0').max(10, 'Máximo 10'),
  ingredientes: z.array(ingredienteSchema).min(1, 'Debe haber al menos un ingrediente.'),
  humedad_objetivo_porcentaje: z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100').default(65),
  notas: z.string().optional(),
}).refine(data => {
    const total = data.ingredientes.reduce((acc, ing) => acc + ing.porcentaje, 0);
    // Allow for small floating point inaccuracies
    return Math.abs(total - 100) < 0.001;
}, {
    message: 'La suma de los porcentajes de los ingredientes debe ser exactamente 100.',
    path: ['ingredientes'],
});

interface FormulacionFormProps {
  formulacion?: Formulacion | null;
  onFinished: () => void;
}

export function FormulacionForm({ formulacion, onFinished }: FormulacionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isUpdateMode = !!formulacion;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: formulacion?.nombre || '',
      descripcion: formulacion?.descripcion || '',
      puntuacion: formulacion?.puntuacion || 5,
      ingredientes: formulacion?.ingredientes || [{ nombre: 'Viruta de madera', porcentaje: 80 }, { nombre: 'Salvado de trigo', porcentaje: 20 }],
      humedad_objetivo_porcentaje: formulacion?.humedad_objetivo_porcentaje ?? 65,
      notas: formulacion?.notas || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredientes',
  });

  const { formState: { isSubmitting, errors } } = form;

  const totalPercentage = form.watch('ingredientes').reduce((acc, ing) => acc + (Number(ing.porcentaje) || 0), 0);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isUpdateMode && formulacion) {
        await updateFormulacion(formulacion.id, values);
        toast({
          title: 'Formulación Actualizada',
          description: `La formulación "${values.nombre}" ha sido actualizada.`,
        });
      } else {
        await createFormulacion(values);
        toast({
          title: 'Formulación Creada',
          description: `La formulación "${values.nombre}" ha sido creada exitosamente.`,
        });
      }
      router.refresh();
      onFinished();
    } catch (error) {
      toast({
        title: 'Error al guardar la formulación',
        description: 'Hubo un problema al guardar los datos. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre de la Formulación</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Fórmula Estándar Ostras" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descripción (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Ideal para Gírgolas y Melena de león" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="puntuacion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Puntuación (0-10)</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" max="10" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="humedad_objetivo_porcentaje"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Humedad Objetivo (%)</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" max="100" placeholder="65" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <FormLabel>Ingredientes del Sustrato Base</FormLabel>
            <div className={`text-sm font-medium ${Math.abs(totalPercentage - 100) > 0.001 ? 'text-destructive' : 'text-primary'}`}>
              Total: {totalPercentage.toFixed(2)}%
            </div>
          </div>
          
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 rounded-lg border bg-background p-2">
                <FormField
                  control={form.control}
                  name={`ingredientes.${index}.nombre`}
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                      <FormLabel className="sr-only">Nombre del Ingrediente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del ingrediente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`ingredientes.${index}.porcentaje`}
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-32">
                      <FormLabel className="sr-only">Porcentaje</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Eliminar</span>
                 </Button>
              </div>
            ))}
          </div>
          
          <Button type="button" variant="outline" size="sm" onClick={() => append({ nombre: '', porcentaje: 0 })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Ingrediente
          </Button>

          {errors.ingredientes && !errors.ingredientes.root && (
                 <p className="text-sm font-medium text-destructive">{errors.ingredientes.message}</p>
            )}
          {errors.ingredientes?.root && (
                 <p className="text-sm font-medium text-destructive">{errors.ingredientes.root.message}</p>
            )}
        </div>
        
        <Separator />

        <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                <FormControl>
                    <Textarea rows={3} placeholder="Instrucciones especiales, tiempos de pasteurización, etc." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isUpdateMode ? "Guardar Cambios" : "Crear Formulación"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
