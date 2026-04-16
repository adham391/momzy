# CLAUDE.md — Momzy Platform
> آخر تحديث: أبريل 2026

---

## 🌸 نظرة عامة على المشروع

**Momzy** منصة رعاية أمومة تأسست من قِبل **هبة حسن** — ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة.

- **الدومين:** momzyworld.com
- **المطور والشريك التشغيلي:** ادهم (يدير كل ما يخص الموقع)
- **اللغة:** العربية RTL فقط
- **العملة:** شيكل إسرائيلي ₪ ILS
- **الجمهور:** أمهات في إسرائيل
- **الشراء:** مجهول كلياً — لا تسجيل دخول، لا حسابات للعملاء

---

## 🎨 المرجع البصري

> **إلزامي:** قبل بناء أي component أو صفحة، اقرأ الملفين التاليين أولاً:

- `reference/momzy-prototype.html` — الـ prototype الكامل للموقع
- `reference/assets/` — جميع الأصول (اللوقو والأيقونات)

### الأصول المتاحة
| الملف | الاستخدام |
|-------|-----------|
| `momzy-logo.png` | اللوقو الرسمي |
| `home-icon.png` | أيقونة الرئيسية في النافبار |
| `services-icon.png` | أيقونة الخدمات في النافبار |
| `shop-icon.png` | أيقونة المتجر في النافبار |
| `blog-icon.png` | أيقونة المقالات في النافبار |
| `about-icon.png` | أيقونة عن هبة في النافبار |
| `products-icon.png` | أيقونة المنتجات في الدروب داون |
| `books-icon.png` | أيقونة الكتيبات في الدروب داون |
| `record-icon.png` | أيقونة الورشات في الدروب داون |

**عند البناء:** انسخ الأصول إلى `public/icons/` و `public/images/`

---

## 🛠️ التقنيات (Tech Stack)

| الطبقة | التقنية |
|--------|---------|
| Framework | Next.js 16 App Router (Turbopack) |
| Styling | Tailwind CSS v4 |
| CMS | Sanity Studio v3 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin only) |
| Email | Resend |
| WhatsApp (هبة) | WhatsApp Business API / Twilio |
| Payments | HYP API (إسرائيل/فلسطين) |
| Hosting | Vercel |
| Analytics | Meta Pixel + Google Analytics 4 + GTM |

---

## 🎨 الهوية البصرية

```css
--rose:      #F2A7B5;
--roselt:    #F7C4CE;
--rosepale:  #FEF5F7;
--teal:      #82C9C4;
--tealpale:  #EFF8F8;
--yellow:    #F7DF98;
--yellowlt:  #FEFBF0;
--mint:      #A8D8D5;
--offwh:     #FDFAF5;
--cream:     #F8F4EE;
--dark:      #252220;
--mid:       #55504C;
--light:     #9A9490;
```

### الخطوط
- `Amiri` — العناوين الرئيسية (serif عربي)
- `Tajawal` — النصوص العامة
- `Nunito` — الأرقام والـ labels

---

## 📄 الصفحات المطلوبة

### صفحات عامة
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | Hero + آخر التحديثات + كل ما تحتاجينه + هبة + مقالات + تقييمات |
| المتجر | `/shop` | فلتر كاتيقوريز + شبكة منتجات |
| صفحة منتج | `/shop/[slug]` | صفحة مستقلة لكل منتج/صندوق |
| صفحة ورشة | `/workshops/[slug]` | صفحة مستقلة لكل ورشة |
| الخدمات | `/services` | خدمات هبة + نموذج حجز |
| المقالات | `/articles` | قائمة مقالات + فلتر تصنيفات |
| مقالة | `/articles/[slug]` | صفحة مقالة كاملة |
| عن هبة | `/about` | قصة Momzy + سيرة هبة |
| تواصل معنا | `/contact` | نموذج تواصل |
| سياسة الخصوصية | `/privacy` | النص القانوني |
| الشروط والأحكام | `/terms` | حقوق المحتوى + منع النشر |

### صفحات النظام
| الصفحة | المسار |
|--------|--------|
| تأكيد الطلب | `/order/[id]` |
| تأكيد الحجز | `/booking/[id]` |
| تحميل ملف رقمي | `/download/[token]` |
| 404 | `/not-found` |

---

## 🛍️ المنتجات والمحتوى

