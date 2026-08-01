-- ═══════════════════════════════════════════════════════════════
-- 0005_analytics.sql — analytics_events (تتبّع الأحداث)
-- الإدراج عبر /api/track (service-role). لا وصول anon مباشر.
-- ═══════════════════════════════════════════════════════════════

-- 42. analytics_events
create table if not exists public.analytics_events (
  id           uuid primary key default gen_random_uuid(),
  event_type   text not null,   -- page_view | view_product | add_to_cart | begin_checkout | purchase | lead
  page         text,
  product_slug text,
  service_slug text,
  order_id     uuid references public.orders(id) on delete set null,
  value        numeric(10,2),   -- قيمة الحدث (₪) — للـ purchase مثلاً
  session_id   text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  created_at   timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_type_idx    on public.analytics_events(event_type);
create index if not exists analytics_events_source_idx  on public.analytics_events(utm_source);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.analytics_events enable row level security;
-- لا سياسات ⇒ service-role فقط (الإدراج عبر /api/track على السيرفر).
