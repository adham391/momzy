import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import SetPasswordForm from "@/components/library/SetPasswordForm";
import { peekLibraryToken } from "@/lib/db/library";
import { getCurrentAccount } from "@/lib/library/auth";
import { redirect } from "@/lib/i18n/navigation";
import { getLocale } from "next-intl/server";

/** صفحة إنشاء/استعادة كلمة المرور — بالتوكن من الإيميل */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  return { title: t("setupMetaTitle"), robots: { index: false, follow: false } };
}

interface SetupPageProps {
  params: Promise<{ token: string }>;
}

/**
 * تثبيت كلمة المرور من رابط الإيميل (دعوة أول مرة أو استعادة).
 * التوكن يُفحص هنا للعرض فقط — الاستهلاك الفعلي ذرّي في POST /api/library/password.
 */
export default async function LibrarySetupPage({ params }: SetupPageProps) {
  const { token } = await params;
  const t = await getTranslations("library");

  const peek = await peekLibraryToken(token);

  // طلب واحد يرسل إيميلًا لكل كتيب، وكلها تحمل رابط الإنشاء نفسه (توكن
  // لمرة واحدة). فمن ثبّتت كلمتها من الرابط الأول ثم ضغطت الثاني لا يصحّ أن
  // تُستقبل بـ«انتهت الصلاحية» — هي داخلة أصلًا، فنأخذها إلى مكتبتها.
  if (!peek && (await getCurrentAccount())) {
    redirect({ href: "/library", locale: await getLocale() });
  }

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh", padding: "64px 0 80px" }}>
      <Container>
        <div
          className="mx-auto bg-white"
          style={{
            maxWidth: 440,
            borderRadius: 22,
            border: "1.5px solid var(--bord)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            padding: "32px 28px",
          }}
        >
          {peek ? (
            <SetPasswordForm token={token} />
          ) : (
            /* رابط منتهٍ أو مستعمَل — توجيه لطلب رابط جديد من صفحة الدخول */
            <div className="text-center">
              <div style={{ fontSize: 44, marginBottom: 12 }}>⌛</div>
              <h1 className="font-heading font-bold text-dark mb-2" style={{ fontSize: 20 }}>
                {t("linkExpiredTitle")}
              </h1>
              <p className="text-mid mb-6" style={{ fontSize: 14, lineHeight: 1.9 }}>
                {t("linkExpiredBody")}
              </p>
              <Link
                href="/library"
                className="inline-block font-label font-bold text-white"
                style={{ background: "var(--rose)", borderRadius: 50, padding: "12px 28px", fontSize: 14 }}
              >
                {t("goToLibrary")}
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
