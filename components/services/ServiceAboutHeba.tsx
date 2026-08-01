import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import { getAboutPage } from "@/lib/sanity/queries/aboutPage";

interface ServiceAboutHebaProps {
  /** لون التمييز — لون الخدمة */
  accent: string;
  /** ترتيب التداخل بين الأقسام */
  zIndex: number;
}

/**
 * «من ترافقك؟» — تعريف مختصر بهبة داخل صفحة الورشة، يبني الثقة قبل التسجيل.
 * يقرأ من نفس مصدر صفحة «عن هبة» (aboutPage في Sanity) — لا نسخة ثانية من سيرتها.
 */
export default async function ServiceAboutHeba({ accent, zIndex }: ServiceAboutHebaProps) {
  const about = await getAboutPage();

  return (
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex }}>
      <SectionWave fill="var(--cream)" />
      <div style={{ background: "var(--cream)", marginTop: -1, padding: "24px 0 72px" }}>
        <Container>
          <div className="text-center mb-8">
            <p
              className="font-label font-bold mb-2"
              style={{ color: accent, letterSpacing: "2.5px", textTransform: "uppercase", fontSize: 15 }}
            >
              مرشدتك
            </p>
            <h2
              className="font-heading font-bold"
              style={{ fontSize: "clamp(24px, 3vw, 32px)", color: "var(--dark)" }}
            >
              من ترافقكِ في هذه الورشة؟
            </h2>
          </div>

          <div
            className="mx-auto rounded-[24px] flex flex-col md:flex-row items-center gap-7 md:gap-9"
            style={{
              maxWidth: 780,
              background: "white",
              border: "1.5px solid var(--bord)",
              padding: "32px 30px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {/* الصورة */}
            <div
              className="relative shrink-0 rounded-full overflow-hidden"
              style={{ width: 132, height: 132, border: `3px solid ${accent}` }}
            >
              <Image
                src={about.image}
                alt={about.name}
                fill
                sizes="132px"
                className="object-cover"
              />
            </div>

            {/* النص */}
            <div className="flex-1 text-center md:text-right">
              <h3 className="font-heading font-bold text-dark text-[21px] mb-1.5">{about.name}</h3>

              {/* الشهادات */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3.5">
                {about.credentials.map((c) => (
                  <span
                    key={c}
                    className="font-label text-[11.5px] font-bold"
                    style={{
                      background: "var(--tealpale)",
                      color: "var(--teal)",
                      borderRadius: 50,
                      padding: "5px 12px",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              <p
                className="text-[14px] leading-[1.95] text-mid mb-5"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {about.tagline}
              </p>

              {/* الأرقام */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-5">
                {about.stats.map((s) => (
                  <div key={s.label} className="text-center md:text-right">
                    <div
                      className="font-label font-extrabold text-[19px]"
                      style={{ color: accent, direction: "ltr" }}
                    >
                      {s.number}
                    </div>
                    <div className="font-label text-[11.5px] text-light">{s.label}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-block font-label font-bold text-[13.5px] active:scale-[0.98] [transition:transform_160ms_ease-out]"
                style={{
                  background: "var(--offwh)",
                  border: "1.5px solid var(--bord)",
                  color: "var(--mid)",
                  borderRadius: 50,
                  padding: "10px 24px",
                }}
              >
                اقرئي قصة هبة كاملة ←
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
