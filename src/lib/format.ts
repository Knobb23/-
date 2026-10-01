/**
 * Date and Number formatting helpers for Thai (พ.ศ.)
 * strictly conforming to editorial style requirements
 */

import { format, parseISO } from "date-fns";

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/**
 * Format ISO date string into Thai Buddhist Year format (พ.ศ.)
 * e.g. "15 สิงหาคม 2569"
 */
export function formatThaiDate(dateInput: string | Date, options?: { shortMonth?: boolean; shortYear?: boolean }): string {
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "-";

    const day = d.getDate();
    const monthIndex = d.getMonth();
    const yearAD = d.getFullYear();
    const yearBE = yearAD + 543;

    const monthStr = options?.shortMonth ? THAI_MONTHS_SHORT[monthIndex] : THAI_MONTHS_FULL[monthIndex];
    const yearStr = options?.shortYear ? String(yearBE).slice(-2) : String(yearBE);

    return `${day} ${monthStr} ${yearStr}`;
  } catch {
    return "-";
  }
}

/**
 * Format day and short month for event cards
 * returns { day: "15", month: "ส.ค.", year: "2569" }
 */
export function getEventDateParts(dateInput: string | Date): { day: string; month: string; year: string } {
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (isNaN(d.getTime())) return { day: "--", month: "-", year: "-" };
    const day = String(d.getDate()).padStart(2, "0");
    const month = THAI_MONTHS_SHORT[d.getMonth()];
    const year = String(d.getFullYear() + 543);
    return { day, month, year };
  } catch {
    return { day: "--", month: "-", year: "-" };
  }
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("th-TH").format(num);
}

/**
 * Format Thai Baht currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("THB", "บาท");
}

/**
 * Category names for news
 */
export const NEWS_CATEGORY_NAMES: Record<string, string> = {
  pr: "ข่าวประชาสัมพันธ์",
  activities: "ภาพข่าวกิจกรรม",
  regulations: "ระเบียบและข้อบังคับ",
  announcements: "ประกาศและคำสั่ง",
  knowledge: "สาระความรู้",
  videos: "คลิปวิดีโอ",
};

/**
 * Event type labels
 */
export const EVENT_TYPE_NAMES: Record<string, string> = {
  sports: "กีฬาและนันทนาการ",
  academic: "วิชาการและอบรม",
  culture: "ศิลปวัฒนธรรม",
  volunteer: "จิตอาสาบำเพ็ญประโยชน์",
  meeting: "การประชุมและสภา",
};

/**
 * Status labels and color badge configs
 */
export const COMPLAINT_STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  received: {
    label: "รับเรื่องแล้ว",
    dotColor: "#7A688D",
    textColor: "#544368",
    bgColor: "#EDE6F5",
  },
  considering: {
    label: "กำลังพิจารณา",
    dotColor: "#B8923A",
    textColor: "#9C7A2B",
    bgColor: "#FBF3DE",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    dotColor: "#6B3FA0",
    textColor: "#4B1F7A",
    bgColor: "#EADBFA",
  },
  resolved: {
    label: "เสร็จสิ้น",
    dotColor: "#2F6B4F",
    textColor: "#20543D",
    bgColor: "#E2F0E8",
  },
};
