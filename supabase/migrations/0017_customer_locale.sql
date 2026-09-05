-- ═══════════════════════════════════════════════════════════════
-- 0017_customer_locale.sql — لغة العميلة على الطلب والحجز
--
-- الموقع بثلاث لغات، لكن الإيميلات كانت عربية دائمًا: من طلبت بالعبرية
-- يصلها تأكيد عربي. اللغة كانت تُمرَّر إلى صفحة الدفع فقط ثم تُنسى، ومعظم
-- الإيميلات تُرسَل **بعد** الطلب (تأكيد الدفع · تسليم الكتيب · تذكير
-- المتروك) فلا سبيل لمعرفتها حينها إلا بحفظها.
--
-- null = طلب قديم قبل هذه الهجرة ⇒ يُعامَل بالعربية (الافتراضي).
-- يُطبَّق بعد 0001–0016.
-- ═══════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists locale text;

alter table public.bookings
  add column if not exists locale text;

-- لا نستعمل enum: إضافة لغة رابعة مستقبلًا لا ينبغي أن تحتاج هجرة نوع
alter table public.orders
  drop constraint if exists orders_locale_check;
alter table public.orders
  add constraint orders_locale_check
  check (locale is null or locale in ('ar', 'he', 'en'));

alter table public.bookings
  drop constraint if exists bookings_locale_check;
alter table public.bookings
  add constraint bookings_locale_check
  check (locale is null or locale in ('ar', 'he', 'en'));
