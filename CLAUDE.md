# CLAUDE.md — Momzy Platform
> آخر تحديث: يوليو 2026 — Sanity CMS ✅ · لوحة أدمن `/admin` + Supabase backend ✅

---

## 🌸 نظرة عامة على المشروع

**Momzy** منصة رعاية أمومة تأسست من قِبل **هبة حسن** — ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة.

- **الدومين:** momzyworld.com
- **المطور والشريك التشغيلي:** ادهم (يدير كل ما يخص الموقع)
- **اللغة:** العربية RTL فقط
- **العملة:** شيكل إسرائيلي ₪ ILS
- **الجمهور:** أمهات في إسرائيل
- **الشراء:** مجهول كليًا — لا تسجيل دخول، لا حسابات للعملاء

---

## 🎨 المرجع البصري

> **إلزامي:** قبل بناء أي component أو صفحة، اقرأ الملفين التاليين أولًا:

- `reference/momzy-prototype.html` — الـ prototype الكامل للموقع
- `reference/assets/` — جميع الأصول (اللوقو والأيقونات)

### الأصول المتاحة
| الملف | الاستخدام |
|-------|-----------|
| `momzy-logo.png` | اللوقو الرسمي |
| `home-icon.png` | أيقونة الرئيسية في النافبار |
| `services-icon.png` | أيقونة الخدمات في النافبار + OfferSection |
| `shop-icon.png` | أيقونة المتجر في النافبار + MobileMenu |
| `blog-icon.png` | أيقونة المقالات في النافبار + OfferSection |
| `about-icon.png` | أيقونة عن هبة في النافبار + MobileMenu |
| `products-icon.png` | أيقونة المنتجات في الدروب داون + OfferSection |
| `books-icon.png` | أيقونة الكتيبات في الدروب داون |
| `record-icon.png` | أيقونة الورشات في الدروب داون |
| `cart-icon.png` | أيقونة السلة في CartSidebar |
| `lock-icon.png` | أيقونة دفع آمن في صفحة المنتج |
| `shipping-icon.png` | أيقونة شحن سريع في صفحة المنتج |

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
| WhatsApp (هبة) | Meta WhatsApp Cloud API (إشعارات هبة) |
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
| قراءة الكتيب الرقمي (flipbook) | `/read/[token]` — القديم `/download/[token]` يحوّل إليه |
| 404 | `/not-found` |

---

## 🛍️ المنتجات والمحتوى

### أنواع المنتجات
1. **فيزيائي** — الصندوق (شحن داخل إسرائيل كاملة)
2. **رقمي** — كتيبات تُقرأ على الموقع فقط بقارئ flipbook (`/read/[token]`) — لا تحميل PDF؛ التوكن لا ينتهي — قراءة غير محدودة مدى الحياة
3. **ورشة مسجلة** — فيديو/رابط مشاهدة

### Product Interface (constants.ts)
```ts
interface Product {
  id, slug, name, nameEn, category, type,
  price, comparePrice?,
  imageBg,        // class name: pi1–pi6
  imageUrl?,      // رابط الصورة من Sanity — TODO
  videoUrl?,      // رابط mp4 من Sanity — TODO
  badge?, shortDescription, fullDescription,
  tags, inStock, categoryLabel
}
```

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
- **الشركة:** محلية — رقم التتبع يُدخل يدويًا من الأدمن
- **الحالات:** pending → confirmed → shipped → delivered
- **لا حساب مطلوب** — شراء مجهول مباشر
- **إجباري:** قبول سياسة الخصوصية قبل الشراء

---

## 📱 نظام الحجوزات

- العميل يختار الخدمة → يرى المواعيد → يحجز → يدفع
- هبة تحدد إتاحتها شهريًا من الأدمن
- النظام يبلوك التعارضات تلقائيًا
- واتساب فوري لهبة + إيميل للعميل عند كل حجز
- تذكير للعميل قبل 24 ساعة و2 ساعة

---

## 🔐 حماية المحتوى الرقمي

- **قراءة على الموقع فقط (flipbook)** — لا رابط تحميل PDF إطلاقًا
- صفحات الكتيب صور WebP في bucket **خاص** على Supabase Storage (`booklets`) — تُبثّ حصرًا عبر `/api/booklet/[token]/[page]` بعد التحقق من توكن الشراء
- الرفع/التحديث: `npx tsx scripts/booklet-upload.ts "<pdf>" <slug>` (idempotent)
- فيديو المنتج: `npx tsx scripts/video-upload.ts "<video>" <slug>` — يضغط لـ1080 عموديًا (faststart) ويرفعه لـSanity ويربط `videoUrl`
- التوكن (جدول `digital_downloads`) **لا ينتهي** — قراءة غير محدودة العدد مدى الحياة (`expires_at = null`)
- القارئ: `components/booklet/FlipbookReader.tsx` (react-pageflip — تقليب RTL بعكس ترتيب الصفحات)
- شروط قانونية: لا نشر أو توزيع بدون إذن هبة

---

## 📧 الإشعارات التلقائية

| الحدث | المستلم | القناة |
|-------|---------|--------|
| تأكيد الطلب | العميل | إيميل |
| تأكيد الحجز | العميل | إيميل |
| رابط قراءة الكتيب | العميل (رقمي) | إيميل |
| تذكير الحجز — **يحمل رابط اللقاء/المكان** | العميل | إيميل في صباح اليوم السابق (Vercel Cron يومي → `/api/cron/reminders`) |
| جدول اليوم (الجلسات ومن ستحضر) | هبة | واتساب صباحًا مع الكرون نفسه — **ويسكت في اليوم بلا جلسات** |

---

## 📊 أدوات التتبع

- Meta Pixel (`lib/analytics/pixel.ts`): PageView مع كل تنقّل (السكربت يرسل الأولى وحدها) · ViewContent في صفحة المنتج · AddToCart من السلة · InitiateCheckout في `/checkout` · Purchase في صفحة التأكيد · Lead من نموذجي التواصل والنشرة. بلا `NEXT_PUBLIC_META_PIXEL_ID` لا يُحمَّل شيء ولا يُرسَل شيء.
- Google Analytics 4
- Google Tag Manager
- **لا تُحتسب زيارات المطوّر:** `isTrackedHost` في `lib/analytics/track.ts` يمنع التتبّع الداخلي (`/api/track`) وتحميل سكربتات Meta/GA/GTM على `localhost` والشبكة المحلية و`*.vercel.app` — مفاتيح الإنتاج في `.env.local`، فكان كل فحص محلي يظهر لهبة زائرةً ومشاهدةَ منتج.

---

## 🗄️ قاعدة البيانات — 45 جدول

