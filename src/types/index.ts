/**
 * Data Interfaces for DeSUP Student Organization Website
 * Conforms to Firestore collections schema (Section 5.1)
 */

export type NewsCategory =
  | "pr" // ข่าวประชาสัมพันธ์
  | "activities" // ภาพข่าวกิจกรรม
  | "regulations" // ระเบียบ / ข้อบังคับ
  | "announcements" // ประกาศ / คำสั่ง
  | "knowledge" // สาระความรู้
  | "videos"; // คลิปวิดีโอ

export interface Attachment {
  name: string;
  url: string;
  size?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  excerpt: string;
  content: string; // HTML from Tiptap editor
  coverUrl: string;
  galleryUrls?: string[];
  attachments?: Attachment[];
  videoUrl?: string; // YouTube URL
  published: boolean;
  pinned: boolean;
  views: number;
  createdAt: string; // ISO String or Firestore timestamp
  updatedAt?: string;
}

export type EventType = "sports" | "academic" | "culture" | "volunteer" | "meeting";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  type: EventType;
  location: string;
  startAt: string; // ISO date/time
  endAt: string; // ISO date/time
  allDay: boolean;
  coverUrl?: string;
  published: boolean;
}

export type DownloadCategory = "forms" | "regulations" | "minutes" | "others";
export type DownloadFileType = "PDF" | "DOCX" | "XLSX" | "ZIP";

export interface DownloadItem {
  id: string;
  title: string;
  category: DownloadCategory;
  fileType: DownloadFileType;
  fileUrl: string;
  fileSize?: string;
  downloads: number;
  createdAt: string;
}

export type PersonRole = "board" | "advisor" | "president";

export interface PersonItem {
  id: string;
  name: string;
  role: PersonRole;
  position: string;
  department?: string; // e.g. ฝ่ายวิชาการ, ฝ่ายกิจกรรม, ฝ่ายสารสนเทศ
  grade?: string; // e.g. มัธยมศึกษาปีที่ 6/1
  yearTH: number; // e.g. 2569
  photoUrl: string;
  quote?: string;
  order: number;
}

export interface BudgetItemEntry {
  activity: string;
  date: string;
  requested: number;
  approved: number;
  spent: number;
}

export interface BudgetYearData {
  yearTH: number;
  totalBudget: number;
  items: BudgetItemEntry[];
}

export type ComplaintType =
  | "complaint" // ร้องเรียน
  | "corruption" // เบาะแสทุจริต
  | "inquiry" // ติดต่อสอบถาม
  | "suggestion" // เสนอแนะ
  | "praise" // ชมเชย
  | "other"; // อื่น ๆ

export type ComplaintStatus = "received" | "considering" | "in_progress" | "resolved";

export interface PublicReply {
  text: string;
  at: string;
}

export interface ComplaintContact {
  name?: string;
  gradeRoom?: string;
  contactChannel?: string; // LINE or Email
}

export interface ComplaintItem {
  id: string; // Tracking code e.g. SC-2569-ABCDEF
  trackingCode: string;
  type: ComplaintType;
  title: string;
  body: string;
  location?: string;
  imageUrls?: string[];
  anonymous: boolean;
  contact?: ComplaintContact;
  status: ComplaintStatus;
  publicReplies: PublicReply[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLinkItem {
  id: string;
  number: string;
  title: string;
  description: string;
  href: string;
  isExternal?: boolean;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  url: string;
  aspect: "4:5" | "3:2" | "1:1" | "16:9";
  date: string;
}

export interface SiteStatistics {
  totalVisits: number;
  totalComplaints: number;
  resolvedComplaints: number;
  resolvedPercentage: number;
  activitiesThisYear: number;
  avgResolutionDays: number;
}
