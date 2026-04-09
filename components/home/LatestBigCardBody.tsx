"use client";

import { useState } from "react";

/** النص القصير للوصف */
const SHORT_DESC =
  "تجربة متكاملة صُمّمت بعناية لتكون إلى جانبكِ في مرحلة ما بعد الولادة...";

/** النص الكامل للوصف */
const FULL_DESC =
  "تجربة متكاملة صُمّمت بعناية لتكون إلى جانبكِ في مرحلة ما بعد الولادة، حيث تتداخل المشاعر مع المسؤولية، وتحتاجين إلى دعم حقيقي يتجاوز النصائح التقليدية. لا يقدّم هذا الصندوق منتجات فحسب، بل يقدّم حضورًا ثابتًا يرافقكِ في تفاصيل يومك، ويمنحكِ وضوحًا وطمأنينة في كل قرار.";

/** وصف الكارد الكبير مع زر توسيع/طي */
export default function LatestBigCardBody() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-[13px] text-mid leading-[1.7] mb-5">
      <span>{expanded ? FULL_DESC : SHORT_DESC}</span>{" "}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
        className="text-teal font-bold cursor-pointer text-[13px] me-1"
      >
        {expanded ? "← أقل" : "اقرئي المزيد ←"}
      </button>
    </div>
  );
}
