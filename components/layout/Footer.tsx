import Image from "next/image";
import Link from "next/link";
import { FOOTER_COLUMNS } from "@/lib/utils/constants";

/** الفوتر الرئيسي */
export default function Footer() {
  return (
    <>
      {/* ── divider وردي فوق الفوتر ─────────────────────── */}
      <div
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(to left, var(--rose), var(--teal))" }}
      />

      <footer className="bg-[#2A2623]">

        {/* ── القسم الرئيسي — 4 أعمدة ─────────────────────── */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-14 pt-14 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.4fr] gap-10 md:gap-12 pb-10 border-b border-white/[.07] mb-7">

            {/* العمود 1 — اللوقو والوصف والسوشال */}
            <div>
              <Image
                src="/icons/momzy-logo.png"
                alt="Momzy"
                width={160}
                height={70}
                className="object-contain brightness-0 invert"
                style={{ height: 70, width: "auto" }}
              />
              <p className="text-[12.5px] leading-[1.85] text-white/40 max-w-[220px] mb-6 mt-4">
                مؤسسة متخصصة ترافق الأمهات —<br />خدمات، منتجات، ومحتوى لكل أم.
              </p>

              {/* أيقونات التواصل الاجتماعي */}
              <div className="flex gap-2.5">
                {/* Instagram */}
                <a href="#" className="footer-social-icon w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" className="footer-social-icon w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="#" className="footer-social-icon w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* العمود 2 — روابط MOMZY */}
            <div>
              <h5 className="font-label text-[13px] tracking-[2.5px] uppercase text-rose mb-5">
                {FOOTER_COLUMNS[0].title}
              </h5>
              <ul className="list-none space-y-2.5">
                {FOOTER_COLUMNS[0].links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 3 — روابط مفيدة */}
            <div>
              <h5 className="font-label text-[13px] tracking-[2.5px] uppercase text-rose mb-5">
                {FOOTER_COLUMNS[1].title}
              </h5>
              <ul className="list-none space-y-2.5">
                {FOOTER_COLUMNS[1].links.filter((l) => l.label !== "اتصل بنا").map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 4 — تواصل معنا */}
            <div>
              <h5 className="font-label text-[13px] tracking-[2.5px] uppercase text-rose mb-5">
                تواصل معنا
              </h5>
              <p className="text-[13px] font-bold mb-1" style={{ color: "var(--rose)" }}>
                هل لديك سؤال؟
              </p>
              <p className="text-[12.5px] leading-[1.75] text-white/40 mb-5">
                نحن هنا للمساعدة في كل خطوة من رحلتك
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-white font-bold text-[13px] px-5 py-2.5 rounded-full mb-4 transition-opacity hover:opacity-85"
                style={{ background: "var(--rose)" }}
              >
                اتصل بنا ←
              </Link>
            </div>

          </div>

          {/* الشريط السفلي */}
          <div className="flex justify-center items-center pt-1">
            <p className="text-[13px] text-white/25">
              © 2026 Momzy — جميع الحقوق محفوظة
            </p>
          </div>
        </div>

      </footer>
    </>
  );
}
