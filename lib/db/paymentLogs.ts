import { createAdminClient } from "@/lib/supabase/admin";

/**
 * سجلّ محاولات الدفع — يُكتب من ‏/api/hyp/callback عند كل عودة من HYP.
 *
 * الغاية: حين تفشل دفعة، نعرف **لماذا** — رمز البوابة وردّها كاملًا.
 * بدونه لا جواب لدى هبة حين تسأل عميلة عن دفعة لم تمرّ.
 */

/** حقول لا تُخزَّن أبدًا حتى لو أعادها المزوّد يومًا */
const SENSITIVE_KEYS = new Set([
  "cardnum", "card", "cardnumber", "cvv", "cvv2", "expdate",
  "tmonth", "tyear", "userid", "key", "passp", "signature",
]);

/** ينقّي بارامترات العودة من أي حقل حسّاس قبل التخزين */
function sanitize(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return out;
}

export interface PaymentLogInput {
  /** MZ-… أو BK-… */
  reference: string;
  kind: "order" | "booking";
  entityId: string | null;
  outcome: "paid" | "failed";
  ccode: string;
  transactionId: string;
  /** بارامترات العودة من HYP */
  params: URLSearchParams;
}

/**
 * يسجّل محاولة دفع — best-effort تمامًا: فشل التسجيل لا يُفشل الدفع
 * ولا يمنع العميلة من متابعة رحلتها.
 */
export async function logPaymentAttempt(input: PaymentLogInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    const amountRaw = input.params.get("Amount");
    await supabase.from("payment_logs").insert({
      reference: input.reference || "(بلا رقم)",
      kind: input.kind,
      entity_id: input.entityId,
      outcome: input.outcome,
      ccode: input.ccode,
      transaction_id: input.transactionId || null,
      amount: amountRaw ? Number(amountRaw) : null,
      gateway_response: sanitize(input.params),
    });
  } catch (err) {
    console.error("[payment_logs] تعذّر تسجيل محاولة الدفع:", err);
  }
}
