'use server';

/**
 * @fileOverview This file implements a Genkit flow that acts as an assistant for a mushroom production batch.
 *
 * - batchAssistant - A function that analyzes a batch's data and provides a summary and suggestions.
 * - BatchAssistantInput - The input type for the batchAssistant function.
 * - BatchAssistantOutput - The return type for the batchAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BatchAssistantInputSchema = z.object({
  productName: z.string().describe('The name of the mushroom product.'),
  status: z.string().describe('The current status of the batch (e.g., "En Incubación", "Contaminado").'),
  substrateNotes: z.string().optional().describe('Notes about the substrate mixture.'),
  incidents: z.string().optional().describe('Registered incidents or problems, like contamination.'),
});

export type BatchAssistantInput = z.infer<typeof BatchAssistantInputSchema>;

const BatchAssistantOutputSchema = z.object({
  summary: z.string().describe("A brief, expert summary of the batch's current situation."),
  suggestions: z.array(z.string()).describe('A list of actionable suggestions for the operator based on the batch data.'),
});

export type BatchAssistantOutput = z.infer<typeof BatchAssistantOutputSchema>;

export async function batchAssistant(input: BatchAssistantInput): Promise<BatchAssistantOutput> {
  return batchAssistantFlow(input);
}

const assistantPrompt = ai.definePrompt({
  name: 'batchAssistantPrompt',
  input: {
    schema: BatchAssistantInputSchema,
  },
  output: {
    schema: BatchAssistantOutputSchema,
  },
  prompt: `You are an expert mycologist and production advisor for FungiGrow, a mushroom cultivation company.
Your task is to analyze the data for a specific production batch and provide a concise summary and actionable suggestions for the operator.

Batch Information:
- Product: {{{productName}}}
- Status: {{{status}}}
- Substrate Notes: {{{substrateNotes}}}
- Incidents: {{{incidents}}}

Based on this information:
1.  **Summary:** Write a short, professional summary (1-2 sentences) of the batch's current state.
2.  **Suggestions:** Provide a list of 2-3 clear, actionable suggestions. These should be practical next steps the operator can take. For example, if the status is 'En Incubación', suggest monitoring temperature and humidity. If there are incidents of contamination, suggest protocols for isolation and disposal. If it's 'Listo para Venta', suggest quality control checks.

Adapt your advice to the specific product and situation. Be encouraging but professional.
`,
});

const batchAssistantFlow = ai.defineFlow(
  {
    name: 'batchAssistantFlow',
    inputSchema: BatchAssistantInputSchema,
    outputSchema: BatchAssistantOutputSchema,
  },
  async input => {
    const {output} = await assistantPrompt(input);
    return output!;
  }
);
