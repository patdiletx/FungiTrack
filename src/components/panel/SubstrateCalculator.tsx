'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { calculateSubstrate, CalculateSubstrateOutput } from '@/ai/flows/calculate-substrate-flow';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Producto } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface SubstrateCalculatorProps {
  productos: Producto[];
  id_producto: string; // Watched from parent form
  onFormulaCalculated: (formula: string) => void;
}

const calculatorSchema = z.object({
  knownIngredients: z.string().min(5, { message: 'Describe al menos un ingrediente.' }),
});

export function SubstrateCalculator({ productos, id_producto, onFormulaCalculated }: SubstrateCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculateSubstrateOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      knownIngredients: '1kg de paja de trigo',
    },
  });

  const handleCalculate = async (values: z.infer<typeof calculatorSchema>) => {
    if (!id_producto) {
      toast({
        title: 'Selecciona un Producto',
        description: 'Debes seleccionar un producto para poder calcular la fórmula.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const selectedProduct = productos.find(p => p.id === id_producto);

    try {
      const calcResult = await calculateSubstrate({
        ...values,
        productName: selectedProduct?.nombre || 'Hongo Ostra',
      });
      setResult(calcResult);

      // Format the result and pass it to the parent form
      let formulaString = 'Fórmula Calculada por IA:\n\n';
      formulaString += 'Ingredientes Secos:\n';
      calcResult.formula.forEach(item => {
        formulaString += `- ${item.ingredient}: ${item.weightKg.toFixed(2)} kg (${item.percentage}%)\n`;
      });
      formulaString += '\nInstrucciones y Notas:\n';
      formulaString += calcResult.notes;

      onFormulaCalculated(formulaString);

      toast({
        title: 'Fórmula Calculada',
        description: 'La fórmula se ha añadido a las notas del sustrato.',
      });

    } catch (error) {
      console.error('Error calculating substrate:', error);
      toast({
        title: 'Error en el Cálculo',
        description: 'No se pudo generar la fórmula. Revisa los datos o inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Wand2 />
          Asistente de Formulación
        </CardTitle>
        <CardDescription>
          Calcula la mezcla de sustrato con ayuda de la IA. Ingresa lo que tienes y la IA completará el resto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="knownIngredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredientes Conocidos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe lo que tienes. Ej: '1kg de alfalfa' o '70% viruta, 20% salvado'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!id_producto && (
              <p className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">
                Por favor, selecciona primero un producto en el menú de arriba para activar el cálculo.
              </p>
            )}

            <Button type="button" onClick={form.handleSubmit(handleCalculate)} disabled={loading || !id_producto} className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Calcular y Añadir a Notas
            </Button>
          </div>
        </Form>
        {result && (
          <div className="mt-4 space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-lg">Resultado de la Formulación</h4>
              <Alert variant="success">
                <AlertTitle className="font-bold">Ingredientes Secos:</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5">
                    {result.formula.map((item, i) => (
                        <li key={i}>
                            <strong>{item.ingredient}:</strong> {item.weightKg.toFixed(2)} kg ({item.percentage}%)
                        </li>
                    ))}
                    </ul>
                </AlertDescription>
              </Alert>
              <Alert>
                <AlertTitle className="font-bold">Notas y Recomendaciones:</AlertTitle>
                <AlertDescription>
                    <p className="whitespace-pre-wrap">{result.notes}</p>
                </AlertDescription>
              </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
