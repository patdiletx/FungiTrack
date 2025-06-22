
'use server';

import type { Lote, Producto, Formulacion, KitSettings, LoteSustrato } from './types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

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

export const getLoteByIdAction = async (id: string, unitIndex?: number): Promise<Lote | null> => {
   const supabase = createClient();

   // Step 1: Fetch the main lote data and its related product
   const { data: loteData, error: loteError } = await supabase
    .from('lotes')
    .select('*, productos(*), lotes_sustrato(*, formulaciones(*))')
    .eq('id', id)
    .single();

  if (loteError && loteError.code !== 'PGRST116') { // PGRST116: row not found
    console.error('Error fetching lote by id (action):', loteError.message);
    return null;
  }

  if (!loteData) {
    return null;
  }

  // Step 2: Fetch the kit_settings for that lote separately
  let settingsQuery = supabase
    .from('kit_settings')
    .select('*')
    .eq('lote_id', id);

  if (unitIndex) {
    settingsQuery = settingsQuery.eq('unit_index', unitIndex);
  }

  const { data: settingsData, error: settingsError } = await settingsQuery;

  if (settingsError) {
    // Log the error but don't fail the whole request.
    // The public kit page can still function even if settings fail to load.
    console.error('Error fetching kit_settings by lote_id (action):', settingsError.message);
  }

  // Step 3: Manually attach the settings to the lote object
  loteData.kit_settings = settingsData || [];

  return loteData;
}

export const createLote = async (data: Omit<Lote, 'id' | 'created_at' | 'estado' | 'id_operador' | 'productos' | 'incidencias' | 'kit_settings' | 'dismissed_alerts' | 'lotes_sustrato' | 'id_formulacion' | 'notas_sustrato'>): Promise<Lote> => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to create lote.');

  const newLoteData = { ...data, id: uuidv4(), estado: 'En Incubación', id_operador: user.id };

  const { data: newLote, error } = await supabase
    .from('lotes')
    .insert(newLoteData)
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating lote:', error.message);
    throw new Error(`Error de base de datos: ${error.message}`);
  }

  revalidatePath('/panel');
  revalidatePath(`/panel/sustratos/${newLote.id_lote_sustrato}`);
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
  
  const { data: refetchedData } = await supabase.from('lotes').select('*, productos(*), lotes_sustrato(*)').eq('id', id).single();
  return refetchedData;
};

export const deleteLote = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('lotes').delete().eq('id', id);
  if (error) throw new Error('Failed to delete lote: ' + error.message);
  revalidatePath('/panel');
  revalidatePath(`/panel/lote/${id}`);
};

export const dismissLoteAlertAction = async (loteId: string, reason: string): Promise<Lote | null> => {
  const supabase = createClient();
  
  const { data: lote, error: fetchError } = await supabase
    .from('lotes')
    .select('dismissed_alerts')
    .eq('id', loteId)
    .single();

  if (fetchError || !lote) {
    console.error('Error fetching lote for dismissal:', fetchError);
    throw new Error('Could not fetch lote to dismiss alert.');
  }

  const currentAlerts = lote.dismissed_alerts || [];
  const newAlerts = [...new Set([...currentAlerts, reason])];

  const { data: updatedLote, error: updateError } = await supabase
    .from('lotes')
    .update({ dismissed_alerts: newAlerts })
    .eq('id', loteId)
    .select()
    .single();

  if (updateError) {
    console.error('Error dismissing alert:', updateError);
    throw new Error('Could not dismiss alert.');
  }

  revalidatePath('/panel');
  return updatedLote;
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

// --- LOTES DE SUSTRATO ---

export const createLoteSustrato = async (data: Omit<LoteSustrato, 'id' | 'created_at' | 'id_operador' | 'formulaciones'>): Promise<LoteSustrato> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated to create substrate lot.');

    const newLoteSustratoData = { ...data, id: uuidv4(), id_operador: user!.id };
    const { data: newLote, error } = await supabase
        .from('lotes_sustrato')
        .insert(newLoteSustratoData)
        .select()
        .single();
    
    if (error) {
        console.error('Supabase error creating substrate lot:', error.message);
        throw new Error(`Error de base de datos: ${error.message}`);
    }

    revalidatePath('/panel/sustratos');
    return newLote;
}

// --- KIT SETTINGS ---

export const updateKitSettingsAction = async (loteId: string, unitIndex: number, settings: Partial<Omit<KitSettings, 'id'|'created_at'|'lote_id'|'unit_index'>>): Promise<KitSettings | null> => {
    const supabase = createClient();
    
    // Use upsert to create or update settings for a kit.
    // We specify the columns that form the unique constraint.
    const { data, error } = await supabase
        .from('kit_settings')
        .upsert(
            { lote_id: loteId, unit_index: unitIndex, ...settings },
            { onConflict: 'lote_id,unit_index' } // Using column names
        )
        .select()
        .single();
        
    if (error) {
        console.error('Failed to update kit settings:', error);
        throw new Error('Failed to update kit settings: ' + error.message);
    }
    
    // Revalidate the public kit page so changes are reflected
    revalidatePath(`/kit/${loteId}/${unitIndex}`);
    // Revalidate the producer's lot detail page
    revalidatePath(`/panel/lote/${loteId}`);

    return data;
}
