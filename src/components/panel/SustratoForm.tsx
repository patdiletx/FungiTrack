'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Formulacion } from '@/lib/types';
import { createLoteSustrato } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

const formSchema = z.object({
  id_formulacion: z.string().uuid('Por favor, selecciona una formulación.'),
  peso_total_kg: z.coerce.number().positive('El peso debe ser un número positivo.'),
  notas_sustrato: z.string().optional(),
});


interface SustratoFormProps {
  formulaciones: Formulacion[];
}

export function SustratoForm({ formulaciones }: SustratoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_formulacion: '',
      peso_total_kg: 10,
      notas_sustrato: '',
    },
  });

  const {formState: { isSubmitting }} = form;
  
  const watchedFormulationId = useWatch({ control: form.control, name: 'id_formulacion' });
  const watchedTotalWeight = useWatch({ control: form.control, name: 'peso_total_kg' });

  useEffect(() => {
    if (!formulaciones) return;

    const formulacion = formulaciones.find(f => f.id === watchedFormulationId);

    if (formulacion && watchedTotalWeight > 0) {
      const totalBaseSubstrateWeightGr = watchedTotalWeight * 1000;
      const humedadObjetivo = (formulacion.humedad_objetivo_porcentaje ?? 0) / 100;

      let formulaString = `Fórmula: ${formulacion.nombre} (Puntuación: ${formulacion.puntuacion}/10)\n`;
      formulaString += `Basado en un peso total de sustrato seco de ${watchedTotalWeight} kg.\n\n`;
      
      if (humedadObjetivo > 0) {
          const aguaNecesariaGr = (totalBaseSubstrateWeightGr / (1 - humedadObjetivo)) - totalBaseSubstrateWeightGr;
          const pesoTotalHumedoGr = totalBaseSubstrateWeightGr + aguaNecesariaGr;
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
        formulaString += `\n--- Notas Adicionales de la Formulación ---\n${formulacion.notas}`;
      }

      form.setValue('notas_sustrato', formulaString);
    }

  }, [watchedFormulationId, watchedTotalWeight, formulaciones, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newLote = await createLoteSustrato(values);
      toast({
        title: "Lote de Sustrato Creado",
        description: `El lote maestro ha sido registrado. Ahora puedes crear lotes de producción a partir de él.`,
      });
      router.push(`/panel/sustratos/${newLote.id}`);
    } catch (error) {
      toast({
        title: "Error al crear lote",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar los datos. Inténtalo de nuevo.",
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="id_formulacion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>1. Selecciona una Formulación Base</FormLabel>
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
                name="peso_total_kg"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>2. Ingresa el Peso Total del Sustrato Seco (kg)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="Ej: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="notas_sustrato"
            render={({ field }) => (
                <FormItem>
                <FormLabel>3. Revisa las Notas (autogeneradas)</FormLabel>
                <FormControl>
                    <Textarea rows={15} placeholder="Los cálculos de la receta aparecerán aquí automáticamente..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <Button type="submit" size="lg" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Registrar Lote de Sustrato
        </Button>
      </form>
    </Form>
  );
}
