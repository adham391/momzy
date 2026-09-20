-- ═══════════════════════════════════════════════════════════════
-- 0023_rate_limits.sql — حدّ لعدد المحاولات في النماذج العامة
--
-- بلا حدّ يستطيع أحدهم إغراق نموذج التواصل برسائل تصل لهبة، أو إنشاء
-- طلبات وحجوزات وهمية، أو تجربة أكواد كوبونات بالجملة.
-- العدّاد في القاعدة لا في ذاكرة الخادم: Vercel يشغّل نسخًا عدّة، وعدّاد
-- الذاكرة يبدأ من الصفر في كل نسخة.
--
-- hit_rate_limit(مفتاح, الحدّ, طول النافذة بالثواني) → true إن كان مسموحًا.
-- المفتاح: «اسم النموذج:عنوان IP». نافذة منزلقة بسيطة: أول محاولة تفتح
-- نافذة، وما بعدها يزيد العدّاد حتى تنتهي النافذة فيبدأ من جديد.
-- يُطبَّق بعد 0001–0022.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);

alter table public.rate_limits enable row level security;  -- لا سياسات: service-role فقط

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
as $$
declare
  current_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
                  when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
                  else r.count + 1
                end,
        window_start = case
                  when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
                  else r.window_start
                end
  returning count into current_count;

  return current_count <= p_limit;
end;
$$;

comment on table public.rate_limits is 'عدّاد محاولات النماذج العامة لكل عنوان IP — يُنظَّف يوميًا مع مهمة التذكيرات';
