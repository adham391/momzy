-- ═══════════════════════════════════════════════════════════════
-- 0007_bookings_slots.sql — نظام الحجوزات (المرحلة 4)
-- يجعل فتحات availability ذاتية الاكتفاء (خدمة + سعة + عدّاد حجز)
-- + دوال حجز/تحرير ذرّية تمنع تجاوز السعة.
-- يُطبَّق بعد 0001–0006.
-- ═══════════════════════════════════════════════════════════════

-- حقول الحجز على availability (الفتحة = خدمة + وقت + سعة)
alter table public.availability
  add column if not exists service_slug  text,
  add column if not exists service_name  text,
  add column if not exists price         numeric(10,2) not null default 0,
  add column if not exists capacity      integer not null default 1,
  add column if not exists booked_count  integer not null default 0;

-- حجز فتحة ذرّياً — يعيد true إذا كان فيها متسع وغير محجوبة (يمنع overbooking)
create or replace function public.book_slot(slot_id uuid)
returns boolean
language plpgsql
as $$
declare ok boolean;
begin
  update public.availability
     set booked_count = booked_count + 1
   where id = slot_id
     and is_blocked = false
     and booked_count < capacity
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

-- تحرير فتحة (عند إلغاء حجز)
create or replace function public.unbook_slot(slot_id uuid)
returns void
language plpgsql
as $$
begin
  update public.availability
     set booked_count = greatest(0, booked_count - 1)
   where id = slot_id;
end;
$$;
