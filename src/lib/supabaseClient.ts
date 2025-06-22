import type { Lote, Producto, Formulacion } from './types';

// Specify the database schema for type safety
export type Database = {
  public: {
    Tables: {
      lotes: {
        Row: Lote;
        Insert: Omit<Lote, 'created_at' | 'productos'>;
        Update: Partial<Omit<Lote, 'id' | 'created_at' | 'productos'>>;
      };
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'created_at'>;
        Update: Partial<Omit<Producto, 'id' | 'created_at'>>;
      };
      formulaciones: {
        Row: Formulacion;
        Insert: Omit<Formulacion, 'created_at'>;
        Update: Partial<Omit<Formulacion, 'id' | 'created_at'>>;
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
