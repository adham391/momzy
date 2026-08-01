-- ═══════════════════════════════════════════════════════════════
-- 0006_seed.sql — بيانات أولية (الإعدادات التشغيلية)
-- يُطبَّق بعد إنشاء الجداول. idempotent (on conflict do nothing).
-- ═══════════════════════════════════════════════════════════════

insert into public.settings (key, value, type, description) values
  ('shop_is_open',          'true', 'boolean', 'هل المتجر مفتوح للطلبات'),
  ('booking_is_open',       'true', 'boolean', 'هل الحجوزات مفتوحة'),
  ('default_shipping_cost', '35',   'number',  'رسوم الشحن الافتراضية (₪)'),
  ('free_shipping_min',     '0',    'number',  'حد الشحن المجاني (₪) — 0 = لا يوجد بعد'),
  ('whatsapp_number',       '',     'string',  'رقم واتساب هبة للإشعارات'),
  ('order_prefix',          'MZ-',  'string',  'بادئة رقم الطلب'),
  ('topbar_message',        '',     'string',  'رسالة الشريط العلوي (فارغ = استخدم Sanity)')
on conflict (key) do nothing;
