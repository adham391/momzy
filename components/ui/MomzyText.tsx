import { Fragment } from "react";

/**
 * يعرض نصًا مع إبراز كلمة «Momzy» — للحفاظ على الهوية حتى لو كان النص
 * قابلاً للتعديل من Sanity.
 *
 * اللون الافتراضي وردي مائل (مناسب للخلفيات الفاتحة). على خلفية وردية
 * (كالهيرو) مرّري `highlightClassName` بلون يظهر — مثل `text-yellow`.
 */
export default function MomzyText({
  text,
  className,
  highlightClassName = "text-rose italic",
}: {
  text: string;
  className?: string;
  highlightClassName?: string;
}) {
  const parts = text.split(/(Momzy)/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p === "Momzy" ? (
          <span key={i} className={highlightClassName}>Momzy</span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        )
      )}
    </span>
  );
}
