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
   const { data, error } = await supabase
    .from('lotes')
    .select('*, productos(*), kit_settings(*)')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116: row not found, which is fine
    console.error('Error fetching lote by id:', error.message);
    return null;
  }

  return data;
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
