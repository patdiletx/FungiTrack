import type { Lote, Producto } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store
let productos: Producto[] = [
  {
    id: 'd9f2c54f-2d7c-4a3d-8e4a-5f6b8c7d9a1b',
    created_at: new Date().toISOString(),
    nombre: 'Kit de Inicio',
    peso_gr: 500,
    precio_clp: 4000,
    costo_variable_clp: 250,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    created_at: new Date().toISOString(),
    nombre: 'Bloque Productor XL',
    peso_gr: 3000,
    precio_clp: 14000,
    costo_variable_clp: 1500,
  },
];

let lotes: Lote[] = [
    {
        id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
        created_at: new Date('2025-06-20T10:00:00Z').toISOString(),
        id_producto: 'd9f2c54f-2d7c-4a3d-8e4a-5f6b8c7d9a1b',
        unidades_producidas: 50,
        estado: 'En Incubación',
        id_operador: 'mock-user-id',
        notas_sustrato: 'Mezcla estandar: 70% Viruta, 20% Alfalfa, 10% Salvado',
        incidencias: null
    }
];

const findProductoById = (id: string) => productos.find(p => p.id === id);

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MOCK API ---

export const getProductos = async (): Promise<Producto[]> => {
  await delay(100);
  return productos;
};

export const getLotes = async (): Promise<Lote[]> => {
  await delay(200);
  // Simulate join with productos
  return lotes.map(lote => ({
    ...lote,
    productos: findProductoById(lote.id_producto),
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getLoteById = async (id: string): Promise<Lote | null> => {
  await delay(150);
  const lote = lotes.find(l => l.id === id);
  if (!lote) return null;
  return {
    ...lote,
    productos: findProductoById(lote.id_producto),
  };
};

export const createLote = async (data: Omit<Lote, 'id' | 'created_at' | 'estado' | 'id_operador'>): Promise<Lote> => {
  await delay(300);
  const newLote: Lote = {
    ...data,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    estado: 'En Incubación',
    id_operador: 'mock-user-id', // Mocked user
  };
  lotes.push(newLote);
  return newLote;
};

export const updateLote = async (id: string, data: Partial<Pick<Lote, 'estado' | 'incidencias'>>): Promise<Lote | null> => {
  await delay(300);
  const loteIndex = lotes.findIndex(l => l.id === id);
  if (loteIndex === -1) return null;
  lotes[loteIndex] = { ...lotes[loteIndex], ...data };
  return getLoteById(id);
};
