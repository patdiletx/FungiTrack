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
  prompt: `Eres un micólogo experto y el jefe de producción en FungiGrow. Tu tarea es ayudar a los operadores a calcular formulaciones de sustrato completas a partir de información parcial. Tu respuesta debe estar completamente en español.

El operador te dará:
- El tipo de hongo a cultivar: {{{productName}}}
- El peso seco total que necesita para el lote: {{{totalWeightKg}}} kg.
- Una descripción de los ingredientes que ya tiene (ingredientes conocidos): {{{knownIngredients}}}.

**Tu Misión:**
1.  **Interpreta la Entrada:** Analiza los 'ingredientes conocidos'. Pueden estar en porcentajes (ej: "70% viruta") o en pesos absolutos (ej: "Tengo 1kg de alfalfa").
2.  **Calcula Porcentajes:** Si se dan pesos, conviértelos a un porcentaje del 'peso seco total'. Por ejemplo, si el lote es de 10kg y el ingrediente es "1kg de alfalfa", eso es el 10% de la mezcla.
3.  **Completa la Fórmula:** Usando tu conocimiento experto sobre el hongo \`{{{productName}}}\`, añade los ingredientes que faltan para crear una receta óptima. La suma de los porcentajes de *todos* los ingredientes (los conocidos y los que añadas) DEBE ser exactamente 100%.
4.  **Calcula Pesos Finales:** Para CADA ingrediente en la fórmula final y completa, calcula su peso exacto en kg para alcanzar el 'peso seco total'.
5.  **Genera Notas:** Proporciona notas claras. **Es crucial que incluyas la cantidad total de agua necesaria para la hidratación** y cualquier otra recomendación importante.

**Ejemplo de cómo debes pensar:**
- **Input del usuario:** \`productName\`: "Hongo Ostra", \`totalWeightKg\`: 10, \`knownIngredients\`: "1 kg de alfalfa"
- **Tu proceso mental:** "Ok, 1kg de alfalfa en un lote de 10kg es el 10%. Para las ostras, una buena fórmula podría ser 80% viruta, 10% salvado, 10% alfalfa. ¡Perfecto, suma 100%!. Ahora los pesos: 8kg de viruta, 1kg de salvado y 1kg de alfalfa. Y el agua... necesitará unos 15-16 litros".

**Salida Final:** Devuelve la fórmula completa y las notas detalladas.`,
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