> لا يوجد جدول customers — الشراء مجهول كليًا.
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
id, order_id, product_slug, product_name, customer_email, token,
expires_at (null = لا تنتهي), is_gift, created_at
-- توكن قراءة flipbook (لا تحميل)؛ download_count صار عدّاد مشاهدات للرصد،
-- و max_downloads عمود قديم غير مُستخدَم

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
--       free_shipping_min, default_shipping_cost, usd_rate,
--       shop_is_open, booking_is_open, instagram_url,
--       order_prefix, whatsapp_notifications_enabled,
--       notify_email_orders, notify_email_bookings,
--       notify_email_booklets, notify_email_contact
--         (صندوق لكل نوع إشعار؛ الفارغ يعود إلى RESEND_TO_EMAIL)

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
│   ├── globals.css                 ✅ Tailwind v4 @theme + design tokens + keyframes (wobble, wobble-light, pulse-ring) + `.pulse-badge`/`.pulse-badge-yellow` (نبض بحلقة ::after — transform/opacity فقط)
│   ├── studio/[[...tool]]/
│   │   ├── page.tsx                ✅ Server Component — يصدّر metadata/viewport من next-sanity/studio
│   │   └── StudioClient.tsx        ✅ Client Component — يعرض NextStudio (يحتاج "use client")
│   ├── (site)/
│   │   ├── layout.tsx              ✅ Site layout async — يجلب getSiteSettings() ويمرّرها لـ TopBar + Footer
│   │   ├── page.tsx                ✅ الصفحة الرئيسية
│   │   ├── shop/
│   │   │   ├── page.tsx            ✅ فلتر + شبكة منتجات
│   │   │   └── [slug]/page.tsx     ✅ صفحة منتج مستقلة
│   │   ├── checkout/
│   │   │   └── page.tsx            ✅ نموذج الشراء — بيانات التوصيل + قبول الشروط + ملخص الطلب
│   │   ├── order/
│   │   │   └── [id]/page.tsx       ✅ صفحة تأكيد الطلب — تقرأ من localStorage
│   │   ├── workshops/[slug]/page.tsx ⬜
│   │   ├── services/
│   │   │   ├── page.tsx            ✅ قسمان: ورشات جماعية + لقاءات فردية + CTA
│   │   │   └── [slug]/page.tsx     ✅ صفحة تفاصيل خدمة + BookingModal
│   │   ├── articles/
│   │   │   ├── page.tsx            ✅ هيدر + فلتر تصنيفات + شبكة بطاقات
│   │   │   └── [slug]/page.tsx     ✅ هيرو + غلاف + Portable Text + مصادر + مقترحة
│   │   ├── about/page.tsx          ✅ عن هبة حسن فقط — bio + خدمات + أرقام + CTA
│   │   ├── contact/page.tsx        ✅ نموذج تواصل — يرسل إيميل لهبة عبر Resend
│   │   ├── privacy/page.tsx        ✅ سياسة الخصوصية — 8 بنود
│   │   ├── terms/page.tsx          ✅ الشروط والأحكام — 9 بنود
│   │   └── not-available/page.tsx  ✅ صفحة الحجب الجغرافي — تظهر للدول المحظورة
│   ├── (admin)/admin/              ⬜
│   └── api/
│       ├── contact/route.ts        ✅ POST — validate + Resend إيميل لهبة + TODO Supabase
│       ├── hyp/webhook/            ⬜
│       ├── orders/                 ⬜
│       ├── bookings/               ⬜
│       └── download/[token]/       ⬜
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx              ✅ شريط teal + badge وردي نابض — يستقبل SiteSettingsTopBar من layout
│   │   ├── Header.tsx              ✅ لوقو + ناف + سلة
│   │   ├── MegaMenu.tsx            ✅ قائمة المتجر المنسدلة — روابط منتجات حقيقية
│   │   ├── MobileMenu.tsx          ✅ قائمة موبايل — accordion للمتجر + أيقونات صور + btn-wobble-light
│   │   └── Footer.tsx              ✅ 4 أعمدة + سوشال + حقوق — يستقبل SiteSettings من layout
│   ├── home/
│   │   ├── HeroSection.tsx         ✅ gradient وردي + دوائر + أزرار CTA + HeroStoryButton
│   │   ├── HeroStoryButton.tsx     ✅ زر "قصة Momzy" يفتح MomzyStoryModal
│   │   ├── LaunchBanner.tsx        ✅ بانر الإعلانات **تحت الهيرو** (قسم كامل في تسلسل الموجات: `zIndex: 2` وموجة `#F8F4EE`، فما بعده أُزيح +1) — يبني الشرائح من البيانات: خصم الصندوق (`compareAtPrice`) · الباقة (`BUNDLE_RULES`) · الشحن المجاني (`shippingInfo.freeShipping`). **ينتهي العرض في مصدره ⇒ تختفي شريحته**، وبلا عرض سارٍ يختفي البانر. **والشحن المجاني عرضُ افتتاح مؤقّت** (يعود بـ₪40 من `/admin/settings`): إزالة علامته في Studio تُسقط شريحته **وذكرَه في نصّ شريحة الصندوق** (`boxTextFreeShipping` ⟵ `boxText`) — يبقى على هبة تعديل «ملاحظات الشحن» في المنتج ونصّ الشريط العلوي، فهما نصّان كتبتهما بنفسها. عدد قطع الصندوق من `contents.length` لا رقمًا مكتوبًا، والمبالغ معزولة ثنائي الاتجاه (U+2066) كي تبقى ₪ قبل الرقم في الجملة العربية
│   │   ├── LaunchBannerCarousel.tsx ✅ واجهة البانر (client) — تبديل تلقائي كل 6ث + أسهم (تُخفى على الهاتف) + نقاط + سحب بالإصبع، ويتوقّف بمرور الفأرة أو التركيز ومع `prefers-reduced-motion`. **التوقّف بالفأرة فقط** (`pointerType === "mouse"`): اللمس يُطلق دخول المؤشّر بلا خروج، فكانت أول لمسة توقف التبديل للأبد. الشرائح كلّها في خانة الشبكة نفسها (ظهور بالشفافية و`inert` لغير الظاهرة) فارتفاع البانر ارتفاعُ أطولها ولا يقفز بين شريحة بسطرين وأخرى بسطر، وبكل لغة طول آخر. وشريحة الشحن تعرض **أيقونة الشحن في دائرة** لا صورة منتج (`imageKind: "icon"`) — هي لا تتكلّم عن منتج بل عن الشحن. **الصورة كاملة بلا قصّ** (`object-contain` بخلفية شفّافة يظهر منها تدرّج الشريحة) ومطلقة داخل عمودها — الصورة العادية بـ`h-full` تفرد ارتفاعها الأصلي فيطول البانر. النغمات (`TONES`): **زيتي** للصندوق (لون الصندوق نفسه في صورته) · تركوازي للباقة · وردي للشحن المجاني — ولون الإبراز في كل نغمة درجة غامقة لا الفاتحة من الهوية، لأنه يحمل نصًّا صغيرًا وخلفيةَ زرٍّ بنصّ أبيض
│   │   ├── MomzyStoryModal.tsx     ✅ modal قصة Momzy + القيم الأربع — Portal
│   │   ├── LatestSection.tsx       ✅ كاردات منتجات + badge نابض أصفر
│   │   ├── LatestBigCardBody.tsx   ✅ محتوى الكارد الكبير
│   │   ├── OfferSection.tsx        ✅ 3 كاردات ملونة + أيقونات صور
│   │   ├── HebaSection.tsx         ✅ صورة هبة + خدمات
│   │   ├── ArticlesSection.tsx     ✅ 3 مقالات preview
│   │   └── ReviewsSection.tsx      ✅ 4 تقييمات gradient
│   ├── shop/
│   │   ├── ShopHeader.tsx              ✅ هيدر المتجر + PageHeaderWave
│   │   ├── ShopFilters.tsx             ✅ Client wrapper — يطبّق category + search + sort
│   │   ├── FilterBar.tsx               ✅ category buttons + search input + sort dropdown
│   │   ├── ProductCard.tsx             ✅ كارد منتج جديد — mainImage + tags badges (rose/gold) + سعر بـ gold + شارة «شحن مجاني» بجانب شارة المنتج (من `shippingInfo.freeShipping`)
│   │   ├── ProductGrid.tsx             ✅ شبكة المنتجات
│   │   ├── ProductImagePlaceholder.tsx ✅ صورة بـ fallback gradient ذهبي + رمز Momzy
│   │   ├── RelatedProducts.tsx         ✅ Server async — getProducts() ويستثني المنتج الحالي
│   │   ├── QuantityInput.tsx           ✅ input الكمية
│   │   ├── AddToCartButton.tsx         ✅ زر إضافة للسلة
│   │   ├── CartSidebar.tsx             ✅ سلة جانبية — cart-icon + ألوان teal
│   │   ├── CartItemRow.tsx             ✅ صف منتج في السلة — mainImage + slug
│   │   ├── CartAddedModal.tsx          ✅ modal "أُضيف للسلة" + اقتراحات
│   │   ├── FloatingCartButton.tsx      ✅ زر السلة العائم
│   │   ├── Toast.tsx                   ✅ إشعار إضافة للسلة
│   │   └── product-detail/
│   │       ├── ProductPageLayout.tsx       ✅ المنسّق — يرتب 11 قسمًا، أقسام شرطية حسب البيانات
│   │       ├── ProductHero.tsx             ✅ Hero — صورة + tagline + سعر gold + CTAs forest/gold + 3 trust signals ديناميكية
│   │       ├── ProductGallery.tsx          ✅ Grid 2/3 cols + lightbox + دعم فيديو (videoUrl أول عنصر)
│   │       ├── ProductShortDescription.tsx ✅ نص شاعري وسط ivory
│   │       ├── ProductContents.tsx         ✅ "كل قطعةٍ جمعناها لكِ" — Grid بطاقات (client)، كل بطاقة تعرض سطرين + زر «المزيد/أقل» خاص بها (items-start فلا يمدّ توسّعُها الصفَّ)
│   │       ├── ProductStory.tsx            ✅ "من قلب هبة" — صورة دائرية + نص
│   │       ├── ProductGiftTargets.tsx      ✅ "لمين هاي الهدية؟" — 3 بطاقات للمُهدي
│   │       ├── ProductLongDescription.tsx  ✅ longDescription أو specifications أو fallback
│   │       ├── ProductTestimonials.tsx     ✅ شهادات بـ 5 نجوم — placeholders TODO
│   │       ├── ProductFAQ.tsx              ✅ accordion ذهبي
│   │       ├── ProductFinalCTA.tsx         ✅ خلفية forest dark + CTA ذهبي
│   │       └── ProductStickyMobileCTA.tsx  ✅ Sticky bar للجوال — يظهر بعد scroll 600px
│   ├── checkout/
│   │   ├── CheckoutClient.tsx      ✅ تدفّق مرحلي سلس (صفحة واحدة): التوصيل ↔ الدفع بلا انتقال + مزامنة ?order=
│   │   ├── CheckoutSteps.tsx       ✅ شريط تقدّم: التوصيل ← الدفع ← التأكيد (يُستخدم في /checkout و /order)
│   │   ├── CheckoutForm.tsx        ✅ نموذج التوصيل — onProceedToPayment (سلس) أو redirect /order/[id] (يدوي)
│   │   ├── EmbeddedPayment.tsx     ✅ iframe صفحة دفع HYP داخل الموقع + حالة تحميل + رجوع لتعديل التوصيل — ارتفاع الإطار بطول صفحة HYP كاملة (`HYP_PAGE_HEIGHT` — قِيست 1387px عند كل عرض) فلا تمرير داخل تمرير، وعرضها لا ينكمش تحت 367px فتُعرَض بـ`HYP_MIN_WIDTH`=380 وتُصغَّر بصريًّا (`transform: scale` بقياس `ResizeObserver`) على الهواتف الأضيق بدل أن تُقصّ حقولها، و`allow="payment 'src' https://pay.hyp.co.il"` + `allowpaymentrequest` شرطُ ظهور Google Pay داخل الإطار (نطاق HYP يُسمّى صراحةً لأن الإطار يُحوَّل إليه من `/api/hyp/retry`)، وتنبيه «افتحي في المتصفّح» لمن دخلت من متصفّح تطبيق (`lib/utils/inAppBrowser.ts`)
│   │   ├── TrustBadges.tsx         ✅ شارات الثقة — Visa/Mastercard/HYP + تشفير SSL
│   │   ├── CheckoutUpsell.tsx     ✅ منتجات مقترحة أسفل صفحة الدفع
│   │   └── OrderSummary.tsx        ✅ ملخص الطلب — عناصر + شحن + إجمالي (readOnly في مرحلة الدفع)
│   ├── booking/
│   │   ├── BookingHeader.tsx       ✅ حالة التسجيل — مؤكَّد/بانتظار الدفع/ملغى
│   │   ├── BookingDetailsCard.tsx  ✅ الورشة + «كيف أحضر؟» (الرابط/المكان يُكشفان قبل الموعد بيوم — كتذكير اليوم السابق) + بيانات المسجِّلة
│   │   └── BookingSummary.tsx      ✅ ملخّص جانبي وقت الدفع — نظير OrderSummary (بلا كشف الرابط/العنوان)
│   ├── order/
│   │   ├── OrderConfirmationClient.tsx ✅ حاوية صفحة التأكيد — loading/notFound/loaded
│   │   ├── OrderHeader.tsx         ✅ أيقونة نجاح + رقم الطلب (نسخ) + التاريخ
│   │   ├── OrderInfoCard.tsx       ✅ كاردا بيانات العميل وعنوان التوصيل
│   │   ├── OrderItemsList.tsx      ✅ عناصر الطلب — للقراءة + ملاحظة digital
│   │   ├── OrderTotals.tsx         ✅ المجموع/الشحن/الخصم/الإجمالي + شعار أمان
│   │   └── OrderActions.tsx        ✅ مواصلة التسوق + تواصلي معنا
│   ├── articles/
│   │   ├── ArticlesHeader.tsx      ✅ هيدر /articles — تدرّج تركوازي يميّز المكتبة عن المتجر
│   │   ├── ArticleFilters.tsx      ✅ Client — أزرار التصنيفات الموجودة فعلًا + الشبكة
│   │   ├── ArticleCard.tsx         ✅ بطاقة مقال — مكوّن أصمّ يستقبل النصوص مترجَمة
│   │   ├── ArticleCover.tsx        ✅ الغلاف — صورة، أو تدرّج التصنيف مع إيموجيه
│   │   ├── ArticleHero.tsx         ✅ رأس صفحة المقال + ArticleHeroCover المتداخل
│   │   ├── ArticleBody.tsx         ✅ Portable Text — قياسات مضبوطة للقراءة العربية الطويلة
│   │   ├── ArticleSources.tsx      ✅ صندوق المراجع (LTR داخل RTL) + تنبيه «تثقيف لا تشخيص»
│   │   └── RelatedArticles.tsx     ✅ «اقرئي أيضًا» — نفس التصنيف ثم الأحدث
│   ├── contact/
│   │   └── ContactForm.tsx         ✅ نموذج التواصل — validation + fetch /api/contact + شاشة نجاح
│   ├── booking/                    ⬜ قيد البناء
│   └── ui/
│       ├── Button.tsx              ✅
│       ├── Chip.tsx                ✅
│       ├── Container.tsx           ✅
│       ├── SectionLabel.tsx        ✅
│       ├── PageHeaderWave.tsx      ✅ موجة ناعمة في أسفل هيدر الصفحة (absolute)
│       ├── SectionWave.tsx         ✅ موجة فاصلة بين الأقسام (flowing) — height 60px
│       ├── PolkaDots.tsx           ✅
│       └── SectionsReveal.tsx      ✅
├── lib/
│   ├── articles/
│   │   ├── categories.ts           ✅ قائمة تصنيفات مغلقة + لون chip + غلاف احتياطي لكل تصنيف
│   │   └── labels.ts               ✅ getArticleLabeller — الموضع الوحيد الذي يصوغ «٥ دقائق للقراءة»
│   ├── products/
│   │   ├── types.ts                ✅ Product + ProductContent + ProductStory + ProductGiftTarget + ProductTestimonial + ProductFAQ + ProductShippingInfo + ProductSpecification + ProductFilters + ProductSort
│   │   ├── seed.ts                 ✅ SEED_PRODUCTS — صندوق مشوار أم فقط (fallback في dev حين لا يُرجع Sanity شيئًا)
│   │   ├── getProduct.ts           ✅ async getProduct(slug) — Sanity أولًا، seed fallback في dev حين لا يُرجع Sanity شيئًا
│   │   └── getProducts.ts          ✅ async getProducts(filters?) + getProductCategories() — Sanity أولًا، seed fallback في dev حين لا يُرجع Sanity شيئًا
│   ├── sanity/
│   │   ├── client.ts               ✅ sanityClient + sanityWriteClient + sanityFetch (ISR revalidate + try-catch)
│   │   ├── image.ts                ✅
│   │   └── queries/
│   │       ├── articles.ts         ✅ getArticles + getArticleBySlug + getRelatedArticles + getHomeArticles + readingMinutes
│   │       ├── products.ts         ✅ PRODUCT_FIELDS + getProductBySlug + getAllProducts + getAllProductSlugs + getProductCategories
│   │       └── siteSettings.ts     ✅ getSiteSettings — singleton مع DEFAULT_SETTINGS fallback
│   ├── supabase/
│   │   ├── client.ts               ✅
│   │   └── server.ts               ✅
│   ├── hyp/                        ⬜
│   ├── resend/
│   │   ├── i18n.ts                 ✅ ترجمة الإيميلات — تقرأ messages مباشرة (لا next-intl: الإرسال بلا سياق طلب)
│   │   ├── client.ts               ✅ Resend client + FROM_EMAIL + TO_EMAIL
│   │   └── emails/
│   │       └── contactEmail.ts     ✅ قالب إيميل التواصل HTML (RTL)
│   ├── store/
│   │   └── cart.ts                 ✅ Zustand cart store + persist — CartItem جديد (slug + mainImage)
│   └── utils/
│       ├── cn.ts                   ✅
│       ├── constants.ts            ✅ MEGA_CATEGORIES + MOBILE_NAV_ITEMS + OFFER_CARDS + REVIEWS + ARTICLE_PREVIEWS + FOOTER_COLUMNS (المنتجات انتقلت إلى lib/products/)
│       └── orders.ts               ✅ Order types + generateOrderNumber + saveOrder/getOrder (localStorage)
├── sanity/
│   └── schemas/
│       ├── index.ts                ✅ يجمع كل الـ schemas ويصدّرها كـ array
│       ├── product.ts              ✅ document — كل حقول Product (slug, title, price, images, video, story...)
│       ├── siteSettings.ts         ✅ document singleton — topBar + socialLinks + contact + footer
│       └── objects/
│           ├── productSpecification.ts  ✅ key + value
│           ├── productShippingInfo.ts   ✅ estimatedDays + freeShipping + notes
│           ├── productContent.ts        ✅ name + description + icon + image
│           ├── productGiftTarget.ts     ✅ label + text
│           ├── productTestimonial.ts    ✅ name + location + text + rating(1-5) + image
│           ├── productFAQ.ts            ✅ question + answer
│           └── productStory.ts          ✅ title + paragraphs[] + image
├── scripts/
│   ├── migrate-seed-to-sanity.ts   ✅ يرفع seed products لـ Sanity — idempotent، يُشغَّل مرة واحدة
│   ├── seed-articles.ts            ✅ يرفع كل المقالات (أو واحدًا بالاسم) — idempotent
│   └── articles/
│       ├── builders.ts             ✅ أدوات Portable Text + seedArticle — المقال الجديد ملفّ محتوى فقط؛ يُبقي تاريخ النشر والغلاف الموجودين، ويرفع `cover` فقط لمقال بلا غلاف
│       ├── covers/                 ✅ صور الأغلفة التي ترفعها ملفات المقالات
│       ├── swaddling.ts            ✅ تقميط الطفل (نوم الطفل) — ar/he/en
│       ├── teething.ts             ✅ التسنين (تطوّر الطفل) — ar/he/en
│       ├── screens.ts              ✅ الشاشات في السنة الأولى (تطوّر الطفل) — ar/he/en
│       └── reading.ts              ✅ القراءة للطفل منذ الولادة (تطوّر الطفل) — ar/he/en + غلاف
├── sanity.config.ts                ✅ Studio config — singleton structure + visionTool + schemas
├── reference/
│   ├── momzy-prototype.html        المرجع البصري الإلزامي
│   └── assets/
├── middleware.ts                   ✅ حجب جغرافي — 13 دولة + قطاع غزة (PS/GZ) → /not-available
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

