import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { getDownloadStatus } from "@/lib/db/downloads";

/** رابط التحميل بالتوكن — لا يُخزَّن مؤقتًا */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "تحميل الكتيب | Momzy" };

interface DownloadPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ e?: string }>;
}

export default async function DownloadPage({ params, searchParams }: DownloadPageProps) {
  const { token } = await params;
  const { e } = await searchParams;

  // أخطاء قادمة من الـ API (ملف غير مرفوع / تعذّر الجلب)
  if (e === "nofile") {
    return (
      <StateCard
        icon="⏳"
        title="الكتيب قيد التجهيز"
        body="كتيبكِ محجوز لكِ! نضع اللمسات الأخيرة على النسخة النهائية، وسيصلكِ رابط التحميل قريبًا. لأي استفسار تواصلي معنا."
      />
    );
  }
  if (e === "fetch") {
    return (
      <StateCard
        icon="⚠️"
        title="تعذّر التحميل مؤقتًا"
        body="حدث خطأ بسيط أثناء تجهيز الملف. حاولي مرة أخرى بعد قليل، وإن استمرّ تواصلي معنا."
      />
    );
  }

  const status = await getDownloadStatus(token);

  if (!status) {
    return (
      <StateCard
        icon="🔗"
        title="رابط غير صالح"
        body="رابط التحميل غير صحيح أو لم يعد موجودًا. تأكّدي من الرابط كاملًا، أو تواصلي معنا."
      />
    );
  }

  if (!status.valid) {
    const body =
      status.reason === "expired"
        ? "انتهت صلاحية رابط التحميل (7 أيام من تاريخ الطلب). تواصلي معنا لإعادة إرساله."
        : "بلغتِ الحد الأقصى لعدد مرّات التحميل. تواصلي معنا وسنساعدك بكل سرور.";
    return <StateCard icon="⌛" title="الرابط لم يعد متاحًا" body={body} />;
  }

  const { row } = status;
  const remaining = row.max_downloads - row.download_count;
  const exp = new Date(row.expires_at);
  const expStr = `${exp.getDate()}/${exp.getMonth() + 1}/${exp.getFullYear()}`;

  return (
    <Shell>
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex items-center justify-center"
          style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--tealpale)", fontSize: 34 }}
        >
          🎉
        </div>
        <h1 className="font-heading font-bold mb-2" style={{ fontSize: 26, color: "var(--dark)" }}>
          كتيبكِ جاهز للتحميل
        </h1>
        <p className="font-heading font-bold" style={{ fontSize: 18, color: "var(--dark)" }}>
          {row.product_name}
        </p>
        <p className="text-[13px] mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
          بصيغة PDF — قابل للطباعة والقراءة دون إنترنت.
        </p>

        <a
          href={`/api/download/${token}`}
          className="inline-flex items-center justify-center gap-2 font-label font-bold w-full [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] hover:-translate-y-[2px]"
          style={{
            fontSize: 17,
            background: "var(--rose)",
            color: "var(--dark)",
            border: "none",
            borderRadius: 50,
            padding: "15px 26px",
            boxShadow: "0 10px 28px rgba(242,167,181,0.5)",
          }}
        >
          ⬇️ تحميل الكتيب (PDF)
        </a>

        <p className="text-[12px] mt-4" style={{ color: "var(--light)", fontFamily: "'Tajawal', sans-serif" }}>
          المتبقّي: {remaining} من {row.max_downloads} مرّات · صالح حتى {expStr}
        </p>
      </div>
    </Shell>
  );
}

/* ── مكوّنات العرض ── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ background: "var(--offwh)", padding: "clamp(48px, 8vw, 96px) 0" }}>
      <Container>
        <div
          className="mx-auto rounded-[24px]"
          style={{
            maxWidth: 460,
            background: "white",
            border: "1.5px solid var(--bord)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
            padding: "clamp(28px, 5vw, 44px)",
          }}
        >
          {children}
        </div>
      </Container>
    </section>
  );
}

function StateCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <Shell>
      <div className="text-center">
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
        <Link
          href="/contact"
          className="inline-flex items-center justify-center font-label font-bold"
          style={{
            fontSize: 14,
            background: "var(--teal)",
            color: "white",
            borderRadius: 50,
            padding: "11px 26px",
          }}
        >
          تواصلي معنا
        </Link>
      </div>
    </Shell>
  );
}
