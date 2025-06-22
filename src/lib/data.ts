// This file contains server-side only data fetching functions.
// It can be safely imported into Server Components.

import { createClient } from './supabase/server';
import type { Lote, Producto, Formulacion } from './types';


// --- PRODUCTOS ---

export const getProductos = async (): Promise<Producto[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching productos:', error.message);
    return []; 
  }
  return data || [];
};

// --- LOTES ---

export const getLotes = async (): Promise<Lote[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lotes')
    .select('*, productos(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lotes:', error.message);
    return [];
  }
  return data || [];
};

export const getLoteById = async (id: string): Promise<Lote | null> => {
   const supabase = createClient();
   
   // Step 1: Fetch the main lote data and its related product
   const { data: loteData, error: loteError } = await supabase
    .from('lotes')
    .select('*, productos(*)')
    .eq('id', id)
    .single();
  
  if (loteError && loteError.code !== 'PGRST116') { // PGRST116: row not found
    console.error('Error fetching lote by id:', loteError.message);
    return null;
  }

  if (!loteData) {
    return null;
  }

  // Step 2: Fetch the kit_settings for that lote separately
  const { data: settingsData, error: settingsError } = await supabase
    .from('kit_settings')
    .select('*')
    .eq('lote_id', id);

  if (settingsError) {
    // Log the error but don't fail the whole request.
    // The producer can still see the lote details even if settings fail to load.
    console.error('Error fetching kit_settings by lote_id:', settingsError.message);
  }
  
  // Step 3: Manually attach the settings to the lote object
  loteData.kit_settings = settingsData || [];

  return loteData;
};

// --- FORMULACIONES ---

export const getFormulaciones = async (): Promise<Formulacion[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('formulaciones').select('*').order('puntuacion', { ascending: false });
  if (error) {
    console.error('Error fetching formulaciones:', error.message);
    return [];
  }
  return data || [];
};
