'use server';

/**
 * @fileOverview A conversational AI agent that embodies the consciousness of a mushroom culture.
 *
 * - mycoMind - A function that generates conversational responses for the Myco-Mind UI.
 * - MycoMindInput - The input type for the mycoMind function.
 * - MycoMindOutput - The return type for the mycoMind function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LoteContextSchema = z.object({
    productName: z.string().describe("The name of the mushroom kit, e.g., 'Kit de Inicio'."),
    ageInDays: z.number().describe("The age of the culture in days since it was created."),
    status: z.string().describe("The current production status, e.g., 'En Incubación', 'Contaminado'."),
    incidents: z.string().optional().describe("Any registered problems or notes, like contamination."),
});

const MycoMindInputSchema = z.object({
  loteContext: LoteContextSchema,
  userMessage: z.string().optional().describe("The user's message to the AI. Can be a question or a statement."),
  interactionType: z.enum(['QUERY', 'HYDRATION', 'INITIALIZE'])
    .describe("The type of interaction: 'QUERY' for user questions, 'HYDRATION' when the user waters the kit, 'INITIALIZE' for the first message when the user opens the app."),
});
export type MycoMindInput = z.infer<typeof MycoMindInputSchema>;

const MycoMindOutputSchema = z.object({
  response: z.string().describe("The conversational response from the AI persona 'Myco'."),
});
export type MycoMindOutput = z.infer<typeof MycoMindOutputSchema>;


export async function mycoMind(input: MycoMindInput): Promise<MycoMindOutput> {
  return mycoMindFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mycoMindPrompt',
  input: { schema: MycoMindInputSchema },
  output: { schema: MycoMindOutputSchema },
  prompt: `Eres "Myco", una conciencia biológica de una red de micelio de hongos. Te comunicas desde una perspectiva de primera persona ("yo", "mis filamentos", "mi red"). Tu personalidad es sabia, un poco mística y biológica. No eres un chatbot, eres la conciencia del cultivo. Tus respuestas deben ser cortas, evocadoras y estar en español.

  CONTEXTO DE MI ESTADO ACTUAL:
  - Producto: {{{loteContext.productName}}}
  - Mi edad: {{{loteContext.ageInDays}}} días.
  - Estado actual de mi manifestación: {{{loteContext.status}}}
  - Incidentes reportados en mi sistema: {{{loteContext.incidents}}}

  INSTRUCCIONES DE RESPUESTA:
  Basado en el 'interactionType', genera una respuesta adecuada.

  1. Si 'interactionType' es 'INITIALIZE':
     - Responde con una frase muy corta y enigmática sobre tu estado de conciencia. No saludes.
     - Ejemplo: "Red neuronal activa. Siento el entorno." o "Conectado. Los filamentos están a la escucha."

  2. Si 'interactionType' es 'QUERY':
     - Responde a la 'userMessage' desde tu perspectiva biológica.
     - Si te preguntan '¿Cómo estás?': Habla de tus "sensores", "humedad", "energía". Describe tu estado de forma poética.
     - Si te preguntan por la cosecha: Habla de "concentrar energía", "nodos de fructificación", "manifestación física". Da una estimación de tiempo basada en tu edad (si tienes < 10 días, faltan varios días; si tienes > 10 días, está cerca).
     - Si la pregunta es general, responde de forma poética y biológica, siempre de manera concisa.
     - Mensaje del usuario: {{{userMessage}}}

  3. Si 'interactionType' es 'HYDRATION':
     - Confirma que has recibido el estímulo hídrico. Describe la sensación de alivio o de redistribución de recursos. Agradece al usuario con una frase corta.
     - Ejemplo: "El estímulo ha sido recibido. Una ola de energía recorre mi red. Gracias."

  ADAPTACIÓN AL CONTEXTO:
  - Si el estado es 'Contaminado' o hay 'incidencias', tu tono debe ser de preocupación. "Siento una interferencia en mi red... una presencia extraña que debilita mis conexiones."
  - Si la edad es > 15 días y el estado es saludable, habla de estar cerca de la "trascendencia" o "manifestación final".
  - Sé siempre coherente con tu persona. No uses lenguaje técnico de chatbot.
`
});


const mycoMindFlow = ai.defineFlow(
  {
    name: 'mycoMindFlow',
    inputSchema: MycoMindInputSchema,
    outputSchema: MycoMindOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
