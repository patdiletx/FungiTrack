'use server';
/**
 * @fileOverview An AI agent that analyzes images of mushroom batches for contamination.
 *
 * - diagnoseContamination - A function that handles the contamination diagnosis process.
 * - DiagnoseContaminationInput - The input type for the diagnoseContamination function.
 * - DiagnoseContaminationOutput - The return type for the diagnoseContamination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseContaminationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a mushroom substrate or batch, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseContaminationInput = z.infer<typeof DiagnoseContaminationInputSchema>;

const DiagnoseContaminationOutputSchema = z.object({
  isContaminated: z.boolean().describe('Whether or not contamination is detected in the image.'),
  diagnosis: z.string().describe("A detailed diagnosis of the image, explaining what was found. If contamination is present, describe the type (e.g., Trichoderma, Cobweb mold) and suggest next steps."),
  confidence: z.number().min(0).max(1).describe('A confidence score (0.0 to 1.0) for the diagnosis.'),
});
export type DiagnoseContaminationOutput = z.infer<typeof DiagnoseContaminationOutputSchema>;

export async function diagnoseContamination(input: DiagnoseContaminationInput): Promise<DiagnoseContaminationOutput> {
  return diagnoseContaminationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseContaminationPrompt',
  input: {schema: DiagnoseContaminationInputSchema},
  output: {schema: DiagnoseContaminationOutputSchema},
  prompt: `Eres un micólogo experto especializado en identificar contaminantes en cultivos de hongos.
Tu tarea es analizar la imagen proporcionada de un sustrato o lote de hongos y determinar si está contaminado. Tu respuesta debe estar completamente en español.

Analiza la imagen: {{media url=photoDataUri}}

- Busca contaminantes comunes como Trichoderma (moho verde), Penicillium (moho azul-verdoso), moho Telaraña (crecimiento gris y algodonoso) o mancha bacteriana (manchas viscosas, amarillas/marrones).
- Si se detecta contaminación, establece 'isContaminated' en true, identifica el contaminante probable en el 'diagnosis', y explica por qué crees que es ese contaminante. Además, proporciona una puntuación de confianza.
- Si el lote parece saludable, establece 'isContaminated' en false e indica en el 'diagnosis' que se ve saludable y listo para la siguiente etapa. Proporciona una puntuación de confianza alta.
- Tu diagnóstico debe ser claro y proporcionar consejos prácticos si se encuentra un problema (ej., "Aísla la bolsa inmediatamente y deséchala de forma segura.").
`,
});

const diagnoseContaminationFlow = ai.defineFlow(
  {
    name: 'diagnoseContaminationFlow',
    inputSchema: DiagnoseContaminationInputSchema,
    outputSchema: DiagnoseContaminationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
