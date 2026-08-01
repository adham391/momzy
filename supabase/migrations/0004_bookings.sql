-- ═══════════════════════════════════════════════════════════════
-- 0004_bookings.sql — الحجوزات:
--   services + availability + bookings + booking_status_history
-- محتوى الخدمات (العرض) في Sanity؛ هذا الجدول تشغيلي (سعة/سعر/مدّة) للحجز.
-- ═══════════════════════════════════════════════════════════════

-- 23. services — تشغيلي (slug يطابق الخدمة في Sanity)
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  duration_minutes integer not null default 60,
  price            numeric(10,2) not null default 0,
  type             text not null default 'individual' check (type in ('individual','group')),
  max_capacity     integer not null default 1,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 25. availability — فتحات هبة (تاريخ/وقت)
create table if not exists public.availability (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  start_time   time not null,
  end_time     time not null,
  service_id   uuid references public.services(id) on delete cascade,  -- null = لأي خدمة
  is_blocked   boolean not null default false,
  block_reason text,
  notes        text,
  created_by   uuid references public.admins(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- تسلسل رقم الحجز: BK-01001, BK-01002, ...
create sequence if not exists public.booking_number_seq start 1001;

-- 27. bookings
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  booking_number text not null unique
                 default ('BK-' || lpad(nextval('public.booking_number_seq')::text, 5, '0')),

  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null,

  service_id      uuid references public.services(id) on delete set null,
  service_slug    text,   -- snapshot
  service_name    text,   -- snapshot
  availability_id uuid references public.availability(id) on delete set null,
  date            date not null,
  start_time      time not null,
  end_time        time,

  status         text not null default 'pending'
                 check (status in ('pending','confirmed','completed','cancelled')),
  payment_status text not null default 'pending'
                 check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text,
  payment_ref    text,
  amount         numeric(10,2) not null default 0,

  coupon_id       uuid references public.coupons(id) on delete set null,
  discount_amount numeric(10,2) not null default 0,

  utm_source   text,
  utm_medium   text,
  utm_campaign text,

  notes             text,
  admin_notes       text,
  reminder_24h_sent boolean not null default false,
  reminder_2h_sent  boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 28. booking_status_history
create table if not exists public.booking_status_history (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_status text,
  new_status text not null,
  note       text,
  changed_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now()
);

-- فهارس
create index if not exists availability_date_idx on public.availability(date);
create index if not exists bookings_date_idx     on public.bookings(date);
create index if not exists bookings_status_idx   on public.bookings(status);
create index if not exists bookings_service_idx  on public.bookings(service_id);

-- updated_at triggers
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.services               enable row level security;
alter table public.availability           enable row level security;
alter table public.bookings               enable row level security;
alter table public.booking_status_history enable row level security;

-- services + availability: قراءة عامة (تدفّق الحجز العام يعرض الفتحات المتاحة)
drop policy if exists "services public read" on public.services;
create policy "services public read"
  on public.services for select using (true);

drop policy if exists "availability public read" on public.availability;
create policy "availability public read"
  on public.availability for select using (true);

-- bookings + booking_status_history: service-role فقط (لا سياسات).
