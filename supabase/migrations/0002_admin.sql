-- ═══════════════════════════════════════════════════════════════
-- 0002_admin.sql — الأدمن: admins + admin_logs + notifications
-- Auth = Supabase Auth (يدير كلمات المرور بأمان).
-- جدول admins يربط auth.users بدور/ملف (لا نخزّن كلمة المرور بأنفسنا).
-- ═══════════════════════════════════════════════════════════════

-- 37. admins — ملف الأدمن + الدور (مرتبط بحساب Supabase Auth)
create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  role       text not null default 'admin' check (role in ('admin','super_admin')),
  is_active  boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

-- 38. admin_logs — سجل إجراءات الأدمن (تغيير حالة، حذف، ...)
create table if not exists public.admin_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.admins(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

-- 39. notifications — إشعارات داخل اللوحة (طلب جديد، حجز جديد، ...)
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid references public.admins(id) on delete cascade,
  type         text not null,
  title        text not null,
  message      text,
  is_read      boolean not null default false,
  related_type text,
  related_id   text,
  created_at   timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.admins        enable row level security;
alter table public.admin_logs    enable row level security;
alter table public.notifications enable row level security;

-- الأدمن يقرأ صفّه فقط (يحتاجه فحص الصلاحية server-side في layout الأدمن).
-- بقية العمليات تمرّ عبر service-role (يتجاوز RLS).
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row"
  on public.admins for select
  using (auth.uid() = id);

-- admin_logs + notifications: لا سياسات ⇒ service-role فقط.
