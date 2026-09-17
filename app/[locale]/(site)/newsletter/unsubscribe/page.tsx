import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import { checkUnsubscribeLink, emailFromLink } from "@/lib/newsletter/unsubscribe";
import { confirmUnsubscribe } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ e?: string; t?: string; done?: string; failed?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletterUnsubscribe" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * صفحة إلغاء الاشتراك في النشرة — وجهة الرابط في تذييل كل نشرة (?e=البريد&t=الرمز).
 * فتح الرابط يعرض التأكيد فقط؛ الإلغاء بزرّ في الصفحة، فلا تلغيه برامج فحص البريد
 * التي تفتح الروابط آليًا. الحالات: تأكيد · تمّ · ملغى أصلًا · رابط غير صالح.
 */
export default async function NewsletterUnsubscribePage({ params, searchParams }: PageProps) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "newsletterUnsubscribe" });

  if (sp.done === "1") {
    return (
      <StatusCard icon="✓" title={t("doneTitle")} label={t("label")}>
        <p className="text-body-sm text-mid leading-[1.95] mb-7">{t("doneText")}</p>
        <HomeLink>{t("backHome")}</HomeLink>
      </StatusCard>
    );
  }

  const email = emailFromLink(sp.e);
  const token = sp.t ?? "";
  const state = await checkUnsubscribeLink(email, token);

  if (state === "invalid") {
    return (
      <StatusCard icon="!" title={t("invalidTitle")} label={t("label")}>
        <p className="text-body-sm text-mid leading-[1.95] mb-7">{t("invalidText")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-rose px-7 py-3 font-bold text-dark">
            {t("contactUs")}
          </Link>
          <HomeLink subtle>{t("backHome")}</HomeLink>
        </div>
      </StatusCard>
    );
  }

  if (state === "unsubscribed") {
    return (
      <StatusCard icon="✓" title={t("alreadyTitle")} label={t("label")}>
        <p className="text-body-sm text-mid leading-[1.95] mb-3">{t("alreadyText")}</p>
        <EmailPill email={email} />
        <HomeLink>{t("backHome")}</HomeLink>
      </StatusCard>
    );
  }

  return (
    <StatusCard icon="✉" title={t("confirmTitle")} label={t("label")}>
      <p className="text-body-sm text-mid leading-[1.95] mb-3">{t("confirmText")}</p>
      <EmailPill email={email} />
      {sp.failed === "1" && (
        <p className="mb-5 rounded-[12px] bg-rosepale px-4 py-2.5 text-[13px] text-dark">{t("failed")}</p>
      )}
      <form action={confirmUnsubscribe} className="flex flex-wrap items-center justify-center gap-3">
        <input type="hidden" name="e" value={email} />
        <input type="hidden" name="t" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="rounded-full bg-rose px-7 py-3 font-bold text-dark">
          {t("confirmButton")}
        </button>
        <HomeLink subtle>{t("keep")}</HomeLink>
      </form>
    </StatusCard>
  );
}

/** بطاقة الحالة — أيقونة وتسمية وعنوان في وسط الصفحة */
function StatusCard({ icon, label, title, children }: { icon: string; label: string; title: string; children: ReactNode }) {
  return (
    <section style={{ background: "linear-gradient(135deg, #FFF5F7 0%, #FDFAF5 55%, #EFF8F8 100%)" }}>
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center py-16">
          <div className="w-full max-w-[520px] rounded-[24px] border border-bord bg-white px-7 py-10 text-center shadow-[0_16px_48px_rgba(0,0,0,0.06)] sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rosepale text-[26px] text-rose">
              {icon}
            </div>
            <p className="mb-2 font-label text-[12px] font-bold tracking-[2px] text-teal">{label}</p>
            <h1 className="mb-4 font-heading text-h2 font-bold leading-[1.4] text-dark">{title}</h1>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** البريد في سطر مستقلّ — اتجاهه LTR فلا يتبعثر داخل النص العربي */
function EmailPill({ email }: { email: string }) {
  return (
    <p dir="ltr" className="mx-auto mb-7 inline-block rounded-full border border-bord bg-offwh px-5 py-2 text-[14px] font-bold text-dark">
      {email}
    </p>
  );
}

function HomeLink({ children, subtle }: { children: ReactNode; subtle?: boolean }) {
  return (
    <Link
      href="/"
      className={
        subtle
          ? "px-4 py-3 text-body-sm font-bold text-mid hover:text-dark"
          : "inline-block rounded-full border border-bord px-7 py-3 text-body-sm font-bold text-dark hover:bg-offwh"
      }
    >
      {children}
    </Link>
  );
}
