'use server';

import type { Lote, Producto, Formulacion, KitSettings, LoteSustrato, Order, ShippingInfo, CartItem, CreatePaymentResponse, DjangoPaymentPayload } from './types';
import { v4 as uuidv4 } from 'uuid';
import { createClient as createSsrClient } from './supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const FLOW_API_URL = process.env.DJANGO_FLOW_API_URL || "https://django-flow-api.onrender.com";
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

export async function createPaymentOrder(
  cartItems: CartItem[],
  totalAmountToPay: number, 
  currency: string = 'CLP',
  shippingDetails: ShippingInfo,
  discountCodeApplied?: string,
  discountAmountApplied?: number
): Promise<CreatePaymentResponse> {
  if (cartItems.length === 0) {
    return { error: "Tu carrito está vacío." };
  }

  const commerceOrder = `FUNGIGROW-${Date.now()}`;
  let subject = `Pedido ${commerceOrder} FungiGrow (Envío a ${shippingDetails.region})`;
  if (discountCodeApplied) {
    subject += ` (Desc: ${discountCodeApplied})`;
  }
  
  const amount = Math.round(totalAmountToPay);

  if (amount < 0) {
     return { error: "El monto total no puede ser negativo."};
   }

  const fungifreshConfirmationUrl = `${NEXT_PUBLIC_APP_URL}/tienda/checkout/confirmation`;

  const payloadToDjango: DjangoPaymentPayload = {
    amount,
    commerceOrder,
    subject,
    currency,
    return_url: fungifreshConfirmationUrl,
    shippingDetails: shippingDetails,
    customer_email: shippingDetails.email,
    discount_code_applied: discountCodeApplied,
    discount_amount_applied: discountAmountApplied,
  };

  try {
    const response = await fetch(`${FLOW_API_URL}/api/create-payment/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadToDjango),
      cache: 'no-store',
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      let errorDetails = `Error API Django ${response.status}: ${response.statusText || 'Error desconocido'}`;
      try {
        const errorData = JSON.parse(responseBodyText);
        errorDetails = errorData.detail || errorData.error || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = `Error del servidor (${response.status}).`;
      }
      return { error: `Falló la creación del pago. ${errorDetails}` };
    }

    const responseData = JSON.parse(responseBodyText);

    if (!responseData.redirect_url) {
      return { error: "Falta URL de redirección desde el servidor de pagos." };
    }

    return {
      redirect_url: responseData.redirect_url,
      token: responseData.token,
      commerceOrder: commerceOrder,
    };

  } catch (error) {
    console.error("Error creating payment order:", error);
    return { error: `Falló la conexión con el servidor de pagos. Por favor, inténtelo de nuevo más tarde.` };
  }
}


// --- ORDERS ---
export const createOrder = async (
  shippingInfo: ShippingInfo,
  items: CartItem[],
  subtotal: number,
  shippingCost: number,
  total: number,
  paymentToken?: string,
  commerceOrder?: string
): Promise<Order | { error: string; details?: string }> => {
    // We must use the admin client to insert into the orders table as anonymous users
    // do not have insert permissions. This is a trusted server-side action.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Supabase URL or Service Role Key is not defined for admin client.');
        return { error: 'Server configuration error preventing order creation.' };
    }
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    );

    // This is a "pre-sale" record. The status is 'pending' until the payment gateway confirms.
    const orderToInsert = {
        shipping_info: shippingInfo,
        items: items,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
        status: 'pending', // Initial status for a pre-sale order
        user_id: null, // Public users are not logged in, so user_id is null
        payment_token: paymentToken,
        commerceOrder: commerceOrder,
    };

    try {
        const { data: createdOrder, error } = await supabaseAdmin
            .from('orders')
            .insert(orderToInsert)
            .select()
            .single();
        
        if (error) {
            console.error('Error creating order with admin client:', error);
            return { error: 'Failed to save pre-sale order to database.', details: error.message };
        }
        
        return createdOrder;

    } catch (e: any) {
        console.error('Unexpected error creating order:', e);
        return { error: 'An unexpected server error occurred.', details: e.message };
    }
}

export const updateOrderStatusFromFlow = async (
    commerceOrder: string, 
    flowStatus: string, 
    flowMessage?: string
): Promise<{ success: boolean; order?: Order; error?: string; details?: string }> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Supabase URL or Service Role Key is not defined for admin client in updateOrderStatusFromFlow.');
        return { success: false, error: 'Server configuration error for updating order status.' };
    }
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    );

    let newOrderStatus: Order['status'] = 'pending';
    if (flowStatus === 'PAID' || flowStatus === 'paid') {
        newOrderStatus = 'paid';
    } else if (flowStatus === 'REJECTED' || flowStatus === 'rejected') {
        newOrderStatus = 'cancelled';
    } else if (flowStatus === 'CANCELLED' || flowStatus === 'cancelled') {
        newOrderStatus = 'cancelled';
    } else if (flowStatus === 'PENDING_PAYMENT' || flowStatus === 'pending_payment' || flowStatus === 'pending') {
        newOrderStatus = 'pending';
    }

    const updatePayload: Partial<Order> = {
        status: newOrderStatus,
    };

    if (newOrderStatus !== 'paid' && flowMessage) {
        updatePayload.error_log = `Flow status: ${flowStatus}. Message: ${flowMessage}`;
    } else if (newOrderStatus !== 'paid') {
        updatePayload.error_log = `Flow status: ${flowStatus}.`;
    }

    try {
        const { data: updatedOrder, error } = await supabaseAdmin
            .from('orders')
            .update(updatePayload)
            .eq('commerceOrder', commerceOrder) 
            .select()
            .single();

        if (error) {
            console.error('Error updating order status from Flow with admin client:', error);
            return { success: false, error: 'Failed to update order status in database.', details: error.message };
        }

        if (!updatedOrder) {
            console.warn(`Order not found for commerceOrder: ${commerceOrder} during status update.`);
            return { success: false, error: 'Order not found for the given commerce order ID.' };
        }
        
        return { success: true, order: updatedOrder };

    } catch (e: any) {
        console.error('Unexpected error updating order status:', e);
        return { success: false, error: 'An unexpected error occurred while updating order status.', details: e.message };
    }
};

// --- PRODUCTOS ---

export const getProductByIdAction = async (id: string): Promise<Producto | null> => {
  const supabase = createSsrClient();
  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
  if (error) {
      console.error(`Error fetching product by id ${id}:`, error.message);
      return null;
  }
  return data;
};

export const createProducto = async (data: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> => {
  const supabase = createSsrClient();
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
  const supabase = createSsrClient();
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
   const supabase = createSsrClient();

   const { data: loteData, error: loteError } = await supabase
    .from('lotes')
    .select('*, productos(*), lotes_sustrato(*, formulaciones(*))')
    .eq('id', id)
    .single();

  if (loteError && loteError.code !== 'PGRST116') {
    console.error('Error fetching lote by id (action):', loteError.message);
    return null;
  }

  if (!loteData) {
    return null;
  }

  let settingsQuery = supabase
    .from('kit_settings')
    .select('*')
    .eq('lote_id', id);

  if (unitIndex) {
    settingsQuery = settingsQuery.eq('unit_index', unitIndex);
  }

  const { data: settingsData, error: settingsError } = await settingsQuery;

  if (settingsError) {
    console.error('Error fetching kit_settings by lote_id (action):', settingsError.message);
  }

  loteData.kit_settings = settingsData || [];

  return loteData;
}

export const createLote = async (data: Omit<Lote, 'id' | 'created_at' | 'estado' | 'id_operador' | 'productos' | 'incidencias' | 'kit_settings' | 'dismissed_alerts' | 'lotes_sustrato'>): Promise<Lote> => {
  const supabase = createSsrClient();
  
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
  const supabase = createSsrClient();
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
  const supabase = createSsrClient();
  const { error } = await supabase.from('lotes').delete().eq('id', id);
  if (error) throw new Error('Failed to delete lote: ' + error.message);
  revalidatePath('/panel');
  revalidatePath(`/panel/lote/${id}`);
};

export const dismissLoteAlertAction = async (loteId: string, reason: string): Promise<Lote | null> => {
  const supabase = createSsrClient();
  
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
  const supabase = createSsrClient();
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
  const supabase = createSsrClient();
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
    const supabase = createSsrClient();
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
    const supabase = createSsrClient();
    
    const { data, error } = await supabase
        .from('kit_settings')
        .upsert(
            { lote_id: loteId, unit_index: unitIndex, ...settings },
            { onConflict: 'lote_id,unit_index' }
        )
        .select()
        .single();
        
    if (error) {
        console.error('Failed to update kit settings:', error);
        throw new Error('Failed to update kit settings: ' + error.message);
    }
    
    revalidatePath(`/kit/${loteId}/${unitIndex}`);
    revalidatePath(`/panel/lote/${loteId}`);

    return data;
}
