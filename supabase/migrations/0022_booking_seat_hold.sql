-- ═══════════════════════════════════════════════════════════════
-- 0022_booking_seat_hold.sql — الحجز المؤقت للمقعد أثناء الدفع
--
-- التسجيل في ورشة مدفوعة يأخذ مقعدًا لـ3 دقائق فقط؛ إن لم يتم الدفع يتحرّر
-- تلقائيًا (lib/bookings/seatHold.ts). كان المقعد يبقى محجوزًا بلا نهاية.
--   • seat_held       — هل يُحسب لهذا الحجز مقعد في availability.booked_count
--   • hold_expires_at — انتهاء الحجز المؤقت (null = مقعد ثابت: مدفوع أو مجاني)
-- الحجوزات القائمة غير الملغاة تحجز مقاعدها فعلًا ← seat_held = true.
-- يُطبَّق بعد 0001–0021، **وقبل نشر الكود**.
-- ═══════════════════════════════════════════════════════════════

alter table public.bookings
  add column if not exists seat_held boolean not null default false,
  add column if not exists hold_expires_at timestamptz;

update public.bookings set seat_held = true where status <> 'cancelled';

create index if not exists bookings_seat_hold_idx
  on public.bookings (hold_expires_at)
  where seat_held and payment_status <> 'paid';

comment on column public.bookings.seat_held is 'هل يُحسب لهذا الحجز مقعد في availability.booked_count';
comment on column public.bookings.hold_expires_at is 'انتهاء الحجز المؤقت أثناء الدفع — null لمقعد ثابت';
