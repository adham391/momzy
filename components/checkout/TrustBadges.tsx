/**
 * شارات الثقة — وسائل الدفع + تشفير SSL. تُطمئن العميلة عند لحظة الدفع.
 * أيقونات SVG مضمّنة (لا أصول خارجية).
 */

/** شعار Visa مبسّط */
function VisaMark() {
  return (
    <div
      className="flex items-center justify-center rounded-[6px]"
      style={{ width: 46, height: 30, background: "white", border: "1px solid var(--bord)" }}
    >
      <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 800, fontStyle: "italic", fontSize: 14, color: "#1434CB", letterSpacing: "-0.5px" }}>
        VISA
      </span>
    </div>
  );
}

/** شعار Mastercard (الدائرتان) */
function MastercardMark() {
  return (
    <div
      className="flex items-center justify-center rounded-[6px]"
      style={{ width: 46, height: 30, background: "white", border: "1px solid var(--bord)" }}
    >
      <svg width="34" height="21" viewBox="0 0 34 21" aria-label="Mastercard">
        <circle cx="12" cy="10.5" r="9.5" fill="#EB001B" />
        <circle cx="22" cy="10.5" r="9.5" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    </div>
  );
}

/** شعار HYP نصّي */
function HypMark() {
  return (
    <div
      className="flex items-center justify-center rounded-[6px]"
      style={{ width: 46, height: 30, background: "white", border: "1px solid var(--bord)" }}
    >
      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: "var(--mid)", letterSpacing: "0.5px" }}>
        HYP
      </span>
    </div>
  );
}

export default function TrustBadges() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex items-center justify-center gap-2">
        <VisaMark />
        <MastercardMark />
        <HypMark />
      </div>
      <div className="flex items-center justify-center gap-1.5 font-label text-[11.5px] text-light">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>دفع آمن ومشفّر بتقنية SSL</span>
      </div>
    </div>
  );
}
