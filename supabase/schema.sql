-- SooqRoot data layer: schema for a hosted Postgres database (Supabase compatible).
-- The application does not connect to this database today. It reads the same shapes
-- through the Repository interface in src/data/repository.ts, served by LocalRepository.
-- Nothing here is applied automatically.

create table if not exists farms (
  id                       text primary key,
  code                     text not null unique,
  name                     text not null,
  emirate                  text not null,
  region                   text not null,
  latitude                 double precision not null,
  longitude                double precision not null,
  growing_method           text not null,
  -- Facility capabilities
  has_cooling              boolean not null default false,
  has_ro_water             boolean not null default false,
  has_greenhouse           boolean not null default false,
  has_indoor               boolean not null default false,
  advance_only             boolean not null default false,
  min_lead_days            integer not null default 1,
  lab_clearance_pending    boolean not null default false,
  foreman_language         text not null default 'ar' check (foreman_language in ('ar', 'ur', 'en')),
  -- 0 to 100, weighted by method predictability in the commitment engine
  supply_confidence_score  numeric(5, 2) not null check (supply_confidence_score between 0 and 100),
  created_at               timestamptz not null default now()
);

create table if not exists harvest_windows (
  id             bigint generated always as identity primary key,
  farm_id        text not null references farms (id) on delete cascade,
  crop           text not null,
  grade          text not null check (grade in ('A', 'B', 'Mixed')),
  available_kg   numeric(12, 2) not null check (available_kg >= 0),
  window_start   date not null,
  window_end     date not null check (window_end >= window_start),
  -- true while the window belongs to a locked advance only crop cycle
  is_locked      boolean not null default false
);

create index if not exists harvest_windows_farm_idx on harvest_windows (farm_id);
create index if not exists harvest_windows_crop_idx on harvest_windows (crop, window_start);

create table if not exists allocations (
  id               bigint generated always as identity primary key,
  order_id         text not null,
  farm_id          text not null references farms (id),
  allocated_kg     numeric(12, 2) not null check (allocated_kg >= 0),
  status           text not null check (status in ('primary', 'backup', 'reallocated')),
  backup_farm_id   text references farms (id)
);

create index if not exists allocations_order_idx on allocations (order_id);

-- Row level security notes
-- 1. Enable row level security on all three tables before any client access.
-- 2. farms: a farm reads and updates only its own row (auth.uid() mapped to farms.id);
--    SooqRoot staff roles can read every row.
-- 3. harvest_windows: a farm inserts and updates windows for its own farm_id only.
--    Setting is_locked is restricted to staff roles.
-- 4. allocations: written by the commitment engine service role only. A farm reads
--    rows where farm_id or backup_farm_id is its own. A buyer reads rows for orders it owns.
-- 5. Public batch passports expose a read only view that omits buyer names.
alter table farms enable row level security;
alter table harvest_windows enable row level security;
alter table allocations enable row level security;
