import { createAdminClient } from "@/lib/supabase/admin";
import { toLatinDigits } from "@/lib/utils/format";
import { SETTLED_ORDER_FILTER } from "@/lib/stats/settlement";
import { fetchAllRows } from "./fetchAllRows";

/** عميل مُجمَّع من الطلبات (لا يوجد جدول customers — الشراء مجهول) */
export interface Customer {
  email: string;
  name: string;
  phone: string;
  /** الطلبات المدفوعة (أو المجانية) غير الملغاة */
  orderCount: number;
  totalSpent: number;
  /** وقت آخر طلب مدفوع */
  lastOrderAt: string;
}

/**
 * يجمّع العملاء بالإيميل من الطلبات المدفوعة (أو المجانية) غير الملغاة فقط —
 * القاعدة نفسها في لوحة التحكم والتحليلات (lib/stats/settlement.ts).
 * من ترك صفحة الدفع دون أن يدفع ليس عميلًا بعد، فلا يظهر هنا.
 * الاسم والهاتف وآخر طلب من أحدث طلب مدفوع (الطلبات مرتّبة تنازليًا).
 */
export async function getCustomers(search?: string): Promise<Customer[]> {
  const supabase = createAdminClient();
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, total_amount, created_at")
      .or(SETTLED_ORDER_FILTER)
      .neq("order_status", "cancelled")
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to)
  );

  const map = new Map<string, Customer>();
  for (const o of rows) {
    const email = String(o.customer_email);
    const key = email.toLowerCase();
    const amount = Number(o.total_amount ?? 0);
    const existing = map.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += amount;
    } else {
      map.set(key, {
        email,
        name: toLatinDigits(String(o.customer_name)),
        phone: toLatinDigits(String(o.customer_phone)),
        orderCount: 1,
        totalSpent: amount,
        lastOrderAt: String(o.created_at),
      });
    }
  }

  let customers = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s)
    );
  }

  return customers;
}
