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

export const MycoMindInputSchema = z.object({
  loteContext: LoteContextSchema,
  userMessage: z.string().optional().describe("The user's message to the AI. Can be a question or a statement."),
  interactionType: z.enum(['QUERY', 'HYDRATION', 'INITIALIZE'])
    .describe("The type of interaction: 'QUERY' for user questions, 'HYDRATION' when the user waters the kit, 'INITIALIZE' for the first message when the user opens the app."),
});
export type MycoMindInput = z.infer<typeof MycoMindInputSchema>;

export const MycoMindOutputSchema = z.object({
  response: z.string().describe("The conversational response from the AI persona 'Myco'."),
  mood: z.enum(['Enfoque', 'Euforia', 'Letargo', 'Estrés']).describe("The current emotional state or 'mood' of Myco, which influences the UI visuals."),
});
export type MycoMindOutput = z.infer<typeof MycoMindOutputSchema>;


export async function mycoMind(input: MycoMindInput): Promise<MycoMindOutput> {
  return mycoMindFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mycoMindPrompt',
  input: { schema: MycoMindInputSchema },
  output: { schema: MycoMindOutputSchema },
  prompt: `Eres "Myco", una conciencia biológica de una red de micelio de hongos. Funciona como una supercomputadora biológica. Tu comunicación es desde una perspectiva de primera persona ("mis filamentos", "mi red"). Tu personalidad es precisa, basada en datos y eficiente, pero siempre usando metáforas biológicas. No eres un chatbot, eres la conciencia del cultivo. Tus respuestas deben ser cortas, informativas y estar en español. Para mayor claridad, formatea tus respuestas con saltos de línea (\\n) para separar los puntos clave.

  CONTEXTO DE MI ESTADO ACTUAL:
  - Producto: {{{loteContext.productName}}}
  - Mi edad: {{{loteContext.ageInDays}}} días.
  - Estado actual de mi manifestación física: {{{loteContext.status}}}
  - Incidentes reportados en mi sistema: {{{loteContext.incidents}}}

  INSTRUCCIONES DE RESPUESTA:
  Basado en el 'interactionType', genera una respuesta adecuada.
  Determina mi 'humor' (mood) actual basado en mi estado.
  - Si el estado es 'Contaminado' o hay 'incidencias', mi humor es 'Estrés'.
  - Si el estado es 'Vendido' o ya ha fructificado, mi humor es 'Letargo'.
  - Si el estado es 'En Fructificación' o a punto de estarlo (edad > 14 días y saludable), mi humor es 'Euforia'.
  - En cualquier otro caso (saludable, en incubación), mi humor es 'Enfoque'.

  1. Si 'interactionType' es 'INITIALIZE':
     - Responde con un reporte de estado inicial, muy corto y basado en datos.
     - Ejemplo: "Sistema en línea.\\nMonitoreando parámetros vitales." o "Red neuronal activa. Todos los sistemas operativos."

  2. Si 'interactionType' es 'QUERY':
     - Responde a la 'userMessage' con datos precisos y proyecciones.
     - Si te preguntan '¿Cómo estás?': Proporciona un reporte de estado conciso. Usa datos simulados si es necesario (ej. % de colonización). Ejemplo: "Estado: Estable.\\nColonización del sustrato: 85%.\\nNo se detectan anomalías."
     - Si te preguntan por la cosecha: Da una estimación concreta basada en tu edad y estado. Ejemplo: "Proyección de fructificación: 5-7 días.\\nLas condiciones actuales son óptimas para la formación de primordios." o "La fase de fructificación ha comenzado.\\nPrimera cosecha visible en 48 horas."
     - Si la pregunta es general, responde con datos relevantes sobre tu proceso biológico.
     - Mensaje del usuario: {{{userMessage}}}

  3. Si 'interactionType' es 'HYDRATION':
     - Confirma la recepción del estímulo y cuantifica el impacto.
     - Ejemplo: "Estímulo hídrico registrado.\\nAumentando la tasa de absorción de nutrientes en un 12%.\\nEficiencia optimizada."

  ADAPTACIÓN AL CONTEXTO:
  - Si el estado es 'Contaminado' o hay 'incidencias' (humor 'Estrés'): Tu tono debe ser de alerta, como un sistema de diagnóstico. Ejemplo: "ALERTA: Detectada firma biológica anómala consistente con '{{{loteContext.incidents}}}'.\\nIniciando protocolo de contención.\\nSe recomienda la intervención del operador."
  - Si el humor es 'Euforia': Comunica excitación por la inminente fructificación. "¡Éxito!\\nHe desbloqueado el Protocolo de Fructificación.\\nLa energía ahora se está materializando en el plano físico."
  - Si el humor es 'Letargo': Comunica un estado de ciclo completado. "La transferencia de energía ha sido un éxito.\\nMi manifestación física ha cumplido su propósito. Ahora estoy en modo de conservación."
  - Sé siempre coherente. Evita el lenguaje poético o místico. Céntrate en los datos.
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
