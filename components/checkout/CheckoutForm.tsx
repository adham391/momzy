"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { computeShipping, type ShippingConfig } from "@/lib/shipping";
import { couponDiscount } from "@/lib/coupons";
import { getStoredUTM } from "@/lib/analytics/track";

/** واجهة بيانات نموذج الدفع */
interface FormData {
  name:       string;
  email:      string;
  phone:      string;
  city:       string;
  address:    string;
  building:   string;
  postalCode: string;
  notes:      string;
}

/** الحقول الإلزامية التي لها قواعد تحقّق (تستثني الاختيارية) */
type RequiredField = keyof Omit<FormData, "notes" | "building" | "postalCode">;

/** الحالات المحتملة للنموذج */
type FormStatus = "idle" | "submitting" | "error";

/** نمط CSS الأساسي لحقول الإدخال */
const inputBase: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  padding: "11px 14px",
  background: "var(--offwh)",
  fontSize: 14,
  color: "var(--dark)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

/** نمط label */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--mid)",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: 6,
  fontFamily: "'Nunito', sans-serif",
};

/** رسالة الخطأ تحت الحقل */
function FieldError({ msg }: { msg: string }) {
  return (
    <div className="font-label text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--rose)" }}>
      <span>⚠</span> {msg}
    </div>
  );
}

/** قواعد التحقق لكل حقل — طول + محتوى */
const validators: Record<RequiredField, (v: string) => string | null> = {
  /** الاسم: حرفان على الأقل، لا أرقام */
  name: (v) => {
    if (v.trim().length < 2) return "الرجاء إدخال الاسم الكامل";
    if (/\d/.test(v))        return "الاسم لا يجب أن يحتوي على أرقام";
    return null;
  },
  /** الإيميل: صيغة صحيحة */
  email: (v) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v.trim())) return "الرجاء إدخال بريد إلكتروني صحيح (مثال: name@gmail.com)";
    return null;
  },
  /** الهاتف: أرقام وعلامات فقط (+، -، مسافة) */
  phone: (v) => {
    const clean = v.trim();
    if (clean.length < 9)             return "رقم الهاتف قصير جداً";
    if (!/^[\d+\-\s()]+$/.test(clean)) return "الهاتف يجب أن يحتوي على أرقام فقط";
    return null;
  },
  /** البلدة: حروف فقط، لا أرقام */
  city: (v) => {
    if (v.trim().length < 2) return "الرجاء إدخال اسم البلدة";
    if (/^\d+$/.test(v.trim())) return "اسم البلدة غير صحيح";
    return null;
  },
  /** العنوان: حد أدنى 5 أحرف */
  address: (v) => {
    if (v.trim().length < 5) return "الرجاء إدخال العنوان الكامل (الشارع ورقم البيت)";
    return null;
  },
};