# HYP Payment — صفحة الدفع المستضافة (pay.hyp.co.il)
HYP_MASOF=      # رقم الترمينال (Masof)
HYP_KEY=        # مفتاح API (KEY)
HYP_PASSP=      # كلمة مرور API (PassP)

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@momzyworld.com
RESEND_NEWSLETTER_SEGMENT_ID=   # قائمة «Momzy Newsletter» في Resend — بدونها لا يُضاف المشتركون إليها

# Cron — تذكير اليوم السابق (رابط اللقاء/المكان)
CRON_SECRET=    # قيمة عشوائية طويلة؛ نفسها في Vercel كي يقبل /api/cron/reminders استدعاء Vercel Cron

# WhatsApp (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_TEMPLATE_NAME=momzy_daily_schedule  # القالب الوحيد — جدول الصباح (٣ بارامترات)
HEBA_WHATSAPP_NUMBER=+972XXXXXXXXX

# Analytics
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_ID=

# App
NEXT_PUBLIC_SITE_URL=https://momzyworld.com
```

> **بلا مفاتيح Sanity لا يعمل الموقع، حتى في dev:** `lib/sanity/client.ts` ينشئ العميل عند تحميله، و`createClient` يرفض `projectId` الفارغ، فتفشل كل صفحة (500). بيانات seed الاحتياطية تُستخدم فقط حين تكون المفاتيح مضبوطة ولا يُرجع Sanity شيئًا. أي نسخة جديدة من المشروع (git worktree) تحتاج نسخة من `.env.local`.

---

## 🛠️ لوحة الأدمن (`/admin`) — مبنية بالكامل ✅

> واجهة إدارة كاملة لهبة تدير كل شيء بدون مبرمج. محمية بـ **Supabase Auth + جدول `admins` بأدوار**.

**البنية:** `app/admin/(panel)/` (سايدبار داكن يمين RTL، خلفية cream) + `app/admin/login/` (خارج الـ shell). الحماية في `proxy.ts` (بعد الحجب الجغرافي: `getUser` → غير مسجّل ⇒ `/admin/login`؛ المفتوح بلا جلسة: `ADMIN_PUBLIC_PATHS` — الدخول ونسيت كلمة المرور والكلمة الجديدة) + تفويض "أدمن نشط" في `(panel)/layout.tsx`. الخروج = server action (`app/admin/actions.ts`).

| الصفحة | الوظيفة |
|--------|---------|
| `/admin` | Dashboard — مبيعات (يوم/أسبوع/شهر) + طلبات اليوم + تنبيه «بانتظار الشحن» + آخر الطلبات/الحجوزات — **المدفوع (أو المجاني) فقط، بلا الملغى**، بأيام إسرائيل |
| `/admin/orders` + `/[id]` | فلاتر + بحث + تغيير حالة (+سجل) + رقم تتبّع + ملاحظات داخلية + **طباعة שטר מטען** (`/[id]/waybill`): ملصق صغير بعرض 100 مم في أعلى A4، ملصق لكل وجهة (هدية فيزيائية ← مستلِمتها)، عناوين الحقول بالعبرية والبيانات كما أدخلتها العميلة، بلا أسعار ولا توقيع — للطلب المدفوع الذي فيه ما يُشحن (`lib/orders/waybill.ts`) |
| `/admin/bookings` + `/availability` | **تصحيح بيانات مسجِّلة** بزرّ «تعديل» في بطاقة الحجز (الاسم والهاتف والبريد والبلدة والملاحظات والمبلغ المقبوض، ومعها حقول الطفل/الحمل/الموضوع إن كان الحجز يحملها) — والمبلغ يعيد اشتقاق حالة الدفع والعربون؛ الموعد والخدمة لا يُعدَّلان هنا (تغيير الموعد يُبلّغ الأمهات وله مكانه في لوحة المواعيد). تأكيد/إلغاء الحجوزات + تذكير واتساب (منع الحجز المزدوج ذرّيًا). في ترويسة الصفحة رابطان: **قائمة الانتظار** (بعدّاد من لم تُشعَر بعد — كانت تُوصَل من صفحة المواعيد وحدها فلم يعرف أحد بوجودها) و**إتاحة المواعيد**. **إدارة المواعيد** (`/availability`): رزنامة شهرية (`AdminCalendar`) تعرض كل يوم عدد جلساته ونقطة لمن فيه مسجِّلات، واختيار يوم يعرض جلساته ويضبط نموذج الإضافة عليه (`SessionsManager` — اليوم المختار يعود في الرابط `?day=` بعد كل فعل)؛ إضافة موعد واحد أو مواعيد متتالية في يوم أو تكرار أسبوعي بقيم تُعبَّأ من الخدمة (السعر، المقاعد، المدّة) ومن الإعدادات (رابط زوم الثابت `zoom_link` وعنوان الحضوري `venue_address`)؛ وخانة **«أضيفيها محجوبة»** تُنشئ المواعيد مخفيّة عن الزبائن (لا تظهر في الرزنامة ولا تُحجز — دالّة book_slot تشترط is_blocked=false) لتجهيزها قبل الإعلان، وتُفتح بزرّ «إظهار»؛ تعديل الجلسة في مكانها؛ **تسجيل يدوي** على البطاقة — **بحقول التسجيل العادي نفسها** حسب ما تسأله الخدمة (اسم الأم وهاتفها وبريدها وبلدتها · حامل/بعد الولادة وأسبوع الحمل · تاريخ ميلاد الطفل واسمه وأسبوع ولادته إن كان خديجًا · موضوع اللقاء · ملاحظات · و**المبلغ المقبوض**) لأمٍّ سجّلت على الواتساب أو بالهاتف — يحجز المقعد ذرّيًا كتسجيل الموقع ولا يمرّ بشروط الفئة العمرية (هبة عرفت الحالة بنفسها). **والمبلغ المقبوض يقرّر الحالة**: صفر ⇒ بانتظار الدفع · أقلّ من السعر ⇒ **عربون** (هجرة `0028` — عمود `deposit_amount`) يؤكّد الحجز كالدفع الكامل فيصلها رابط اللقاء وتظهر في جدول اليوم، ويبقى «يتبقّى ₪250» ظاهرًا لهبة في `/admin/bookings` وفي جدول اليوم حتى تضغط **«حصّلت الباقي»** · السعر فأكثر ⇒ مدفوع. **والإيراد يتبع لحظة القبض لا لحظة الحجز**: العربون يُحتسب يوم الحجز والباقي يوم تحصيله (`remainder_collected_at` — هجرة `0029`)، فتُجلب البواقي المحصَّلة في الفترة باستعلام مستقلّ (قد يكون الحجز أقدم من الفترة والتحصيل داخلها) وتُضاف للإيراد بلا أن تُعدّ تسجيلًا جديدًا. الحساب كلّه في `lib/bookings/deposit.ts`، وبلا بريد تُعلَّم علامة التذكير مُرسَلة فلا يحاول الكرون كل صباح ويفشل (ترسل هبة الرابط يدويًا). **ولا إيميل تأكيد فوريًّا** من النظام: هبة كلّمت الأم وسجّلتها بنفسها، وهي ترسل التأكيد يدويًا في هذه المرحلة (قرار ادهم، سبتمبر 2026) — التذكير التلقائي وحده يبقى، ولمن لها بريد؛ حجب مؤقت؛ **تحريك كل جلسات يوم** بتاريخ آخر و/أو دقائق؛ إلغاء جلسة فيها تسجيلات (يلغي حجوزاتها ويحرّر مقاعدها ويعرض من دفعت للاسترداد اليدوي). كل تغيير في موعد يُنسخ إلى الحجوزات (تحمل نسخة من الموعد) **ويرسل بريدًا بلغة كل أم مؤكَّدة** (`lib/notifications/sessionChange.ts`)، والحذف الصامت لجلسة فيها تسجيلات ممنوع. **والتسجيل اليدوي يمرّ في الجلسة المحجوبة**: الحجب يخفيها عن الزبائن لا عن هبة، فيؤخذ المقعد بمقارنة-وتحديث بدل `book_slot` (وهو يشترط ألّا تكون محجوبة) — والامتلاء يبقى مانعًا. الطبقة: `lib/db/sessions.ts` + `lib/sessions/time.ts`، الأفعال في `availability/actions.ts` تعود دائمًا برسالة أعلى الصفحة |
| `/admin/products` | تعديل السعر/المخزون/الإظهار — `sanityWriteClient.patch()` |
| `/admin/coupons` | CRUD كوبونات + تفعيل/إيقاف + إحصائيات |
| `/admin/customers` | مُجمَّعون من الطلبات المدفوعة (أو المجانية) غير الملغاة — بحث + إجمالي الإنفاق؛ من لم يدفع بعد لا يظهر |
| `/admin/newsletter` | مشتركات النشرة — بحث بالبريد، ومصدر كل اشتراك (نموذج الموقع / موافقة عند الدفع)، ومن ألغت اشتراكها تبقى ظاهرة كسجلّ (`getSubscribers` في `lib/db/newsletter.ts`) |
| `/admin/settings` | تشغيلية (Supabase `settings`) + محتوى (Sanity `siteSettings`) — نصوص الشريط العلوي بخانة لكل لغة (عربي/עברית/English)، والفارغة تسقط للعربية |
| `/admin/account` | حسابي — تغيير كلمة المرور (تُطلب الحالية أولًا · ١٢ حرفًا حدًّا أدنى من `lib/admin/passwordPolicy.ts`) |
| `/admin/forgot` ← `/admin/reset-password` | نسيت كلمة المرور — رابط لمرة واحدة إلى بريد الأدمن عبر Resend (`lib/admin/passwordReset.ts`)؛ الرد موحّد فلا يكشف الحسابات، والرابط من `NEXT_PUBLIC_SITE_URL` لا من ترويسة Host، والرمز يُتحقَّق منه عند الحفظ لا عند الفتح. **يعمل فقط حين يستقبل بريدُ الأدمن الرسائل** |
| `/admin/analytics` | تبويبات (`?tab=` · `&days=7/30/90/all`): **نظرة عامة** (مصادر UTM + مبيعات حسب المصدر + أفضل المنتجات + رسم 30 يوم + معدل تحويل + مولّد UTM) · **المنتجات** · **الكتيبات** · **الورشات** — لكل فئة أرقامها وحدها. «البيع» في كل اللوحة قاعدة واحدة (`lib/stats/settlement.ts`): مدفوع أو مجاني وغير ملغى، وما بانتظار الدفع يُعرض منفصلًا، رسم زمني بأيام إسرائيل، وصف لكل عنصر (مشاهدات وإضافات للسلة ومخزون / فتح روابط القراءة / جلسات ومقاعد وانتظار). وفي «نظرة عامة» لوحة **الإيرادات حسب النوع** (منتجات · كتيبات · الشحن ناقص الخصومات · ورشات · المجموع): المجموع نقدٌ لا جمع أرقام التبويبات — إجمالي الطلبات المدفوعة وما قُبض من الحجوزات — فيظهر فرق الشحن والخصم سطرًا تُغلق به الحسبة. وإحصاءات الجلسات تعدّ **المحجوبة أيضًا** (هي جلسات هبة وقد تحمل تسجيلًا يدويًّا؛ كانت تُستثنى فيظهر مقعد محجوز وكأنه صفر). الجلب `lib/db/categoryStats.ts`، والحساب دوال صافية في `lib/stats/` |

**حدّ المحاولات:** كل نموذج عام (تواصل · نشرة · انتظار · تسجيل ورشة · طلب · كوبون · المكتبة) محدود لكل IP (`lib/security/rateLimit.ts` — دالة `hit_rate_limit` في هجرة `0023`؛ العدّاد في القاعدة لا في ذاكرة الخادم لأن Vercel يشغّل نسخًا عدّة). يفشل مفتوحًا: تعذّر القاعدة يمرّر الطلب. التنظيف يوميًا مع `/api/cron/reminders`.

**طبقة البيانات:** `lib/db/` (`orders`, `bookings`, `coupons`, `customers`, `settings`, `analytics`, `dashboard`) — كلها عبر service-role (`lib/supabase/admin.ts`)؛ RLS يقفل anon. التتبّع: `lib/analytics/track.ts` (عميل) → `POST /api/track` → `analytics_events`.

**Supabase:** migrations `supabase/migrations/0001→0010` (مُطبَّقة). إنشاء الأدمن: `npm run seed:admins` (كلمة المرور المؤقتة من `SEED_ADMIN_PASSWORD` في `.env.local` — لا كلمة مرور في الكود) · نسيان كلمة المرور: `npm run admin:password -- <الإيميل>` (في طرفية — الكلمة تُكتب مخفيّة) · تنظيف بيانات الاختبار: `npm run clear:test`.

---

## ⚠️ حلول مؤقتة — يجب تغييرها قبل الإطلاق

> بعد بناء لوحة الأدمن + Supabase backend (المراحل 0–5)، حُلّت معظم النقاط.

### ✅ مُنجَز
- الطلبات تُحفظ في Supabase (`orders` + `order_items`) عبر `POST /api/orders` — لا `localStorage`.
- رقم الطلب/الحجز server-side (`sequence`: `MZ-` / `BK-`).
- الكوبونات فعّالة: `POST /api/coupons/validate` + إعادة تحقّق موثوق في `createOrder` + عدّاد استخدام.
- checkout يستدعي API حقيقيًا (بلا `setTimeout`)؛ الشحن يُقرأ من `settings`.
- صفحة التأكيد `/order/[id]` تقرأ من Supabase بالـ **UUID** (غير قابل للتخمين).
- بيانات الهدية تُحفظ JSONB في `order_items.gift`.
  **الرسالة الشخصية لهدية الصندوق وشارة «بطاقة إهداء مجانية» مخفيتان مؤقتًا** (هدية الكتيب تُبقي رسالتها): لإعادتهما `PHYSICAL_GIFT_MESSAGE_ENABLED = true` في `lib/products/giftMessage.ts`، وأزيلي «إخفاء من الموقع» عن سؤال البطاقة الشخصية في أسئلة الصندوق في Studio (حقل `hidden` في `productFAQ` — تُطبَّق على أسئلة المنتجات والخدمات).
- النشرة البريدية فعّالة (`/api/newsletter` → جدول `newsletter_subscribers`)، وكل مشتركة تُضاف بعد الرد إلى قائمة **«Momzy Newsletter»** في Resend (`lib/resend/newsletter.ts` — مشروطة بـ`RESEND_NEWSLETTER_SEGMENT_ID`). والمشتركة الجديدة من نموذج الفوتر تصلها **رسالة ترحيب** بلغة الصفحة (`sendNewsletterWelcome` — قالب `lib/resend/emails/newsletterWelcomeEmail.ts`) مرة واحدة فقط (`isNew` من `subscribeNewsletter`: إعادة إرسال النموذج لا تكرّرها)، برابط إلغاء اشتراك شخصي، وبلا عروض أو منتجات فلا «פרסומת» في عنوانها. **كل عدد ملفّ في `newsletters/`** (`NewsletterIssue`) بقالب `lib/resend/emails/newsletterEmail.ts`، وهو يضيف تلقائيًا «פרסומת» لبداية العنوان والتذييل القانوني ورابط إلغاء الاشتراك وUTM لكل رابط (فتظهر النشرة في `/admin/analytics`). `npm run newsletter -- <العدد> --preview | --test <بريد> | --draft`: معاينة HTML · تجربة لقائمة «Momzy Newsletter — Test» وحدها · مسودة للقائمة الحقيقية تُرسَل من لوحة Resend (Broadcasts) بعد مراجعتها — السكربت لا يرسل لكل المشتركات. **إلغاء الاشتراك في صفحة الموقع `/newsletter/unsubscribe`** (ar/he/en) لا في صفحة Resend: رابط التذييل يحمل بريد المستلِمة ورمزها (خاصية `unsubscribe_token` على جهة اتصال Resend — `lib/resend/newsletterContact.ts` يمنحها لكل مشتركة)، وفتح الرابط يعرض التأكيد فقط (برامج فحص البريد تفتح الروابط آليًا)، والزرّ يلغي في Resend وSupabase معًا (`lib/newsletter/unsubscribe.ts`) — التفاصيل في `LAUNCH-CHECKLIST.md` بند 4.4. خانة الموافقة على الرسائل الدعائية في الدفع تبدأ فارغة وتُحفظ في `orders.has_marketing_consent`، ومن أشّرتها تُضاف إلى القائمة نفسها (المصدر `checkout`) **وتصلها رسالة الترحيب بلغة طلبها** — كانت لا تصل إلا مشتركات نموذج الفوتر — **عند تأكيد طلبها** — بعد نجاح الدفع، أو عند الإنشاء بلا دفع إلكتروني (`lib/newsletter/checkoutConsent.ts`)؛ فمن تركت الدفع أو رُفضت بطاقتها لا تدخلها.
- إيميلات تأكيد الطلب والحجز تلقائية عبر Resend (للعميل + إشعار لهبة). **تأكيد الطلب يتبع محتواه** (`orderContents` في `lib/resend/emails/orderEmail.ts`): «سنبدأ بتجهيزه» وعنوان التوصيل وسطر الشحن لما يُشحن فقط؛ وطلب الكتيبات «تم تأكيد طلبك» مع تنبيه أن رابط القراءة والمكتبة يصلان في رسالة منفصلة (أو إلى بريد المستلِمة للهدية) — وكذلك إشعار هبة وتذكير الدفع.
- **الدفع بـ HYP مُدمج ومُختبَر end-to-end** على ترمينال الاختبار (SIGN مقبول + صفحة الدفع تُعرض بالمبلغ الصحيح + VERIFY): `lib/hyp/client.ts` (SIGN/VERIFY) + `POST /api/orders` يولّد رابط الدفع + `CheckoutForm` → **مرحلة الدفع في نفس الصفحة** (تدفّق مرحلي سلس عبر `CheckoutClient`: التوصيل ↔ `EmbeddedPayment` بلا انتقال، شريط تقدّم `CheckoutSteps` + ملخّص readOnly + شارات ثقة، والرابط يُزامَن `?order=`) — صفحة HYP في **iframe داخل الموقع** (العميلة لا تغادر Momzy، يبقى الامتثال SAQ A؛ مصدره `/api/hyp/retry`؛ `/checkout/pay/[id]` صفحة استرداد مستقلة) + `/api/hyp/callback` يتحقّق ويُعلّم الطلب مدفوعًا ثم **يخرج من الـ iframe** للنافذة الأعلى (`window.top`). صفحة `/order/[id]` تعرض حالة **"بانتظار الدفع"** (لا نجاح كاذب) مع زر إتمام الدفع حين لا يكتمل. **مشروط بوجود المفاتيح** — بدونها يبقى التدفّق اليدوي الحالي (الطلب `pending` → صفحة التأكيد مباشرة). **التقسيط حتى 3 دفعات** بلا فوائد تختارها العميلة (`Tash`/`tashType` — `MAX_INSTALLMENTS` في `lib/hyp/client.ts`)؛ بدونه كانت صفحة HYP تعرض حدّ الترمينال (36). **Apple Pay داخل الإطار:** `EmbeddedPayment` يحمّل سكربت HYP الرسمي (`applePayOnIframe.js`) وملف التوثيق في `public/.well-known/` — ويبقى التفعيل وتسجيل الدومين في لوحة HYP (`LAUNCH-CHECKLIST.md` بند 1.9).
  **لا تأكيد ولا تسليم بلا دفع** (`lib/orders/fulfillment.ts` — `canFulfill`): حين تُضبط HYP لا يُرسل تأكيد الطلب أو الحجز، ولا رابط الكتيب، ولا رابط اللقاء، ولا اشتراك النشرة، إلا لطلب مدفوع (أو مجاني) غير ملغى — **حتى لو فشل إنشاء رابط الدفع** (كان يُعامَل كغياب HYP فوصل الكتيب بلا دفع). القارئ `/read` وصور صفحاته والمكتبة لا تفتح كتيب طلب غير مدفوع (التوكن يُنشأ مع الطلب قبل الدفع). فشل توقيع HYP يُسجَّل في `payment_logs` (`stage=APISign` مع ردّ HYP — `CCode=902` = المفاتيح لا تطابق)، وكل تعذّر في `/api/hyp/retry` يخرج من إطار الدفع (`lib/hyp/breakout.ts`). **تذكير الطلب غير المدفوع** (بطاقة مرفوضة أو دفع متروك): إيميل «أتمّي الدفع» بعد 30 دقيقة مرة واحدة (`lib/notifications/recovery.ts`) — لا فور الرفض: HYP يعرض الرفض داخل إطاره ولا يعود للموقع دائمًا. يُفحص بعد كل طلب، ومع زيارات الموقع (`/api/track` — مرة كل 5 دقائق لكل نسخة خادم)، ويوميًا مع `/api/cron/reminders` — كان يُفحص بعد الطلبات وحدها فلا يصل في يوم هادئ. **ولا يُرسَل لطلب ملغى** (ألغته هبة عن قصد) **ولا لمن لها طلب مدفوع في النافذة نفسها** (تعثّر دفعها فبدأت طلبًا جديدًا ودفعته — فالمتروك توأمٌ ميت، وتذكيره يقول لها «لم تدفعي» وقد دفعت).
  **من داخل البلاد فقط:** الصندوق (كل طلب فيه ما يُشحن) واللقاءات الحضورية (كل جلسة ليست أونلاين — `isOnlineSession` في `lib/services/session.ts`: رابط اللقاء، ثم مكان الفتحة، ثم نوع الخدمة) تُطلب وتُدفع من داخل البلاد فقط. البلاد = إسرائيل والضفة الغربية (غزة محجوبة أصلًا)؛ البلد من ترويسة Vercel (`lib/geo/country.ts` — المجهول يمرّ)، والحكم في `/api/orders` و`createBooking` (403 + `code: domestic_only`)، والواجهة تنبّه مبكرًا عبر `/api/geo` (`useDomestic`) فتعرض `AbroadNotice` بدل النموذج (وفي الدفع زرّ يزيل الصندوق ليكمل الشراء بالكتيبات). الكتيبات واللقاءات الأونلاين متاحة من أي مكان. `/api/availability` يعيد الفتحات بصيغة `PublicSlot` (حقل `online` بدل رابط اللقاء ومكانه — كانا يُكشفان قبل الدفع، والرزنامة تعرض «💻 أونلاين» أو «📍 حضوري» فقط). للتجربة محليًا: كوكي `dev-geo-country=US` (أو بمنطقة `PS-GZ`) في المتصفح — تُتجاهَل في الإنتاج.
  **الدفع بالدولار من خارج البلاد — بأسعار ثابتة:** الأسعار بالشيكل دائمًا، والزائرة من خارج البلاد (كتيبات ولقاءات أونلاين) تُخصم بالدولار عبر HYP (`Coin=2`) **بسعر دولار ثابت لكل منتج وخدمة** يُضبط في Studio (حقل «السعر من خارج البلاد ($)» — `priceUsd`) — لا سعر صرف عام (أُزيل من `/admin/settings`). منه «سعر صرف الطلب» (`orderUsdRate` في `lib/currency.ts`: قائمة الشيكل ÷ قائمة الدولار) يحوّل كل مبلغ في الطلب، فالمنتج وحده يُخصم بسعره الثابت تمامًا والكوبون/الباقة بالنسبة نفسها؛ ما لا سعر دولار له يُحوَّل احتياطيًا بـ`FALLBACK_USD_RATE` (3.6). يُحسب مرة عند إنشاء الطلب/الحجز ويُحفظ معه (`currency` · `charged_amount` · `exchange_rate` — هجرة `0019`)، فإعادة الدفع من `/api/hyp/retry` تستعمل المبلغ المحفوظ. الشيكل يبقى أساس الإحصاءات والأدمن (يُعرض «$23.00 (₪67)»). الواجهة: `/checkout` يمرّر أسعار الدولار من Sanity (`cartPriceContext` في `lib/geo/cartPricing.ts`)، ورزنامة التسجيل تأخذ `price_usd` من `/api/availability`؛ والإيميلات وواتساب تذكر المبلغ المخصوم.
- **الشحن المجاني لكل منتج** (حقل «شحن مجاني» في Studio — `shippingInfo.freeShipping`): المنتج الفيزيائي المعلَّم به لا تُحسب عليه رسوم الشحن، لا في الدفع ولا في الفاتورة — `computeShipping` (`lib/shipping.ts`) يستقبل العناصر، و`getShippingConfig` يضيف `freeShippingSlugs` من Sanity فيتطابق حساب الواجهة والسيرفر. رسوم `/admin/settings` تبقى لكل منتج فيزيائي غير معلَّم. وبطاقة المنتج تعرض شارة «شحن مجاني» من الحقل نفسه.
- **SEO والسرعة:** كل صفحة عامة تبني عنوانها ووصفها ورابطها الأساسي (canonical) وروابط لغاتها (hreflang + x-default) ومعاينة المشاركة عبر `pageSeo` في `lib/seo/site.ts` — وعنوان الرئيسية فيه «مومزي / מומזי» كما يكتب الناس الاسم. البيانات المنظَّمة (JSON-LD) من `lib/seo/jsonld.ts` عبر `components/seo/JsonLd.tsx`: العلامة وهبة والموقع في كل صفحة (من الـ layout)، والمنتج (سعر، توفّر، شحن مجاني) والخدمة والمقال ومسار التنقّل في صفحاتها — بلا تقييمات مختلقة. `/sitemap.xml` (`app/sitemap.ts`) و`/robots.txt` (`app/robots.ts`) مستثنيان من الـ proxy. **أيقونة الموقع** (ما يظهر بجانب النتيجة في Google وفي تبويب المتصفح): علامة الأم والطفل الوردية من الشعار على خلفية بيضاء — `app/favicon.ico` (16/32/48/256) و`app/icon.png` (192) و`app/apple-icon.png` (180)، والأخيرتان مستثناتان من الـ proxy (كانت الأيقونة مثلث Vercel الافتراضي). نقاط الهيرو وبطاقة هبة `data-nosnippet`، وعلامات ✓ الزخرفية مرسومة لا نصّية (`components/ui/CheckGlyph.tsx`) — كان Google يعرضها وصفًا بدل الـ meta description. صورة المشاركة الافتراضية `public/images/og-momzy.jpg` (1200×630 — تحت `images` لأن الـ proxy يتجاوزه). صور Sanity تُطلب بعرض الشاشة وبصيغة حديثة (`lib/sanity/imageUrl.ts` + `srcset` في `ProductImagePlaceholder`، وصورة هيرو المنتج بأولوية)، وصورة هبة في هيرو الرئيسية `next/image` مع preload.
  **IndexNow** (`lib/seo/indexnow.ts`): المفتاح في `/indexnow-key.txt` (route في جذر app، مستثنى من الـ proxy)، و`/api/revalidate` يبلّغ Bing بالصفحة وقسمها لحظة النشر (إن ضُبط webhook Sanity)، و`/api/cron/indexnow` (Vercel Cron يوميًا 06:30 UTC، محمي بـ `CRON_SECRET`) يبلّغ بكل ما تغيّر في Sanity خلال اليوم — و`?all=1` بكل خريطة الموقع. من النسخة المنشورة فقط (`VERCEL_ENV=production`).
- **المخزون يُخصم تلقائيًا في Sanity عند تأكيد الطلب** (`lib/products/stock.ts` عبر `deductOrderStock`) — **عند نجاح الدفع لا عند الإنشاء** (أو فورًا لطلب بلا دفع إلكتروني)، فالطلب المتروك لا يُنقصه. ذرّي عبر `dec()`، يُثبّت على 0 ويُخفي المنتج (`inStock=false`) عند النفاد، ويُرجَع عند إلغاء طلب خُصم مخزونه فقط (`updateOrderStatus` + `canFulfill`). المنتجات بلا `stockQuantity` (رقمية) تُتخطّى. و`markOrderPaid`/`markBookingPaid` يعيدان `firstPayment`: إعادة فتح عنوان العودة لا تكرّر الخصم ولا الإشعارات.
- **تسجيل الورشات إلكترونيًا** (بديل واتساب): زر «سجّلي الآن» في بطاقة الخدمة يفتح نموذج التسجيل → المقعد يُحجز **ذرّيًا** (`book_slot`) **حجزًا مؤقتًا لـ3 دقائق** (`SEAT_HOLD_MINUTES` في `lib/bookings/seatHold.ts` — هجرة `0022`: `seat_held` · `hold_expires_at`) → **دفع HYP مدمج** → صفحة `/booking/[id]`. إن لم يتم الدفع يتحرّر المقعد تلقائيًا (`releaseExpiredSeatHolds` قبل عرض المواعيد وقبل كل تسجيل وفي لوحة المواعيد)؛ كل فتح لإطار الدفع يمدّ الحجز أو يأخذ المقعد من جديد، وإن اكتمل العدد في الأثناء يُلغى التسجيل بلا دفع (`?seat=taken`)؛ ومن دفعت بعد انتهاء الحجز والجلسة ممتلئة تأخذ مقعدها وتُنبَّه هبة (ملاحظة الحجز في الأدمن والإيميل). التأكيد (إيميل/واتساب) يُرسل **بعد نجاح الدفع فقط**، و**رابط اللقاء (زوم) أو المكان لا يُرسلان فور الدفع بل في تذكير اليوم السابق** (`lib/notifications/reminders.ts` عبر `/api/cron/reminders` — Vercel Cron يوميًا 06:00 UTC في `vercel.json`، محمي بـ `CRON_SECRET`؛ خطة Hobby تسمح بتشغيل يومي واحد)، ويظهران في صفحة `/booking/[id]` حين تصبح الجلسة خلال 24 ساعة (`REVEAL_HOURS_BEFORE`). تحريك الجلسة يعيد ضبط علامة التذكير فيصل تذكير جديد. الرابط/المكان يُضبط لكل جلسة من `/admin/bookings/availability`. عند اكتمال المقاعد تبقى الجلسات ظاهرة في الرزنامة رمادية («اكتمل العدد») ولا تُحجز — **ولا شيء خارج الرزنامة يقول «اكتمل العدد»**: زرّ البطاقة والشريط الثابت يبقيان «سجّلي الآن» بلا شارة ولا تبهيت — كان ذلك يوحي أن لا مواعيد أصلًا، والمواعيد موجودة؛ فيفتح الزرّ الرزنامة فتراها الزائرة مشطوبة وتحتها زرّ الانتظار. ومع الشارة سقط استعلام المقاعد من صفحتَي الخدمات (`getAvailableSeatsBySlug`) — لم يعد له غرض، ومن تريد تنضم لـ**قائمة انتظار** — بالشرط العمري نفسه: الورشة ذات الفئة العمرية تسأل المنتظِرة عن تاريخ ميلاد طفلها وتمنع الانضمام خارج الفئة (يُقاس **اليوم** لا يوم جلسة، فلا جلسة بعد — مع مهلة نصف شهر تحت الحدّ الأدنى: `checkWaitlistAge` و`WAITLIST_GRACE_DAYS`، فمن طفلها 3.5 أشهر تنتظر ورشة الـ4 أشهر لأنه يبلغها قبل أن يُفتح الموعد؛ والحدّ الأقصى صارم لأن الطفل يكبر ولا يصغر)، والحكم في `/api/waitlist` لا في الواجهة فقط. **والعمر المرفوض لا يُترك بابًا مغلقًا:** يظهر صندوق بالخدمات التي تناسب عمر الطفل (`/api/services/for-age` — ذوات الفئة المطابقة أولًا ثم المفتوحة، بحدّ أربع)، والضغط على أيّها يفتح صفحتها، والتاريخ يُحفظ في `waitlist.baby_birth_date` (هجرة `0024` — تُطبَّق يدويًا) فيظهر عمر الطفل لهبة في صندوق التفاصيل — (`waitlist` + إدارة في `/admin/bookings/waitlist`) من زر تحت الرزنامة أو من زر «انضمي للانتظار» في البطاقة، و**عدد المقاعد المتبقية لا يظهر للزبونة** في أي مكان (البطاقة · الشريط الثابت · الرزنامة) — «اكتمل العدد» وحده حين تمتلئ الجلسة؛ الأعداد لهبة في الأدمن فقط. واتساب صار للاستفسار فقط.
  **رقم واتساب خاص بخدمة** (حقل `whatsappNumber` في الخدمة في Studio): الفارغ يعني رقم الموقع (`siteSettings.contact`)، والمملوء يوجّه أزرار «تواصلي على واتساب» **في تلك الخدمة وحدها** إليه — الزيارة البيتية تُدار على رقم هبة الشخصي. الفوتر والهيدر وبقية الخدمات تبقى على رقم الموقع.
  **أسبوع الحمل — لما قبل الولادة** (`lib/utils/pregnancy.ts` — عمودا `pregnancy_week`، هجرة `0027` **تُطبَّق يدويًا قبل النشر**): حقل «أقلّ أسبوع حمل يوم اللقاء» (`minPregnancyWeek`) في الخدمة في Studio يجعل النموذج **يسأل أولًا: حامل أم بعد الولادة؟** — الحامل تُسأل أسبوع الحمل، ومن ولدت تُسأل تاريخ ميلاد الطفل كبقية الورشات (بخداجه وفئته العمرية إن كانت للخدمة فئة). مضبوط على **18** للقاء الزوم مع حدّ أقصى **3 أشهر** لمن ولدت. تبديل الحالة يمسح إجابة الأخرى فلا يصل الحقلان معًا، والسيرفر يقرأ ما وصله: أسبوع حمل ⇒ حامل، وإلا فطفل. والأسبوع **يتقدّم**: من هي في أسبوعها الرابع عشر اليوم تكون في العشرين بعد ستّة أسابيع، فالشرط يُقاس **يوم اللقاء** لا يوم التسجيل — كما يُقاس عمر الطفل يوم الورشة. **قائمة الانتظار تسأل ولا تشترط**: لا موعد بعد، فكل أسبوع اليوم يصلح لموعدٍ يُفتح لاحقًا. يُحفظ الأسبوع **كما أُدخل**، ويُحسب أسبوع اللقاء منه ومن `created_at` — فلو تحرّك الموعد بقي الحساب صحيحًا. يظهر لهبة في `/admin/bookings` وقائمة الانتظار وإيميل الحجز وجدول اليوم («حمل أسبوع 21» بدل الطفل).
  **الطفل الخديج والعمر المصحَّح** (`lib/utils/age.ts` — عمودا `gestational_weeks` في `bookings` و`waitlist`، هجرة `0026` **تُطبَّق يدويًا قبل النشر**): حيثما يُسأل تاريخ الميلاد (التسجيل وقائمة الانتظار، لكل الخدمات ذات الفئة العمرية) يُسأل بعده «هل وُلد طفلكِ قبل موعده؟» — و«نعم» تفتح خانة **أسبوع الولادة** (٢٢–٣٦؛ الكاملة ٤٠). التطبيق: **يُؤخَّر تاريخ الميلاد** بمقدار ما سبق الطفلُ موعده (`correctedBirthDate`) ويُمرَّر لدوال العمر كما هي، فلا تعرف بقيّة الدوالّ شيئًا عن الخداج. **الفئة العمرية تُقاس بالعمر المصحَّح**: طفلٌ يبلغ السنّ بتاريخ مواليده قد لا يبلغها مصحَّحًا فيُرفض، وتقول الرسالة «العمر المصحّح لطفلكِ …» — **لا تذكر الخداج إطلاقًا**، ويظهر معها صندوق الورشات التي تناسب عمره المصحَّح. و**المولود لا يصير غير مولود**: الخديج الذي لم يبلغ بعد موعد ولادته عمره المصحَّح صفر لا سالب، وإلا رفضته ورشة تبدأ من يوم الولادة وهي أحوج ما يكون إليها. العمر المصحَّح يظهر للأم في النموذج (مع عمرها الزمني) ولهبة في `/admin/bookings` وقائمة الانتظار وإيميل الحجز وجدول اليوم على واتساب.
  **الفئة العمرية** (`lib/utils/age.ts`): حقلا `ageMinMonths`/`ageMaxMonths` في Sanity يُفعّلان بوّابة عمرية لكل ورشة على حدة — تُسأل الأم عن **تاريخ ميلاد طفلها** ويُحسب عمره **يوم الجلسة** لا يوم التسجيل، ويُمنع التسجيل خارج الفئة. **ولا تسجيل لحامل في الورشات**: الطفل الذي لم يُولد يوم الورشة مرفوض مهما كانت الفئة — والحامل تسجّل في خدمة ما قبل الولادة وحدها، وهناك تُسأل عن أسبوع حملها. التحقق مُطبَّق في `createBooking` (سيرفر) لا في الواجهة فقط، ويسبق حجز المقعد فلا يتسرّب مقعد على محاولة مرفوضة. الحقلان فارغان ⇒ لا سؤال ولا تحقّق. عمر الطفل يظهر لهبة في `/admin/bookings` وفي إيميل الحجز — **بالأيام قبل أن يُكمل شهره الأول** وبالأشهر بعده (`babyAgeAtLabel`). ومعه **اسم الطفل الكامل** (`lib/utils/babyName.ts` — عمود `bookings.baby_name`، هجرة `0020` تُطبَّق يدويًا قبل النشر): يظهر بعد تاريخ الميلاد حين يكون حتى اليوم (مولود) وإلزامي حينها، ولا يظهر للحامل التي تدخل الموعد المتوقّع؛ يُتحقَّق منه في `createBooking` قبل حجز المقعد.
  **بلدة الأم** (`lib/utils/bookingCity.ts`): خانة إلزامية «البلدة» في كل تسجيل (2–60 حرفًا)، يُتحقَّق منها في `createBooking` قبل حجز المقعد، وتُحفظ في `bookings.city` (هجرة `0025` — **تُطبَّق يدويًا قبل النشر**، وإلا فشل كل تسجيل جديد). تظهر لهبة في `/admin/bookings` وفي إيميل الحجز وفي جدول اليوم على واتساب — لتعرف من أين تأتي المسجِّلات.
  **موضوع اللقاء** (`askTopic` في Sanity — مفعّل للّقاء الفردي في الناصرة وللاستشارة الفردية مع هبة): خانة إلزامية «موضوع اللقاء» في نموذج التسجيل (3–500 حرف، `lib/utils/bookingTopic.ts`)، يُتحقَّق منها في `createBooking` قبل حجز المقعد كالفئة العمرية، وتُحفظ في `bookings.topic` (هجرة `0018` — تُطبَّق يدويًا؛ حجوزات الخدمات الأخرى لا تكتب في العمود). تظهر لهبة مع ملاحظات الأم في `/admin/bookings` وفي إيميل الحجز، وللأم في صفحة `/booking/[id]`.
  **تجربة الدفع موحّدة مع المتجر:** صفحة `/booking/[id]` تتبدّل بالمرحلة تمامًا كـ`/checkout`+`/order` — قبل الدفع: عنوان «الدفع الآمن» + شريط تقدّم (التسجيل ← الدفع ← التأكيد) + عمودان (الدفع المدمج + `BookingSummary` ملتصق + `TrustBadges`)؛ وبعده: عنوان «تأكيد التسجيل» + الشريط على المرحلة 3 + إيصال بعمود واحد. عنوان التبويب يتبع المرحلة عبر `generateMetadata`. الملخّص **لا يكشف** رابط اللقاء/العنوان قبل الدفع — نوع الحضور فقط.
  **الورشة الجماعية:** عدّة أمهات على نفس الجلسة حتى السعة (لا قيد `unique` على `availability_id`) — كل أم تسجّل نفسها بمقعد واحد.

  **مدخل تسجيل واحد:** كل أزرار التسجيل في الموقع (هيرو الورشة · CTA النهائي · الشريط الثابت على الجوال · بطاقة الخدمة في `/services`) تفتح **`BookingModal`** — لا قسم مواعيد منفصل في الصفحة (حُذف `UpcomingSessions` لأنه كان مدخلًا ثانيًا مكرّرًا). اختيار الموعد يتم داخل النموذج عبر **`SessionCalendar`** (نسخة `compact`): الأيام التي فيها جلسات مميّزة، والماضية معطّلة؛ وعند اختيار يوم تظهر **ساعاته** مع 💻أونلاين/📍حضوري والسعر (والمكتملة «اكتمل العدد»). التنقّل بين الأشهر يختار تلقائيًا أول يوم فيه جلسات.
  `/api/availability` يعيد كل الجلسات القادمة **بما فيها المكتملة** (لا تختفي من الرزنامة)؛ نموذج الانتظار يُفتح مباشرةً فقط حين لا توجد جلسة مجدولة أصلًا («لا مواعيد مجدولة») أو من زر «انضمي للانتظار» الصريح. ونصّ كل أزرار التسجيل موحّد: **«سجّلي الآن»**.
  **أقسام صفحة الورشة:** هيرو ← المحتوى ← **`ServiceAboutHeba`** (تعريف بهبة يقرأ من `aboutPage` نفسه — لا نسخة ثانية من سيرتها) ← **`ServiceFAQ`** (شرطي — يظهر فقط إن أضافت هبة أسئلة في حقل `faqs`) ← CTA ← خدمات مقترحة. تسلسل `zIndex` للموجات: 3 ← 4 ← 5 ← 6 ← 7 (`ServiceCTASection` يستقبل `zIndex` لأنه يُستخدم في صفحتين).
  **`components/ui/FAQAccordion.tsx`** — أكورديون مشترك بين صفحة المنتج وصفحة الورشة (استُخرج من `ProductFAQ` بدل نسخه)؛ كل صفحة تغلّفه بقسمها ولونها. كائن Sanity `productFAQ` مُعاد استخدامه لحقل `faqs` في الخدمة — بنية واحدة (سؤال + جواب).
- **واتساب هبة — جدول اليوم وحده** (Meta Cloud API — `lib/whatsapp/` + `lib/notifications/dailySchedule.ts` بقالب `momzy_daily_schedule`): جلسات اليوم غير المحجوبة ومن ستحضر (المدفوعة غير الملغاة — قاعدة `canFulfill` نفسها)، **ولكل أم: بلدتها وهاتفها واسم طفلها وعمره بالشهر واليوم وموضوع لقائها** (مختصرًا في ٧٠ حرفًا، وفي ذيل القالب سطر ثابت برابط `/admin/bookings` لقراءته كاملًا مع الملاحظات). يوم مزدحم يتجاوز حدّ القالب (1024 حرفًا) فتسقط التفاصيل وتبقى الأسماء ثم يُقصّ النصّ — Meta يرفض الرسالة الطويلة كلّها لا يقصّها. **لا واتساب للطلب ولا للحجز الجديد**: إيميلاهما يصلانها بكل التفاصيل، فالرسالة تكرارٌ يُعوّدها تجاهُلَ الإشعارات. يركب على `/api/cron/reminders` فلا يحتاج مهمة مجدولة ثانية (خطة Hobby: مهمتان يوميًا وقد استُعملتا)، و**لا يُرسَل في يوم بلا جلسة** — الرسالة اليومية بلا محتوى تُتجاهَل فيضيع معها اليوم المهمّ. وبارامترات قوالب واتساب لا تقبل أسطرًا جديدة، فالجلسات كلّها في بارامتر واحد بفواصل. مشروط بإعداد Meta + رقم هبة (`settings.whatsapp_number` من `/admin/settings`)، ومعاينة بلا إرسال: `npm run whatsapp:preview`. رابط `wa.me` اليدوي يبقى احتياطيًا.

### ⬜ متبقٍ قبل الإطلاق

> 📋 **القائمة الكاملة خطوة بخطوة (حسابات · مفاتيح · محتوى · اختبار نهائي):** [`LAUNCH-CHECKLIST.md`](LAUNCH-CHECKLIST.md)

| الميزة | المتبقّي |
|--------|----------|
| تفعيل الدفع | أضيفي `HYP_MASOF/KEY/PASSP` **الحقيقية** في `.env.local` (المفاتيح مُعدّة فارغة بالأسماء الصحيحة) + اضبطي عنوان العودة في بوابة HYP → `{SITE}/api/hyp/callback`. الكود مُختبَر ✅ — يُفعَّل تلقائيًا بمجرّد وجود المفاتيح. |
| تفعيل واتساب | أضيفي `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` في `.env.local` + أنشئي قالب `momzy_notification` (4 بارامترات) واعتمديه في Meta + رقم هبة في `/admin/settings`. الكود مُختبَر ✅ (Graph API يقبل الطلب) — يُفعَّل تلقائيًا بمجرّد وجود المفاتيح. |
| `ProductTestimonials.tsx` | ربط بـ Supabase `reviews` بدل placeholders |
| `ProductImagePlaceholder.tsx` | صور حقيقية (الحالي gradient احتياطي) |
| Pixel/GA4/GTM | إضافة الـ IDs في `.env.local` (السكربتات مبنية ومشروطة — صامتة بدونها) |
| إيميل الهدية | إشعار تلقائي للمستلِمة عند طلب هدية |

---

## 📌 إضافات مستقبلية للفوتر

> ميزات مشروطة بأحداث مستقبلية — يُضاف كل عنصر عند توفّر شرطه.

| الشرط | الإضافة المطلوبة | الموقع |
|-------|------------------|--------|
| تسجيل **עוסק מורשה** (حاليًا פטור) | إضافة رقم ח.פ. + اسم النشاط القانوني — إلزامي قانونيًا | الشريط السفلي في `Footer.tsx` |
| ربط **HYP API** للدفع | أيقونات Visa / Mastercard / HYP — يبني الثقة عند الدفع | بجانب Newsletter في `Footer.tsx` |
| توفر **مكتب أو عيادة** فيزيائية | عنوان النشاط الكامل + رابط Google Maps | عمود التواصل في `Footer.tsx` |

---

## 🚀 ترتيب البناء

```
المرحلة 1 — الأساس ✅ مكتملة
  ✅ تثبيت المكتبات (Supabase, Sanity, lucide-react, zustand)
  ✅ إعداد Tailwind v4 بالألوان والتوكنات
  ✅ Layout (TopBar, Header, MegaMenu, MobileMenu, Footer)
  ✅ الصفحة الرئيسية الكاملة (6 أقسام)

