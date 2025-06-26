-- FungiGrow AI - Supabase Initialization Script
-- Este script crea todas las tablas necesarias para la aplicación.
-- Para ejecutarlo: ve a tu proyecto en Supabase -> SQL Editor -> New query y pega todo el contenido.

-- Habilita la extensión para generar UUIDs si no está habilitada.
create extension if not exists "uuid-ossp" with schema extensions;

-- 1. Tabla de PRODUCTOS
-- Almacena los productos finales que se venden en la tienda.
create table public.productos (
  id uuid primary key default extensions.uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  nombre text not null,
  peso_gr integer not null,
  precio_clp integer not null,
  costo_variable_clp integer not null,
  spawn_rate_porcentaje numeric,
  image_url text
);
comment on table public.productos is 'Productos finales para la venta, como kits de cultivo.';

-- Habilitar RLS y definir políticas para PRODUCTOS
alter table public.productos enable row level security;
create policy "Public products are viewable by everyone." on public.productos for select using (true);
create policy "Users can insert/update/delete products." on public.productos for all using (auth.role() = 'authenticated');


-- 2. Tabla de FORMULACIONES
-- Almacena las recetas para los sustratos base.
create table public.formulaciones (
  id uuid primary key default extensions.uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  nombre text not null,
  descripcion text,
  ingredientes jsonb not null,
  puntuacion integer not null,
  humedad_objetivo_porcentaje numeric,
  notas text,
  id_operador uuid not null references auth.users(id) on delete cascade
);
comment on table public.formulaciones is 'Recetas para la mezcla de sustratos base.';

-- Habilitar RLS y definir políticas para FORMULACIONES
alter table public.formulaciones enable row level security;
create policy "Users can manage formulations." on public.formulaciones for all using (auth.role() = 'authenticated');


-- 3. Tabla de LOTES_SUSTRATO
-- Almacena los lotes maestros de sustrato creados a partir de una formulación.
create table public.lotes_sustrato (
  id uuid primary key default extensions.uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  id_formulacion uuid not null references public.formulaciones(id),
  notas_sustrato text,
  peso_total_kg numeric not null,
  id_operador uuid not null references auth.users(id) on delete cascade
);
comment on table public.lotes_sustrato is 'Lotes maestros de sustrato base.';

-- Habilitar RLS y definir políticas para LOTES_SUSTRATO
alter table public.lotes_sustrato enable row level security;
create policy "Users can manage substrate lots." on public.lotes_sustrato for all using (auth.role() = 'authenticated');


-- 4. Tabla de LOTES
-- Almacena los lotes de producción finales, vinculados a un producto y un lote de sustrato.
create table public.lotes (
  id uuid primary key default extensions.uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  id_producto uuid not null references public.productos(id),
  id_lote_sustrato uuid references public.lotes_sustrato(id),
  unidades_producidas integer not null,
  estado text not null,
  incidencias text,
  id_operador uuid not null references auth.users(id) on delete cascade,
  dismissed_alerts text[]
);
comment on table public.lotes is 'Lotes de producción de kits listos para la venta.';

-- Habilitar RLS y definir políticas para LOTES
alter table public.lotes enable row level security;
create policy "Users can manage production lots." on public.lotes for all using (auth.role() = 'authenticated');


-- 5. Tabla de KIT_SETTINGS
-- Almacena la configuración y datos del usuario para cada kit individual.
create table public.kit_settings (
  id uuid primary key default extensions.uuid_generate_v4(),
  lote_id uuid not null references public.lotes(id) on delete cascade,
  unit_index integer not null,
  created_at timestamp with time zone not null default now(),
  coordinates jsonb,
  notification_settings jsonb,
  photo_history jsonb,
  last_ai_response jsonb,
  constraint kit_settings_lote_unit_unique unique (lote_id, unit_index)
);
comment on table public.kit_settings is 'Configuración y datos de interacción del usuario para cada kit.';

-- Habilitar RLS y definir políticas para KIT_SETTINGS
alter table public.kit_settings enable row level security;
create policy "Kit settings are publicly readable and writable." on public.kit_settings for all using (true);


-- 6. Tabla de ORDERS
-- Almacena los pedidos de la tienda online.
create table public.orders (
    id uuid primary key default extensions.uuid_generate_v4(),
    created_at timestamp with time zone not null default now(),
    shipping_info jsonb not null,
    items jsonb not null,
    subtotal numeric not null,
    shipping_cost numeric not null,
    total numeric not null,
    status text not null default 'pending',
    user_id uuid references auth.users(id),
    payment_token text,
    error_log text
);
comment on table public.orders is 'Pedidos generados desde la tienda online.';

-- Habilitar RLS y definir políticas para ORDERS
alter table public.orders enable row level security;
create policy "Operators can view all orders." on public.orders for select using (auth.role() = 'authenticated');
-- La inserción de pedidos se realiza con la service_role desde una server action, por lo que no se necesita una política de inserción.

-- FIN DEL SCRIPT
