'use server';

import type { Lote, Producto, Formulacion } from './types';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './supabaseClient';
import { revalidatePath } from 'next/cache';

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
                    cookieStore.set(name, value, options);
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set(name, '', options);
                },
            },
        }
    );
}

// --- PRODUCTOS ---

export const createProducto = async (data: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> => {
  const supabase = createClient();
  const newProductData = { ...data, id: uuidv4() };

  const { data: newProduct, error } = await supabase
    .from('productos')
    .insert(newProductData)
    .select()
    .single();

  if (error) throw new Error('Failed to create producto: ' + error.message);
  revalidatePath('/panel/productos');
  return newProduct;
};

export const updateProducto = async (id: string, data: Partial<Omit<Producto, 'id' | 'created_at'>>): Promise<Producto | null> => {
  const supabase = createClient();
  const { data: updatedProduct, error } = await supabase
    .from('productos')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Failed to update producto: ' + error.message);
  revalidatePath('/panel/productos');
  return updatedProduct;
};


// --- LOTES ---

export const getLoteByIdAction = async (id: string): Promise<Lote | null> => {
   const supabase = createClient();
   const { data, error } = await supabase
    .from('lotes')
    .select('*, productos(*)')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching lote by id:', error.message);
    return null;
  }
  return data;
}

export const createLote = async (data: Omit<Lote, 'id' | 'estado' | 'id_operador' | 'productos'>): Promise<Lote> => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to create lote.');

  const newLoteData = { ...data, id: uuidv4(), estado: 'En Incubación', id_operador: user.id };

  const { data: newLote, error } = await supabase
    .from('lotes')
    .insert(newLoteData)
    .select()
    .single();

  if (error) throw new Error('Failed to create lote: ' + error.message);
  revalidatePath('/panel');
  return newLote;
};

export const updateLote = async (id: string, data: Partial<Pick<Lote, 'estado' | 'incidencias'>>): Promise<Lote | null> => {
  const supabase = createClient();
  const { data: updatedLote, error } = await supabase
    .from('lotes')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error('Failed to update lote: ' + error.message);
  revalidatePath(`/panel/lote/${id}`);
  revalidatePath('/panel');
  
  const { data: refetchedData } = await supabase.from('lotes').select('*, productos(*)').eq('id', id).single();
  return refetchedData;
};

export const deleteLote = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('lotes').delete().eq('id', id);
  if (error) throw new Error('Failed to delete lote: ' + error.message);
  revalidatePath('/panel');
  revalidatePath(`/panel/lote/${id}`);
};


// --- FORMULACIONES ---

export const createFormulacion = async (data: Omit<Formulacion, 'id' | 'created_at' | 'id_operador'>): Promise<Formulacion> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to create formulation.');

  const newFormulacionData = { ...data, id: uuidv4(), id_operador: user.id };
  const { data: newFormulacion, error } = await supabase
    .from('formulaciones')
    .insert(newFormulacionData)
    .select()
    .single();

  if (error) throw new Error('Failed to create formulacion: ' + error.message);
  revalidatePath('/panel/formulaciones');
  return newFormulacion;
};

export const updateFormulacion = async (id: string, data: Partial<Omit<Formulacion, 'id' | 'created_at' | 'id_operador'>>): Promise<Formulacion | null> => {
  const supabase = createClient();
  const { data: updatedFormulacion, error } = await supabase
    .from('formulaciones')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Failed to update formulacion: ' + error.message);
  revalidatePath('/panel/formulaciones');
  return updatedFormulacion;
};
