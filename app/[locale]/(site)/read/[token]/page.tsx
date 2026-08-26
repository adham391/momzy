import type { Metadata } from "next";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import FlipbookReader from "@/components/booklet/FlipbookReader";
import { getDownloadStatus, recordReadView } from "@/lib/db/downloads";
import { getBookletMeta } from "@/lib/booklets/reader";

/** صفحة القراءة بالتوكن — لا تُخزَّن مؤقتًا */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "download" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

interface ReadPageProps {
  params: Promise<{ token: string }>;
}

/**
 * قارئ الكتيب — flipbook على الموقع فقط (بلا تحميل).
 * التوكن يصل المشترية بالإيميل بعد الطلب؛ صالح لسنة، قراءة غير محدودة.
 */
export default async function ReadPage({ params }: ReadPageProps) {
  const { token } = await params;
  const t = await getTranslations("download");

  const status = await getDownloadStatus(token);

  if (!status) {
    return <StateCard icon="🔗" title={t("invalidTitle")} body={t("invalidBody")} contactLabel={t("contactUs")} />;
  }
  if (!status.valid) {
    return <StateCard icon="⌛" title={t("unavailableTitle")} body={t("expiredBody")} contactLabel={t("contactUs")} />;
  }

  // الكتيب نفسه — صور الصفحات المرفوعة للمنتج المشترى
  const meta = await getBookletMeta(status.row.product_slug);
  if (!meta) {
    return <StateCard icon="⏳" title={t("nofileTitle")} body={t("nofileBody")} contactLabel={t("contactUs")} />;
  }

  // عدّاد مشاهدات — رصد لمشاركة الرابط، بعد الرد (لا يؤخّر القراءة)
  after(() => recordReadView(status.row.id));

  return (
    <FlipbookReader
      token={token}
      pages={meta.pages}
      ratio={meta.width / meta.height}
      title={status.row.product_name}
    />
  );
}

/* ── حالة غير صالحة/منتهية/قيد التجهيز ── */
function StateCard({ icon, title, body, contactLabel }: {
  icon: string;
  title: string;
  body: string;
  contactLabel: string;
}) {
  return (
    <section style={{ background: "var(--offwh)", padding: "clamp(48px, 8vw, 96px) 0" }}>
      <Container>
        <div
          className="mx-auto rounded-[24px] text-center"
          style={{
            maxWidth: 460,
            background: "white",
            border: "1.5px solid var(--bord)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
            padding: "clamp(28px, 5vw, 44px)",
          }}
        >
          <div
            className="mx-auto mb-5 flex items-center justify-center"
            style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--rosepale)", fontSize: 30 }}
          >
            {icon}
          </div>
          <h1 className="font-heading font-bold mb-3" style={{ fontSize: 22, color: "var(--dark)" }}>
            {title}
          </h1>
          <p className="text-[14px] leading-[1.9] mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            {body}
          </p>
          <Button variant="teal" href="/contact">
            {contactLabel}
          </Button>
        </div>
      </Container>
    </section>
  );
}
