-- ═══════════════════════════════════════════════════════════════
-- 0009_newsletter.sql — مشتركو النشرة البريدية
-- يُطبَّق بعد 0001–0008.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text,
  is_active       boolean not null default true,
  source          text,                 -- من أين اشترك (footer…)
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;
-- لا سياسات ⇒ service-role فقط (الاشتراك عبر /api/newsletter على السيرفر).
