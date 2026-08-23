import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * أدوات تنقّل واعية باللغة — بديل next/link و next/navigation
 * داخل شجرة [locale]. Link يضيف بادئة اللغة تلقائيًا (/he/shop).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
