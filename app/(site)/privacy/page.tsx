import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | Momzy",
  description: "سياسة الخصوصية لموقع Momzy — كيف نجمع بياناتك ونحميها",
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
function Li({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 mt-2" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
      <span>{children}</span>
    </div>
  );
}

export default function PrivacyPage() {
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
            سياسة الخصوصية
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
            className="font-body text-[15px] leading-[2.1] mt-6 mb-2 py-5"
            style={{
              color: "var(--mid)",
              fontFamily: "'Tajawal', sans-serif",
              borderBottom: "1px solid var(--bord)",
            }}
          >
            نحن في <strong style={{ color: "var(--dark)" }}>Momzy</strong> نحترم خصوصيتكِ ونلتزم بحماية بياناتك الشخصية.
            توضّح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامكِ لموقعنا{" "}
            <strong style={{ color: "var(--dark)" }}>momzyworld.com</strong>.
          </p>

          <Section num="01" title="المعلومات التي نجمعها">
            <p>عند إجراء عملية شراء أو تواصلكِ معنا، نجمع المعلومات التالية:</p>
            <div className="flex flex-col gap-1 mt-1">
              <Li>الاسم الكامل</Li>
              <Li>عنوان البريد الإلكتروني</Li>
              <Li>رقم الهاتف</Li>
              <Li>عنوان التوصيل (البلدة والشارع ورقم البيت)</Li>
              <Li>ملاحظات الطلب (إن وجدت)</Li>
            </div>
            <p className="mt-2">
              <strong style={{ color: "var(--dark)" }}>لا نجمع</strong> بيانات بطاقات الائتمان —
              عملية الدفع تتم عبر بوابة الدفع الآمنة HYP مباشرةً.
            </p>
          </Section>

          <Section num="02" title="كيف نستخدم معلوماتكِ">
            <p>نستخدم بياناتكِ حصرياً للأغراض التالية:</p>
            <div className="flex flex-col gap-1 mt-1">
              <Li>معالجة طلبكِ وتأكيده</Li>
              <Li>التواصل معكِ بشأن حالة الطلب أو التوصيل</Li>
              <Li>إرسال رسائل ترويجية إذا وافقتِ على ذلك (يمكن إلغاؤها في أي وقت)</Li>
              <Li>تحسين خدماتنا ومنتجاتنا</Li>
            </div>
          </Section>

          <Section num="03" title="مشاركة البيانات مع أطراف ثالثة">
            <p>لا نبيع بياناتكِ لأي طرف ثالث. نشارك معلوماتكِ فقط مع:</p>
            <div className="flex flex-col gap-1 mt-1">
              <Li>شركة الشحن — لتوصيل طلبكِ</Li>
              <Li>بوابة الدفع HYP — لمعالجة الدفع بأمان</Li>
              <Li>خدمة البريد الإلكتروني — لإرسال تأكيدات الطلب</Li>
            </div>
            <p className="mt-2">جميع الأطراف الثالثة ملتزمة بسرية بياناتكِ وفق القوانين المعمول بها.</p>
          </Section>

          <Section num="04" title="أمان البيانات">
            <p>
              نستخدم بروتوكول HTTPS لتشفير جميع البيانات المنقولة بين متصفحكِ وخوادمنا.
              بيانات الطلبات محفوظة في قاعدة بيانات آمنة مع صلاحيات وصول مقيّدة.
            </p>
          </Section>

          <Section num="05" title="ملفات تعريف الارتباط (Cookies)">
            <p>
              نستخدم ملفات تعريف الارتباط لحفظ محتويات سلة التسوق خلال جلستكِ.
              لا نستخدمها لتتبعكِ عبر مواقع أخرى. يمكنكِ تعطيلها من إعدادات متصفحكِ
              مع العلم بأن ذلك قد يؤثر على عمل سلة التسوق.
            </p>
          </Section>

          <Section num="06" title="حقوقكِ">
            <p>يحق لكِ في أي وقت:</p>
            <div className="flex flex-col gap-1 mt-1">
              <Li>طلب الاطلاع على البيانات التي نحتفظ بها عنكِ</Li>
              <Li>طلب تصحيح أي بيانات غير دقيقة</Li>
              <Li>طلب حذف بياناتكِ (مع مراعاة المتطلبات القانونية)</Li>
              <Li>إلغاء الاشتراك في الرسائل التسويقية</Li>
            </div>
          </Section>

          <Section num="07" title="الاحتفاظ بالبيانات">
            <p>
              نحتفظ ببيانات الطلبات لمدة 3 سنوات للأغراض المحاسبية والقانونية.
              بيانات القائمة البريدية تُحذف فور إلغاء الاشتراك.
            </p>
          </Section>

          <Section num="08" title="التواصل معنا">
            <p>
              إذا كان لديكِ أي استفسار حول سياسة الخصوصية أو بياناتكِ الشخصية،
              يسعدنا التواصل معكِ عبر صفحة{" "}
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