### أنواع المنتجات
1. **فيزيائي** — الصندوق (شحن داخل إسرائيل كاملة)
2. **رقمي** — كتيبات PDF (رابط تحميل آمن بتوكن، حد أقصى 5 تحميلات، صلاحية 7 أيام)
3. **ورشة مسجلة** — فيديو/رابط مشاهدة

### Sanity Schemas
```
product: name, slug, price, type, description, images, tags, digitalFile, stock
workshop: name, slug, price, date, capacity, description, coverImage, recordingUrl
article: title, slug, body, category, coverImage, publishedAt, author
service: name, description, duration, price, bookingEnabled
siteSettings: topBarMessage, socialLinks, contactInfo
```

---

## 💳 نظام الدفع — HYP API

- **مزود الدفع:** HYP (إسرائيل/فلسطين) — لا Stripe
- **العملة:** ILS ₪
- **تدفق الدفع:**
  1. العميل يضغط "اشتري الآن"
  2. يقبل سياسة الخصوصية والشروط (checkbox إجباري)
  3. يدخل بياناته (الاسم، الهاتف، الإيميل، العنوان)
  4. يُحوَّل لصفحة HYP
  5. بعد الدفع → webhook يحدّث Supabase
  6. إيميل تأكيد للعميل + واتساب إشعار لهبة

---

## 📦 نظام الشحن

- **النطاق:** إسرائيل كاملة
- **الشركة:** محلية — رقم التتبع يُدخل يدوياً من الأدمن
- **الحالات:** pending → confirmed → shipped → delivered
- **لا حساب مطلوب** — شراء مجهول مباشر
- **إجباري:** قبول سياسة الخصوصية قبل الشراء

---

## 📱 نظام الحجوزات

- العميل يختار الخدمة → يرى المواعيد → يحجز → يدفع
- هبة تحدد إتاحتها شهرياً من الأدمن
- النظام يبلوك التعارضات تلقائياً
- واتساب فوري لهبة + إيميل للعميل عند كل حجز
- تذكير للعميل قبل 24 ساعة و2 ساعة

---

## 🔐 حماية المحتوى الرقمي

- روابط تحميل بـ token فريد
- حد أقصى 5 تحميلات — صلاحية 7 أيام
- شروط قانونية: لا نشر أو توزيع بدون إذن هبة

---

## 📧 الإشعارات التلقائية

| الحدث | المستلم | القناة |
|-------|---------|--------|
| طلب جديد | هبة | واتساب فوري |
| حجز جديد | هبة | واتساب فوري |
| تأكيد الطلب | العميل | إيميل |
| تأكيد الحجز | العميل | إيميل |
| رابط تحميل | العميل (رقمي) | إيميل |
| تذكير الحجز | العميل | إيميل قبل 24 ساعة |
| تذكير الحجز | العميل | إيميل قبل 2 ساعة |

---

## 📊 أدوات التتبع

- Meta Pixel: ViewContent, AddToCart, InitiateCheckout, Purchase, Lead
- Google Analytics 4
- Google Tag Manager

---

## 🗄️ قاعدة البيانات — 45 جدول

> لا يوجد جدول customers — الشراء مجهول كلياً.
> بيانات العميل تُحفظ مباشرة في orders و bookings.

### المتجر (15 جدول)

**01. products**
id, name, name_en, description, price, compare_price, cost_price,
category_id, type(physical/digital/workshop), image_url, badge,
in_stock, stock_count, file_url, file_size, file_type,
weight, is_active, sort_order, seo_title, seo_description, og_image,
created_at, updated_at

**02. product_images**
id, product_id, image_url, alt_text, sort_order, is_primary, created_at

**03. categories**
id, name, name_en, description, icon, image_url, slug,
is_active, sort_order, created_at

**04. tags**
id, name, slug, created_at

**05. product_tags**
id, product_id, tag_id — UNIQUE(product_id, tag_id)

**06. orders**
id, order_number(MZ-00123),
customer_name, customer_email, customer_phone, customer_address, customer_city,
subtotal, shipping_cost, discount_amount, total_amount,
coupon_id, payment_status, payment_method, payment_ref, order_status,
shipping_company, tracking_number, shipping_zone_id,
notes, admin_notes, created_at, updated_at

**07. order_items**
id, order_id, product_id, product_name, product_type,
quantity, unit_price, total_price

**08. order_status_history**
id, order_id, old_status, new_status, note, changed_by, created_at

**09. digital_downloads**
id, order_id, product_id, customer_email, download_token,
download_url, expires_at, download_count, max_downloads(5),
whatsapp_notified, is_active, created_at

