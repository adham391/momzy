"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MomzyStoryModal from "./MomzyStoryModal";

/** زر "قصة Momzy" في الهيرو — يفتح modal القصة */
export default function HeroStoryButton() {
  const t = useTranslations("home");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline font-bold hover:opacity-80 transition-opacity"
        style={{ opacity: 0.85, color: "inherit", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
      >
        {t("story.button")}
      </button>

      <MomzyStoryModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