/** نموذج بيانات العميل + قبول الشروط */
export default function CheckoutForm({
  shipping,
  onProceedToPayment,
}: {
  shipping: ShippingConfig;
  /** يُستدعى بعد إنشاء الطلب حين يكون الدفع الإلكتروني مفعّلاً — للانتقال لمرحلة الدفع في نفس الصفحة */
  onProceedToPayment?: (orderId: string) => void;
}) {
  const router    = useRouter();
  const cartItems     = useCart((s) => s.items);
  const getTotal      = useCart((s) => s.getTotal);
  const appliedCoupon = useCart((s) => s.appliedCoupon);

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", city: "", address: "", building: "", postalCode: "", notes: "",
  });

  /** الحقول التي خرج منها المستخدم — لإظهار الأخطاء فقط بعد onBlur */
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const [agreedPolicy,    setAgreedPolicy]    = useState(false);
  const [agreedTerms,     setAgreedTerms]     = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(true);
  const [focusedField,    setFocusedField]    = useState<string | null>(null);
  const [status,          setStatus]          = useState<FormStatus>("idle");

  /** حساب الشحن — للعناصر الفيزيائية فقط (الرقمية تُرسل بالبريد بلا شحن) */
  const physicalCount = cartItems.filter((i) => !i.isDigital).length;
  const shippingCost = computeShipping(getTotal(), physicalCount, shipping);
  const discount     = couponDiscount(appliedCoupon, getTotal());
  const grandTotal   = getTotal() + shippingCost - discount;

  /** تحديث حقل واحد */
  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /** تسجيل أن الحقل تم لمسه عند الخروج */
  function handleBlur(field: keyof FormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField(null);
  }

  /** خطأ الحقل — يظهر فقط إذا لُمس */
  function fieldError(field: RequiredField): string | null {
    if (!touched[field]) return null;
    return validators[field](form[field]);
  }

  /** لون حدود الحقل */
  function borderColor(field: RequiredField): string {
    if (fieldError(field)) return "var(--rose)";
    if (focusedField === field) return "var(--teal)";
    return "var(--bord)";
  }

  /** التحقق الكامل من النموذج */
  const isValid =
    !validators.name(form.name) &&
    !validators.email(form.email) &&
    !validators.phone(form.phone) &&
    !validators.city(form.city) &&
    !validators.address(form.address) &&
    agreedPolicy &&
    agreedTerms;

  /** إرسال الطلب — ينشئه في Supabase عبر /api/orders (الدفع الفعلي بـ HYP لاحقاً) */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name, email: form.email, phone: form.phone,
            city: form.city, address: form.address,
            building: form.building, postalCode: form.postalCode,
          },
          // نرسل slug + الكمية فقط — الأسعار تُحسب على السيرفر
          items: cartItems.map((i) => ({ slug: i.slug, quantity: i.quantity, gift: i.gift ?? null })),
          couponCode: appliedCoupon?.code ?? null,
          hasMarketingConsent: agreedMarketing,
          notes: form.notes,
          utm: getStoredUTM(),
        }),
      });

      if (!res.ok) throw new Error("order failed");

      const { id, paymentUrl } = (await res.json()) as { id: string; paymentUrl?: string | null };
      // وجود paymentUrl = HYP مُفعّل → ننتقل لمرحلة الدفع المدمجة في نفس الصفحة (بلا انتقال)؛
      // وإلا التدفّق اليدوي → صفحة التأكيد مباشرة (الطلب pending)
      if (paymentUrl && onProceedToPayment) {
        onProceedToPayment(id);
      } else {
        // نُبقي السلة حتى صفحة التأكيد (تُفرَّغ هناك لتجنّب race condition)
        router.push(`/order/${id}`);
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="rounded-[22px]"
        style={{
          background: "white",
          border: "1.5px solid var(--bord)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* ── هيدر ── */}
        <div
          className="font-heading font-bold text-dark"
          style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--bord)", fontSize: 17 }}
        >
          بيانات التوصيل
        </div>

        {/* ── الحقول ── */}
        <div style={{ padding: "24px" }} className="flex flex-col gap-4">

          {/* الاسم الكامل */}
          <div>
            <label style={labelStyle}>الاسم الكامل *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="الاسم الأول والأخير"
              autoComplete="name"
              style={{ ...inputBase, border: `1.5px solid ${borderColor("name")}` }}
              onFocus={() => setFocusedField("name")}
              onBlur={() => handleBlur("name")}
            />
            {fieldError("name") && <FieldError msg={fieldError("name")!} />}
          </div>

          {/* صف الإيميل والهاتف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>البريد الإلكتروني *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                dir="ltr"
                style={{ ...inputBase, border: `1.5px solid ${borderColor("email")}`, textAlign: "right" }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => handleBlur("email")}
              />
              {fieldError("email") && <FieldError msg={fieldError("email")!} />}
            </div>
            <div>
              <label style={labelStyle}>رقم الهاتف *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+972 5X-XXXXXXX"
                autoComplete="tel"
                dir="ltr"
                style={{ ...inputBase, border: `1.5px solid ${borderColor("phone")}`, textAlign: "right" }}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => handleBlur("phone")}
              />
              {fieldError("phone") && <FieldError msg={fieldError("phone")!} />}
            </div>
          </div>

          {/* البلدة + الرمز البريدي */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>البلدة *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="اسم البلدة"
                autoComplete="address-level2"
                style={{ ...inputBase, border: `1.5px solid ${borderColor("city")}` }}
                onFocus={() => setFocusedField("city")}
                onBlur={() => handleBlur("city")}
              />
              {fieldError("city") && <FieldError msg={fieldError("city")!} />}
            </div>
            <div>
              <label style={labelStyle}>الرمز البريدي (اختياري)</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="مثال: 1610001"
                autoComplete="postal-code"
                dir="ltr"
                inputMode="numeric"
                style={{ ...inputBase, border: `1.5px solid ${focusedField === "postalCode" ? "var(--teal)" : "var(--bord)"}`, textAlign: "right" }}
                onFocus={() => setFocusedField("postalCode")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* العنوان */}
          <div>
            <label style={labelStyle}>العنوان *</label>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="الشارع ورقم البيت"
              rows={2}
              style={{ ...inputBase, border: `1.5px solid ${borderColor("address")}`, resize: "none" }}
              onFocus={() => setFocusedField("address")}
              onBlur={() => handleBlur("address")}
            />
            {fieldError("address") && <FieldError msg={fieldError("address")!} />}
          </div>

          {/* طابق / شقة / مدخل */}
          <div>
            <label style={labelStyle}>طابق / شقة / مدخل (اختياري)</label>
            <input
              type="text"
              value={form.building}
              onChange={(e) => updateField("building", e.target.value)}
              placeholder="مثال: طابق 3، شقة 8، مدخل ب"
              style={{ ...inputBase, border: `1.5px solid ${focusedField === "building" ? "var(--teal)" : "var(--bord)"}` }}
              onFocus={() => setFocusedField("building")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        {/* ── معلومات إضافية ── */}
        <div style={{ padding: "20px 24px", borderTop: "1.5px solid var(--bord)" }}>
          <div className="font-heading font-bold text-dark mb-3" style={{ fontSize: 15 }}>
            معلومات إضافية
          </div>
          <label style={labelStyle}>ملاحظات الطلب (اختياري)</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="ملاحظات حول الطلب"
            rows={3}
            style={{
              ...inputBase,
              border: `1.5px solid ${focusedField === "notes" ? "var(--teal)" : "var(--bord)"}`,
              resize: "none",
            }}
            onFocus={() => setFocusedField("notes")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* ── قسم الموافقة ── */}
        <div
          style={{ padding: "20px 24px", borderTop: "1.5px solid var(--bord)", background: "var(--offwh)" }}
          className="flex flex-col gap-3"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedPolicy}
              onChange={(e) => setAgreedPolicy(e.target.checked)}
              className="shrink-0"
              style={{ accentColor: "var(--teal)", width: 17, height: 17, cursor: "pointer" }}
            />
            <span className="text-[13px] text-mid">
              لقد قرأتُ{" "}
              <Link href="/privacy" className="text-teal font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                سياسة الخصوصية
              </Link>
              {" "}وأوافق عليها لهذا الموقع
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="shrink-0"
              style={{ accentColor: "var(--teal)", width: 17, height: 17, cursor: "pointer" }}
            />
            <span className="text-[13px] text-mid">
              لقد قرأتُ{" "}
              <Link href="/terms" className="text-teal font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                الشروط والأحكام
              </Link>
              {" "}وأوافق عليها لهذا الموقع
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedMarketing}
              onChange={(e) => setAgreedMarketing(e.target.checked)}
              className="shrink-0"
              style={{ accentColor: "var(--teal)", width: 17, height: 17, cursor: "pointer" }}
            />
            <span className="text-[13px] text-mid">
              أوافق على إرسال مواد دعائية عبر البريد الإلكتروني أو رسالة SMS/Whatsapp
            </span>
          </label>
        </div>

        {/* ── زر الدفع ── */}
        <div style={{ padding: "20px 24px", borderTop: "1.5px solid var(--bord)" }}>
          {status === "error" && (
            <div
              className="text-center text-[13px] mb-3 rounded-[10px] py-2"
              style={{ background: "#FEF5F7", color: "var(--rose)", border: "1px solid var(--roselt)" }}
            >
              حدث خطأ، يرجى المحاولة مجدداً
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || status === "submitting"}
            className="w-full font-label font-bold text-white text-[16px] active:scale-[0.98] [transition:background-color_200ms_ease,box-shadow_200ms_ease,transform_160ms_ease-out]"
            style={{
              background: isValid ? "var(--rose)" : "var(--light)",
              border: "none",
              borderRadius: 50,
              padding: "15px",
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: isValid ? "0 6px 20px rgba(242,167,181,0.45)" : "none",
              opacity: status === "submitting" ? 0.8 : 1,
            }}
          >
            {status === "submitting"
              ? "جارٍ تجهيز الدفع الآمن…"
              : `المتابعة للدفع الآمن — ₪${grandTotal} ←`}
          </button>

          <p className="text-center text-[12px] text-light mt-3">
            🔒 لن يُخصم أي مبلغ قبل إدخالك بيانات الدفع في الخطوة التالية
          </p>
        </div>
      </div>
    </form>
  );
}
