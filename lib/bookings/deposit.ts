/**
 * العربون — الأم تدفع جزءًا عند الحجز وتُكمل يوم اللقاء.
 *
 * ما يُحفظ في الحجز: `deposit_amount` (المقبوض عند الحجز) و`remainder_collected_at`
 * (لحظة تحصيل الباقي). ومنهما يُشتقّ كل شيء آخر — فلا رقم محسوب يُخزَّن ويتقادم.
 *
 * **الإيراد يتبع لحظة القبض لا لحظة الحجز**: العربون يوم الحجز، والباقي يوم تحصيله.
 */

/** حجزٌ بما يكفي لحساب عربونه */
export interface DepositFields {
  amount: number;
  deposit_amount: number | null;
  remainder_collected_at: string | null;
}

/** هل هذا الحجز بعربون (لا دفعًا كاملًا ولا بلا دفع)؟ */
export function hasDeposit(b: DepositFields): boolean {
  return b.deposit_amount !== null && b.deposit_amount < b.amount;
}

/** ما قُبض لحظة الحجز — العربون إن وُجد، وإلا المبلغ كاملًا */
export function receivedAtBooking(b: DepositFields): number {
  return b.deposit_amount === null ? b.amount : Math.min(b.deposit_amount, b.amount);
}

/** ما بقي على الأم الآن — صفر بعد التحصيل أو حين لا عربون */
export function remainingOf(b: DepositFields): number {
  if (b.remainder_collected_at || b.deposit_amount === null) return 0;
  return Math.max(0, b.amount - b.deposit_amount);
}
