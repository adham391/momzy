"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/** حقل بحث عام — يحدّث معامل ?q= في الـ URL (تقرأه صفحة السيرفر) */
export default function SearchInput({
  defaultValue = "",
  placeholder,
}: {
  defaultValue?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const s = q.trim();
        router.push(s ? `${pathname}?q=${encodeURIComponent(s)}` : pathname);
      }}
      className="relative max-w-md mb-5"
    >
      <Search
        size={17}
        className="absolute top-1/2 -translate-y-1/2 right-3.5 text-light pointer-events-none"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-bord bg-white text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
      />
    </form>
  );
}
