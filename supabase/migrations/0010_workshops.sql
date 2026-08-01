-- ═══════════════════════════════════════════════════════════
-- 0010_workshops.sql — نظام تسجيل الورشات
--   1. جدول قائمة الانتظار (عند اكتمال المقاعد)
--   2. بيانات الجلسة على الفتحة: رابط اللقاء (أونلاين) أو المكان (حضوري)
-- idempotent — آمن لإعادة التشغيل.
-- ═══════════════════════════════════════════════════════════

-- ── 1. قائمة الانتظار ──────────────────────────────────────
create table if not exists public.waitlist (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  -- الورشة المطلوبة (slug من Sanity) + اسمها لقطةً وقت التسجيل
  service_slug    text not null,
  service_name    text,
  -- الجلسة المحددة إن اختارتها (اختياري — قد تنتظر أي جلسة قادمة)
  availability_id uuid references public.availability(id) on delete set null,
  -- هل أُشعرت بتوفّر مكان؟
  is_notified     boolean not null default false,
  notified_at     timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ترتيب الانتظار حسب الأسبقية لكل ورشة
create index if not exists waitlist_service_idx
  on public.waitlist (service_slug, created_at asc);

-- منع تكرار نفس الشخص لنفس الورشة (البريد يُخزَّن lowercase من التطبيق)
create unique index if not exists waitlist_unique_idx
  on public.waitlist (service_slug, customer_email);

-- خاص بالسيرفر فقط (service-role) — لا سياسات لـ anon
alter table public.waitlist enable row level security;

-- ── 2. بيانات الجلسة على الفتحة ────────────────────────────
-- رابط اللقاء للورشات الأونلاين (يُرسل بعد تأكيد الدفع فقط)
alter table public.availability add column if not exists meeting_link text;
-- مكان اللقاء للورشات الحضورية (يتجاوز عنوان الخدمة إن وُجد)
alter table public.availability add column if not exists location text;