**10. shipping_updates**
id, order_id, status, note, location, updated_by, created_at

**11. shipping_zones**
id, name, cities[], shipping_cost, estimated_days, is_active, created_at

**12. cart_sessions**
id, session_token, items(jsonb), expires_at, created_at, updated_at

**13. payment_logs**
id, order_id, payment_method, amount, currency, status, payment_ref,
gateway_response(jsonb), error_message, created_at

**14. refunds**
id, order_id, amount, reason, status, refund_ref,
requested_by, processed_by, requested_at, processed_at, notes

**15. coupons**
id, code, description, type(percentage/fixed), value,
min_order_amount, max_uses, used_count, is_active, expires_at,
created_by, created_at

### العملاء (6 جداول — بدون customers)

**16. reviews**
id, customer_name, customer_email,
product_id(null إذا خدمة), booking_id(null إذا منتج),
rating(1-5), comment, is_approved, is_featured, created_at

**17. testimonials**
id, customer_name, customer_info, content, rating, image_url,
is_active, sort_order, source, created_at

**18. contact_messages**
id, name, email, phone, subject, message,
is_read, is_replied, replied_by, replied_at, created_at

**19. newsletter_subscribers**
id, email, name, is_active, source, subscribed_at, unsubscribed_at

**20. newsletter_campaigns**
id, title, subject, content, total_sent, total_opened,
status, scheduled_at, sent_at, created_by, created_at

**21. waitlist**
id, customer_email, customer_name, customer_phone,
workshop_id, product_id, is_notified, notified_at, created_at

### الحجوزات (10 جداول)

**22. service_categories**
id, name, description, icon, sort_order, is_active, created_at

**23. services**
id, name, description, category_id, duration_minutes, price,
type(individual/group), max_capacity, is_active, sort_order,
seo_title, seo_description, created_at, updated_at

**24. service_images**
id, service_id, image_url, alt_text, sort_order, is_primary, created_at

**25. availability**
id, date, start_time, end_time, is_blocked, block_reason,
is_recurring, recurrence_rule, recurrence_end, notes, created_by, created_at

**26. availability_exceptions**
id, availability_id, date, reason, created_at

**27. bookings**
id, booking_number(BK-00123),
customer_name, customer_email, customer_phone,
service_id, availability_id, date, start_time, end_time,
status, payment_status, payment_method, payment_ref,
amount, coupon_id, discount_amount, notes, admin_notes,
reminder_24h_sent, reminder_2h_sent, created_at, updated_at

**28. booking_status_history**
id, booking_id, old_status, new_status, note, changed_by, created_at

**29. booking_reminders**
id, booking_id, type(24h/2h/follow_up), sent_at, success, error_message

**30. workshops**
id, service_id, availability_id, date, start_time, end_time,
max_capacity, current_bookings, is_full, is_active, notes, created_at

**31. workshop_bookings**
id, workshop_id, booking_id — UNIQUE(workshop_id, booking_id)

### المحتوى (5 جداول)

**32. articles**
id, title, slug, content, excerpt, category, image_url, read_time,
is_published, published_at, is_featured, views_count, created_by,
seo_title, seo_description, og_image, created_at, updated_at

**33. article_tags**
id, article_id, tag_id — UNIQUE(article_id, tag_id)

**34. faq**
id, question, answer, category, related_id, sort_order, is_active, created_at

**35. promo_banners**
id, title, subtitle, image_url, link_url, button_text,
position, is_active, starts_at, ends_at, sort_order, created_by, created_at

**36. media_library**
id, file_name, file_url, file_type, file_size, alt_text, uploaded_by, created_at

### الأدمن (6 جداول)

**37. admins**
id, name, email, password_hash, role(admin/super_admin),
is_active, last_login, created_at

**38. admin_logs**
id, admin_id, action, entity_type, entity_id,
old_value(jsonb), new_value(jsonb), ip_address, created_at

**39. notifications**
id, admin_id, type, title, message, is_read,
related_type, related_id, created_at

**40. settings**
id, key, value, type, description, updated_by, updated_at
-- keys: site_name, contact_email, whatsapp_number,
--       free_shipping_min, default_shipping_cost,
--       shop_is_open, booking_is_open, instagram_url,
--       order_prefix, whatsapp_notifications_enabled

**41. email_logs**
id, type, to_email, subject, status, error_message,
related_type, related_id, sent_at

