import { NextResponse } from "next/server";
import { getDownloadStatus, redeemDownload } from "@/lib/db/downloads";
import { getProduct } from "@/lib/products/getProduct";

/**
 * GET /api/download/[token]
 * يتحقّق من التوكن (صلاحية + حد) ويبثّ ملف الـ PDF من Sanity عبر السيرفر
 * (لا يُكشف الرابط الخام)، ويزيد عدّاد التحميل. عند الفشل يعيد للصفحة بسبب واضح.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const pageUrl = (extra = "") => new URL(`/download/${token}${extra}`, request.url);

  // 1) تحقّق أولي دون استهلاك عدّاد
  const status = await getDownloadStatus(token);
  if (!status || !status.valid) {
    return NextResponse.redirect(pageUrl());
  }

  // 2) تأكّد من وجود الملف قبل استهلاك العدّاد
  const product = await getProduct(status.row.product_slug);
  const fileUrl = product?.digitalFile;
  if (!fileUrl) {
    return NextResponse.redirect(pageUrl("?e=nofile"));
  }

  // 3) استهلك محاولة (تحقّق ذرّي + زيادة العدّاد)
  const redeemed = await redeemDownload(token);
  if (!redeemed.ok) {
    return NextResponse.redirect(pageUrl());
  }

  // 4) اجلب الملف وبثّه
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok || !fileRes.body) {
    return NextResponse.redirect(pageUrl("?e=fetch"));
  }

  const asciiName = "momzy-booklet.pdf";
  const niceName = `${redeemed.row.product_name}.pdf`;

  return new NextResponse(fileRes.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(niceName)}`,
      "Cache-Control": "no-store",
    },
  });
}
