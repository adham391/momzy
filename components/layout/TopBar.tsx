/** الشريط العلوي — رسالة ترويجية مركزية */
export default function TopBar() {
  return (
    <div
      className="hidden sm:flex items-center justify-center gap-2"
      style={{
        padding: "13px 56px",
        background: "#82C9C4",
        boxShadow: "0 4px 15px rgba(130,201,196,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* badge متنبض */}
      <span
        className="text-white font-label uppercase tracking-[1.5px]"
        style={{
          background: "#F2A7B5",
          color: "white",
          fontSize: 13,
          fontWeight: 800,
          borderRadius: 20,
          padding: "5px 14px",
          opacity: 1,
          transform: "none",
          willChange: "box-shadow",
          animation: "pulse-badge 2s infinite",
        }}
      >
        جديد
      </span>

      {/* النص الرئيسي */}
      <span
        className="text-white font-bold text-[14px]"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
      >
        صندوق مشوار أم
      </span>

      {/* النص الثانوي */}
      <span
        className="text-[12px]"
        style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
      >
        — اطلبي الآن قبل نفاد الكمية
      </span>
    </div>
  );
}
