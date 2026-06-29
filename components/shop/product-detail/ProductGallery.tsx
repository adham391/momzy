"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import SectionLabel from "@/components/ui/SectionLabel";

interface ProductGalleryProps {
  images:    string[];
  mainImage: string;
  title:     string;
  /** رابط YouTube أو Vimeo أو Google Drive أو MP4 مباشر */
  videoUrl?: string;
}

/** نوع الفيديو */
type VideoKind = "youtube" | "iframe" | "direct";

type LightboxItem =
  | { type: "image"; src: string }
  | { type: "video"; kind: VideoKind; src: string };

/** يكتشف نوع رابط الفيديو */
function detectVideoKind(url: string): VideoKind {
  if (/youtube\.com|youtu\.be/.test(url))       return "youtube";
  if (/vimeo\.com|drive\.google\.com/.test(url)) return "iframe";
  // أي رابط MP4 مباشر أو Cloudinary أو CDN
  return "direct";
}

/** يحوّل رابط الفيديو إلى رابط قابل للتضمين */
function toEmbedUrl(url: string): string | null {
  // YouTube
  const yt =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?&]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:manage\/videos\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

  // Google Drive
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;

  // MP4 مباشر / Cloudinary — يُستخدم كـ src في <video>
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com")) {
    return url;
  }

  return null;
}

/** thumbnail من YouTube فقط */
function toThumbnailUrl(url: string): string | null {
  const match =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?&]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

/** معرض صور/فيديو — الفيديو أول + Grid + lightbox */
export default function ProductGallery({ images, mainImage, title, videoUrl }: ProductGalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  const galleryImages = (images ?? []).filter((img) => img !== mainImage);
  const hasContent    = videoUrl || galleryImages.length > 0;

  if (!hasContent) return null;

  const embedUrl     = videoUrl ? toEmbedUrl(videoUrl)     : null;
  const thumbnailUrl = videoUrl ? toThumbnailUrl(videoUrl) : null;
  const videoKind    = videoUrl ? detectVideoKind(videoUrl) : "direct";

  function openVideo() {
    if (!embedUrl) return;
    setLightbox({ type: "video", kind: videoKind, src: embedUrl });
  }

  return (
    <>
      <section style={{ background: "white", padding: "28px 0 80px" }}>
        <Container>
          <div className="mb-8">
            <SectionLabel color="teal">معرض الصور</SectionLabel>
            <h2
              className="text-h2 font-heading font-bold"
              style={{ color: "var(--dark)" }}
            >
              تفاصيل تستحق <span style={{ color: "var(--rose)", fontStyle: "italic" }}>التأمل</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

            {/* الفيديو — أول عنصر دائماً */}
            {videoUrl && embedUrl && (
              <button
                onClick={openVideo}
                className="relative rounded-[16px] overflow-hidden [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.02]"
                style={{ aspectRatio: "4 / 5", border: "1.5px solid var(--bord)", cursor: "pointer", background: "#111" }}
                aria-label={`فيديو ${title}`}
              >
                {/* Thumbnail */}
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                  />
                ) : videoKind === "direct" ? (
                  /* معاينة فيديو مباشر بدون تشغيل */
                  <video
                    src={embedUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    style={{ pointerEvents: "none" }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: "#1a1a1a" }} />
                )}

                {/* أيقونة التشغيل */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.30)" }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--rose)" style={{ marginRight: -3 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* شارة "فيديو" */}
                <div
                  className="absolute bottom-3 start-3 font-label font-bold"
                  style={{
                    fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase",
                    background: "rgba(242,167,181,0.92)", color: "white",
                    padding: "3px 10px", borderRadius: 20,
                  }}
                >
                  فيديو
                </div>
              </button>
            )}

            {/* الصور */}
            {galleryImages.map((img, idx) => (
              <button
                key={img}
                onClick={() => setLightbox({ type: "image", src: img })}
                className="rounded-[16px] overflow-hidden [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.02]"
                style={{ aspectRatio: "4 / 5", border: "1.5px solid var(--bord)", cursor: "pointer" }}
                aria-label={`صورة ${idx + 1} من ${title}`}
              >
                <ProductImagePlaceholder src={img} alt={title} size="gallery" />
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[900] flex items-center justify-center p-4 cursor-pointer"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
          onClick={() => setLightbox(null)}
        >
          {lightbox.type === "image" ? (
            /* صورة — تملأ الشاشة بشكل طبيعي */
            <div
              className="relative rounded-[20px] overflow-hidden"
              style={{ maxWidth: 640, maxHeight: "85vh", width: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          ) : (
            /* فيديو */
            <div
              className="relative w-full rounded-[20px] overflow-hidden"
              style={{
                maxWidth: 900,
                aspectRatio: "16 / 9",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.kind === "direct" ? (
                <video
                  src={lightbox.src}
                  className="w-full h-full"
                  controls
                  autoPlay
                  playsInline
                  style={{ background: "#000" }}
                />
              ) : (
                <iframe
                  src={lightbox.src}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              )}
            </div>
          )}

          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 end-6 w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.15)", fontSize: 20 }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
