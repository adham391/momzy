-- ═══════════════════════════════════════════════════════════════
-- 0008_order_address.sql — تفاصيل عنوان أدق للطلبات (احترافي)
-- يُطبَّق بعد 0001–0007.
-- ═══════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists customer_building    text,   -- طابق / شقة / مدخل
  add column if not exists customer_postal_code text;   -- الرمز البريدي (מיקוד)
