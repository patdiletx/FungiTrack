export interface Producto {
  id: string;
  created_at: string;
  nombre: string;
  peso_gr: number;
  precio_clp: number;
  costo_variable_clp: number;
}

export interface Lote {
  id: string;
  created_at: string;
  id_producto: string;
  unidades_producidas: number;
  notas_sustrato?: string | null;
  estado: string;
  incidencias?: string | null;
  id_operador: string;
  productos?: Producto; // For joined queries
}
