import type { SiteSettingsTopBar } from "@/lib/sanity/queries/siteSettings";

interface TopBarProps {
  settings: SiteSettingsTopBar;
}

/** الشريط العلوي — ticker يدخل من اليمين لليسار (موبايل + ديسكتوب) */
export default function TopBar({ settings }: TopBarProps) {
  if (!settings.enabled) return null;

  return (
    <div
      data-topbar
      style={{
        position: "relative", /* يتمرر مع الصفحة — النمط الاحترافي */
        zIndex: 850,          /* فوق MobileMenu (z=800)، أسفل Header (z=860) */
        /* 38px على الموبايل، 47px على الديسكتوب */
        height: "clamp(38px, 5vw, 47px)",
        overflow: "hidden",
        background: "#82C9C4",
        boxShadow: "0 4px 15px rgba(130,201,196,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/*
        position: absolute + left: 0  — يمنع محاذاة RTL تلقائياً
        paddingLeft: 100vw             — يبدأ المحتوى عند الحافة اليمنى للشاشة
        translateX(-100%)              — يحرّك العنصر كامل عرضه لليسار
        سرعة أعلى على الموبايل (10s) لأن الشاشة أضيق
      */}
      <div
        className="hover:[animation-play-state:paused]"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          whiteSpace: "nowrap",
          paddingLeft: "100vw",
          willChange: "transform",
          /* الموبايل أسرع قليلاً لأن المسافة المرئية أقصر */
          animation: "ticker-single 12s linear infinite",
        }}
      >
        {/* badge متنبض */}
        {settings.badge && (
          <span
            className="font-label uppercase tracking-[1.2px] shrink-0"
            style={{
              background: "#F2A7B5",
              color: "white",
              fontSize: "clamp(10px, 2.5vw, 12px)",
              fontWeight: 800,
              borderRadius: 20,
              padding: "4px 10px",
              animation: "pulse-badge 2s infinite",
            }}
          >
            {settings.badge}
          </span>
        )}

        {/* رسالة الشريط */}
        {settings.message && (
          <span
            className="text-white font-bold shrink-0"
            style={{
              fontSize: "clamp(11px, 2.8vw, 14px)",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          >
            {settings.message}
          </span>
        )}
      </div>
    </div>
  );
}
