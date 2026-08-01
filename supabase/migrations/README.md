# Supabase Migrations — Momzy

ملفات SQL لإنشاء بنية قاعدة البيانات. **تُطبَّق يدوياً** من:
**Supabase Dashboard → SQL Editor → New query → الصق محتوى الملف → Run.**

## ترتيب التطبيق (مهم — التبعيات تعتمد عليه)

| # | الملف | المحتوى |
|---|-------|---------|
| 1 | `0001_helpers.sql`   | امتداد `pgcrypto` + دالة `set_updated_at()` |
| 2 | `0002_admin.sql`     | `admins` + `admin_logs` + `notifications` |
| 3 | `0003_store.sql`     | `settings` + `coupons` + `orders` + `order_items` + `order_status_history` |
| 4 | `0004_bookings.sql`  | `services` + `availability` + `bookings` + `booking_status_history` |
| 5 | `0005_analytics.sql` | `analytics_events` |
| 6 | `0006_seed.sql`      | إعدادات تشغيلية أولية (شحن 35₪، المتجر مفتوح…) |
| 7 | `0007_bookings_slots.sql` | حقول الحجز على `availability` (خدمة/سعة/عدّاد) + دوال `book_slot`/`unbook_slot` (المرحلة 4) |
| 8 | `0008_order_address.sql` | حقول عنوان أدق على `orders` (`customer_building` + `customer_postal_code`) |
| 9 | `0009_newsletter.sql` | جدول `newsletter_subscribers` (اشتراكات النشرة البريدية) |
| 10 | `0010_workshops.sql` | تسجيل الورشات: جدول `waitlist` + `meeting_link`/`location` على `availability` |

> كل الملفات **idempotent** (آمنة لإعادة التشغيل): `create table if not exists`،
> `drop policy if exists` قبل كل policy، و`on conflict do nothing` للبيانات.

## بعد تطبيق كل الملفات

أنشئ حسابات الأدمن الثلاثة (يتطلب `SUPABASE_SERVICE_ROLE_KEY` في `.env.local`):

```bash
npm run seed:admins
```

يُنشئ: `adham@momzyworld.com` (super_admin)، `heba@momzyworld.com`، `admin@momzyworld.com`
بكلمة مرور مؤقتة موحّدة (تُغيَّر بعد أول دخول).

## نموذج الأمان (RLS)

- **service-role فقط** (لا سياسات، الوصول عبر API routes على السيرفر):
  `orders`, `order_items`, `order_status_history`, `coupons`,
  `bookings`, `booking_status_history`, `analytics_events`,
  `admin_logs`, `notifications`.
- **قراءة عامة** (`select using (true)`): `settings`, `services`, `availability`
  — يحتاجها الموقع وتدفّق الحجز العام.
- **admins**: كل أدمن يقرأ صفّه فقط (لفحص الصلاحية)؛ الباقي service-role.

المفتاح `anon` عاجز عن قراءة الطلبات/الحجوزات مباشرةً — فقط المفتاح السرّي
(`SUPABASE_SERVICE_ROLE_KEY`) على السيرفر يصل إليها.