**42. analytics_events**
id, event_type, page, product_id, service_id, session_id, created_at

### SEO (2 جدول)

**43. seo_settings**
id, site_name, site_description, og_image,
google_analytics, google_search_console, facebook_pixel,
updated_by, updated_at

**44. pages_seo**
id, page_key(home/shop/articles/services/about),
seo_title, seo_description, og_image, updated_by, updated_at

### أخرى (1 جدول)

**45. currencies**
id, code(ILS/USD/JOD), name, symbol(₪/$),
exchange_rate, is_default, is_active, updated_at

> المجموع: 45 جدول ✅

---

## 📁 هيكل المشروع

```
momzy/
├── app/
│   ├── layout.tsx                  ✅ Root layout — خطوط + dir="rtl"
│   ├── globals.css                 ✅ Tailwind v4 @theme + design tokens + keyframes
│   ├── (site)/
│   │   ├── layout.tsx              ✅ Site layout — TopBar + Header + Footer
│   │   ├── page.tsx                ✅ الصفحة الرئيسية
│   │   ├── shop/
│   │   │   ├── page.tsx            ⬜ قيد البناء
│   │   │   └── [slug]/page.tsx     ⬜ قيد البناء
│   │   ├── workshops/[slug]/page.tsx ⬜
│   │   ├── services/page.tsx       ⬜
│   │   ├── articles/
│   │   │   ├── page.tsx            ⬜
│   │   │   └── [slug]/page.tsx     ⬜
│   │   ├── about/page.tsx          ⬜
│   │   ├── contact/page.tsx        ⬜
│   │   ├── privacy/page.tsx        ⬜
│   │   └── terms/page.tsx          ⬜
│   ├── (admin)/admin/              ⬜
│   └── api/
│       ├── hyp/webhook/            ⬜
│       ├── orders/                 ⬜
│       ├── bookings/               ⬜
│       └── download/[token]/       ⬜
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx              ✅ شريط teal + badge وردي نابض
│   │   ├── Header.tsx              ✅ لوقو + ناف + سلة
│   │   ├── MegaMenu.tsx            ✅ قائمة المتجر المنسدلة
│   │   ├── MobileMenu.tsx          ✅ قائمة موبايل
│   │   └── Footer.tsx              ✅ 4 أعمدة + سوشال + حقوق
│   ├── home/
│   │   ├── HeroSection.tsx         ✅ gradient وردي + دوائر + أزرار CTA
│   │   ├── LatestSection.tsx       ✅ كاردات منتجات + dot pattern
│   │   ├── LatestBigCardBody.tsx   ✅ محتوى الكارد الكبير
│   │   ├── OfferSection.tsx        ✅ 3 كاردات ملونة
│   │   ├── HebaSection.tsx         ✅ صورة هبة + خدمات
│   │   ├── ArticlesSection.tsx     ✅ 3 مقالات preview
│   │   └── ReviewsSection.tsx      ✅ 4 تقييمات gradient
│   ├── shop/                       ⬜ قيد البناء
│   ├── booking/                    ⬜ قيد البناء
│   └── ui/
│       ├── Button.tsx              ✅
│       ├── Chip.tsx                ✅
│       ├── Container.tsx           ✅
│       └── SectionLabel.tsx        ✅
├── lib/
│   ├── sanity/
│   │   ├── client.ts               ✅
│   │   └── image.ts                ✅
│   ├── supabase/
│   │   ├── client.ts               ✅
│   │   └── server.ts               ✅
│   ├── hyp/                        ⬜
│   ├── resend/                     ⬜
│   └── utils/
│       ├── cn.ts                   ✅
│       └── constants.ts            ✅ بيانات static للهوم بيج
├── sanity/
│   ├── schemas/                    ⬜
│   └── studio/                     ⬜
├── reference/
│   ├── momzy-prototype.html        المرجع البصري الإلزامي
│   └── assets/
├── public/
│   ├── icons/
│   └── images/
└── CLAUDE.md
```

---

## ⚙️ متغيرات البيئة (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# HYP Payment
HYP_MERCHANT_ID=
HYP_API_KEY=
HYP_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@momzyworld.com

# WhatsApp
WHATSAPP_API_TOKEN=
HEBA_WHATSAPP_NUMBER=+972XXXXXXXXX

# Analytics
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_ID=

