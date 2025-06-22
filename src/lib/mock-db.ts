import type { Lote, Producto } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

// --- Supabase API ---

export const getProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching productos:', error.message);
    // In a real app, you might want to show a user-friendly error
    return []; 
  }
  return data || [];
};

export const createProducto = async (data: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> => {
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


export const getLotes = async (): Promise<Lote[]> => {
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

export const createLote = async (data: Omit<Lote, 'id' | 'created_at' | 'estado' | 'id_operador' | 'productos'>): Promise<Lote> => {
  const newLoteData = {
    ...data,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    estado: 'En Incubación',
    id_operador: 'mock-user-id', // Mocked user, would be replaced with real auth
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
  
  return getLoteById(id); // Refetch to get the joined data
};
