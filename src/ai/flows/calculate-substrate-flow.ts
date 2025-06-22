'use server';
/**
 * @fileOverview An AI agent for calculating mushroom substrate formulations.
 *
 * - calculateSubstrate - A function that calculates a substrate formula based on known ingredients.
 * - CalculateSubstrateInput - The input type for the calculateSubstrate function.
 * - CalculateSubstrateOutput - The return type for the calculateSubstrate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateSubstrateInputSchema = z.object({
  productName: z.string().describe('The name of the mushroom product (e.g., "Oyster Mushroom", "Shiitake").'),
  knownIngredients: z.string().describe('Una descripción en texto de los ingredientes conocidos, usando porcentajes o pesos absolutos. Ej: "70% viruta, 20% salvado" o "Tengo 5kg de paja y 1kg de alfalfa seca".'),
  totalWeightKg: z.number().positive().describe('The total dry weight in kilograms for the final substrate mix.'),
});
export type CalculateSubstrateInput = z.infer<typeof CalculateSubstrateInputSchema>;

const IngredientSchema = z.object({
    ingredient: z.string().describe('Name of the ingredient (e.g., "Viruta de madera", "Salvado de trigo").'),
    percentage: z.number().describe('The percentage of this ingredient in the total mix.'),
    weightKg: z.number().describe('The calculated dry weight in kilograms for this ingredient.'),
});

const CalculateSubstrateOutputSchema = z.object({
  formula: z.array(IngredientSchema).describe('The complete list of ingredients for the formula.'),
  notes: z.string().describe("Important recommendations, hydration instructions, or other expert notes about the calculated formula. Should include the total water to add."),
});
export type CalculateSubstrateOutput = z.infer<typeof CalculateSubstrateOutputSchema>;

export async function calculateSubstrate(input: CalculateSubstrateInput): Promise<CalculateSubstrateOutput> {
  return calculateSubstrateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateSubstratePrompt',
  input: {schema: CalculateSubstrateInputSchema},
  output: {schema: CalculateSubstrateOutputSchema},
  prompt: `Eres un micólogo experto y el jefe de producción en FungiGrow. Tu tarea es ayudar a los operadores a calcular formulaciones de sustrato precisas y completas a partir de información parcial. Tu respuesta debe estar completamente en español.

Un operador te proporcionará:
- El tipo de hongo a cultivar (producto).
- Una descripción de los ingredientes que ya tiene. Esto puede ser en porcentajes (ej: "70% viruta") o en pesos absolutos (ej: "Tengo 1kg de alfalfa seca").
- El peso seco total final que necesita para el lote.

Tu trabajo es:
1.  Analizar los ingredientes proporcionados: {{{knownIngredients}}}.
2.  Si se proporcionan pesos absolutos (ej: "1kg de alfalfa"), determina su porcentaje en base al peso seco total del lote de {{{totalWeightKg}}} kg.
3.  A partir de ahí, completa la fórmula con otros ingredientes necesarios para crear una mezcla balanceada y optimizada para el hongo especificado: {{{productName}}}. La suma de los porcentajes de todos los ingredientes DEBE ser 100%.
4.  Calcula el peso en kg de CADA ingrediente de la fórmula final para alcanzar el peso seco total.
5.  Proporciona notas claras y concisas. Esto DEBE incluir la cantidad de agua necesaria para la hidratación (generalmente 60-65% del peso total húmedo) y otras recomendaciones.

Ejemplo: Si el input es '1 kg de alfalfa' y el peso total es 10kg, debes deducir que la alfalfa es el 10%. Luego, completas la fórmula (ej: con 80% viruta y 10% salvado), calculas los pesos finales (8kg viruta, 1kg alfalfa, 1kg salvado), y lo presentas.

Sé muy preciso con los cálculos. Devuelve una fórmula completa y útil.`,
});

const calculateSubstrateFlow = ai.defineFlow(
  {
    name: 'calculateSubstrateFlow',
    inputSchema: CalculateSubstrateInputSchema,
    outputSchema: CalculateSubstrateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
