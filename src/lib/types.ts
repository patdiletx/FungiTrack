export interface Producto {
  id: string;
  created_at: string;
  nombre: string;
  peso_gr: number;
  precio_clp: number;
  costo_variable_clp: number;
  spawn_rate_porcentaje?: number | null;
}

export interface Lote {
  id: string;
  created_at: string;
  id_producto: string;
  unidades_producidas: number;
  id_formulacion?: string | null;
  notas_sustrato?: string | null;
  estado: string;
  incidencias?: string | null;
  id_operador: string;
  productos?: Producto; // For joined queries
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
  // This will be stored as JSONB in the database
  ingredientes: Ingrediente[];
  puntuacion: number;
  humedad_objetivo_porcentaje?: number | null;
  notas?: string | null;
  id_operador: string;
}
