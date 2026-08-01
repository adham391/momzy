-- ═══════════════════════════════════════════════════════════════
-- 0001_helpers.sql — امتدادات ودوال مشتركة
-- يُطبَّق أولاً (قبل بقية ملفات الـ migrations — الباقي يعتمد عليه)
-- ═══════════════════════════════════════════════════════════════

-- توليد UUID (مدمج في PG13+، لكن نضمن توفّره صراحةً)
create extension if not exists pgcrypto;

-- دالة مشتركة: تحديث عمود updated_at تلقائياً عند كل UPDATE
-- تُستخدم عبر triggers في جداول orders / settings / services / bookings
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
