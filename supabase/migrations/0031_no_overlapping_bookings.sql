-- ═══════════════════════════════════════════════════════════════
-- 0031_no_overlapping_bookings.sql — هبة واحدة لا تُحجز مرّتين
--
-- الجلسات تُفتح متوازيةً في الساعة نفسها لخدمات عدّة (استشارة · زوم · لقاء
-- فردي) لتترك للأم حرية الاختيار، وهي بدائل لا مواعيد مستقلّة. كان `book_slot`
-- ينظر إلى صفّه وحده، فتسجّل أمّ في لقاء زوم 11:00–13:00 وتسجّل أخرى في
-- استشارة 11:00–12:00 — وهبة عند الاثنتين في الساعة نفسها.
--
-- الشرط هنا لا في الكود وحده: أمّان تضغطان «سجّلي» في اللحظة نفسها تمرّان من
-- أي فحص يسبق الكتابة، ولا يوقفهما إلا شرطٌ داخل العملية الذرّية نفسها.
--
-- ويكفي حجزٌ واحد ليشغل الوقت: ورشة سعتها خمسة وفيها أمّ واحدة تعني أن هبة
-- عندها. والمحجوبة تُحسب أيضًا — الحجز اليدوي يشغل هبة كغيره.
-- والتماس ليس تقاطعًا: جلسة تنتهي 12:00 وأخرى تبدأ 12:00 تجتمعان بلا تضارب.
--
-- يُطبَّق بعد 0001–0030، **وقبل إظهار جلسات متوازية للزبائن**.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.book_slot(slot_id uuid)
returns boolean
language plpgsql
as $$
declare
  ok boolean;
  target public.availability%rowtype;
begin
  select * into target from public.availability where id = slot_id;
  if not found then
    return false;
  end if;

  -- وقت هبة مأخوذ بجلسة أخرى تتقاطع معها وفيها حجز
  if exists (
    select 1
      from public.availability other
     where other.id <> target.id
       and other.date = target.date
       and other.booked_count > 0
       and other.start_time < coalesce(target.end_time, target.start_time)
       and coalesce(other.end_time, other.start_time) > target.start_time
  ) then
    return false;
  end if;

  update public.availability
     set booked_count = booked_count + 1
   where id = slot_id
     and is_blocked = false
     and booked_count < capacity
  returning true into ok;

  return coalesce(ok, false);
end;
$$;

comment on function public.book_slot(uuid) is
  'يحجز مقعدًا ذرّيًا: يرفض الجلسة الممتلئة أو المحجوبة، ويرفض كل جلسة يتقاطع وقتها مع جلسة أخرى فيها حجز (هبة واحدة)';
