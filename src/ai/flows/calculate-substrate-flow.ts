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
  knownIngredients: z.string().describe('A plain text description of the known ingredients and their desired percentages or weights. e.g., "70% viruta, 10% salvado"'),
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
  prompt: `Eres un micólogo experto y el jefe de producción en FungiGrow. Tu tarea es ayudar a los operadores a calcular formulaciones de sustrato precisas. Tu respuesta debe estar completamente en español.

Un operador te proporcionará:
- El tipo de hongo a cultivar (producto).
- Los ingredientes que ya tiene o quiere usar, con sus porcentajes o pesos.
- El peso seco total final que necesita para el lote.

Tu trabajo es:
1.  Analizar los ingredientes proporcionados: {{{knownIngredients}}}
2.  Calcular los ingredientes restantes para crear una fórmula balanceada y optimizada para el hongo especificado: {{{productName}}}. La suma de los porcentajes de todos los ingredientes DEBE ser 100%.
3.  Calcular el peso en kg de cada ingrediente (tanto los proporcionados como los que tú añadas) para alcanzar el peso seco total de {{{totalWeightKg}}} kg.
4.  Proporcionar notas claras y concisas. Esto DEBE incluir la cantidad de agua necesaria para alcanzar una hidratación óptima (generalmente 60-65% del peso total húmedo) y cualquier otra recomendación importante.

Ejemplo de respuesta esperada: Si el input es '70% viruta, 10% salvado' y 100kg, podrías completar con '20% alfalfa' y calcular los pesos para cada uno.

Se muy preciso con los cálculos. Devuelve una fórmula completa y útil.
`,
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