# App
NEXT_PUBLIC_SITE_URL=https://momzyworld.com
```

---

## 🚀 ترتيب البناء

```
المرحلة 1 — الأساس ✅ مكتملة
  ✅ تثبيت المكتبات (Supabase, Sanity, lucide-react)
  ✅ إعداد Tailwind v4 بالألوان والتوكنات
  ✅ Layout (TopBar, Header, MegaMenu, MobileMenu, Footer)
  ✅ الصفحة الرئيسية الكاملة (6 أقسام)
  □ صفحة المتجر + كاردات  ← الخطوة التالية

المرحلة 2 — المتجر (الأسبوع 2-3)
  □ صفحة منتج مستقلة
  □ نظام السلة
  □ نموذج الشراء + قبول الشروط
  □ دمج HYP
  □ نظام التحميل الرقمي

المرحلة 3 — الحجوزات (الأسبوع 3-4)
  □ صفحة الخدمات
  □ نظام المواعيد
  □ نموذج الحجز + الدفع
  □ Resend + Twilio WhatsApp

المرحلة 4 — المحتوى (الأسبوع 4-5)
  □ المقالات
  □ صفحات الورشات
  □ عن هبة + تواصل
  □ سياسة الخصوصية + الشروط

المرحلة 5 — الإطلاق (الأسبوع 5-6)
  □ لوحة الأدمن
  □ إنشاء جداول Supabase
  □ Meta Pixel + GA4 + GTM
  □ اختبار كامل
  □ إطلاق على Vercel
```

---

## 🌊 نمط التصميم — الأقسام المتداخلة

كل قسم في الصفحة الرئيسية يتداخل مع السابق عبر:

```tsx
// البنية المعيارية لكل section (ما عدا HeroSection)
<section className="relative" style={{ marginTop: -40, zIndex: N }}>

  {/* موجة علوية — لون القسم الحالي يغطي نهاية القسم السابق */}
  <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
       style={{ display: "block", width: "100%", height: 40 }} aria-hidden="true">
    <path d="M0,20 C480,0 960,0 1440,20 L1440,40 L0,40 Z" fill="SECTION_COLOR" />
  </svg>

  {/* محتوى القسم — لا background على <section> نفسه */}
  <div className="bg-SECTION_COLOR" style={{ marginTop: -1, paddingTop: 16, paddingBottom: 60 }}>
    {/* المحتوى */}
  </div>

</section>
```

| القسم | z-index | marginTop | لون الـ wave |
|-------|---------|-----------|-------------|
| HeroSection | 1 | — | gradient وردي |
| LatestSection | 2 | -40px | #F5F0EA |
| OfferSection | 3 | -40px | #FDFAF5 |
| HebaSection | 4 | — | #F8F4EE |
| ArticlesSection | 5 | -40px | #FDFAF5 |
| ReviewsSection | 6 | -40px | #F5D98E |

**قواعد مهمة:**
- `<section>` نفسه **بدون background-color** — وإلا يُغطي القسم السابق بحافة حادة
- الـ background يُوضع فقط على الـ `<div>` الداخلي
- `marginTop: -1` على الـ div الداخلي لمنع الـ gap بين الـ SVG والـ div
- الدوائر الديكورية داخل الـ div الداخلي (لا داخل `<section>`)

---

## 📋 قواعد البرمجة

- **المرجع البصري إلزامي** — اقرأ `reference/momzy-prototype.html` قبل أي component
- **الأصول** من `reference/assets/` — انسخها إلى `public/`
- **RTL دائماً** — `dir="rtl"` على كل المكونات
- **العربية أولاً** — كل النصوص بالعربية
- **Server Components** افتراضياً
- **لا `any`** في TypeScript
- **Tailwind v4** — `@theme inline {}` في globals.css، لا CSS مخصص إلا للـ keyframes
- **Mobile First**
- **لا تسجيل دخول للعملاء** — الشراء والحجز مجهول كلياً
- **Clean Code** — كل function هدف واحد، لا تتجاوز 150 سطر
- **تعليقات عربية** — كل section وfunction موثقة
- **أسماء واضحة** — تصف الوظيفة بالإنجليزي
- **لا magic numbers** — كل ثابت له اسم
- **فصل المسؤوليات** — UI / Logic / Data منفصلة
- **لا كود مكرر** — أي تكرار يصبح component
- **Types موثقة** — كل interface مشروحة

---

## 📞 معلومات المشروع

- **صاحبة المشروع:** هبة حسن
- **الموقع:** momzyworld.com
