import { getSettingsMap, boolSetting } from "@/lib/db/settings";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";
import { updateOperationalSettingsAction, updateSiteContentAction, updateNotifyEmailsAction } from "./actions";
import { NOTIFY_EMAIL_SETTING_KEYS } from "@/lib/notifications/recipients";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعدادات — لوحة Momzy" };

export default async function AdminSettingsPage() {
  const [settings, site] = await Promise.all([getSettingsMap(), getSiteSettings()]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">الإعدادات</h1>
      <p className="text-mid text-body-sm mb-6">إعدادات المتجر والتواصل — تُطبَّق على الموقع فوراً.</p>

      <div className="grid grid-cols-1 gap-5">
        {/* ── إعدادات المتجر (Supabase) ── */}
        <Card title="المتجر والشحن">
          <form action={updateOperationalSettingsAction} className="flex flex-col gap-4">
            <Toggle
              name="shop_is_open"
              label="المتجر مفتوح للطلبات"
              defaultChecked={boolSetting(settings["shop_is_open"], true)}
            />
            <Toggle
              name="booking_is_open"
              label="الحجوزات مفتوحة"
              defaultChecked={boolSetting(settings["booking_is_open"], true)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="default_shipping_cost"
                label="رسوم الشحن (₪)"
                type="number"
                defaultValue={settings["default_shipping_cost"] ?? "35"}
              />
              <TextField
                name="free_shipping_min"
                label="حد الشحن المجاني (₪) — 0 = لا يوجد"
                type="number"
                defaultValue={settings["free_shipping_min"] ?? "0"}
              />
            </div>
            <TextField
              name="whatsapp_number"
              label="رقم واتساب هبة للإشعارات"
              defaultValue={settings["whatsapp_number"] ?? ""}
              ltr
              placeholder="+972501234567"
            />
            <SaveButton />
          </form>
        </Card>

        {/* ── وجهات الإشعارات (Supabase) ── */}
        <Card title="وجهات الإشعارات">
          <p className="text-mid text-body-sm mb-4 leading-relaxed">
            صندوق لكل نوع كي يبقى الوارد مرتّبًا. اتركي الحقل فارغًا ليذهب نوعه إلى
            البريد الافتراضي. الطلب الذي يجمع منتجًا وكتيبًا يصل الصندوقين معًا.
          </p>
          <form action={updateNotifyEmailsAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name={NOTIFY_EMAIL_SETTING_KEYS.orders}
                label="طلبات المتجر"
                defaultValue={settings[NOTIFY_EMAIL_SETTING_KEYS.orders] ?? ""}
                ltr
                placeholder="orders@momzyworld.com"
              />
              <TextField
                name={NOTIFY_EMAIL_SETTING_KEYS.bookings}
                label="تسجيلات الورشات"
                defaultValue={settings[NOTIFY_EMAIL_SETTING_KEYS.bookings] ?? ""}
                ltr
                placeholder="workshops@momzyworld.com"
              />
              <TextField
                name={NOTIFY_EMAIL_SETTING_KEYS.booklets}
                label="الكتيبات الرقمية"
                defaultValue={settings[NOTIFY_EMAIL_SETTING_KEYS.booklets] ?? ""}
                ltr
                placeholder="booklets@momzyworld.com"
              />
              <TextField
                name={NOTIFY_EMAIL_SETTING_KEYS.contact}
                label="رسائل التواصل"
                defaultValue={settings[NOTIFY_EMAIL_SETTING_KEYS.contact] ?? ""}
                ltr
                placeholder="hello@momzyworld.com"
              />
            </div>
            <SaveButton />
          </form>
        </Card>

        {/* ── محتوى الموقع (Sanity) ── */}
        <Card title="الشريط العلوي والتواصل">
          <form action={updateSiteContentAction} className="flex flex-col gap-4">
            <TextField
              name="topbar_message"
              label="رسالة الشريط العلوي"
              defaultValue={site.topBar.message ?? ""}
              placeholder="صندوق مشوار أم — اطلبي الآن قبل نفاد الكمية"
            />
            <TextField
              name="topbar_badge"
              label="شارة الشريط (كلمة صغيرة)"
              defaultValue={site.topBar.badge ?? ""}
              placeholder="جديد"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="contact_email"
                label="بريد التواصل"
                defaultValue={site.contact.email ?? ""}
                ltr
                placeholder="hello@momzyworld.com"
              />
              <TextField
                name="contact_whatsapp"
                label="واتساب التواصل"
                defaultValue={site.contact.whatsappNumber ?? ""}
                ltr
                placeholder="+972501234567"
              />
            </div>
            <SaveButton />
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ── مكوّنات ── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--rl)] border border-bord p-5 md:p-6">
      <h2 className="font-heading font-bold text-dark text-body mb-4">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  ltr,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  ltr?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-body-sm font-bold text-dark">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        dir={ltr ? "ltr" : undefined}
        className="w-full px-3.5 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose"
        style={ltr ? { textAlign: "right" } : undefined}
      />
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-body-sm font-bold text-dark">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-5 h-5 shrink-0"
        style={{ accentColor: "var(--teal)" }}
      />
    </label>
  );
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="self-start px-6 py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition"
    >
      حفظ
    </button>
  );
}