المرحلة 2 — المتجر ✅ مكتملة (بدون الدفع)
  ✅ طبقة بيانات مجردة `lib/products/` (types + seed + getProduct + getProducts)
  ✅ تصميم فاخر — design tokens forest/gold/ivory في globals.css
  ✅ صفحة /shop — ShopFilters (category + search + sort) + شبكة منتجات
  ✅ صفحة /shop/[slug] — قالب موحد + 11 قسم (إلزامي + شرطي حسب البيانات)
  ✅ مكونات تفاصيل المنتج (12 component في components/shop/product-detail/)
  ✅ Sticky mobile CTA — يظهر بعد scroll
  ✅ Lightbox للـ Gallery + دعم فيديو (videoUrl كأول عنصر)
  ✅ نظام السلة (Zustand + persist localStorage) — schema جديد بـ slug + mainImage
  ✅ CartSidebar + FloatingCartButton + Toast + CartAddedModal
  ✅ نموذج الشراء + قبول الشروط (/checkout) — CheckoutForm + OrderSummary + redirect
  ✅ صفحة تأكيد الطلب /order/[id] — تخزين localStorage + عرض كامل

المرحلة 2.5 — Sanity CMS ✅ مكتملة
  ✅ Sanity Studio على /studio — واجهة هبة لإدارة المحتوى
  ✅ Schemas: product (document) + siteSettings (singleton) + 7 objects
  ✅ Query layer: lib/sanity/queries/products.ts + siteSettings.ts
  ✅ getProduct/getProducts تقرآن من Sanity أولًا، seed fallback في dev حين لا يُرجع Sanity شيئًا (بلا مفاتيح Sanity لا يعمل الموقع أصلًا — انظر متغيرات البيئة)
  ✅ TopBar + Footer ديناميكيان من Sanity siteSettings
  ✅ Migration script جاهز (npx tsx scripts/migrate-seed-to-sanity.ts)
  ✅ ISR revalidate 60s — تحديثات Studio تظهر خلال دقيقة
  □ رفع صور المنتجات الحقيقية من Studio ← هبة
  □ إعداد siteSettings من Studio ← هبة
  □ ربط ReviewModal بـ Sanity testimonials ← لاحقًا
  □ دمج HYP  ← الخطوة التالية للمطور
  □ ربط Supabase للطلبات الفعلية (استبدال localStorage)

