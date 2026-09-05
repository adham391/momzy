import { cn } from "@/lib/utils/cn";
import { CATEGORY_COVER, type ArticleCategory } from "@/lib/articles/categories";

/**
 * غلاف المقال — الصورة المرفوعة، وإلا تدرّج التصنيف مع إيموجيه.
 *
 * النسبة (`ratio`) بدل ارتفاع ثابت: الارتفاع الثابت مع بطاقة متغيّرة العرض
 * يعطي شريطًا مسطّحًا يقصّ رأس الطفل. النسبة تُبقي القصّ متوقَّعًا على كل
 * المقاسات، والقصّ نفسه يتمّ في Sanity محترمًا نقطة التركيز (hotspot).
 *
 * الاحتياطي ليس عيبًا نخفيه: هبة تكتب أسرع مما تصوّر، والبطاقة بلا غلاف
 * تبدو ناقصة. الإيموجي يعطي البطاقة هويّة بصرية فورًا ويميّز التصنيفات.
 */
export default function ArticleCover({
  src,
  alt,
  category,
  emoji,
  bg,
  ratio,
  emojiSize = 52,
  className,
}: {
  src?: string;
  alt?: string;
  category: ArticleCategory | null;
  /** الاحتياطي الثابت (بطاقات constants) — يتقدّم على تصنيف غير موجود */
  emoji?: string;
  bg?: string;
  /** العرض ÷ الارتفاع — مثلاً 3 / 2 */
  ratio: number;
  emojiSize?: number;
  className?: string;
}) {
  if (src) {
    return (
      // صورة خلفية لا <img>: الغلاف زخرفي والنص المجاور يحمل المعنى،
      // والقصّ المركزي بنسبة ثابتة أبسط هنا من object-fit.
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn("bg-cover bg-center", className)}
        style={{ aspectRatio: ratio, backgroundImage: `url('${src}')` }}
      />
    );
  }

  const cover = category ? CATEGORY_COVER[category] : undefined;
  const fallbackEmoji = emoji ?? cover?.emoji ?? "🌸";
  const fallbackBg = bg ?? cover?.bg ?? "bg-gradient-to-br from-[#fde8ee] to-[#fbd4de]";

  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center", fallbackBg, className)}
      style={{ aspectRatio: ratio, fontSize: emojiSize }}
    >
      {fallbackEmoji}
    </div>
  );
}
