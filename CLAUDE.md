# CLAUDE.md — Momzy Platform
> آخر تحديث: أبريل 2026 — Sanity CMS ✅

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
│   ├── globals.css                 ✅ Tailwind v4 @theme + design tokens + keyframes (wobble, wobble-light, pulse-badge, pulse-badge-yellow)
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
│   │   │   ├── page.tsx            ⬜
│   │   │   └── [slug]/page.tsx     ⬜
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
│   │   ├── ProductCard.tsx             ✅ كارد منتج جديد — mainImage + tags badges (rose/gold) + سعر بـ gold
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
│   │       ├── ProductPageLayout.tsx       ✅ المنسّق — يرتب 11 قسماً، أقسام شرطية حسب البيانات
│   │       ├── ProductHero.tsx             ✅ Hero — صورة + tagline + سعر gold + CTAs forest/gold + 3 trust signals ديناميكية
│   │       ├── ProductGallery.tsx          ✅ Grid 2/3 cols + lightbox + دعم فيديو (videoUrl أول عنصر)
│   │       ├── ProductShortDescription.tsx ✅ نص شاعري وسط ivory
│   │       ├── ProductContents.tsx         ✅ "كل قطعة جمعناها إلك" — Grid بطاقات
│   │       ├── ProductStory.tsx            ✅ "من قلب هبة" — صورة دائرية + نص
│   │       ├── ProductGiftTargets.tsx      ✅ "لمين هاي الهدية؟" — 3 بطاقات للمُهدي
│   │       ├── ProductLongDescription.tsx  ✅ longDescription أو specifications أو fallback
│   │       ├── ProductTestimonials.tsx     ✅ شهادات بـ 5 نجوم — placeholders TODO
│   │       ├── ProductFAQ.tsx              ✅ accordion ذهبي
│   │       ├── ProductFinalCTA.tsx         ✅ خلفية forest dark + CTA ذهبي
│   │       └── ProductStickyMobileCTA.tsx  ✅ Sticky bar للجوال — يظهر بعد scroll 600px
│   ├── checkout/
│   │   ├── CheckoutClient.tsx      ✅ حاوية صفحة الدفع — تحقق من السلة + redirect
│   │   ├── CheckoutForm.tsx        ✅ نموذج التوصيل + redirect لـ /order/[id] بعد الإرسال
│   │   ├── CheckoutUpsell.tsx     ✅ منتجات مقترحة أسفل صفحة الدفع
│   │   └── OrderSummary.tsx        ✅ ملخص الطلب — عناصر + شحن + إجمالي
│   ├── order/
│   │   ├── OrderConfirmationClient.tsx ✅ حاوية صفحة التأكيد — loading/notFound/loaded
│   │   ├── OrderHeader.tsx         ✅ أيقونة نجاح + رقم الطلب (نسخ) + التاريخ
│   │   ├── OrderInfoCard.tsx       ✅ كاردا بيانات العميل وعنوان التوصيل
│   │   ├── OrderItemsList.tsx      ✅ عناصر الطلب — للقراءة + ملاحظة digital
│   │   ├── OrderTotals.tsx         ✅ المجموع/الشحن/الخصم/الإجمالي + شعار أمان
│   │   └── OrderActions.tsx        ✅ مواصلة التسوق + تواصلي معنا
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
│   ├── products/
│   │   ├── types.ts                ✅ Product + ProductContent + ProductStory + ProductGiftTarget + ProductTestimonial + ProductFAQ + ProductShippingInfo + ProductSpecification + ProductFilters + ProductSort
│   │   ├── seed.ts                 ✅ SEED_PRODUCTS — مشوار أم (كامل) + مصاصة + قنينة (fallback في dev)
│   │   ├── getProduct.ts           ✅ async getProduct(slug) — Sanity أولاً، seed fallback في dev
│   │   └── getProducts.ts          ✅ async getProducts(filters?) + getProductCategories() — Sanity أولاً، seed fallback
│   ├── sanity/
│   │   ├── client.ts               ✅ sanityClient + sanityWriteClient + sanityFetch (ISR revalidate + try-catch)
│   │   ├── image.ts                ✅
│   │   └── queries/
│   │       ├── products.ts         ✅ PRODUCT_FIELDS + getProductBySlug + getAllProducts + getAllProductSlugs + getProductCategories
│   │       └── siteSettings.ts     ✅ getSiteSettings — singleton مع DEFAULT_SETTINGS fallback
│   ├── supabase/
│   │   ├── client.ts               ✅
│   │   └── server.ts               ✅
│   ├── hyp/                        ⬜
│   ├── resend/
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
│   └── migrate-seed-to-sanity.ts   ✅ يرفع seed products لـ Sanity — idempotent، يُشغَّل مرة واحدة
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

