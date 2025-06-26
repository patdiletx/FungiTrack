'use server';
import type { MycoMindOutput } from '@/ai/flows/myco-mind-flow';

export interface Producto {
  id: string;
  created_at: string;
  nombre: string;
  peso_gr: number;
  precio_clp: number;
  costo_variable_clp: number;
  spawn_rate_porcentaje?: number | null;
  image_url?: string | null;
}

export interface PhotoEntry {
  url: string;
  date: string;
}

export interface Kit {
  id: string;
  unit: number;
  name: string;
}

export interface NotificationSettings {
  enabled: boolean;
  watering: {
    enabled: boolean;
    time: string; // 'HH:mm'
  };
  aeration: {
    enabled: boolean;
    times: string[]; // ['HH:mm', 'HH:mm', ...]
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface KitSettings {
  id: string;
  lote_id: string;
  unit_index: number;
  created_at: string;
  coordinates: Coordinates | null;
  notification_settings: NotificationSettings | null;
  photo_history: PhotoEntry[] | null;
  last_ai_response: MycoMindOutput | null;
}

export interface Lote {
  id: string;
  created_at: string;
  id_producto: string;
  id_lote_sustrato?: string | null; // FK to lotes_sustrato
  unidades_producidas: number;
  estado: string;
  incidencias?: string | null;
  id_operador: string;
  productos?: Producto; // For joined queries
  lotes_sustrato?: LoteSustrato; // For joined queries
  kit_settings?: KitSettings[];
  dismissed_alerts?: string[] | null;
}

export interface Ingrediente {
  nombre: string;
  porcentaje: number;
}

export interface Formulacion {
  id: string;
  created_at: string;
  nombre: string;
  descripcion?: string | null;
  ingredientes: Ingrediente[];
  puntuacion: number;
  humedad_objetivo_porcentaje?: number | null;
  notas?: string | null;
  id_operador: string;
}

export interface LoteSustrato {
  id: string;
  created_at: string;
  id_formulacion: string;
  notas_sustrato?: string | null;
  peso_total_kg: number;
  id_operador: string;
  formulaciones?: Formulacion; // For joined queries
}

export interface CartItem extends Producto {
  quantity: number;
}

export interface ShippingInfo {
    nombreCompleto: string;
    email: string;
    rut: string;
    telefono: string;
    direccion: string;
    comuna: string;
    region: string;
}

export interface Order {
    id: string; // uuid, auto-generado por la BD
    created_at: string; // timestamp with time zone, auto-generado
    shipping_info: ShippingInfo; // jsonb
    items: CartItem[]; // jsonb
    subtotal: number; // numeric
    shipping_cost: number; // numeric
    total: number; // numeric
    status: string; // text, e.g., 'pending', 'paid', 'shipped', 'cancelled'
    user_id?: string | null; // uuid, references auth.users(id)
    payment_token?: string | null; // text, token de Flow
    error_log?: string | null; // text, para errores de pago u otros
    commerceOrder?: string | null; // text, ID de orden del comercio enviado a Flow
}

export interface CreatePaymentResponse {
  redirect_url?: string;
  token?: string;
  commerceOrder?: string;
  error?: string;
}

export interface DjangoPaymentPayload {
  amount: number;
  commerceOrder: string;
  subject: string;
  currency: string;
  return_url: string;
  shippingDetails: ShippingInfo;
  customer_email: string;
  discount_code_applied?: string;
  discount_amount_applied?: number;
}