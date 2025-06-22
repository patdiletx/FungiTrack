'use server';
/**
 * @fileOverview This file implements a Genkit flow that analyzes a list of all production batches
 * and generates a high-level summary for the producer's dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Lote } from '@/lib/types';

// Simplified schemas for the flow input
const KitSettingsSummarySchema = z.object({
  has_location: z.boolean(),
  photo_count: z.number(),
  has_ai_interaction: z.boolean(),
});

const LoteSummarySchema = z.object({
  id: z.string(),
  productName: z.string(),
  status: z.string(),
  incidents: z.string().optional(),
  userActivity: KitSettingsSummarySchema.optional(),
  dismissed_alerts: z.array(z.string()).optional().describe('A list of alert reasons that have already been acknowledged by the producer.'),
});

const BatchSummaryInputSchema = z.object({
  lotes: z.array(LoteSummarySchema),
});
export type BatchSummaryInput = z.infer<typeof BatchSummaryInputSchema>;

const AttentionItemSchema = z.object({
    loteId: z.string(),
    productName: z.string(),
    reason: z.string().describe("A brief, clear reason why this batch needs attention (e.g., 'Contaminación reportada', 'Usuario subió nuevas fotos')."),
});

const HighlightItemSchema = z.object({
    loteId: z.string(),
    productName: z.string(),
    reason: z.string().describe("A brief reason for the highlight (e.g., 'Pasó a fase de fructificación', 'Vendido exitosamente')."),
});

const BatchSummaryOutputSchema = z.object({
  overallSummary: z.string().describe("A 1-2 sentence high-level overview of the entire production status. Example: 'La producción avanza a buen ritmo, con varios lotes en incubación y uno nuevo listo para la venta. Se ha detectado un posible problema de contaminación que requiere atención.'"),
  attentionRequired: z.array(AttentionItemSchema).describe('A list of batches that require immediate attention from the producer.'),
  positiveHighlights: z.array(HighlightItemSchema).describe('A list of batches with positive news or milestones.'),
  generalSuggestions: z.array(z.string()).describe("A list of 2-3 general, actionable suggestions for the producer based on the overall situation."),
});
export type BatchSummaryOutput = z.infer<typeof BatchSummaryOutputSchema>;

// The function that will be called from the server component
export async function summarizeBatches(lotes: Lote[]): Promise<BatchSummaryOutput> {
  // Map the full Lote[] object to the simplified LoteSummarySchema for the AI
  const flowInput: BatchSummaryInput = {
    lotes: lotes.map(lote => ({
      id: lote.id,
      productName: lote.productos?.nombre || 'Producto Desconocido',
      status: lote.estado,
      incidents: lote.incidencias || undefined,
      userActivity: lote.kit_settings && lote.kit_settings.length > 0 ? {
        has_location: !!lote.kit_settings[0].coordinates,
        photo_count: lote.kit_settings[0].photo_history?.length || 0,
        has_ai_interaction: !!lote.kit_settings[0].last_ai_response,
      } : undefined,
      dismissed_alerts: lote.dismissed_alerts || undefined,
    })),
  };
  return batchSummaryFlow(flowInput);
}

const summaryPrompt = ai.definePrompt({
    name: 'batchSummaryPrompt',
    input: { schema: BatchSummaryInputSchema },
    output: { schema: BatchSummaryOutputSchema },
    prompt: `Eres un jefe de producción experto para FungiGrow, una empresa de cultivo de hongos. Tu tarea es analizar una lista completa de todos los lotes de producción y generar un informe de alto nivel para el panel de control del productor. Tu respuesta debe estar completamente en español.

    Aquí está la lista de todos los lotes actuales:
    {{#each lotes}}
    - Lote ID: {{{id}}}
      - Producto: {{{productName}}}
      - Estado Productor: {{{status}}}
      - Incidencias del Productor: {{{incidents}}}
      - Alertas Descartadas: {{#if dismissed_alerts}}{{#each dismissed_alerts}}{{{this}}}; {{/each}}{{else}}Ninguna{{/if}}
      - Actividad del Usuario: {{#if userActivity}}
        - Ubicación: {{#if userActivity.has_location}}Sí{{else}}No{{/if}}
        - Fotos subidas: {{userActivity.photo_count}}
        - Interacción con IA: {{#if userActivity.has_ai_interaction}}Sí{{else}}No{{/if}}
      {{else}}
        - Sin actividad del usuario registrada.
      {{/if}}
    {{/each}}
    
    Basado en TODA esta información, genera el informe de salida:

    1.  **overallSummary**: Escribe un resumen muy breve (1-2 frases) que describa el estado general de la producción. Menciona tanto los éxitos como los desafíos clave.

    2.  **attentionRequired**: Identifica los lotes que necesitan atención URGENTE. Prioriza en este orden:
        - Lotes con estado "Contaminado". La razón debe ser "Contaminación reportada por el productor".
        - Lotes con "incidencias" registradas por el productor. La razón debe ser "Incidencias registradas".
        - Lotes donde el usuario ha subido fotos recientemente (photo_count > 0). La razón debe ser "Nuevas fotos de progreso subidas".
        
        **REGLA CRÍTICA:** NO incluyas un lote en esta lista si la razón que generarías ya está presente en el campo "Alertas Descartadas" de ese lote. Por ejemplo, si para el lote XYZ la razón es "Contaminación reportada por el productor" y esa misma frase ya está en sus "Alertas Descartadas", entonces NO debes incluir ese lote en la lista de 'attentionRequired' por esa razón.

    3.  **positiveHighlights**: Identifica noticias positivas o hitos. Por ejemplo:
        - Lotes que han cambiado a "En Fructificación" o "Listo para Venta".
        - Lotes "Vendidos".
        
    4.  **generalSuggestions**: Proporciona 2-3 sugerencias generales y prácticas para el productor. Por ejemplo, "Revisa los protocolos de esterilización debido a la contaminación en el lote X" o "Considera preparar nuevos lotes para reemplazar los vendidos".

    Sé conciso, directo y enfocado en la acción.
    `,
});

const batchSummaryFlow = ai.defineFlow(
  {
    name: 'batchSummaryFlow',
    inputSchema: BatchSummaryInputSchema,
    outputSchema: BatchSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await summaryPrompt(input);
    return output!;
  }
);
