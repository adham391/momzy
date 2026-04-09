import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج أصناف Tailwind مع حل التعارضات */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
