-- ═══════════════════════════════════════════════════════════════
-- 0014_payment_logs.sql — سجلّ محاولات الدفع (نجاحًا وفشلًا)
--
-- بدونه: عند فشل دفعة لا نعرف السبب إطلاقًا — لا رمز الخطأ ولا ردّ
-- HYP. فتسأل العميلة «لماذا لم يمرّ دفعي؟» ولا جواب لدينا.
--
-- نحفظ رمز البوابة وردّها كاملًا. ولا نحفظ أي بيانات بطاقة: HYP لا
-- يعيدها أصلًا في رابط العودة، والرد يُنقّى قبل التخزين احتياطًا.
-- يُطبَّق بعد 0001–0013.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.payment_logs (
  id            uuid primary key default gen_random_uuid(),
  -- الطلب أو الحجز — نصّ لا مفتاح خارجي: قد يصل ردّ برقم لا يقابله سجل
  reference     text not null,                 -- MZ-… أو BK-…
  kind          text not null check (kind in ('order', 'booking')),
  entity_id     uuid,                          -- المعرّف حين نعثر عليه
  outcome       text not null check (outcome in ('paid', 'failed')),
  ccode         text,                          -- رمز HYP: 0 = نجاح
  transaction_id text,                         -- رقم المعاملة (Id)
  amount        numeric(10,2),
  gateway_response jsonb,                      -- بارامترات العودة كاملة (بلا بطاقة)
  created_at    timestamptz not null default now()
);

create index if not exists idx_payment_logs_reference on public.payment_logs(reference);
create index if not exists idx_payment_logs_created   on public.payment_logs(created_at desc);

-- RLS: لا وصول لـ anon — القراءة من لوحة الأدمن عبر service-role
alter table public.payment_logs enable row level security;
