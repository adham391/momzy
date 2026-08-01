import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/db/coupons";

/**
 * POST /api/coupons/validate — يتحقق من كود خصم لمجموع معيّن.
 * body: { code: string, subtotal: number }
 * يعيد: { valid, discount, code?, label?, error? }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, discount: 0, error: "طلب غير صالح" }, { status: 400 });
  }

  const b = body as { code?: string; subtotal?: number };
  if (!b.code || typeof b.code !== "string") {
    return NextResponse.json({ valid: false, discount: 0, error: "أدخلي كود الخصم" }, { status: 400 });
  }

  const result = await validateCoupon(b.code, Number(b.subtotal) || 0);
  return NextResponse.json(result);
}
