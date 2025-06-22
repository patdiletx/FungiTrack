// This file contains server-side only data fetching functions.
// It can be safely imported into Server Components.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './supabaseClient';
import type { Lote, Producto, Formulacion } from './types';

function createClient() {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set(name, value, options);
                    } catch (error) {
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set(name, '', options);
                    } catch (error) {
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}

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
    .select('*, productos(*)')
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
