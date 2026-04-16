import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import LatestBigCardBody from "./LatestBigCardBody";
import PolkaDots from "@/components/ui/PolkaDots";

/** قسم آخر التحديثات — أحدث المنتجات */
export default function LatestSection() {
  return (
    /** ─ الـ section نفسه شفاف — الـ z-index والـ negative margin يخلقان التداخل ─ */
    <section className="relative reveal-section" style={{ marginTop: -40, zIndex: 2 }}>

      {/* ── موجة أعلى القسم — تغطي نهاية الهيرو بلون القسم الحالي ── */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 80 }}
        aria-hidden="true"
      >
        <path d="M0,40 C480,0 960,0 1440,40 L1440,80 L0,80 Z" fill="#F5F0EA" />
      </svg>

      {/* ── محتوى القسم مع الخلفية ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#F5F0EA",
          backgroundImage: `
            radial-gradient(circle, rgba(242,167,181,0.18) 1px, transparent 1px),
            radial-gradient(circle, rgba(130,201,196,0.13) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 44px 44px",
          backgroundPosition: "0 0, 14px 14px",
          marginTop: -1,
        }}
      >
        {/* ── نقاط ديكورية متحركة ── */}
        <PolkaDots opacity={0.25} count={18} />

        <div className="pb-14">
          <Container className="relative z-[2]">

            {/* ── عنوان القسم ── */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <SectionLabel color="teal">جديد في Momzy</SectionLabel>
                <h2 className="font-heading text-[clamp(28px,3vw,42px)] font-bold text-dark">
                  آخر <span className="text-rose">التحديثات</span>
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[13px] font-semibold text-teal transition-all hover:gap-2 flex items-center gap-1.5 hover:text-teal/80"
              >
                كل المنتجات ←
              </Link>
            </div>

            {/* ── شبكة المنتجات ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5">

              {/* الكارد الكبير — صندوق مشوار أم */}
              <Link
                href="/shop/mshwar-am-box"
                className="group bg-white border-[1.5px] border-bord rounded-[24px] grid grid-cols-1 md:grid-cols-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] hover:-translate-y-1.5"
              >
                {/* منطقة الصورة */}
                <div className="bg-gradient-to-br from-rosepale to-[#fde8ee] flex items-center justify-center text-[100px] p-8 relative min-h-[200px]">
                  📦
                  <span className="absolute top-3.5 end-3.5 bg-yellow text-dark font-label text-[9px] font-extrabold tracking-[1.5px] uppercase px-3.5 py-[5px] rounded-full shadow-sm">
                    جديد الآن
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* محتوى الكارد */}
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="font-label text-[10px] font-bold tracking-[2px] uppercase text-light mb-2.5">
                      منتج فعلي · Limited Edition
                    </div>
                    <div className="font-heading text-[26px] text-dark mb-3 leading-[1.3]">
                      صندوق مشوار أم
                    </div>
                    <LatestBigCardBody />
                    <div className="flex gap-2 flex-wrap mb-6">
                      <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">✦ مختار بعناية</span>
                      <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">✦ شحن سريع</span>
                      <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">✦ كميات محدودة</span>
                    </div>
                  </div>
                  <span className="btn-wobble inline-flex items-center gap-2 bg-rose text-white shadow-[0_4px_16px_rgba(242,167,181,0.45)] px-7 py-3 rounded-full text-[13px] font-bold w-fit transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(242,167,181,0.55)] group-hover:-translate-y-0.5">
                    اطلبي الآن ←
                  </span>
                </div>
              </Link>

              {/* الكارد الصغير — كتيب الرضاعة */}
              <Link
                href="/shop/breastfeeding-guide"
                className="group bg-white border-[1.5px] border-bord rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] hover:-translate-y-1.5 flex flex-col"
              >
                <div className="bg-gradient-to-br from-tealpale to-[#d4f0ee] flex-1 flex items-center justify-center text-[72px] p-7 relative min-h-[180px]">
                  📗
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <div className="font-label text-[9px] font-bold tracking-[2px] uppercase text-light mb-2">
                    كتيب رقمي · PDF
                  </div>
                  <div className="font-heading text-xl text-dark mb-2">
                    كتيب الرضاعة الطبيعية
                  </div>
                  <div className="text-[13px] text-mid leading-[1.65] mb-5">
                    دليل شامل من الوضعيات الصحيحة إلى حل المشكلات الشائعة — تنزيل فوري.
                  </div>
                  <span className="btn-wobble inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal transition-all duration-200 group-hover:gap-2.5">
                    احصلي عليه ←
                  </span>
                </div>
              </Link>

            </div>
          </Container>
        </div>
      </div>

    </section>
  );
}
