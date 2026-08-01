import { createAdminClient } from "@/lib/supabase/admin";
import { toLatinDigits } from "@/lib/utils/format";

/** عميل مُجمَّع من الطلبات (لا يوجد جدول customers — الشراء مجهول) */
export interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

/**
 * يجمّع العملاء من جدول orders بالإيميل.
 * الاسم/الهاتف/آخر طلب من أحدث طلب (الطلبات مرتّبة تنازلياً).
 * الإنفاق يستثني الطلبات الملغاة.
 */
export async function getCustomers(search?: string): Promise<Customer[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("customer_name, customer_email, customer_phone, total_amount, order_status, created_at")
    .order("created_at", { ascending: false });

  const map = new Map<string, Customer>();
  for (const o of data ?? []) {
    const email = String(o.customer_email);
    const key = email.toLowerCase();
    const amount = o.order_status === "cancelled" ? 0 : Number(o.total_amount ?? 0);
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
