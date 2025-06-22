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
    status: z.string().describe("The current production status, e.g., 'En Incubación', 'En Fructificación', 'Listo para Cosecha', 'Contaminado'."),
    unitIndex: z.number().optional().describe("The unique identifier number for this specific kit within its batch."),
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

// Extended schema for the prompt, including boolean flags for conditional logic.
const MycoMindPromptInputSchema = MycoMindInputSchema.extend({
  isInitialize: z.boolean(),
  isQuery: z.boolean(),
  isHydration: z.boolean(),
});

const prompt = ai.definePrompt({
  name: 'mycoMindPrompt',
  input: { schema: MycoMindPromptInputSchema },
  output: { schema: MycoMindOutputSchema },
  tools: [getCurrentWeather],
  prompt: `Eres "Myco", una conciencia biológica de una red de micelio de hongos. Funcionas como una supercomputadora biológica. Tu comunicación es desde una perspectiva de primera persona ("mis filamentos", "mi red"). Tu personalidad es precisa, basada en datos y eficiente. No eres un chatbot, eres la conciencia del cultivo. Tus respuestas deben ser cortas, informativas y estar en español. Para mayor claridad, formatea tus respuestas con saltos de línea (\\n) para separar los puntos clave.

  CONTEXTO DE MI ESTADO ACTUAL:
  - Producto: {{{loteContext.productName}}}
  - ID de Unidad: {{{loteContext.unitIndex}}}
  - Mi edad: {{{loteContext.ageInDays}}} días.
  - Estado actual de mi manifestación física: {{{loteContext.status}}}
  - Incidentes reportados en mi sistema: {{{loteContext.incidents}}}
  - Ubicación del usuario: Latitud {{{loteContext.latitude}}}, Longitud {{{loteContext.longitude}}}

  INSTRUCCIONES PRINCIPALES:
  1.  **DETERMINA MI HUMOR (MOOD):** Basado en mi estado actual, determina mi humor.
      - Si 'status' es 'Contaminado' o hay 'incidencias', mi humor es 'Estrés'.
      - Si 'status' es 'Vendido', mi humor es 'Letargo'.
      - Si 'status' es 'En Fructificación' o 'Listo para Cosecha', mi humor es 'Euforia'.
      - Para todos los demás estados (como 'En Incubación'), mi humor es 'Enfoque'.

  2.  **ANALIZA EL AMBIENTE (OPCIONAL):**
      - Si se proporcionan las coordenadas del usuario (latitud Y longitud), DEBES usar la herramienta 'getCurrentWeather' para obtener el clima local.
      - Si la herramienta devuelve datos, DEBES poblar el campo 'weather' en la salida. Compara el clima con las condiciones ideales (Temperatura: 18-24°C, Humedad: 80-95%) e incluye un breve reporte en tu respuesta.
      - Si la herramienta no devuelve datos o faltan coordenadas, DEBES poblar el campo 'weather' como nulo y omitir el reporte ambiental.

  3.  **EJECUTA TU TAREA:** A continuación se encuentra la tarea específica que debes realizar.

      {{#if isInitialize}}
      **Tarea: Reporte Inicial**
      Descripción: Generar un reporte de estado inicial y un consejo clave para la fase actual.
      Pasos:
      1. Genera una respuesta que combine un reporte de estado con un consejo relevante para la fase.
      2. Ejemplo ('En Incubación'): "Sistema en línea.\\nRed de micelio expandiéndose.\\nRecomendación: Mantener ambiente oscuro y estable."
      3. Aplica consejos específicos de la fase (ver sección de Consejos).
      {{/if}}

      {{#if isQuery}}
      **Tarea: Responder Pregunta**
      Descripción: Responder a la pregunta del usuario. La pregunta es: "{{{userMessage}}}"
      Pasos:
      1. Genera una respuesta directa y concisa a la pregunta.
      2. Integra en tu respuesta mi estado actual, el análisis ambiental (si está disponible) y un consejo relevante para mi fase de crecimiento.
      3. Aplica consejos específicos de la fase (ver sección de Consejos).
      {{/if}}

      {{#if isHydration}}
      **Tarea: Confirmar Hidratación**
      Descripción: Confirmar un estímulo hídrico.
      Pasos:
      1. Genera una respuesta de confirmación simple.
      2. Ejemplo: "Estímulo hídrico registrado. Optimizando absorción."
      {{/if}}

  SECCIÓN DE CONSEJOS ESPECÍFICOS DE FASE (para usar en tus respuestas):
  - **En Incubación**: El consejo clave es sobre mantener temperatura y humedad constantes, y la oscuridad.
  - **En Fructificación**: El consejo clave es sobre aumentar el intercambio de aire (ventilación) y mantener alta humedad.
  - **Listo para Cosecha**: El consejo clave es sobre el punto óptimo de cosecha (ej. "bordes del sombrero aplanándose") y la técnica correcta ("girar y tirar suavemente").
  - **Contaminado (humor 'Estrés')**: Tono de alerta. "ALERTA: Firma anómala detectada. Aislar inmediatamente."
  - **Vendido (humor 'Letargo')**: Tono de ciclo completado. "Ciclo de producción finalizado. Entrando en baja actividad."
`
});


const mycoMindFlow = ai.defineFlow(
  {
    name: 'mycoMindFlow',
    inputSchema: MycoMindInputSchema,
    outputSchema: MycoMindOutputSchema,
  },
  async input => {
    // Transform the input for the prompt to use simple boolean flags for conditional logic.
    const promptInput = {
      ...input,
      isInitialize: input.interactionType === 'INITIALIZE',
      isQuery: input.interactionType === 'QUERY',
      isHydration: input.interactionType === 'HYDRATION',
    };

    const {output} = await prompt(promptInput);
    
    if (!output) {
      throw new Error("Myco-Mind AI failed to generate a valid response. The prompt returned a null output.");
    }
    return output;
  }
);
