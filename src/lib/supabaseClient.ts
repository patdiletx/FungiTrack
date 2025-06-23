import type { Lote, Producto, Formulacion, KitSettings, LoteSustrato } from './types';

// Specify the database schema for type safety
export type Database = {
  public: {
    Tables: {
      lotes: {
        Row: Lote;
        Insert: Omit<Lote, 'created_at' | 'productos' | 'kit_settings' | 'lotes_sustrato'>;
        Update: Partial<Omit<Lote, 'id' | 'created_at' | 'productos' | 'kit_settings' | 'lotes_sustrato'>>;
      };
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'created_at'>;
        Update: {
          nombre?: string;
          peso_gr?: number;
          precio_clp?: number;
          costo_variable_clp?: number;
          spawn_rate_porcentaje?: number | null;
          image_url?: string | null;
        };
      };
      formulaciones: {
        Row: Formulacion;
        Insert: Omit<Formulacion, 'created_at'>;
        Update: Partial<Omit<Formulacion, 'id' | 'created_at'>>;
      };
      kit_settings: {
        Row: KitSettings;
        Insert: Omit<KitSettings, 'id' | 'created_at'>;
        Update: Partial<Omit<KitSettings, 'id' | 'created_at'>>;
      };
      lotes_sustrato: {
        Row: LoteSustrato;
        Insert: Omit<LoteSustrato, 'id' | 'created_at' | 'formulaciones'>;
        Update: Partial<Omit<LoteSustrato, 'id' | 'created_at' | 'formulaciones'>>;
      }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};
