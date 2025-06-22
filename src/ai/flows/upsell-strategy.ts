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
  prompt: `Eres un asesor de marketing experto para una empresa de cultivo de hongos. Tu respuesta debe estar completamente en español.

  Basado en el ID del producto escaneado y el historial de compras del cliente, determina si se debe ofrecer una promoción de venta adicional para el 'Bloque Productor XL'.

  Si el producto escaneado es el 'Kit de Inicio', considera el historial del cliente para determinar si estaría interesado en un producto más grande como el 'Bloque Productor XL'.

  Si el cliente tiene un historial de comprar múltiples kits o ha mostrado interés en mayores cantidades de hongos, entonces ofrece la venta adicional.

  Historial del Cliente: {{{customerHistory}}}
  ID del Producto: {{{productId}}}

  Devuelve un objeto JSON con 'shouldUpsell' establecido en true o false, y si es true, un 'upsellMessage' personalizado en español que anime al usuario a comprar el 'Bloque Productor XL'.`,
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
