/**
 * صندوق المصادر أسفل المقال.
 *
 * وجوده ليس تزيينًا: هبة ممرضة معتمدة تكتب في موضوع صحي، والأم تحتاج أن
 * ترى من أين جاءت المعلومة. المراجع تبقى بلغتها الأصلية — أسماء المؤسسات
 * والدوريات لا تُترجَم — فيُعرض الصندوق LTR داخل صفحة RTL.
 *
 * وسطر التنبيه ثابت في كل مقال: تثقيف لا تشخيص.
 */
export default function ArticleSources({
  sources,
  title,
  note,
}: {
  sources: string[];
  title: string;
  note: string;
}) {
  if (sources.length === 0) return null;

  return (
    <aside className="mt-14 mx-auto" style={{ maxWidth: "68ch" }}>
      <div className="rounded-[20px] border-[1.5px] border-bord bg-cream/60 p-6 md:p-7">
        <h2 className="font-heading text-h4 font-bold text-dark mb-4">{title}</h2>

        <ol dir="ltr" className="list-decimal ps-5 space-y-2.5 text-start">
          {sources.map((s, i) => (
            <li key={i} className="text-body-sm text-mid leading-[1.8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-body-sm text-light leading-[1.9] mt-4 text-center">{note}</p>
    </aside>
  );
}
