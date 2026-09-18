-- ═══════════════════════════════════════════════════════════════
-- 0019_foreign_currency.sql — الدفع بالدولار من خارج البلاد
--
-- الأسعار في الموقع بالشيكل، لكن الزائرة من خارج البلاد (كتيبات ولقاءات أونلاين)
-- تُخصم بالدولار الأمريكي عبر HYP (Coin=2). يُحفظ مع الطلب/الحجز ما خُصم فعلًا
-- وبأي سعر صرف، فلا يتغيّر المبلغ لو تغيّر السعر لاحقًا. الشيكل يبقى أساس الحسابات
-- (total_amount / amount) — لوحة الأدمن والإحصاءات لم تتغيّر.
--
-- currency: ILS (افتراضي) أو USD · charged_amount: المبلغ بعملة الخصم (null للطلبات
-- القديمة = الشيكل نفسه) · exchange_rate: ₪ لكل $1 وقت الطلب.
-- سعر الصرف يُضبط من /admin/settings (المفتاح usd_rate) — الاحتياطي في الكود 3.6.
-- يُطبَّق بعد 0001–0018.
-- ═══════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists currency text not null default 'ILS',
  add column if not exists charged_amount numeric(10, 2),
  add column if not exists exchange_rate numeric(10, 4);

alter table public.orders drop constraint if exists orders_currency_check;
alter table public.orders
  add constraint orders_currency_check check (currency in ('ILS', 'USD'));

alter table public.bookings
  add column if not exists currency text not null default 'ILS',
  add column if not exists charged_amount numeric(10, 2),
  add column if not exists exchange_rate numeric(10, 4);

alter table public.bookings drop constraint if exists bookings_currency_check;
alter table public.bookings
  add constraint bookings_currency_check check (currency in ('ILS', 'USD'));

comment on column public.orders.currency is 'عملة الخصم — ILS داخل البلاد، USD من خارجها';
comment on column public.orders.charged_amount is 'المبلغ المخصوم بعملة currency (null = الشيكل نفسه)';
comment on column public.orders.exchange_rate is '₪ لكل $1 وقت الطلب — للطلبات بالدولار';
comment on column public.bookings.currency is 'عملة الخصم — ILS داخل البلاد، USD من خارجها';
comment on column public.bookings.charged_amount is 'المبلغ المخصوم بعملة currency (null = الشيكل نفسه)';
comment on column public.bookings.exchange_rate is '₪ لكل $1 وقت الحجز — للحجوزات بالدولار';

-- سعر الصرف الافتراضي — تعدّله هبة من /admin/settings
insert into public.settings (key, value, type, description)
values ('usd_rate', '3.6', 'number', 'سعر صرف الدولار — ₪ لكل $1 (الدفع من خارج البلاد)')
on conflict (key) do nothing;
