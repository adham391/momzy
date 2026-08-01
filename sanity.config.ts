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
            // ── محتوى الصفحات (Singletons) ──
            S.listItem()
              .title("الصفحة الرئيسية")
              .id("homePage")
              .child(
                S.document().schemaType("homePage").documentId("homePage").title("الصفحة الرئيسية")
              ),

            S.listItem()
              .title("صفحة عن هبة")
              .id("aboutPage")
              .child(
                S.document().schemaType("aboutPage").documentId("aboutPage").title("صفحة عن هبة")
              ),

            S.divider(),

            // ── المنتجات ──
            S.listItem()
              .title("المنتجات")
              .schemaType("product")
              .child(S.documentTypeList("product").title("المنتجات")),

            // ── الخدمات ──
            S.listItem()
              .title("الخدمات")
              .schemaType("service")
              .child(S.documentTypeList("service").title("الخدمات")),

            // ── المقالات ──
            S.listItem()
              .title("المقالات")
              .schemaType("article")
              .child(S.documentTypeList("article").title("المقالات")),

            // ── التقييمات ──
            S.listItem()
              .title("التقييمات")
              .schemaType("review")
              .child(S.documentTypeList("review").title("التقييمات")),

            S.divider(),

            // ── إعدادات الموقع (Singleton) ──
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
