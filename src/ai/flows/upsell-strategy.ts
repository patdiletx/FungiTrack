'use server';

/**
 * @fileOverview This file implements the Genkit flow for the UpsellBloqueProductorXL story.
 *
 * - upsellStrategy - A function that determines whether to offer an upsell promotion for the 'Bloque Productor XL'.
 * - UpsellStrategyInput - The input type for the upsellStrategy function.
 * - UpsellStrategyOutput - The return type for the upsellStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpsellStrategyInputSchema = z.object({
  productId: z.string().describe('The ID of the product being scanned.'),
  customerHistory: z
    .string()
    .optional()
    .describe('A summary of the customers past orders and demographics.'),
});

export type UpsellStrategyInput = z.infer<typeof UpsellStrategyInputSchema>;

const UpsellStrategyOutputSchema = z.object({
  shouldUpsell: z
    .boolean()
    .describe(
      'Whether an upsell promotion for the Bloque Productor XL should be offered.'
    ),
  upsellMessage: z
    .string()
    .optional()
    .describe('Personalized message encouraging the user to buy the Bloque Productor XL.'),
});

export type UpsellStrategyOutput = z.infer<typeof UpsellStrategyOutputSchema>;

export async function upsellStrategy(input: UpsellStrategyInput): Promise<UpsellStrategyOutput> {
  return upsellStrategyFlow(input);
}

const upsellPrompt = ai.definePrompt({
  name: 'upsellPrompt',
  input: {
    schema: UpsellStrategyInputSchema,
  },
  output: {
    schema: UpsellStrategyOutputSchema,
  },
  prompt: `You are an expert marketing advisor for a mushroom growing company.

  Based on the product ID scanned, and the customer's purchase history, determine whether to offer an upsell promotion for the 'Bloque Productor XL'.

  If the product scanned is the 'Kit de Inicio', consider the customer's history to determine if they would be interested in a larger product like the 'Bloque Productor XL'.

  If the customer has a history of purchasing multiple kits, or has shown interest in larger quantities of mushrooms, then offer the upsell.

  Customer History: {{{customerHistory}}}
  Product ID: {{{productId}}}

  Return a JSON object with 'shouldUpsell' set to true or false, and if true, a personalized 'upsellMessage' encouraging them to buy the 'Bloque Productor XL'.`,
});

const upsellStrategyFlow = ai.defineFlow(
  {
    name: 'upsellStrategyFlow',
    inputSchema: UpsellStrategyInputSchema,
    outputSchema: UpsellStrategyOutputSchema,
  },
  async input => {
    const {output} = await upsellPrompt(input);
    return output!;
  }
);
