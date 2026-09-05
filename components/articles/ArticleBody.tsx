import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity/image";

/**
 * عارض محتوى المقال (Portable Text).
 *
 * القياسات مضبوطة للقراءة الطويلة بالعربية: ارتفاع سطر 2.05 وعرض عمود
 * محدود (~68 حرفًا) — النص العربي بحروفه المتصلة وتشكيله يحتاج تنفّسًا
 * أكثر من اللاتيني، والسطر الطويل يُضيّع مكان العين عند الرجوع للسطر التالي.
 *
 * الروابط الخارجية تُفتح في تبويب جديد مع rel آمن — القارئة وسط مقال
 * ولا نريد أن نفقدها عند أول مرجع.
 */

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body text-mid leading-[2.05] mb-5">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-heading text-h3 font-bold text-dark mt-11 mb-4 scroll-mt-24">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading text-h4 font-bold text-dark mt-8 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      // شريط ملوّن على حافة البدء — يعمل يمينًا في RTL ويسارًا في LTR بلا تفريع
      <blockquote className="my-7 ps-5 border-s-4 border-teal bg-tealpale/50 rounded-e-2xl py-4 pe-5">
        <div className="text-body text-dark leading-[1.95] font-medium">{children}</div>
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="list-disc ms-6 mb-6 space-y-2.5 marker:text-rose">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal ms-6 mb-6 space-y-2.5 marker:text-teal marker:font-bold">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-body text-mid leading-[1.95] ps-1">{children}</li>,
    number: ({ children }) => <li className="text-body text-mid leading-[1.95] ps-1">{children}</li>,
  },

  marks: {
    strong: ({ children }) => <strong className="font-bold text-dark">{children}</strong>,
    em: ({ children }) => <em className="italic text-dark">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal font-medium underline underline-offset-4 decoration-teal/40 hover:decoration-teal transition"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    image: ({ value }) => {
      const img = value as { asset?: unknown; alt?: string } | undefined;
      if (!img?.asset) return null;
      const alt = img.alt ?? "";
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(img).width(1200).fit("max").auto("format").url()}
            alt={alt}
            className="w-full rounded-[20px] border-[1.5px] border-bord"
            loading="lazy"
          />
          {alt && <figcaption className="text-body-sm text-light text-center mt-2.5">{alt}</figcaption>}
        </figure>
      );
    },
  },
};

export default function ArticleBody({ body }: { body: PortableTextBlock[] }) {
  if (!body?.length) return null;
  return (
    <div style={{ maxWidth: "68ch" }} className="mx-auto">
      <PortableText value={body} components={components} />
    </div>
  );
}
