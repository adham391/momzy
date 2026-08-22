-- ═══════════════════════════════════════════════════════════════
-- 0012_digital_downloads.sql — روابط تحميل المنتجات الرقمية (كتيبات PDF)
-- توكن فريد لكل عنصر رقمي في الطلب: صلاحية محدودة + حد أقصى تحميلات.
-- الوصول عبر service-role فقط (RLS يمنع anon) — التسليم من /download/[token].
-- المستلِم = المشترية، أو مستلِمة الهدية (للهدايا الرقمية).
-- يُطبَّق بعد 0001–0011.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.digital_downloads (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_slug   text not null,
  product_name   text not null,
  customer_email text not null,             -- المستلِم (المشترية أو مستلِمة الهدية)
  token          text not null unique,      -- توكن التحميل الفريد
  expires_at     timestamptz not null,
  download_count integer not null default 0,
  max_downloads  integer not null default 5,
  is_gift        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists idx_digital_downloads_token on public.digital_downloads(token);
create index if not exists idx_digital_downloads_order on public.digital_downloads(order_id);

-- RLS: لا وصول لـ anon — كل العمليات عبر service-role (تتجاوز RLS على السيرفر)
alter table public.digital_downloads enable row level security;
