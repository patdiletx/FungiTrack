'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const ingredienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.'),
  porcentaje: z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100'),
});

export const formulacionFormSchema = z.object({
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
  form: UseFormReturn<z.infer<typeof formulacionFormSchema>>;
}

export function FormulacionForm({ form }: FormulacionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredientes',
  });

  const { formState: { errors } } = form;

  const totalPercentage = form.watch('ingredientes').reduce((acc, ing) => acc + (Number(ing.porcentaje) || 0), 0);

  return (
    <>
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
    </>
  );
}