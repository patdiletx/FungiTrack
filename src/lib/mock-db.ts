import type { Lote, Producto, Formulacion } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

// This function creates a Supabase client that can be used in Server Components.
// It will correctly handle authentication by reading cookies.
function createServerSupabaseClient(): SupabaseClient<Database> {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
}

// --- PRODUCTOS ---

export const getProductos = async (): Promise<Producto[]> => {
  const supabaseServer = createServerSupabaseClient();
  const { data, error } = await supabaseServer.from('productos').select('*').order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching productos:', error.message);
    return []; 
  }
  return data || [];
};

export const createProducto = async (data: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const newProductData = {
    ...data,
    id: uuidv4(),
  };

  const { data: newProduct, error } = await supabase
    .from('productos')
    .insert(newProductData)
    .select()
    .single();

  if (error) {
    console.error('Error creating producto:', error.message);
    throw new Error('Failed to create producto.');
  }

  return newProduct;
};

export const updateProducto = async (id: string, data: Partial<Omit<Producto, 'id' | 'created_at'>>): Promise<Producto | null> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data: updatedProduct, error } = await supabase
    .from('productos')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating producto:', error.message);
    throw new Error('Failed to update producto.');
  }

  return updatedProduct;
};


// --- LOTES ---

export const getLotes = async (): Promise<Lote[]> => {
  const supabaseServer = createServerSupabaseClient();
  const { data, error } = await supabaseServer
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
   const supabaseServer = createServerSupabaseClient();
   const { data, error } = await supabaseServer
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

export const createLote = async (data: Omit<Lote, 'id' | 'estado' | 'id_operador' | 'productos'>): Promise<Lote> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to create lote.');

  const newLoteData = {
    ...data,
    id: uuidv4(),
    estado: 'En Incubación',
    id_operador: user.id,
  };

  const { data: newLote, error } = await supabase
    .from('lotes')
    .insert(newLoteData)
    .select()
    .single();

  if (error) {
    console.error('Error creating lote:', error.message);
    throw new Error('Failed to create lote.');
  }

  return newLote;
};

export const updateLote = async (id: string, data: Partial<Pick<Lote, 'estado' | 'incidencias'>>): Promise<Lote | null> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data: updatedLote, error } = await supabase
    .from('lotes')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating lote:', error.message);
    throw new Error('Failed to update lote.');
  }
  
  // This is a client-side call, so we can't use the server client.
  // We'll refetch using the standard client. It's better to reconstruct the object
  // if possible, but this will do for now.
  const { data: refetchedData } = await supabase.from('lotes').select('*, productos(*)').eq('id', id).single();
  return refetchedData;
};

export const deleteLote = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { error } = await supabase.from('lotes').delete().eq('id', id);

  if (error) {
    console.error('Error deleting lote:', error.message);
    throw new Error('Failed to delete lote.');
  }
};


// --- FORMULACIONES ---

export const getFormulaciones = async (): Promise<Formulacion[]> => {
  const supabaseServer = createServerSupabaseClient();
  const { data, error } = await supabaseServer.from('formulaciones').select('*').order('puntuacion', { ascending: false });
  if (error) {
    console.error('Error fetching formulaciones:', error.message);
    return [];
  }
  return data || [];
};

export const createFormulacion = async (data: Omit<Formulacion, 'id' | 'created_at' | 'id_operador'>): Promise<Formulacion> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to create formulation.');

  const newFormulacionData = {
    ...data,
    id: uuidv4(),
    id_operador: user.id,
  };

  const { data: newFormulacion, error } = await supabase
    .from('formulaciones')
    .insert(newFormulacionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating formulacion:', error.message);
    throw new Error('Failed to create formulacion.');
  }

  return newFormulacion;
};

export const updateFormulacion = async (id: string, data: Partial<Omit<Formulacion, 'id' | 'created_at' | 'id_operador'>>): Promise<Formulacion | null> => {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data: updatedFormulacion, error } = await supabase
    .from('formulaciones')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating formulacion:', error.message);
    throw new Error('Failed to update formulacion.');
  }

  return updatedFormulacion;
};
