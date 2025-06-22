import { createClient, SupabaseClient } from '@supabase/supabase-js'
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

let supabase: SupabaseClient<Database> | null = null;
export let supabaseInitializationError: string | null = null;

let isValidUrl = false;
if (supabaseUrl) {
    try {
        new URL(supabaseUrl);
        isValidUrl = true;
    } catch(e) {
        isValidUrl = false;
    }
}

if (!isValidUrl || !supabaseAnonKey) {
    supabaseInitializationError = 'Supabase URL is invalid or Supabase Key is missing. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
} else {
    try {
        supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    } catch (error: any) {
        supabaseInitializationError = `Error initializing Supabase client: ${error.message}`;
        supabase = null;
    }
}

export { supabase };
