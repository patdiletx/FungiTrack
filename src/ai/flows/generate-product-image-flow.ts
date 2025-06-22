'use server';

/**
 * @fileOverview Generates a product image using AI.
 *
 * - generateProductImage - A function that generates an image for a product.
 * - GenerateProductImageInput - The input type for the generateProductImage function.
 * - GenerateProductImageOutput - The return type for the generateProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductImageInputSchema = z.object({
  productName: z.string().describe('The name of the product for which to generate an image.'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;

const GenerateProductImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateProductImageOutput = z.infer<typeof GenerateProductImageOutputSchema>;

export async function generateProductImage(
  input: GenerateProductImageInput
): Promise<GenerateProductImageOutput> {
  return generateProductImageFlow(input);
}

const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImageInputSchema,
    outputSchema: GenerateProductImageOutputSchema,
  },
  async ({ productName }) => {
    const prompt = `A professional, photorealistic product shot of a '${productName}' mushroom growing kit, suitable for a gourmet food company. The image should be on a clean, minimalist, slightly out-of-focus background in a rustic kitchen setting. The product should look appealing, high-quality, and easy to use for beginners. Show oyster mushrooms beginning to sprout from the kit.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed to return media.');
    }

    return { imageDataUri: media.url };
  }
);
