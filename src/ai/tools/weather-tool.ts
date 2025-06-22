'use server';
/**
 * @fileOverview A Genkit tool for fetching current weather conditions.
 *
 * - getCurrentWeather - A tool that fetches temperature and humidity for given coordinates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Obtiene la temperatura y humedad actual para una ubicación geográfica específica (latitud y longitud). Solo debe llamarse si se proporcionan tanto la latitud como la longitud.',
    inputSchema: z.object({
      latitude: z.number().optional().describe('La latitud de la ubicación.'),
      longitude: z.number().optional().describe('La longitud de la ubicación.'),
    }),
    outputSchema: z.object({
      temperature: z.number().describe('La temperatura actual en grados Celsius.'),
      humidity: z.number().describe('La humedad relativa actual en porcentaje.'),
    }).nullable(),
  },
  async ({ latitude, longitude }) => {
    // If coordinates are not provided, we can't get the weather. Return null.
    // This makes the tool more robust in case the LLM calls it without full data.
    if (latitude === undefined || longitude === undefined) {
      return null;
    }

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
      if (!response.ok) {
        console.error(`Error fetching weather data: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      
      return {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
      };
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        // On any failure, return null gracefully.
        // The AI prompt is designed to handle this null case.
        return null;
    }
  }
);
