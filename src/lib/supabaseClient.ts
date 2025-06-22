import { createClient } from '@supabase/supabase-js';
import type { Lote, Producto } from './types';

// Specify the database schema for type safety
export type Database = {
  public: {
    Tables: {
      lotes: {
        Row: Lote;
        Insert: Omit<Lote, 'id' | 'created_at' | 'productos'>;
        Update: Partial<Omit<Lote, 'id' | 'created_at' | 'productos'>>;
      };
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'id' | 'created_at'>;
        Update: Partial<Omit<Producto, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

try {
    new URL(supabaseUrl);
} catch (error) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Please check your .env.local file.`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
