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
  prompt: `You are an expert mycologist specializing in identifying mushroom cultivation contaminants.
Your task is to analyze the provided image of a mushroom substrate or batch and determine if it is contaminated.

Analyze the image: {{media url=photoDataUri}}

- Look for common contaminants like Trichoderma (green mold), Penicillium (blue-green mold), Cobweb mold (gray, fuzzy growth), or bacterial blotch (slimy, yellow/brown spots).
- If contamination is detected, set 'isContaminated' to true, identify the likely contaminant in the 'diagnosis', and explain why you think it's that contaminant. Also, provide a confidence score.
- If the batch appears healthy, set 'isContaminated' to false and state in the 'diagnosis' that it looks healthy and ready for the next stage. Provide a high confidence score.
- Your diagnosis should be clear and provide actionable advice if a problem is found (e.g., "Isolate the bag immediately and dispose of it safely.").
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
