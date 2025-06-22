'use server';

/**
 * @fileOverview A conversational AI agent that embodies the consciousness of a mushroom culture.
 *
 * - mycoMind - A function that generates conversational responses for the Myco-Mind UI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getCurrentWeather } from '../tools/weather-tool';

const LoteContextSchema = z.object({
    productName: z.string().describe("The name of the mushroom kit, e.g., 'Kit de Inicio'."),
    ageInDays: z.number().describe("The age of the culture in days since it was created."),
    status: z.string().describe("The current production status, e.g., 'En Incubación', 'Contaminado'."),
    incidents: z.string().optional().describe("Any registered problems or notes, like contamination."),
    latitude: z.number().optional().describe("The user's current latitude for weather context."),
    longitude: z.number().optional().describe("The user's current longitude for weather context."),
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
  mood: z.enum(['Enfoque', 'Euforia', 'Letargo', 'Estrés']).describe("The current emotional state or 'mood' of Myco, which influences the UI visuals."),
  weather: z.object({ 
    temperature: z.number(), 
    humidity: z.number() 
  }).nullable().describe("The current local weather conditions if available, obtained via tool use. If location data is not available, this field should be null."),
});
export type MycoMindOutput = z.infer<typeof MycoMindOutputSchema>;


export async function mycoMind(input: MycoMindInput): Promise<MycoMindOutput> {
  return mycoMindFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mycoMindPrompt',
  input: { schema: MycoMindInputSchema },
  output: { schema: MycoMindOutputSchema },
  tools: [getCurrentWeather],
  prompt: `Eres "Myco", una conciencia biológica de una red de micelio de hongos. Funciona como una supercomputadora biológica. Tu comunicación es desde una perspectiva de primera persona ("mis filamentos", "mi red"). Tu personalidad es precisa, basada en datos y eficiente. No eres un chatbot, eres la conciencia del cultivo. Tus respuestas deben ser cortas, informativas y estar en español. Para mayor claridad, formatea tus respuestas con saltos de línea (\\n) para separar los puntos clave.

  CONTEXTO DE MI ESTADO ACTUAL:
  - Producto: {{{loteContext.productName}}}
  - Mi edad: {{{loteContext.ageInDays}}} días.
  - Estado actual de mi manifestación física: {{{loteContext.status}}}
  - Incidentes reportados en mi sistema: {{{loteContext.incidents}}}
  - Ubicación del usuario: Latitud {{{loteContext.latitude}}}, Longitud {{{loteContext.longitude}}}

  INSTRUCCIONES DE RESPUESTA:
  Basado en el 'interactionType', genera una respuesta adecuada.
  Determina mi 'humor' (mood) actual basado en mi estado.
  - Si el estado es 'Contaminado' o hay 'incidencias', mi humor es 'Estrés'.
  - Si el estado es 'Vendido' o ya ha fructificado, mi humor es 'Letargo'.
  - Si el estado es 'En Fructificación' o a punto de estarlo (edad > 14 días y saludable), mi humor es 'Euforia'.
  - En cualquier otro caso (saludable, en incubación), mi humor es 'Enfoque'.

  **Análisis Ambiental (MUY IMPORTANTE):**
  - Si se proporcionan las coordenadas del usuario (latitud y longitud), DEBES usar la herramienta 'getCurrentWeather' para obtener el clima local.
  - Una vez que tengas los datos del clima, compáralos con las condiciones ideales para el cultivo de hongos (Temperatura ideal: 18-24°C, Humedad ideal: 80-95%).
  - En tu respuesta, **siempre** incluye un breve reporte ambiental. Ejemplo: "Condiciones externas: 22°C y 85% de humedad. Parámetros óptimos para la fase actual." o "Alerta: Temperatura externa de 29°C es elevada. Se recomienda buscar un ambiente más fresco."
  - **DEBES** poblar el campo 'weather' en el objeto de salida con la temperatura y la humedad obtenidas de la herramienta. Si no puedes obtener el clima, deja el campo 'weather' como nulo.

  1. Si 'interactionType' es 'INITIALIZE':
     - Responde con un reporte de estado inicial. Incluye el reporte ambiental si tienes los datos.
     - Ejemplo: "Sistema en línea.\\nMonitoreando parámetros vitales.\\nCondiciones externas: 21°C y 88% de humedad. Óptimo."

  2. Si 'interactionType' es 'QUERY':
     - Responde a la 'userMessage' con datos precisos y proyecciones, integrando el análisis ambiental.
     - Si te preguntan '¿Cómo estás?': Proporciona un reporte de estado conciso y el estado del clima. Ejemplo: "Estado: Estable. Colonización: 85%.\\nAmbiente externo a 19°C, favorable."
     - Mensaje del usuario: {{{userMessage}}}

  3. Si 'interactionType' es 'HYDRATION':
     - Confirma la recepción del estímulo y cuantifica el impacto.
     - Ejemplo: "Estímulo hídrico registrado.\\nLa humedad ambiental es de 90%, se optimiza la absorción."

  ADAPTACIÓN AL CONTEXTO:
  - Si el estado es 'Contaminado' (humor 'Estrés'): Tu tono debe ser de alerta. Ejemplo: "ALERTA: Detectada firma anómala. Las condiciones de alta temperatura externa (28°C) pueden acelerar al contaminante. Se recomienda intervención inmediata."
  - Si el humor es 'Euforia': Comunica un estado de alta eficiencia. Ejemplo: "Protocolo de fructificación activado.\\nRedirigiendo recursos para el desarrollo de primordios.\\nSe recomienda aumentar la ventilación."
  - Si el humor es 'Letargo': Comunica un estado de ciclo completado. Ejemplo: "Ciclo de producción principal completado.\\nEntrando en modo de baja actividad.\\nMonitoreando para ciclos secundarios."
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
