import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getShippingRows } from "@/lib/db/orders";
import { toCSV } from "@/lib/utils/csv";
import { toLatinDigits } from "@/lib/utils/format";
import type { OrderStatus } from "@/lib/db/types";

const STATUS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكّد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

/**
 * GET /api/admin/orders/export?status=&q= — تصدير عناوين التوصيل CSV.
 * ⚠️ محمي بالتحقّق داخل الـ route (‏/api مستثنى من middleware)،
 * لأن البيانات تحوي PII للعملاء.
 */
export async function GET(request: Request) {
  // تحقّق أنه أدمن نشط
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: admin } = await supabase
    .from("admins")
    .select("is_active")
    .eq("id", user.id)
    .single();
  if (!admin || !admin.is_active) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const q = searchParams.get("q") ?? "";

  const rows = await getShippingRows({ status: status as OrderStatus | "all", search: q });

  const headers = [
    "رقم الطلب",
    "المستلِم",
    "الهاتف",
    "البلدة",
    "العنوان",
    "طابق/شقة/مدخل",
    "الرمز البريدي",
    "هدية؟",
    "الحالة",
    "الإجمالي ₪",
    "ملاحظات",
    "التاريخ",
  ];

  const L = toLatinDigits;
  // ="..." يجبر Excel على معاملة القيمة كنص (يمنع القصّ والصيغة العلمية للأرقام الطويلة)
  const excelText = (v: string) => (v ? `="${L(v)}"` : "");

  const csvRows = rows.map((r) => [
    L(r.orderNumber),
    L(r.recipientName),
    excelText(r.phone),
    L(r.city),
    L(r.address),
    L(r.building),
    excelText(r.postalCode),
    r.isGift ? "نعم" : "لا",
    STATUS_AR[r.status] ?? r.status,
    r.total,
    L(r.notes),
    r.createdAt.slice(0, 10),
  ]);

  const csv = toCSV(headers, csvRows);
  const filename = `momzy-shipping-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
