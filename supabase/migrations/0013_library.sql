-- ═══════════════════════════════════════════════════════════════
-- 0013_library.sql — مكتبة العميلة (كتيبات + ورشات مسجلة لاحقًا)
--
-- الشراء يبقى مجهولًا كليًا — الحساب يُنشأ بعد الشراء الرقمي تلقائيًا،
-- ويصل العميلة رابط «أنشئي كلمة مرورك» بالإيميل. الدخول بعدها دائم
-- (بريد + كلمة مرور)، والمكتبة تجدّد توكنات القراءة بنفسها فلا تنتهي.
--
-- كلمات المرور scrypt (node:crypto) — لا تُخزَّن ولا تُرسَل نصًا أبدًا.
-- التوكنات (جلسات/دعوات/استعادة) تُخزَّن sha256 — الخام في الكوكي/الرابط فقط.
-- الوصول عبر service-role فقط (RLS يمنع anon).
-- يُطبَّق بعد 0001–0012.
-- ═══════════════════════════════════════════════════════════════

-- ─── حسابات المكتبة — البريد هو الهوية ───────────────────────────
create table if not exists public.library_accounts (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,      -- يُخزَّن lowercase دائمًا
  password_hash   text,                      -- null = لم تُنشئ كلمتها بعد (دعوة معلّقة)
  failed_attempts integer not null default 0,
  locked_until    timestamptz,               -- قفل مؤقت بعد محاولات فاشلة متتالية
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- updated_at تلقائي — نفس الدالة المشتركة في 0001_helpers.sql
drop trigger if exists trg_library_accounts_updated_at on public.library_accounts;
create trigger trg_library_accounts_updated_at
  before update on public.library_accounts
  for each row execute function public.set_updated_at();

-- ─── توكنات إنشاء/استعادة كلمة المرور — لمرة واحدة ───────────────
create table if not exists public.library_tokens (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.library_accounts(id) on delete cascade,
  token_hash text not null unique,           -- sha256 للتوكن — الخام في الرابط فقط
  purpose    text not null check (purpose in ('setup', 'reset')),
  expires_at timestamptz not null,           -- setup: 7 أيام · reset: ساعتان
  used_at    timestamptz,                    -- non-null = استُهلك
  created_at timestamptz not null default now()
);

create index if not exists idx_library_tokens_account on public.library_tokens(account_id);

-- ─── جلسات الدخول — منزلقة الصلاحية (عمليًا دائمة مع الاستخدام) ──
create table if not exists public.library_sessions (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references public.library_accounts(id) on delete cascade,
  token_hash   text not null unique,         -- sha256 للتوكن — الخام في الكوكي فقط
  expires_at   timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_library_sessions_account on public.library_sessions(account_id);

-- ─── توحيد بريد المشتريات الرقمية ────────────────────────────────
-- المكتبة تطابق البريد بـ «=» لا بـ ILIKE (فلا تتحوّل _ و% إلى بدائل تكشف
-- مشتريات عميلات أخريات). التوحيد على lowercase شرطُ صحة هذه المطابقة،
-- ويجعل الفهرس البسيط أدناه قابلًا للاستخدام فعليًا.
update public.digital_downloads
   set customer_email = lower(customer_email)
 where customer_email <> lower(customer_email);

-- إسقاط أولًا: لو طُبِّقت نسخة سابقة أنشأت الفهرس على lower(customer_email)
-- لَتخطّى «if not exists» إنشاءَ الصحيح بصمت — والاستعلام يطابق العمود نفسه.
drop index if exists public.idx_digital_downloads_email;
create index idx_digital_downloads_email
  on public.digital_downloads (customer_email);

-- ─── تسجيل محاولة دخول فاشلة — ذرّي ──────────────────────────────
-- القراءة ثم الكتابة من التطبيق تفقد تحديثات عند التوازي، فيتسلّل المهاجم
-- بمحاولات متزامنة دون بلوغ الحد. الزيادة هنا تجري داخل صف مقفول.
create or replace function public.library_record_login_failure(
  p_account_id   uuid,
  p_max_attempts integer,
  p_lock_minutes integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempts integer;
begin
  update public.library_accounts
     set failed_attempts = failed_attempts + 1
   where id = p_account_id
  returning failed_attempts into v_attempts;

  if v_attempts is not null and v_attempts >= p_max_attempts then
    update public.library_accounts
       set locked_until    = now() + make_interval(mins => p_lock_minutes),
           failed_attempts = 0
     where id = p_account_id;
  end if;
end;
$$;

-- RLS: لا وصول لـ anon — كل العمليات عبر service-role (تتجاوز RLS على السيرفر)
alter table public.library_accounts enable row level security;
alter table public.library_tokens   enable row level security;
alter table public.library_sessions enable row level security;