المرحلة 3 — الحجوزات (الأسبوع 3-4)
  □ صفحة الخدمات
  □ نظام المواعيد
  □ نموذج الحجز + الدفع
  □ Resend + Twilio WhatsApp

المرحلة 4 — المحتوى (الأسبوع 4-5)
  ✅ المقالات — /articles + /articles/[slug] بثلاث لغات
     · التصنيف مفتاح ثابت في Sanity والاسم يُترجَم من messages
     · المحتوى Portable Text مُدوّل (internationalizedArrayArticleBody)
     · زمن القراءة يُحسب من النص، والتاريخ يتبع لغة الصفحة
     · صندوق مصادر + تنبيه «تثقيف لا تشخيص» في كل مقال
  □ صفحات الورشات
  □ عن هبة + تواصل
  □ سياسة الخصوصية + الشروط

المرحلة 5 — الإطلاق (الأسبوع 5-6)
  □ لوحة الأدمن
  □ إنشاء جداول Supabase
  □ ربط ReviewModal بـ Supabase
  □ Meta Pixel + GA4 + GTM
  □ اختبار كامل
  □ إطلاق على Vercel
```

---

## 🌊 نمط التصميم — الأقسام المتداخلة

### نوعان من الـ waves:

**1. `PageHeaderWave`** — في أسفل هيدر الصفحة (absolute positioned):
```tsx
// يُستخدم داخل div بـ position:relative + overflow:hidden
<PageHeaderWave fillColor="#F5F0EA" />
```

**2. `SectionWave`** — فاصل بين الأقسام (flowing, أول child):
```tsx
<section className="relative reveal-section" style={{ marginTop: -60, zIndex: N }}>
  <SectionWave fill="#FDFAF5" />
  <div className="bg-SECTION_COLOR" style={{ marginTop: -1, paddingTop: 16, paddingBottom: 60 }}>
    {/* المحتوى */}
  </div>