## ⚠️ حلول مؤقتة — يجب تغييرها قبل الإطلاق

> هذه الحلول تعمل في مرحلة التطوير لكنها **غير صالحة للإنتاج**.

| الملف | الحل المؤقت | البديل النهائي |
|-------|------------|----------------|
| `lib/utils/orders.ts` | حفظ الطلبات في `localStorage` | POST `/api/orders` → Supabase `orders` table |
| `lib/utils/orders.ts` | رقم الطلب بـ `crypto.randomUUID()` | `SERIAL` أو `sequence` في Supabase يُولَّد server-side |
| `components/checkout/CheckoutForm.tsx` | محاكاة الإرسال بـ `setTimeout(1500ms)` | POST حقيقي لـ HYP API → redirect لصفحة دفع |
| `components/checkout/OrderSummary.tsx` | الكوبون دائماً "غير صحيح" | POST `/api/coupons/validate` → Supabase `coupons` table |
| `lib/products/seed.ts` | Fallback في dev إذا Sanity فارغ — المحتوى الحقيقي يُرفع من Sanity Studio | رفع منتجات حقيقية من Studio — seed يصبح للاختبار فقط |
| `components/shop/ProductImagePlaceholder.tsx` | صور gradient + رمز Momzy | استبدال بـ `next/image` على ملفات في `public/images/products/{slug}/` |
| `components/shop/product-detail/ProductTestimonials.tsx` | 3 شهادات placeholder | جلب من Supabase `reviews` table بحسب `product_id` |
| `components/layout/NewsletterForm.tsx` | محاكاة اشتراك بـ `setTimeout(700ms)` | POST `/api/newsletter` → Supabase `newsletter_subscribers` table |
| `lib/store/cart.ts` (gift items) | بيانات الهدية تُحفظ مع كل عنصر في `localStorage` فقط | حفظها في Supabase `orders` كـ JSONB column + إيميل تلقائي للمستلِمة |

---

## 📌 إضافات مستقبلية للفوتر

> ميزات مشروطة بأحداث مستقبلية — يُضاف كل عنصر عند توفّر شرطه.

| الشرط | الإضافة المطلوبة | الموقع |
|-------|------------------|--------|
| تسجيل **עוסק מורשה** (حالياً פטור) | إضافة رقم ח.פ. + اسم النشاط القانوني — إلزامي قانونياً | الشريط السفلي في `Footer.tsx` |
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
  ✅ getProduct/getProducts تقرآن من Sanity أولاً، seed fallback في dev
  ✅ TopBar + Footer ديناميكيان من Sanity siteSettings
  ✅ Migration script جاهز (npx tsx scripts/migrate-seed-to-sanity.ts)
  ✅ ISR revalidate 60s — تحديثات Studio تظهر خلال دقيقة
  □ رفع صور المنتجات الحقيقية من Studio ← هبة
  □ إعداد siteSettings من Studio ← هبة
  □ ربط ReviewModal بـ Sanity testimonials ← لاحقاً
  □ دمج HYP  ← الخطوة التالية للمطور
  □ ربط Supabase للطلبات الفعلية (استبدال localStorage)

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
| LatestSection | 2 | -60px | #F5F0EA |
| OfferSection | 3 | -60px | #FDFAF5 |
| HebaSection | 4 | — | #F8F4EE |
| ArticlesSection | 5 | -60px | #FDFAF5 |
| ReviewsSection | 6 | -60px | #F5D98E |

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
@keyframes pulse-badge        /* وردي — TopBar */
@keyframes pulse-badge-yellow /* أصفر — جديد الآن في LatestSection */
```

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
