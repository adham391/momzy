"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/** Client Component — Sanity Studio يحتاج context يعمل فقط على الـ browser */
export default function StudioClient() {
  return <NextStudio config={config} />;
}
