import type { SlotRow } from "@/lib/db/bookings";
import type { ServiceType } from "./types";

/** ما يلزم من فتحة الإتاحة لمعرفة طريقة الحضور */
export interface SessionAttendance {
  meeting_link: string | null;
  location: string | null;
}

/**
 * هل الجلسة أونلاين؟ رابط اللقاء يحسم، ثم المكان المحدَّد للفتحة، ثم نوع الخدمة —
 * فخدمة «أونلاين» تبقى أونلاين وإن لم تضف هبة الرابط بعد (تضيفه حتى موعد الجلسة).
 * الجلسة غير الأونلاين حضورية (في الناصرة أو في بيت الأم) — التسجيل لها من داخل البلاد فقط.
 */
export function isOnlineSession(
  slot: SessionAttendance,
  serviceType: ServiceType | null | undefined
): boolean {
  if (slot.meeting_link) return true;
  if (slot.location) return false;
  return serviceType === "online";
}

/**
 * الفتحة كما تراها العميلة قبل الدفع — بلا رابط اللقاء ولا مكانه: كلاهما يصل في تذكير
 * اليوم السابق فقط. `online` يكفي الرزنامة لتعرض «أونلاين» أو «حضوري».
 */
export interface PublicSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  booked_count: number;
  /** أونلاين أم حضوري — الحضوري يُحجز من داخل البلاد فقط */
  online: boolean;
}

/** يسقط من الفتحة ما لا يخصّ العميلة قبل الدفع، ويضيف حكم الحضور */
export function toPublicSlot(slot: SlotRow, serviceType: ServiceType | null | undefined): PublicSlot {
  return {
    id: slot.id,
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    price: slot.price,
    capacity: slot.capacity,
    booked_count: slot.booked_count,
    online: isOnlineSession(slot, serviceType),
  };
}