</section>
```

| القسم | z-index | marginTop | لون الـ wave |
|-------|---------|-----------|-------------|
| HeroSection | 1 | — | لا wave |
| LaunchBanner | 2 | -60px | #F8F4EE |
| WhyMomzySection | 3 | -60px | #FDFAF5 |
| BestSellersSection | 4 | -60px | #F5F0EA |
| HebaSection | 5 | -60px | #F8F4EE |
| ArticlesSection | 6 | -60px | #FDFAF5 |
| ChannelSection | 7 | -60px | #EFF8F8 |
| ReviewsSection | 8 | -60px | #F5D98E |

**قواعد مهمة:**
- `<section>` نفسه **بدون background-color**
- الـ background يُوضع فقط على الـ `<div>` الداخلي
- `marginTop: -1` على الـ div الداخلي لمنع الـ gap
- `SectionWave` height = **60px**، `marginTop` = **-60px**
- **لا تستخدم `PageHeaderWave` كـ section separator** — z-index الأقسام يغطيها

---

## 🎭 نظام الأنيميشن

```css
/* wobble عام — كل button و a في الموقع */
button:hover, a:hover { animation: wobble 0.6s ease; }

/* wobble خفيف — MobileMenu فقط */
.btn-wobble-light:hover { animation: wobble-light 0.5s ease; }

/* pulse للـ badges */
.pulse-badge        /* وردي — TopBar وشارات البطاقات: حلقة ::after بـ transform/opacity (لا box-shadow متحرك — كان يُعاد رسمه كل إطار) */
.pulse-badge-yellow /* أصفر — «جديد الآن» */
.pulse-dot          /* مع pulse-badge على نقطة دائرية — تتسع بالتساوي */
```

---

## 📋 قواعد البرمجة

- **المرجع البصري إلزامي** — اقرأ `reference/momzy-prototype.html` قبل أي component
- **الأصول** من `reference/assets/` — انسخها إلى `public/`
- **RTL دائمًا** — `dir="rtl"` على كل المكونات
- **العربية أولًا** — كل النصوص بالعربية
- **Server Components** افتراضيًا
- **لا `any`** في TypeScript
- **Tailwind v4** — `@theme inline {}` في globals.css، لا CSS مخصص إلا للـ keyframes
- **Mobile First**
- **لا تسجيل دخول للعملاء** — الشراء والحجز مجهول كليًا
- **Modals بـ Portal** — استخدم `createPortal(el, document.body)` لتجنب z-index conflicts
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
