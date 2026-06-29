"use client";

import { useState } from "react";

interface LatestBigCardBodyProps {
  description?: string;
}

/** حد الأحرف للنص المختصر */
const SHORT_LIMIT = 80;

/** وصف الكارد الكبير مع زر توسيع/طي — النص من Sanity */
export default function LatestBigCardBody({ description }: LatestBigCardBodyProps) {
  const [expanded, setExpanded] = useState(false);

  const text      = description ?? "";
  const isLong    = text.length > SHORT_LIMIT;
  const shortText = isLong ? text.slice(0, SHORT_LIMIT).trimEnd() + "..." : text;

  return (
    <div className="text-[13px] md:text-[15px] text-mid leading-[1.7] mb-5">
      <span>{expanded ? text : shortText}</span>{" "}
      {isLong && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="text-teal font-bold cursor-pointer text-[13px] md:text-[15px] me-1"
        >
          {expanded ? "← أقل" : "اقرئي المزيد ←"}
        </button>
      )}
    </div>
  );
}
