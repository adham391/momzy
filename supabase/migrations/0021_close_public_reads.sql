-- ═══════════════════════════════════════════════════════════════
-- 0021_close_public_reads.sql — إغلاق القراءة العامة لثلاثة جداول
--
-- المفتاح العام (anon) مكشوف في صفحات الموقع بطبيعته، وكانت سياسات
-- «public read» تسمح به بقراءة:
--   • settings      — رابط زوم الثابت (zoom_link) وعنوان اللقاء الحضوري
--                     (venue_address) وصناديق الإشعارات: من يعرف الطريقة
--                     يحصل على رابط اللقاء بلا دفع.
--   • availability  — رابط اللقاء (meeting_link) ومكانه (location) لكل جلسة.
--   • services      — جدول قديم (الخدمات في Sanity الآن).
--
-- الموقع لا يقرأ هذه الجداول بالمفتاح العام أصلًا: كل القراءة عبر
-- service-role في السيرفر (lib/db/*)، والجلسات تصل للعموم عبر
-- /api/availability بصيغة PublicSlot بلا رابط ولا مكان.
-- بعد الحذف: RLS مفعّل بلا سياسة للعموم ⇒ المفتاح العام يرى صفرًا.
-- يُطبَّق بعد 0001–0020.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "settings public read"     on public.settings;
drop policy if exists "availability public read" on public.availability;
drop policy if exists "services public read"     on public.services;
