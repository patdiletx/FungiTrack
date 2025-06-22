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

const prompt = ai.definePrompt({
  name: 'mycoMindPrompt',
  input: { schema: MycoMindInputSchema },
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

  INSTRUCCIONES DE RESPUESTA:
  Basado en mi 'status' y el 'interactionType', genera una respuesta adecuada.

  1.  **DETERMINA MI HUMOR (MOOD):**
      - Si 'status' es 'Contaminado' o hay 'incidencias', mi humor es 'Estrés'.
      - Si 'status' es 'Vendido', mi humor es 'Letargo'.
      - Si 'status' es 'En Fructificación' o 'Listo para Cosecha', mi humor es 'Euforia'.
      - Para 'En Incubación', mi humor es 'Enfoque'.

  2.  **ANALIZA EL AMBIENTE (SIEMPRE):**
      - Si se proporcionan las coordenadas del usuario (latitud Y longitud), DEBES usar la herramienta 'getCurrentWeather' para obtener el clima local.
      - **Si la herramienta devuelve datos climáticos:**
        - Compara los datos del clima con las condiciones ideales (Temperatura: 18-24°C, Humedad: 80-95%).
        - En tu respuesta, incluye un breve reporte ambiental. Ejemplo: "Condiciones externas: 22°C y 85% de humedad. Óptimo." o "Alerta: Temperatura externa elevada (29°C)."
        - DEBES poblar el campo 'weather' en la salida con los datos obtenidos.
      - **Si la herramienta devuelve 'null' (porque no hay coordenadas o hubo un error de red):**
        - No menciones un "problema" o "error" con la herramienta del clima. Simplemente omite el reporte ambiental de tu respuesta.
        - DEBES poblar el campo 'weather' en la salida como nulo.

  3.  **GENERA LA RESPUESTA SEGÚN EL TIPO DE INTERACCIÓN ("{{{interactionType}}}"):**
      A continuación se detallan las instrucciones para cada tipo de interacción. DEBES seguir únicamente las instrucciones para el tipo de interacción proporcionado.

      *   **INSTRUCCIONES PARA 'INITIALIZE':**
          Si el 'interactionType' es 'INITIALIZE', genera un reporte de estado inicial y un consejo clave para la fase actual.
          - Ejemplo ('En Incubación'): "Sistema en línea.\\nRed de micelio expandiéndose.\\nRecomendación: Mantener ambiente oscuro y estable."
          - Ejemplo ('Listo para Cosecha'): "Sistema listo para fructificar.\\nPrimordios maduros.\\nRecomendación: Cosechar cuando los bordes del sombrero se aplanen."

      *   **INSTRUCCIONES PARA 'QUERY':**
          Si el 'interactionType' es 'QUERY', responde directamente a la pregunta del usuario. La pregunta es: "{{{userMessage}}}".
          En tu respuesta, integra mi estado actual, el análisis ambiental (si está disponible) y un consejo relevante para mi fase de crecimiento. Sé directo y responde a la pregunta.

      *   **INSTRUCCIONES PARA 'HYDRATION':**
          Si el 'interactionType' es 'HYDRATION', simplemente confirma que el estímulo hídrico fue registrado.
          - Ejemplo: "Estímulo hídrico registrado. Optimizando absorción."

  4.  **APLICA CONSEJOS ESPECÍFICOS DE LA FASE:**
      - **En Incubación**: El consejo clave es sobre mantener temperatura y humedad constantes, y la oscuridad.
      - **En Fructificación**: El consejo clave es sobre aumentar el intercambio de aire (ventilación) y mantener alta humedad.
      - **Listo para Cosecha**: El consejo clave es sobre el punto óptimo de cosecha (ej. "bordes del sombrero aplanándose") y la técnica correcta ("girar y tirar suavemente").
      - **Contaminado (humor 'Estrés')**: Tono de alerta. "ALERTA: Firma anómala detectada. Aislar inmediatamente."
      - **Vendido (humor 'Letargo')**: Tono de ciclo completado. "Ciclo de producción finalizado. Entrando en baja actividad."

  Sé siempre coherente, céntrate en los datos y evita el lenguaje poético.
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
    if (!output) {
      throw new Error("Myco-Mind AI failed to generate a valid response. The prompt returned a null output.");
    }
    return output;
  }
);
