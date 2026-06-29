import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

/**
 * إعداد Sanity Studio الرئيسي
 * يُركَّب على /studio — هبة تدير المحتوى من هنا
 */
export default defineConfig({
  name: "momzy",
  title: "Momzy — لوحة المحتوى",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",

  basePath: "/studio",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("المحتوى")
          .items([
            // المنتجات — قائمة عادية
            S.listItem()
              .title("المنتجات")
              .schemaType("product")
              .child(S.documentTypeList("product").title("المنتجات")),

            S.divider(),

            // إعدادات الموقع — Singleton (نسخة واحدة)
            S.listItem()
              .title("إعدادات الموقع")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("إعدادات الموقع")
              ),
          ]),
    }),
    visionTool(), // GROQ playground للتطوير
  ],

  schema: {
    types: schemaTypes,
  },
});
