-- ═══════════════════════════════════════════════════════════════
-- 0003_store.sql — المتجر:
--   settings + coupons + orders + order_items + order_status_history
-- ═══════════════════════════════════════════════════════════════

-- 40. settings — key/value (إعدادات تشغيلية يقرأها الموقع)
create table if not exists public.settings (
  key         text primary key,
  value       text,
  type        text not null default 'string' check (type in ('string','number','boolean')),
  description text,
  updated_by  uuid references public.admins(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- 15. coupons
create table if not exists public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  description      text,
  type             text not null check (type in ('percentage','fixed')),
  value            numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_uses         integer,        -- null = غير محدود
  used_count       integer not null default 0,
  is_active        boolean not null default true,
  expires_at       timestamptz,    -- null = لا تنتهي
  created_by       uuid references public.admins(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- تسلسل رقم الطلب: MZ-01001, MZ-01002, ... (يُولَّد server-side بواسطة DB)
create sequence if not exists public.order_number_seq start 1001;

-- 06. orders — الشراء مجهول، بيانات العميل تُحفظ مع الطلب
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique
               default ('MZ-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),

  -- بيانات العميل
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  customer_address text not null,
  customer_city    text not null,

  -- المبالغ (₪)
  subtotal        numeric(10,2) not null default 0,
  shipping_cost   numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_amount    numeric(10,2) not null default 0,

  -- الكوبون
  coupon_id   uuid references public.coupons(id) on delete set null,
  coupon_code text,

  -- الدفع (HYP لاحقاً — الطلب يُنشأ pending)
  payment_status text not null default 'pending'
                 check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text,
  payment_ref    text,

  -- حالة الطلب + الشحن
  order_status text not null default 'pending'
               check (order_status in ('pending','confirmed','shipped','delivered','cancelled')),
  shipping_company text,
  tracking_number  text,

  -- مصدر الزيارة (UTM) — للتحليلات
  utm_source   text,
  utm_medium   text,
  utm_campaign text,

  -- موافقات + ملاحظات
  has_marketing_consent boolean not null default false,
  notes       text,   -- ملاحظات العميل
  admin_notes text,   -- ملاحظات داخلية للأدمن

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 07. order_items — المنتج يعيش في Sanity ⇒ نحفظ slug + snapshot للاسم/السعر
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  product_type text not null default 'physical'
               check (product_type in ('physical','digital','workshop')),
  quantity     integer not null default 1 check (quantity > 0),
  unit_price   numeric(10,2) not null,
  total_price  numeric(10,2) not null,
  gift         jsonb,   -- خيارات الهدية (إن وُجدت)
  created_at   timestamptz not null default now()
);

-- 08. order_status_history — سجل تغيّر حالة الطلب
create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  note       text,
  changed_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now()
);

-- فهارس للاستعلامات الشائعة في اللوحة
create index if not exists orders_status_idx     on public.orders(order_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_email_idx      on public.orders(customer_email);
create index if not exists orders_phone_idx      on public.orders(customer_phone);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists coupons_code_idx      on public.coupons(code);

-- تحديث updated_at تلقائياً
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.settings             enable row level security;
alter table public.coupons              enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_status_history enable row level security;

-- settings: قراءة عامة (الموقع يحتاج shop_is_open + رسوم الشحن)
drop policy if exists "settings public read" on public.settings;
create policy "settings public read"
  on public.settings for select using (true);

-- coupons / orders / order_items / order_status_history:
-- لا سياسات ⇒ service-role فقط (كل الوصول عبر API routes على السيرفر).
