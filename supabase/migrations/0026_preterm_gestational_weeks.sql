-- ═══════════════════════════════════════════════════════════════
-- 0026_preterm_gestational_weeks.sql — أسبوع ولادة الطفل الخديج
-- تُسأل عنه الأم في التسجيل وفي قائمة الانتظار للورشات ذات الفئة
-- العمرية: «هل وُلد قبل موعده؟» ثم أسبوع الولادة (الكاملة 40).
-- منه يُحسب **العمر المصحَّح**، وهو ما تُقاس به الفئة العمرية.
-- null = وُلد في موعده (أو ورشة بلا فئة عمرية) ⇒ بلا تصحيح.
-- يُطبَّق بعد 0001–0025، **وقبل نشر الكود** — التسجيل يكتب في العمودين.
-- ═══════════════════════════════════════════════════════════════

alter table public.bookings
  add column if not exists gestational_weeks smallint;

alter table public.waitlist
  add column if not exists gestational_weeks smallint;

comment on column public.bookings.gestational_weeks is
  'أسبوع الولادة للطفل الخديج (22–36) — منه العمر المصحَّح؛ null = وُلد في موعده';

comment on column public.waitlist.gestational_weeks is
  'أسبوع الولادة للطفل الخديج (22–36) — منه العمر المصحَّح؛ null = وُلد في موعده';
