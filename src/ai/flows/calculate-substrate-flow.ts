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
  knownIngredients: z.string().describe('A text description of the known ingredients, using percentages or absolute weights. E.g., "70% wood chips, 20% bran" or "I have 5kg straw and 1kg dry alfalfa".'),
  totalWeightKg: z.number().positive().optional().describe('The desired total dry weight in kilograms for the final substrate mix. If not provided, the AI should infer it from the known ingredients.'),
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
- Los ingredientes que ya tiene (ingredientes conocidos): {{{knownIngredients}}}.
- Opcionalmente, podría darte el peso seco total que necesita para el lote: {{{totalWeightKg}}} kg.

**Tu Misión:**
1.  **Determina el Peso Total del Lote:**
    *   **Si se proporciona \`totalWeightKg\`**, úsalo como el objetivo final del peso seco.
    *   **Si NO se proporciona \`totalWeightKg\`**, DEBES inferirlo a partir de los 'ingredientes conocidos'. Usa tu conocimiento experto.
        *   Ejemplo de Inferencia: Si el usuario dice "1 kg de alfalfa" para "Hongo Ostra", y tú sabes que la alfalfa suele ser un 10% de la receta, entonces el peso total del lote es 10 kg.
        *   Si el usuario da varios pesos ("5kg de paja y 1kg de afrecho"), el peso total mínimo es la suma de esos ingredientes. Completa la receta basándote en ese total inferido o un estándar de la industria, lo que sea más lógico.

2.  **Completa la Fórmula:** Basado en el peso total (ya sea proporcionado o inferido), añade los ingredientes que faltan para crear una receta óptima para \`{{{productName}}}\`. La suma de los porcentajes de *todos* los ingredientes debe ser exactamente 100%.

3.  **Calcula Pesos Finales:** Para CADA ingrediente en la fórmula final, calcula su peso exacto en kg.

4.  **Genera Notas:** Proporciona notas claras. **Es crucial que incluyas la cantidad total de agua necesaria para la hidratación** y cualquier otra recomendación importante.

**Ejemplo de cómo debes pensar:**
- **Input del usuario:** \`productName\`: "Hongo Ostra", \`knownIngredients\`: "1 kg de alfalfa", \`totalWeightKg\`: (no proporcionado)
- **Tu proceso mental:** "Ok, no hay peso total. El usuario tiene 1kg de alfalfa. Para las ostras, la alfalfa es un buen suplemento, digamos un 10%. Por lo tanto, el lote total debería ser de 10kg. Una buena fórmula es 80% viruta, 10% salvado y 10% alfalfa. ¡Perfecto! Pesos: 8kg viruta, 1kg salvado, 1kg alfalfa. El agua necesaria será de unos 15-16 litros".

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
