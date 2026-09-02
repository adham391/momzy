import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import LibraryAuth from "@/components/library/LibraryAuth";
import AccountBar from "@/components/library/AccountBar";
import { getCurrentAccount } from "@/lib/library/auth";
import { getLibraryItems, type LibraryItem } from "@/lib/db/library";
import { getProductImageMap } from "@/lib/products/getProductImageMap";
import { BOOKLET_COVER_RATIO } from "@/lib/products/helpers";

/** صفحة المكتبة — تعتمد على كوكي الجلسة، لا تُخزَّن مؤقتًا */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * مكتبة العميلة — كتيباتها الآن، وورشاتها المسجّلة لاحقًا.
 * بلا جلسة → نموذج الدخول؛ بجلسة → الرفّ بتوكنات قراءة تتجدّد تلقائيًا.
 */
export default async function LibraryPage() {
  const t = await getTranslations("library");
  const account = await getCurrentAccount();

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── الهيدر ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
          paddingTop: 56,
          paddingBottom: 80,
        }}
      >
        <Container>
          <h1 className="font-heading font-bold text-h1 mb-2" style={{ color: "var(--dark)" }}>
            {t("title")}
          </h1>
          <p
            className="font-body text-[15px]"
            style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
          >
            {account ? t("subtitleLoggedIn") : t("subtitle")}
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      <Container>
        <div className="mt-8 max-w-[920px] mx-auto">
          {account ? <Shelf email={account.email} /> : <LibraryAuth />}
        </div>
      </Container>
    </div>
  );
}

/* ── الرفّ — مشتريات العميلة الرقمية ─────────────────────────── */

async function Shelf({ email }: { email: string }) {
  const t = await getTranslations("library");
  const [items, imageMap] = await Promise.all([getLibraryItems(email), getProductImageMap()]);

  return (
    <div className="flex flex-col gap-6">
      <AccountBar email={email} />

      {items.length === 0 ? (
        <EmptyShelf />
      ) : (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
        >
          {items.map((item) => (
            <ShelfCard key={item.id} item={item} cover={imageMap.get(item.productSlug)} readLabel={t("readNow")} giftLabel={t("giftBadge")} />
          ))}
        </div>
      )}
    </div>
  );
}

/** بطاقة كتيب على الرفّ — الرابط يفتح القارئ بتوكن مجدَّد */
function ShelfCard({
  item,
  cover,
  readLabel,
  giftLabel,
}: {
  item: LibraryItem;
  cover?: string;
  readLabel: string;
  giftLabel: string;
}) {
  return (
    <Link
      href={`/read/${item.token}`}
      className="group flex flex-col overflow-hidden bg-white [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[4px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)]"
      style={{ borderRadius: 20, border: "1.5px solid var(--bord)" }}
    >
      {/* الغلاف */}
      <div
        className="flex items-center justify-center"
        style={{ background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))", padding: "20px 0" }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={item.productName}
            width={150}
            height={214}
            className="object-contain shadow-md"
            style={{ aspectRatio: BOOKLET_COVER_RATIO, width: "auto", height: 190, borderRadius: 6 }}
            unoptimized
          />
        ) : (
          <span style={{ fontSize: 54 }}>📖</span>
        )}
      </div>

      {/* الاسم + الفعل */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-heading font-bold text-dark leading-snug" style={{ fontSize: 15.5 }}>
            {item.productName}
          </span>
          {item.isGift && (
            <span
              className="shrink-0 font-label font-bold rounded-full"
              style={{ background: "var(--rosepale)", color: "#D9697A", fontSize: 10.5, padding: "3px 9px" }}
            >
              🎁 {giftLabel}
            </span>
          )}
        </div>
        <span className="font-label font-bold text-teal" style={{ fontSize: 13.5 }}>
          {readLabel}
        </span>
      </div>
    </Link>
  );
}

/** رفّ فارغ — بريد بلا مشتريات رقمية بعد */
async function EmptyShelf() {
  const t = await getTranslations("library");
  return (
    <div
      className="text-center bg-white"
      style={{ borderRadius: 22, border: "1.5px solid var(--bord)", padding: "56px 24px" }}
    >
      <div style={{ fontSize: 52, marginBottom: 14 }}>📚</div>
      <h2 className="font-heading font-bold text-dark mb-2" style={{ fontSize: 20 }}>
        {t("emptyTitle")}
      </h2>
      <p className="text-mid mb-6" style={{ fontSize: 14, lineHeight: 1.9 }}>
        {t("emptyBody")}
      </p>
      <Link
        href="/shop"
        className="inline-block font-label font-bold text-white"
        style={{ background: "var(--rose)", borderRadius: 50, padding: "12px 28px", fontSize: 14 }}
      >
        {t("emptyCta")}
      </Link>
    </div>
  );
}
