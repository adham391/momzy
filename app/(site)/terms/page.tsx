import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

export const metadata: Metadata = {
  title: "الشروط والأحكام | Momzy",
  description: "الشروط والأحكام لموقع Momzy — حقوق وواجبات المستخدم والموقع",
};

/** قسم فرعي */
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="py-7" style={{ borderBottom: "1px solid var(--bord)" }}>
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="font-label font-extrabold text-[13px] shrink-0"
          style={{ color: "var(--teal)", letterSpacing: "1px" }}
        >
          {num}
        </span>
        <h2 className="font-heading font-bold text-h4" style={{ color: "var(--dark)" }}>
          {title}
        </h2>
      </div>
      <div
        className="font-body text-body leading-[2.1] flex flex-col gap-2"
        style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
      >
        {children}
      </div>
    </div>
  );
}

/** نقطة قائمة */
function Li({ warn, children }: { warn?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="shrink-0 mt-2"
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: warn ? "var(--rose)" : "var(--teal)",
          display: "inline-block",
        }}
      />
      <span>{children}</span>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh" }}>

      {/* ── هيدر ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
          paddingTop: 56,
          paddingBottom: 80,
        }}
      >
        <Container>
          <p
            className="font-label font-bold text-[11px] mb-3"
            style={{ color: "var(--rose)", letterSpacing: "2.5px", textTransform: "uppercase" }}
          >
            قانوني
          </p>
          <h1
            className="font-heading font-bold text-h1 mb-2"
            style={{ color: "var(--dark)" }}
          >
            الشروط والأحكام
          </h1>
          <p className="font-label text-[14px]" style={{ color: "var(--mid)" }}>
            آخر تحديث: أبريل 2026
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── المحتوى ── */}
      <Container>
        <div className="mx-auto pb-20" style={{ maxWidth: 860, marginTop: -20 }}>

          {/* مقدمة */}
          <p
            className="font-body text-[15px] leading-[2.1] mt-10 mb-2 py-5"
            style={{
              color: "var(--mid)",
              fontFamily: "'Tajawal', sans-serif",
              borderBottom: "1px solid var(--bord)",
            }}
          >
            باستخدامكِ لموقع <strong style={{ color: "var(--dark)" }}>Momzy</strong> أو إجرائكِ
            لعملية شراء، فإنكِ توافقين على الشروط والأحكام الواردة في هذه الصفحة.
            يُرجى قراءتها بعناية قبل المتابعة.
          </p>

          <Section num="01" title="عن الموقع">
            <p>
              Momzy منصة رعاية أمومة تأسست من قِبل{" "}
              <strong style={{ color: "var(--dark)" }}>هبة حسن</strong> —
              ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة. يقدّم الموقع منتجات فيزيائية
              ورقمية وورشات مسجلة موجهة للأمهات في إسرائيل.
            </p>
          </Section>

          <Section num="02" title="الشراء والدفع">
            <div className="flex flex-col gap-1">
              <Li>الشراء متاح بدون تسجيل حساب — مجهول الهوية</Li>
              <Li>الأسعار بالشيكل الإسرائيلي ₪ وتشمل ضريبة القيمة المضافة</Li>
              <Li>الدفع يتم عبر بوابة الدفع الآمنة HYP</Li>
              <Li>يُعدّ الطلب مؤكداً بعد استلام تأكيد الدفع من HYP</Li>
              <Li>نحتفظ بالحق في رفض أي طلب في حالات الاشتباه بالاحتيال</Li>
            </div>
          </Section>

          <Section num="03" title="الشحن والتوصيل">
            <div className="flex flex-col gap-1">
              <Li>الشحن متاح داخل إسرائيل فقط</Li>
              <Li>مدة التوصيل المتوقعة: 3–5 أيام عمل من تأكيد الطلب</Li>
              <Li>رسوم الشحن: ₪40 للمنتجات الفيزيائية — مجاني للمنتجات الرقمية</Li>
              <Li>رقم التتبع يُرسل بعد شحن الطلب</Li>
              <Li>الموقع غير مسؤول عن أي تأخير من جانب شركة الشحن</Li>
            </div>
          </Section>

          <Section num="04" title="سياسة الإرجاع والاستبدال">
            <p style={{ color: "var(--teal)", fontWeight: 700 }}>المنتجات الفيزيائية:</p>
            <div className="flex flex-col gap-1 mb-4">
              <Li>يحق لكِ طلب الإرجاع خلال 14 يوماً من استلام الطلب</Li>
              <Li>يجب أن يكون المنتج غير مستخدم وفي عبوته الأصلية</Li>
              <Li>تكاليف الإرجاع تقع على عاتق العميل إلا في حالة وجود عيوب</Li>
            </div>
            <p style={{ color: "var(--teal)", fontWeight: 700 }}>المنتجات الرقمية والورشات المسجلة:</p>
            <div className="flex flex-col gap-1">
              <Li>لا يمكن الإرجاع بعد تحميل الملف أو مشاهدة الورشة</Li>
              <Li>في حالة وجود مشكلة تقنية نلتزم بإيجاد حل بديل</Li>
            </div>
          </Section>

          <Section num="05" title="حقوق المحتوى الرقمي">
            <p>
              جميع المنتجات الرقمية (الكتيبات، الورشات المسجلة) هي ملكية فكرية حصرية لـ{" "}
              <strong style={{ color: "var(--dark)" }}>هبة حسن</strong>.
            </p>
            <div className="flex flex-col gap-1 mt-2">
              <Li warn>يُمنع منعاً باتاً نشر المحتوى أو توزيعه أو مشاركته مع أي طرف آخر</Li>
              <Li warn>يُمنع إعادة بيع المحتوى أو استخدامه لأغراض تجارية</Li>
              <Li warn>روابط التحميل صالحة لمدة 7 أيام وبحد أقصى 5 تحميلات</Li>
              <Li warn>الاستخدام مقتصر على الغرض الشخصي فقط</Li>
            </div>
            <p className="mt-3 font-bold" style={{ color: "var(--dark)" }}>
              أي انتهاك لهذه الحقوق يُعرّض صاحبه للمساءلة القانونية.
            </p>
          </Section>

          <Section num="06" title="إخلاء المسؤولية">
            <p>
              المعلومات المقدَّمة في الموقع والمنتجات ذات طابع توعوي وتثقيفي ولا تُغني عن
              استشارة الطبيب أو المختص الصحي. Momzy غير مسؤولة عن أي نتائج تترتب على
              تطبيق المعلومات الواردة دون استشارة متخصص.
            </p>
          </Section>

          <Section num="07" title="التعديلات على الشروط">
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيُنشر تاريخ آخر تحديث أعلى
              الصفحة. استمرار استخدامكِ للموقع بعد التعديل يعني موافقتكِ على الشروط الجديدة.
            </p>
          </Section>

          <Section num="08" title="القانون المطبّق">
            <p>
              تخضع هذه الشروط والأحكام لقوانين دولة إسرائيل. أي نزاع يُحسم أمام
              المحاكم المختصة في إسرائيل.
            </p>
          </Section>

          <Section num="09" title="التواصل معنا">
            <p>
              لأي استفسار حول هذه الشروط، تواصلي معنا عبر صفحة{" "}
              <a href="/contact" style={{ color: "var(--teal)", fontWeight: 600 }}>
                تواصل معنا
              </a>.
            </p>
          </Section>

          {/* تذييل */}
          <p
            className="font-label text-[13px] text-center pt-8 mt-2"
            style={{ color: "var(--light)" }}
          >
            © 2026 Momzy — جميع الحقوق محفوظة
          </p>
        </div>
      </Container>
    </div>
  );
}
