import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import LatestBigCardBody from "./LatestBigCardBody";

/** قسم آخر التحديثات — أحدث المنتجات */
export default function LatestSection() {
  return (
    <section className="py-11 bg-offwh border-t-[1.5px] border-b-[1.5px] border-bord relative overflow-hidden">
      {/* دوائر ديكورية */}
      <span className="absolute w-[300px] h-[300px] rounded-full bg-rose/[.08] -top-20 -end-[60px] pointer-events-none" />
      <span className="absolute w-[180px] h-[180px] rounded-full bg-mint/10 -bottom-[50px] start-10 pointer-events-none" />

      <Container className="relative z-[2]">
        {/* عنوان القسم */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel color="teal">جديد في Momzy</SectionLabel>
            <h2 className="font-heading text-[clamp(28px,3vw,42px)] font-bold text-dark">
              آخر <span className="text-rose">التحديثات</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[13px] font-semibold text-teal cursor-pointer transition-colors hover:text-teald"
          >
            كل المنتجات ←
          </Link>
        </div>

        {/* شبكة المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5">
          {/* الكارد الكبير — صندوق مشوار أم */}
          <Link
            href="/shop/mshwar-am-box"
            className="bg-white border-[1.5px] border-bord rounded-[22px] grid grid-cols-1 md:grid-cols-2 overflow-hidden cursor-pointer transition-all duration-250 hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1"
          >
            {/* منطقة الصورة */}
            <div className="bg-rosepale flex items-center justify-center text-[100px] p-8 relative">
              📦
              <span className="absolute top-3.5 end-3.5 bg-yellow text-dark font-label text-[9px] font-extrabold tracking-[1.5px] uppercase px-3.5 py-[5px] rounded-full">
                جديد الآن
              </span>
            </div>

            {/* محتوى الكارد */}
            <div className="p-8">
              <div className="font-label text-[10px] font-bold tracking-[2px] uppercase text-light mb-2.5">
                منتج فعلي · Limited Edition
              </div>
              <div className="font-heading text-[26px] text-dark mb-3 leading-[1.3]">
                صندوق مشوار أم
              </div>
              <LatestBigCardBody />
              <div className="flex gap-2 flex-wrap mb-6">
                <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">
                  مختار بعناية
                </span>
                <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">
                  شحن سريع
                </span>
                <span className="bg-rosepale text-rose text-[10px] font-semibold px-3 py-1 rounded-xl">
                  كميات محدودة
                </span>
              </div>
              <span className="inline-flex items-center gap-2 bg-white text-teal shadow-[0_4px_16px_rgba(0,0,0,0.12)] px-7 py-3 rounded-full text-[13px] font-bold">
                اطلبي الآن ←
              </span>
            </div>
          </Link>

          {/* الكارد الصغير — كتيب الرضاعة */}
          <Link
            href="/shop/breastfeeding-guide"
            className="bg-white border-[1.5px] border-bord rounded-[22px] overflow-hidden cursor-pointer transition-all duration-250 hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 flex flex-col"
          >
            <div className="bg-tealpale flex-1 flex items-center justify-center text-[72px] p-7">
              📗
            </div>
            <div className="p-6">
              <div className="font-label text-[9px] font-bold tracking-[2px] uppercase text-light mb-2">
                كتيب رقمي · PDF
              </div>
              <div className="font-heading text-xl text-dark mb-2">
                كتيب الرضاعة الطبيعية
              </div>
              <div className="text-[13px] text-mid leading-[1.65] mb-[18px]">
                دليل شامل من الوضعيات الصحيحة إلى حل المشكلات الشائعة — تنزيل
                فوري.
              </div>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal transition-all hover:gap-2.5">
                احصلي عليه ←
              </span>
            </div>
          </Link>
        </div>
      </Container>
    </section>
  );
}
