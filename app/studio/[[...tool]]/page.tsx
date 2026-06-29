/**
 * صفحة Sanity Studio — مركّبة على /studio
 * Server Component يصدّر metadata + يعرض Client Component
 */
export { metadata, viewport } from "next-sanity/studio";
export const dynamic = "force-static";

import StudioClient from "./StudioClient";

export default function StudioPage() {
  return <StudioClient />;
}
