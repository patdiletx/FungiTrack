import type { MycoMindOutput } from '@/ai/flows/myco-mind-flow';

export interface Producto {
  id: string;
  created_at: string;
  nombre: string;
  peso_gr: number;
  precio_clp: number;
  costo_variable_clp: number;
  spawn_rate_porcentaje?: number | null;
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
  id_formulacion?: string | null;
  notas_sustrato?: string | null;
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
