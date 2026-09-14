/** صف كما يعيده Supabase بلا أنواع مولَّدة */
export type Row = Record<string, unknown>;

/** أقصى صفوف يعيدها Supabase في الطلب الواحد */
const PAGE_SIZE = 1000;

/** نتيجة دفعة واحدة من استعلام Supabase */
type PageResult = PromiseLike<{ data: Row[] | null; error: { message: string } | null }>;

/**
 * يجلب كل صفوف استعلام على دفعات. Supabase يقطع أي نتيجة عند 1000 صف بصمت،
 * فتظهر الأرقام أقلّ من الحقيقة بلا أي خطأ.
 *
 * الاستعلام يحتاج ترتيبًا ثابتًا (`.order("id")`) كي لا تتكرّر الصفوف أو تسقط بين دفعة وأخرى.
 * الخطأ يُرمى: صفحة أرقام تُظهر أصفارًا خاطئة أسوأ من صفحة خطأ.
 */
export async function fetchAllRows(page: (from: number, to: number) => PageResult): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`[supabase] ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
