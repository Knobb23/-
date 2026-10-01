/**
 * Data Service Layer (src/lib/dataService.ts)
 * 
 * Supports both Cloud Firestore and rich fallback data.
 * Includes complete CRUD and Seed functionality for Admin Panel (Phase 4).
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  NewsItem,
  NewsCategory,
  EventItem,
  EventType,
  DownloadItem,
  DownloadCategory,
  PersonItem,
  PersonRole,
  BudgetYearData,
  ComplaintItem,
  ComplaintType,
  ComplaintStatus,
  ComplaintContact,
  ServiceLinkItem,
  GalleryPhoto,
  SiteStatistics,
  HeroSlideItem,
} from "@/src/types";

// ==========================================
// SEED MOCK DATA (สมมติอย่างเป็นธรรมชาติ ไม่มีชื่อบุคคลจริง)
// ==========================================

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "เปิดรับสมัครทีมเยาวชนจิตอาสา พัฒนาห้องสมุดและภูมิทัศน์โรงเรียน ประจำภาคเรียนที่ 1/2569",
    slug: "volunteer-library-renovation-2569",
    category: "activities",
    excerpt: "องค์การนักเรียนขอเชิญชวนเพื่อนพี่น้องนักเรียนทุกระดับชั้น ร่วมกิจกรรมบำเพ็ญประโยชน์เพื่อโรงเรียนของเรา พร้อมรับชั่วโมงจิตอาสา",
    content: `
      <p>องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา ขอเชิญชวนนักเรียนระดับชั้นมัธยมศึกษาปีที่ 1 - 6 ที่มีความสนใจด้านงานจิตอาสาและพัฒนาสภาพแวดล้อมการเรียนรู้ เข้าร่วมโครงการปรับปรุงภูมิทัศน์ห้องสมุดและลานอ่านหนังสือกลางแจ้ง</p>
      <br/>
      <h3 class="font-serif font-bold text-xl text-[#1B1226]">วัตถุประสงค์โครงการ</h3>
      <p>เพื่อส่งเสริมการมีส่วนร่วมของนักเรียนในการดูแลรักษาสมบัติส่วนรวม สร้างบรรยากาศที่เอื้อต่อการอ่านและการแลกเปลี่ยนเรียนรู้อย่างสร้างสรรค์ของชาวสาธิตฯ</p>
      <ul class="list-disc pl-5 my-3 space-y-1">
        <li>จัดหมวดหมู่หนังสือและสื่อมัลติมีเดียใหม่เพื่อความสะดวกในการค้นคว้า</li>
        <li>ทาสีและซ่อมแซมโต๊ะเก้าอี้บริเวณสวนวรรณกรรมใต้ร่มไม้</li>
        <li>จัดมุมนิทรรศการแสดงผลงานทางวิชาการและศิลปะของเพื่อนนักเรียน</li>
      </ul>
      <p>ผู้เข้าร่วมจะได้รับเกียรติบัตรการเข้าร่วมกิจกรรมและบันทึกชั่วโมงกิจกรรมจิตอาสา 12 ชั่วโมง</p>
    `,
    coverUrl: "https://picsum.photos/seed/desup-news-library/1200/800",
    galleryUrls: [
      "https://picsum.photos/seed/desup-gal-1/1000/750",
      "https://picsum.photos/seed/desup-gal-2/1000/750",
      "https://picsum.photos/seed/desup-gal-3/1000/750",
    ],
    attachments: [
      { name: "ใบสมัครเข้าร่วมโครงการจิตอาสา_2569.pdf", url: "https://example.com/form.pdf", size: "1.2 MB" },
      { name: "กำหนดการและตารางงานจิตอาสา.pdf", url: "https://example.com/schedule.pdf", size: "850 KB" }
    ],
    published: true,
    pinned: true,
    views: 1420,
    createdAt: "2026-09-28T09:00:00Z",
  },
  {
    id: "news-2",
    title: "ประกาศผลการคัดเลือกตัวแทนนักเรียนเข้าร่วมการแข่งขันตอบปัญหาวิชาการระดับภูมิภาค",
    slug: "academic-competition-representatives-2569",
    category: "pr",
    excerpt: "ขอแสดงความยินดีกับตัวแทนนักเรียนโรงเรียนสาธิต ม.พะเยา ที่ผ่านการคัดเลือกเป็นตัวแทนศูนย์ภาคเหนือในการแข่งขันทักษะวิชาการ",
    content: `<p>ตามที่ฝ่ายวิชาการ องค์การนักเรียน ได้ร่วมกับกลุ่มสาระการเรียนรู้ จัดการทดสอบคัดเลือกตัวแทนนักเรียนเพื่อเข้าร่วมงานสัปดาห์วิทยาศาสตร์และคณิตศาสตร์ระดับภาคเหนือ บัดนี้การประมวลผลคะแนนเสร็จสิ้นเรียบร้อยแล้ว ขอให้นักเรียนที่มีรายชื่อติดต่อรับเอกสารเตรียมความพร้อมที่ห้ององค์การนักเรียน</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-academic/1200/800",
    published: true,
    pinned: false,
    views: 980,
    createdAt: "2026-09-24T14:30:00Z",
  },
  {
    id: "news-3",
    title: "ระเบียบองค์การนักเรียน ว่าด้วยการจัดตั้งชมรมและกิจกรรมเสริมหลักสูตร พ.ศ. 2569",
    slug: "club-regulations-2569",
    category: "regulations",
    excerpt: "กำหนดแนวทาง ขั้นตอน และเกณฑ์การขอเปิดชมรมนักเรียนใหม่ พร้อมสิทธิการขอรับการสนับสนุนงบประมาณดำเนินกิจกรรม",
    content: `<p>เพื่อให้การดำเนินกิจกรรมชมรมนักเรียนเป็นไปด้วยความเรียบร้อย มีประสิทธิภาพ และเกิดประโยชน์สูงสุดต่อนักเรียน องค์การนักเรียนจึงออกระเบียบว่าด้วยการจัดตั้งชมรม ประจำปีการศึกษา 2569 โดยมีผลบังคับใช้ตั้งแต่วันที่ 1 พฤษภาคม 2569 เป็นต้นไป</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-doc/1200/800",
    attachments: [
      { name: "ระเบียบการจัดตั้งชมรม_2569.pdf", url: "https://example.com/club-rules.pdf", size: "2.4 MB" },
    ],
    published: true,
    pinned: false,
    views: 865,
    createdAt: "2026-09-18T11:00:00Z",
  },
  {
    id: "news-4",
    title: "สรุปผลการประชุมสภานักเรียน สมัยสามัญ ครั้งที่ 3/2569: การพิจารณางบประมาณงานวันสถาปนา",
    slug: "student-council-meeting-summary-3-2569",
    category: "announcements",
    excerpt: "รายงานมติที่ประชุมสภานักเรียนเรื่องการจัดสรรงบประมาณกิจกรรมส่งเสริมศิลปวัฒนธรรมล้านนา และการปรับปรุงระบบเสียงห้องประชุม",
    content: `<p>ที่ประชุมสภานักเรียนมีมติเอกฉันท์เห็นชอบกรอบงบประมาณการจัดกิจกรรมงานวันสถาปนาโรงเรียน พร้อมทั้งมอบหมายให้ฝ่ายสวัสดิการประสานงานโรงเรียนเพื่อปรับปรุงสิ่งอำนวยความสะดวกในโรงอาหาร</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-meeting/1200/800",
    published: true,
    pinned: false,
    views: 650,
    createdAt: "2026-09-15T16:00:00Z",
  },
  {
    id: "news-5",
    title: "แนวทางการดูแลสุขภาพจิตและคลายเครียดก่อนสอบกลางภาคสำหรับวัยรุ่น",
    slug: "mental-health-tips-exams-2569",
    category: "knowledge",
    excerpt: "เทคนิคการบริหารเวลา วิธีพักสายตา และการฝึกสติฉบับกระชับ ที่ช่วยให้เพื่อน ๆ ทำข้อสอบได้อย่างเต็มศักยภาพโดยไม่เสียสุขภาพ",
    content: `<p>ช่วงสัปดาห์แห่งการสอบมักสร้างความตึงเครียดให้กับนักเรียนหลายคน ฝ่ายแนะแนวและส่งเสริมสุขภาวะ องค์การนักเรียน ได้รวบรวม 5 วิธีดูแลสมองและจิตใจที่ทำได้จริงทุกวัน</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-health/1200/800",
    published: true,
    pinned: false,
    views: 1120,
    createdAt: "2026-09-10T10:15:00Z",
  },
  {
    id: "news-6",
    title: "วิดีทัศน์แนะนำคณะกรรมการองค์การนักเรียน ประจำปีการศึกษา 2569",
    slug: "video-introducing-student-board-2569",
    category: "videos",
    excerpt: "พบกับตัวแทนนักเรียนจากทั้ง 6 ฝ่าย ที่พร้อมทำงานและรับฟังทุกเสียงของเพื่อนนักเรียนสาธิต ม.พะเยา ตลอดปีการศึกษานี้",
    content: `<p>ติดตามรับชมวิดีโอแนะนำตัวและนโยบายเร่งด่วนขององค์การนักเรียน ประจำปีการศึกษา 2569 เพื่อให้ทุกเสียงสะท้อนได้รับการขับเคลื่อนสู่การปฏิบัติจริง</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-video/1200/800",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    published: true,
    pinned: false,
    views: 1890,
    createdAt: "2026-09-05T13:00:00Z",
  },
  {
    id: "news-7",
    title: "ผลการแข่งขันกีฬาภายใน 'สาธิตพะเยาสัมพันธ์' ครั้งที่ 14",
    slug: "sports-day-results-2569",
    category: "activities",
    excerpt: "ประมวลภาพความสนุกสนาน น้ำใจนักกีฬา และความคิดสร้างสรรค์ในขบวนพาเหรดของทุกคณะสี ณ สนามกีฬาโรงเรียนสาธิตฯ",
    content: `<p>เสร็จสิ้นลงอย่างน่าประทับใจสำหรับมหกรรมกีฬาภายใน 'สาธิตพะเยาสัมพันธ์' โดยได้รับเกียรติจากผู้อำนวยการโรงเรียนเป็นประธานในพิธีปิด พร้อมมอบถ้วยรางวัลเกียรติยศแก่คณะสีที่ชนะเลิศ</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-sports/1200/800",
    galleryUrls: [
      "https://picsum.photos/seed/sports-1/1000/750",
      "https://picsum.photos/seed/sports-2/1000/750",
    ],
    published: true,
    pinned: false,
    views: 2310,
    createdAt: "2026-08-29T17:30:00Z",
  },
  {
    id: "news-8",
    title: "เปิดรับข้อเสนอโครงการพัฒนานวัตกรรมและสิ่งแวดล้อมในโรงเรียน ประจำปี 2569",
    slug: "innovation-green-school-proposals-2569",
    category: "pr",
    excerpt: "สนับสนุนเงินทุนดำเนินโครงการสูงสุด 5,000 บาท สำหรับไอเดียนักเรียนที่ช่วยลดขยะ ประหยัดพลังงาน หรือส่งเสริมความยั่งยืน",
    content: `<p>องค์การนักเรียนจัดตั้งกองทุนส่งเสริมนวัตกรรมสีเขียวในโรงเรียน เพื่อเปิดโอกาสให้นักเรียนทุกห้องเสนอโมเดลต้นแบบที่สามารถนำมาประยุกต์ใช้ได้จริงในพื้นที่โรงเรียน</p>`,
    coverUrl: "https://picsum.photos/seed/desup-news-green/1200/800",
    published: true,
    pinned: false,
    views: 740,
    createdAt: "2026-08-20T08:45:00Z",
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "การประชุมสามัญองค์การนักเรียน ประจำเดือนตุลาคม 2569",
    description: "ติดตามความคืบหน้าโครงการและการบริหารงบประมาณกิจกรรมประจำภาคเรียน",
    type: "meeting",
    location: "ห้องประชุมสภานักเรียน อาคาร 2 ชั้น 3",
    startAt: "2026-10-08T15:30:00Z",
    endAt: "2026-10-08T17:30:00Z",
    allDay: false,
    published: true,
  },
  {
    id: "evt-2",
    title: "ค่ายฝึกอบรมผู้นำเยาวชนสาธิต ม.พะเยา รุ่นที่ 11",
    description: "พัฒนาทักษะการสื่อสาร การทำงานเป็นทีม และการแก้ปัญหาในสถานการณ์จริง",
    type: "academic",
    location: "หอประชุมใหญ่ โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
    startAt: "2026-10-17T08:30:00Z",
    endAt: "2026-10-18T16:30:00Z",
    allDay: true,
    published: true,
  },
  {
    id: "evt-3",
    title: "สัปดาห์ศิลปวัฒนธรรมท้องถิ่นพะเยา 'กว๊านพะเยางามตระการ'",
    description: "นิทรรศการภูมิปัญญาพื้นบ้าน ดนตรีสะล้อซอซึง และการประกวดอาหารพื้นเมือง",
    type: "culture",
    location: "ลานกิจกรรมใต้อาคารเรียนรวม",
    startAt: "2026-10-24T09:00:00Z",
    endAt: "2026-10-26T16:00:00Z",
    allDay: true,
    published: true,
  },
  {
    id: "evt-4",
    title: "การแข่งขันบาสเกตบอลกระชับมิตร 3x3 ประจำภาคเรียน",
    description: "ส่งเสริมสุขภาพและความสามัคคีระหว่างนักเรียนระดับ ม.ต้น และ ม.ปลาย",
    type: "sports",
    location: "โรงยิมเนเซียม 1",
    startAt: "2026-11-04T16:00:00Z",
    endAt: "2026-11-06T18:00:00Z",
    allDay: false,
    published: true,
  },
  {
    id: "evt-5",
    title: "กิจกรรมจิตอาสาฟื้นฟูระบบนิเวศริมกว๊านพะเยา",
    description: "ร่วมใจเก็บขยะ ปลูกต้นไม้พื้นถิ่น และเรียนรู้ระบบนิเวศพื้นที่ชุ่มน้ำ",
    type: "volunteer",
    location: "สวนสาธารณะเฉลิมพระเกียรติ เทศบาลเมืองพะเยา",
    startAt: "2026-11-14T08:00:00Z",
    endAt: "2026-11-14T12:00:00Z",
    allDay: false,
    published: true,
  },
  {
    id: "evt-6",
    title: "เวทีรับฟังความคิดเห็นนักเรียน Student Town Hall ประจำปี 2569",
    description: "เปิดโอกาสให้นักเรียนทุกชั้นปีร่วมเสนอแนะการปรับปรุงสิ่งอำนวยความสะดวกในโรงเรียน",
    type: "meeting",
    location: "ห้องประชุมเกียรติยศ อาคารอำนวยการ",
    startAt: "2026-11-20T13:30:00Z",
    endAt: "2026-11-20T16:00:00Z",
    allDay: false,
    published: true,
  },
  {
    id: "evt-7",
    title: "ค่ายติวเข้มทักษะโอลิมปิกวิชาการและโครงงานวิทยาศาสตร์",
    description: "ติวเข้มและฝึกปฏิบัติการทางวิทยาศาสตร์โดยคณาจารย์จากมหาวิทยาลัยพะเยา",
    type: "academic",
    location: "ศูนย์ปฏิบัติการวิทยาศาสตร์ คณะวิทยาศาสตร์ ม.พะเยา",
    startAt: "2026-12-01T09:00:00Z",
    endAt: "2026-12-03T16:30:00Z",
    allDay: true,
    published: true,
  },
  {
    id: "evt-8",
    title: "งานดนตรีในสวนสาธิตพะเยา (Music in the Park)",
    description: "การแสดงดนตรีสากลและดนตรีไทยร่วมสมัยของชมรมดนตรีสากล",
    type: "culture",
    location: "สวนร่มรื่นข้างอาคารกิจกรรม",
    startAt: "2026-12-18T16:30:00Z",
    endAt: "2026-12-18T19:30:00Z",
    allDay: false,
    published: true,
  },
  {
    id: "evt-9",
    title: "กิจกรรมแบ่งปันรอยยิ้มมอบอุปกรณ์การเรียนให้โรงเรียนน้องบนดอย",
    description: "ส่งมอบของขวัญ อุปกรณ์กีฬา และหนังสือที่มีประโยชน์แก่น้อง ๆ โรงเรียนในถิ่นทุรกันดาร",
    type: "volunteer",
    location: "โรงเรียนบ้านแม่ต๋ำน้อย อ.เมือง จ.พะเยา",
    startAt: "2026-12-25T07:30:00Z",
    endAt: "2026-12-25T15:00:00Z",
    allDay: true,
    published: true,
  },
  {
    id: "evt-10",
    title: "พิธีมอบเกียรติบัตรและส่งมอบงานองค์การนักเรียน",
    description: "สรุปผลการดำเนินงานตลอดปีการศึกษาและส่งมอบหน้าที่แก่คณะกรรมการรุ่นถัดไป",
    type: "meeting",
    location: "หอประชุมใหญ่ โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
    startAt: "2027-02-15T09:00:00Z",
    endAt: "2027-02-15T12:00:00Z",
    allDay: false,
    published: true,
  },
];

export const MOCK_DOWNLOADS: DownloadItem[] = [
  {
    id: "dl-1",
    title: "แบบฟอร์มขออนุมัติจัดโครงการและกิจกรรมนักเรียน (แบบ อน.01)",
    category: "forms",
    fileType: "PDF",
    fileUrl: "https://example.com/forms/on-01.pdf",
    fileSize: "1.4 MB",
    downloads: 348,
    createdAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "dl-2",
    title: "แบบฟอร์มขอจัดตั้งและต่ออายุชมรมนักเรียน ประจำปีการศึกษา 2569",
    category: "forms",
    fileType: "DOCX",
    fileUrl: "https://example.com/forms/club-register.docx",
    fileSize: "850 KB",
    downloads: 512,
    createdAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "dl-3",
    title: "ระเบียบและข้อบังคับวินัยนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา ฉบับปรับปรุง 2569",
    category: "regulations",
    fileType: "PDF",
    fileUrl: "https://example.com/rules/discipline-2569.pdf",
    fileSize: "3.2 MB",
    downloads: 1240,
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "dl-4",
    title: "ธรรมนูญองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
    category: "regulations",
    fileType: "PDF",
    fileUrl: "https://example.com/rules/constitution.pdf",
    fileSize: "2.1 MB",
    downloads: 980,
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "dl-5",
    title: "รายงานการประชุมสภานักเรียน สมัยสามัญ ครั้งที่ 1/2569",
    category: "minutes",
    fileType: "PDF",
    fileUrl: "https://example.com/minutes/minutes-01-2569.pdf",
    fileSize: "1.8 MB",
    downloads: 215,
    createdAt: "2026-06-20T14:00:00Z",
  },
  {
    id: "dl-6",
    title: "รายงานการประชุมสภานักเรียน สมัยสามัญ ครั้งที่ 2/2569",
    category: "minutes",
    fileType: "PDF",
    fileUrl: "https://example.com/minutes/minutes-02-2569.pdf",
    fileSize: "1.9 MB",
    downloads: 194,
    createdAt: "2026-08-15T15:00:00Z",
  },
  {
    id: "dl-7",
    title: "แบบฟอร์มสรุปรายงานผลการดำเนินโครงการและเบิกจ่ายงบประมาณ (แบบ อน.02)",
    category: "forms",
    fileType: "XLSX",
    fileUrl: "https://example.com/forms/budget-report.xlsx",
    fileSize: "620 KB",
    downloads: 410,
    createdAt: "2026-06-01T11:00:00Z",
  },
  {
    id: "dl-8",
    title: "คู่มือการใช้งานระบบรับเรื่องร้องเรียนออนไลน์และติดตามสถานะสำหรับนักเรียน",
    category: "others",
    fileType: "PDF",
    fileUrl: "https://example.com/manual/complaints-user-guide.pdf",
    fileSize: "2.5 MB",
    downloads: 670,
    createdAt: "2026-06-05T09:30:00Z",
  },
];

export const MOCK_PEOPLE: PersonItem[] = [
  {
    id: "person-1",
    name: "นายปิติวัจน์ สุวรรณรัตน์",
    role: "board",
    position: "ประธานองค์การนักเรียน",
    department: "ฝ่ายบริหารกลาง",
    grade: "ม.6/1",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p1/600/750",
    quote: "ร่วมสร้างโรงเรียนที่น่าอยู่ เพื่ออนาคตที่ทุกคนภาคภูมิใจ",
    order: 1,
  },
  {
    id: "person-2",
    name: "นางสาวณัฐณิชา เจริญพิพัฒน์",
    role: "board",
    position: "รองประธาน คนที่ 1",
    department: "ฝ่ายบริหารกลาง",
    grade: "ม.6/2",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p2/600/750",
    quote: "รับฟังทุกความคิดเห็น ขับเคลื่อนงานอย่างโปร่งใส",
    order: 2,
  },
  {
    id: "person-3",
    name: "นายกรวิชญ์ เมธาธรณ์",
    role: "board",
    position: "รองประธาน คนที่ 2",
    department: "ฝ่ายบริหารกลาง",
    grade: "ม.5/1",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p3/600/750",
    quote: "พร้อมเป็นสะพานเชื่อมระหว่างนักเรียนและโรงเรียน",
    order: 3,
  },
  {
    id: "person-4",
    name: "นางสาวพิมพ์มาดา ศิริวัฒน์",
    role: "board",
    position: "เลขานุการ",
    department: "ฝ่ายสารบรรณ",
    grade: "ม.6/3",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p4/600/750",
    order: 4,
  },
  {
    id: "person-5",
    name: "นายกิตติคุณ รัตนสุวรรณ",
    role: "board",
    position: "เหรัญญิก",
    department: "ฝ่ายการเงินและงบประมาณ",
    grade: "ม.6/1",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p5/600/750",
    order: 5,
  },
  {
    id: "person-6",
    name: "นายธนกฤต วิริยปัญญา",
    role: "board",
    position: "หัวหน้าฝ่ายวิชาการ",
    department: "ฝ่ายวิชาการ",
    grade: "ม.5/2",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p6/600/750",
    order: 6,
  },
  {
    id: "person-7",
    name: "นางสาวกานต์พิชชา สมบูรณ์",
    role: "board",
    position: "หัวหน้าฝ่ายกิจกรรมและกีฬา",
    department: "ฝ่ายกิจกรรม",
    grade: "ม.5/3",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p7/600/750",
    order: 7,
  },
  {
    id: "person-8",
    name: "นายวริศรา นราทร",
    role: "board",
    position: "หัวหน้าฝ่ายศิลปวัฒนธรรม",
    department: "ฝ่ายวัฒนธรรม",
    grade: "ม.5/4",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p8/600/750",
    order: 8,
  },
  {
    id: "person-9",
    name: "นายภูริต วงศ์สว่าง",
    role: "board",
    position: "หัวหน้าฝ่ายประชาสัมพันธ์",
    department: "ฝ่ายสื่อสารองค์กร",
    grade: "ม.6/2",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p9/600/750",
    order: 9,
  },
  {
    id: "person-10",
    name: "นางสาวอรปรียา กิตติกร",
    role: "board",
    position: "หัวหน้าฝ่ายสวัสดิการและสิ่งแวดล้อม",
    department: "ฝ่ายสวัสดิการ",
    grade: "ม.4/1",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p10/600/750",
    order: 10,
  },
  {
    id: "person-11",
    name: "นายชินดนัย บวรวงศ์",
    role: "board",
    position: "หัวหน้าฝ่ายเทคโนโลยีสารสนเทศ",
    department: "ฝ่ายเทคโนโลยี",
    grade: "ม.5/1",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p11/600/750",
    order: 11,
  },
  {
    id: "person-12",
    name: "นางสาวศุภิสรา รัตนโชติ",
    role: "board",
    position: "หัวหน้าฝ่ายประสานงานและสิทธิ",
    department: "ฝ่ายพิทักษ์สิทธิ์",
    grade: "ม.4/2",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/board-p12/600/750",
    order: 12,
  },

  // 3 Advisory Teachers
  {
    id: "advisor-1",
    name: "อาจารย์ ดร.วรพงษ์ จิตต์ภักดี",
    role: "advisor",
    position: "อาจารย์ที่ปรึกษาหลัก องค์การนักเรียน",
    department: "กลุ่มสาระการเรียนรู้สังคมศึกษาฯ",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/advisor-1/600/750",
    quote: "การเรียนรู้ผ่านการทำงานจริง คือพื้นฐานสำคัญของการเป็นผู้นำที่ดีในอนาคต",
    order: 1,
  },
  {
    id: "advisor-2",
    name: "อาจารย์รัชดาวรรณ พงษ์ศิริ",
    role: "advisor",
    position: "อาจารย์ที่ปรึกษาฝ่ายกิจกรรมและพัฒนานักเรียน",
    department: "กลุ่มสาระการเรียนรู้ภาษาไทย",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/advisor-2/600/750",
    order: 2,
  },
  {
    id: "advisor-3",
    name: "อาจารย์ธนพล เกียรติอนันต์",
    role: "advisor",
    position: "อาจารย์ที่ปรึกษาฝ่ายงบประมาณและสวัสดิการ",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/advisor-3/600/750",
    order: 3,
  },

  // 6 Past Presidents
  {
    id: "pres-2569",
    name: "นายปิติวัจน์ สุวรรณรัตน์",
    role: "president",
    position: "ประธานองค์การนักเรียน",
    grade: "รุ่นที่ 14",
    yearTH: 2569,
    photoUrl: "https://picsum.photos/seed/pres-2569/600/750",
    quote: "ก้าวสู่การเปลี่ยนแปลง ด้วยพลังและการมีส่วนร่วมของทุกคน",
    order: 1,
  },
  {
    id: "pres-2568",
    name: "นายชลสิทธิ์ พัฒนกุล",
    role: "president",
    position: "อดีตประธานองค์การนักเรียน",
    grade: "รุ่นที่ 13",
    yearTH: 2568,
    photoUrl: "https://picsum.photos/seed/pres-2568/600/750",
    quote: "สร้างสรรค์กิจกรรม เชื่อมสายสัมพันธ์สู่ความเป็นหนึ่งเดียว",
    order: 2,
  },
  {
    id: "pres-2567",
    name: "นางสาวศิรภัสสร เมธาพร",
    role: "president",
    position: "อดีตประธานองค์การนักเรียน",
    grade: "รุ่นที่ 12",
    yearTH: 2567,
    photoUrl: "https://picsum.photos/seed/pres-2567/600/750",
    quote: "เสียงของนักเรียนคือพลังสำคัญในการพัฒนาโรงเรียน",
    order: 3,
  },
  {
    id: "pres-2566",
    name: "นายธนวัฒน์ เกษมศานติ์",
    role: "president",
    position: "อดีตประธานองค์การนักเรียน",
    grade: "รุ่นที่ 11",
    yearTH: 2566,
    photoUrl: "https://picsum.photos/seed/pres-2566/600/750",
    quote: "เปิดกว้าง โปร่งใส ร่วมใจพัฒนาสาธิต ม.พะเยา",
    order: 4,
  },
  {
    id: "pres-2565",
    name: "นายพงศธร บุญทวี",
    role: "president",
    position: "อดีตประธานองค์การนักเรียน",
    grade: "รุ่นที่ 10",
    yearTH: 2565,
    photoUrl: "https://picsum.photos/seed/pres-2565/600/750",
    quote: "ความสามัคคีและน้ำใจนักกีฬาคือหัวใจของพวกเรา",
    order: 5,
  },
  {
    id: "pres-2564",
    name: "นางสาวกุลธิดา อมรเวช",
    role: "president",
    position: "อดีตประธานองค์การนักเรียน",
    grade: "รุ่นที่ 9",
    yearTH: 2564,
    photoUrl: "https://picsum.photos/seed/pres-2564/600/750",
    quote: "ร่วมใจฟันฝ่าทุกความท้าทาย เพื่อรอยยิ้มของพี่น้องทุกคน",
    order: 6,
  },
];

export const MOCK_BUDGET: BudgetYearData = {
  yearTH: 2569,
  totalBudget: 450000,
  items: [
    {
      activity: "งานปฐมนิเทศและรับขวัญน้องใหม่ ม.1 และ ม.4",
      date: "2026-05-18",
      requested: 65000,
      approved: 60000,
      spent: 58450,
    },
    {
      activity: "พิธีไหว้ครูและประดับเข็มประจำรุ่น",
      date: "2026-06-12",
      requested: 45000,
      approved: 45000,
      spent: 44200,
    },
    {
      activity: "ค่ายผู้นำเยาวชนสาธิต ม.พะเยา รุ่นที่ 11",
      date: "2026-07-22",
      requested: 90000,
      approved: 85000,
      spent: 83500,
    },
    {
      activity: "มหกรรมกีฬาภายใน 'สาธิตพะเยาสัมพันธ์'",
      date: "2026-08-28",
      requested: 160000,
      approved: 150000,
      spent: 148900,
    },
    {
      activity: "สัปดาห์ศิลปวัฒนธรรมท้องถิ่นพะเยา",
      date: "2026-10-24",
      requested: 55000,
      approved: 50000,
      spent: 0,
    },
    {
      activity: "โครงการส่งเสริมนวัตกรรมและสิ่งแวดล้อมสีเขียว",
      date: "2026-11-15",
      requested: 35000,
      approved: 30000,
      spent: 0,
    },
    {
      activity: "งานดนตรีในสวนและส่งท้ายปีเก่าต้อนรับปีใหม่",
      date: "2026-12-25",
      requested: 35000,
      approved: 30000,
      spent: 0,
    },
  ],
};

export const MOCK_SERVICES: ServiceLinkItem[] = [
  {
    id: "srv-1",
    number: "01",
    title: "ส่งเรื่องร้องเรียน / ข้อเสนอแนะ",
    description: "ระบบรับฟังเสียงสะท้อน พร้อมรหัสติดตามสถานะโปร่งใส",
    href: "/complaint",
  },
  {
    id: "srv-2",
    number: "02",
    title: "ติดตามสถานะเรื่องร้องเรียน",
    description: "ตรวจสอบความคืบหน้าและการดำเนินการตอบกลับขององค์การ",
    href: "/track",
  },
  {
    id: "srv-3",
    number: "03",
    title: "คลังดาวน์โหลดเอกสารทางการ",
    description: "แบบฟอร์มขอจัดกิจกรรม ระเบียบชมรม และรายงานการประชุม",
    href: "/downloads",
  },
  {
    id: "srv-4",
    number: "04",
    title: "ปฏิทินกิจกรรมโรงเรียนและองค์การ",
    description: "ตรวจสอบกำหนดการ กิจกรรมวิชาการ และวันสำคัญตลอดปี",
    href: "/calendar",
  },
  {
    id: "srv-5",
    number: "05",
    title: "ระเบียบและข้อบังคับนักเรียน",
    description: "ธรรมนูญนักเรียน กฎระเบียบวินัย และสิทธิขั้นพื้นฐาน",
    href: "/about/authority",
  },
  {
    id: "srv-6",
    number: "06",
    title: "ติดต่อสอบถามข้อมูลองค์การ",
    description: "ที่ทำการองค์การนักเรียน หมายเลขโทรศัพท์ และแผนที่เดินทาง",
    href: "/contact",
  },
];

export const MOCK_GALLERY: GalleryPhoto[] = [
  {
    id: "gal-1",
    title: "พิธีไหว้ครูและประดับเข็มประจำรุ่น ประจำปีการศึกษา 2569",
    caption: "บรรยากาศความอบอุ่นและกตัญญุตาต่อคณะครูอาจารย์ผู้ประสิทธิ์ประสาทวิชา",
    url: "https://picsum.photos/seed/desup-g1/800/1000",
    aspect: "4:5",
    date: "2026-06-12",
  },
  {
    id: "gal-2",
    title: "ขบวนพาเหรดงานกีฬาภายในสาธิตพะเยาสัมพันธ์",
    caption: "ความคิดสร้างสรรค์และการสะท้อนเอกลักษณ์วัฒนธรรมล้านนาของนักเรียน",
    url: "https://picsum.photos/seed/desup-g2/1000/667",
    aspect: "3:2",
    date: "2026-08-28",
  },
  {
    id: "gal-3",
    title: "การแสดงดนตรีพื้นบ้านล้านนา สะล้อซอซึง",
    caption: "นักเรียนชมรมดนตรีไทยร่วมบรรเลงต้อนรับผู้มาเยือน ณ ลานกิจกรรม",
    url: "https://picsum.photos/seed/desup-g3/800/800",
    aspect: "1:1",
    date: "2026-07-15",
  },
  {
    id: "gal-4",
    title: "กิจกรรมค่ายผู้นำเยาวชนสาธิต ม.พะเยา",
    caption: "ฝึกทักษะการทำงานเป็นทีมและการแก้ปัญหาเชิงสร้างสรรค์ร่วมกัน",
    url: "https://picsum.photos/seed/desup-g4/800/1000",
    aspect: "4:5",
    date: "2026-07-22",
  },
  {
    id: "gal-5",
    title: "นิทรรศการสิ่งประดิษฐ์และโครงงานวิทยาศาสตร์",
    caption: "ผลงานโครงงานของนักเรียน ม.ปลาย ที่ได้รับรางวัลระดับภาค",
    url: "https://picsum.photos/seed/desup-g5/1000/667",
    aspect: "3:2",
    date: "2026-08-14",
  },
  {
    id: "gal-6",
    title: "จิตอาสารวมใจพัฒนาชุมชนรอบรั้วสาธิตฯ",
    caption: "รอยยิ้มแห่งความสุขจากการร่วมมือกันปรับปรุงสิ่งแวดล้อมเพื่อสังคม",
    url: "https://picsum.photos/seed/desup-g6/800/800",
    aspect: "1:1",
    date: "2026-09-02",
  },
];

export const MOCK_PRESIDENT = {
  name: "นายปิติวัจน์ สุวรรณรัตน์",
  position: "ประธานองค์การนักเรียน ประจำปีการศึกษา 2569",
  grade: "ชั้นมัธยมศึกษาปีที่ 6/1",
  photoUrl: "https://picsum.photos/seed/desup-president-2569/800/1000",
  greetingText:
    "องค์การนักเรียนไม่ใช่เพียงตัวแทนของนักเรียนกลุ่มหนึ่ง แต่คือพื้นที่กลางที่เปิดกว้างสำหรับทุกเสียง ทุกไอเดีย และทุกความฝันของเพื่อน ๆ สาธิต ม.พะเยา เรามุ่งมั่นจะทำให้โรงเรียนแห่งนี้เป็นบ้านหลังที่สองที่ทุกคนภาคภูมิใจ ปลอดภัย และเติบโตไปด้วยกันอย่างมีความสุข",
  academicYear: 2569,
};

export const MOCK_STATS: SiteStatistics = {
  totalVisits: 28450,
  totalComplaints: 84,
  resolvedComplaints: 78,
  resolvedPercentage: 92.8,
  activitiesThisYear: 32,
  avgResolutionDays: 3.2,
};

export const MOCK_TICKER = [
  "ยินดีต้อนรับสู่เว็บไซต์ทางการ องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
  "ขอเชิญชวนเสนอหัวข้อกิจกรรมในเวที Student Town Hall สัปดาห์หน้า",
  "เปิดรับข้อเสนอโครงการพัฒนานวัตกรรมและสิ่งแวดล้อม ประจำปี 2569 ถึงวันที่ 15 ต.ค. นี้",
  "ระบบรับเรื่องร้องเรียนเปิดให้บริการ 24 ชม. ตรวจสอบสถานะด้วยรหัสติดตามได้ทันที",
];

export const MOCK_COMPLAINTS: Record<string, ComplaintItem> = {
  "SC-2569-DEMO01": {
    id: "SC-2569-DEMO01",
    trackingCode: "SC-2569-DEMO01",
    type: "suggestion",
    title: "เสนอขอเพิ่มจุดบริการน้ำดื่มเย็นและแก้วน้ำกระดาษบริเวณโรงยิมเนเซียม",
    body: "เนื่องจากช่วงหลังเลิกเรียนมีนักเรียนเล่นกีฬาและออกกำลังกายเป็นจำนวนมาก แต่จุดบริการน้ำดื่มมีเพียงจุดเดียวและน้ำมักไม่เย็น ขอเสนอให้องค์การนักเรียนช่วยประสานงานฝ่ายอาคารสถานที่เพื่อติดตั้งตู้ทำน้ำเย็นเพิ่มเติม",
    location: "โรงยิมเนเซียม 1",
    anonymous: true,
    status: "resolved",
    publicReplies: [
      {
        text: "องค์การนักเรียนได้รับเรื่องและประสานงานกับฝ่ายอาคารสถานที่ของโรงเรียนเรียบร้อยแล้ว",
        at: "2026-09-12T10:00:00Z",
      },
      {
        text: "ฝ่ายอาคารฯ ได้ดำเนินการติดตั้งตู้กดน้ำเย็นเพิ่มเติม 1 จุด และเปลี่ยนไส้กรองใหม่เรียบร้อยแล้ว พร้อมใช้งาน",
        at: "2026-09-16T14:30:00Z",
      },
    ],
    createdAt: "2026-09-10T14:00:00Z",
    updatedAt: "2026-09-16T14:30:00Z",
  },
  "SC-2569-DEMO02": {
    id: "SC-2569-DEMO02",
    trackingCode: "SC-2569-DEMO02",
    type: "complaint",
    title: "ระบบเสียงในห้องประชุม 2 มีเสียงสะท้อนและไมโครโฟนดับบ่อย",
    body: "การจัดประชุมชมรมเมื่อวันศุกร์ที่ผ่านมาพบว่าไมโครโฟนตัวที่ 2 และ 3 สัญญาณขาดหายบ่อยครั้ง ทำให้การนำเสนอติดขัด ขอความอนุเคราะห์ตรวจเช็กระบบสัญญาณ",
    location: "ห้องประชุม 2 อาคารเรียนรวม",
    anonymous: false,
    contact: {
      name: "นายกรวิชญ์ เมธาธรณ์",
      gradeRoom: "ม.5/1",
      contactChannel: "korn.m@up.ac.th",
    },
    status: "in_progress",
    publicReplies: [
      {
        text: "องค์การนักเรียนฝ่ายเทคโนโลยีได้เข้าทดสอบและส่งเครื่องส่งสัญญาณเข้าซ่อมบำรุง คาดว่าจะแล้วเสร็จภายในสัปดาห์นี้",
        at: "2026-09-22T09:15:00Z",
      },
    ],
    createdAt: "2026-09-20T16:30:00Z",
    updatedAt: "2026-09-22T09:15:00Z",
  },
};

// ==========================================
// ASYNC API SERVICE METHODS
// ==========================================

export async function getNews(options?: {
  category?: NewsCategory | "all";
  search?: string;
  limit?: number;
  offset?: number;
  includeUnpublished?: boolean;
}): Promise<{ items: NewsItem[]; total: number }> {
  try {
    const newsCol = collection(db, "news");
    let qConstraint = options?.includeUnpublished
      ? query(newsCol, limit(50))
      : query(newsCol, where("published", "==", true), limit(50));

    const qSnap = await getDocs(qConstraint);
    if (!qSnap.empty) {
      let items: NewsItem[] = qSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as NewsItem[];

      if (options?.category && options.category !== "all") {
        items = items.filter((n) => n.category === options.category);
      }
      if (options?.search?.trim()) {
        const q = options.search.toLowerCase().trim();
        items = items.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.excerpt.toLowerCase().includes(q)
        );
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const offset = options?.offset || 0;
      const lim = options?.limit || items.length;
      return { items: items.slice(offset, offset + lim), total: items.length };
    }
  } catch (error) {
    console.warn("Using fallback news data:", error);
  }

  let filtered = [...MOCK_NEWS];
  if (!options?.includeUnpublished) {
    filtered = filtered.filter((item) => item.published);
  }

  if (options?.category && options.category !== "all") {
    filtered = filtered.filter((item) => item.category === options.category);
  }
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
    );
  }
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = filtered.length;
  const offset = options?.offset || 0;
  const lim = options?.limit || filtered.length;
  const items = filtered.slice(offset, offset + lim);

  return { items, total };
}

export async function getFeaturedNews(): Promise<{ main: NewsItem; secondary: NewsItem[] }> {
  const { items } = await getNews();
  const pinned = items.find((n) => n.pinned) || items[0];
  const others = items.filter((n) => n.id !== pinned.id).slice(0, 4);

  return {
    main: pinned,
    secondary: others,
  };
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const docSnap = await getDoc(doc(db, "news", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NewsItem;
    }
  } catch {
    // fallback
  }

  const found = MOCK_NEWS.find((n) => n.id === id || n.slug === id);
  return found || null;
}

export async function getRelatedNews(currentId: string, category: NewsCategory, count: number = 3): Promise<NewsItem[]> {
  const { items } = await getNews({ category });
  return items.filter((n) => n.id !== currentId).slice(0, count);
}

export async function incrementNewsViews(id: string): Promise<void> {
  const sessionKey = `viewed_news_${id}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, "true");

  try {
    const docRef = doc(db, "news", id);
    await updateDoc(docRef, {
      views: increment(1),
    });
  } catch {
    const item = MOCK_NEWS.find((n) => n.id === id);
    if (item) item.views += 1;
  }
}

export async function getEvents(options?: {
  type?: EventType;
}): Promise<EventItem[]> {
  try {
    const evCol = collection(db, "events");
    const snap = await getDocs(query(evCol, where("published", "==", true)));
    if (!snap.empty) {
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EventItem[];
      if (options?.type) {
        items = items.filter((e) => e.type === options.type);
      }
      return items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    }
  } catch {
    // fallback
  }

  let items = [...MOCK_EVENTS].filter((e) => e.published);
  if (options?.type) {
    items = items.filter((e) => e.type === options.type);
  }
  return items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export async function getUpcomingEvents(limitCount: number = 6): Promise<EventItem[]> {
  const events = await getEvents();
  return events.slice(0, limitCount);
}

export async function getDownloads(options?: {
  category?: DownloadCategory | "all";
  search?: string;
}): Promise<DownloadItem[]> {
  try {
    const dlCol = collection(db, "downloads");
    const snap = await getDocs(dlCol);
    if (!snap.empty) {
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DownloadItem[];
      if (options?.category && options.category !== "all") {
        items = items.filter((d) => d.category === options.category);
      }
      if (options?.search?.trim()) {
        const q = options.search.toLowerCase().trim();
        items = items.filter((d) => d.title.toLowerCase().includes(q));
      }
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch {
    // fallback
  }

  let items = [...MOCK_DOWNLOADS];
  if (options?.category && options.category !== "all") {
    items = items.filter((d) => d.category === options.category);
  }
  if (options?.search?.trim()) {
    const q = options.search.toLowerCase().trim();
    items = items.filter((d) => d.title.toLowerCase().includes(q));
  }
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function incrementDownloadCount(id: string): Promise<void> {
  try {
    const docRef = doc(db, "downloads", id);
    await updateDoc(docRef, {
      downloads: increment(1),
    });
  } catch {
    const item = MOCK_DOWNLOADS.find((d) => d.id === id);
    if (item) item.downloads += 1;
  }
}

export async function getPeople(role?: PersonRole, yearTH?: number): Promise<PersonItem[]> {
  try {
    const peoCol = collection(db, "people");
    const snap = await getDocs(peoCol);
    if (!snap.empty) {
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PersonItem[];
      if (role) items = items.filter((p) => p.role === role);
      if (yearTH) items = items.filter((p) => p.yearTH === yearTH);
      return items.sort((a, b) => a.order - b.order);
    }
  } catch {
    // fallback
  }

  let items = [...MOCK_PEOPLE];
  if (role) items = items.filter((p) => p.role === role);
  if (yearTH) items = items.filter((p) => p.yearTH === yearTH);
  return items.sort((a, b) => a.order - b.order);
}

export async function getBudget(yearTH: number = 2569): Promise<BudgetYearData> {
  try {
    const snap = await getDoc(doc(db, "budgets", String(yearTH)));
    if (snap.exists()) {
      return snap.data() as BudgetYearData;
    }
  } catch {
    // fallback
  }
  return MOCK_BUDGET;
}

export async function getSiteStatistics(): Promise<SiteStatistics> {
  return MOCK_STATS;
}

export async function getServiceShortcuts(): Promise<ServiceLinkItem[]> {
  return MOCK_SERVICES;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return MOCK_GALLERY;
}

export async function getPresidentGreeting() {
  return MOCK_PRESIDENT;
}

export async function getTickerAnnouncements(): Promise<string[]> {
  return MOCK_TICKER;
}

// ==========================================
// COMPLAINT & TRACKING SERVICE
// ==========================================

export function generateTrackingCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SC-2569-${randomPart}`;
}

export async function submitComplaint(payload: {
  type: ComplaintType;
  title: string;
  body: string;
  location?: string;
  imageUrls?: string[];
  anonymous: boolean;
  contact?: ComplaintContact;
  honeypot?: string;
}): Promise<{ trackingCode: string }> {
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    throw new Error("Spam detected.");
  }

  const lastSubmit = localStorage.getItem("desup_last_complaint_ts");
  const now = Date.now();
  if (lastSubmit && now - parseInt(lastSubmit, 10) < 60000) {
    const waitSec = Math.ceil((60000 - (now - parseInt(lastSubmit, 10))) / 1000);
    throw new Error(`กรุณารออีก ${waitSec} วินาทีก่อนส่งเรื่องถัดไป`);
  }

  const trackingCode = generateTrackingCode();
  const isoTime = new Date().toISOString();

  const publicData: ComplaintItem = {
    id: trackingCode,
    trackingCode,
    type: payload.type,
    title: payload.title.trim(),
    body: payload.body.trim(),
    location: payload.location?.trim() || "",
    imageUrls: payload.imageUrls || [],
    anonymous: payload.anonymous,
    status: "received",
    publicReplies: [],
    createdAt: isoTime,
    updatedAt: isoTime,
  };

  try {
    await setDoc(doc(db, "complaints", trackingCode), publicData);

    if (!payload.anonymous && payload.contact) {
      await setDoc(
        doc(db, `complaints/${trackingCode}/private`, "contact"),
        payload.contact
      );
    }
  } catch (error) {
    console.warn("Could not save to Firestore, storing in memory fallback:", error);
    MOCK_COMPLAINTS[trackingCode] = publicData;
  }

  localStorage.setItem("desup_last_complaint_ts", String(now));
  return { trackingCode };
}

export async function getComplaintByTrackingCode(trackingCode: string): Promise<ComplaintItem | null> {
  const code = trackingCode.trim().toUpperCase();

  try {
    const snap = await getDoc(doc(db, "complaints", code));
    if (snap.exists()) {
      return snap.data() as ComplaintItem;
    }
  } catch {
    // fallback
  }

  return MOCK_COMPLAINTS[code] || null;
}

export async function getAllComplaints(): Promise<ComplaintItem[]> {
  try {
    const colSnap = await getDocs(collection(db, "complaints"));
    if (!colSnap.empty) {
      const items = await Promise.all(
        colSnap.docs.map(async (docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as ComplaintItem;
          // Try fetching private contact if available for admin
          try {
            const contactSnap = await getDoc(doc(db, `complaints/${item.id}/private`, "contact"));
            if (contactSnap.exists()) {
              item.contact = contactSnap.data() as ComplaintContact;
            }
          } catch {
            // private read might fail if not admin
          }
          return item;
        })
      );
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (error) {
    console.warn("Fetching complaints from fallback:", error);
  }

  return Object.values(MOCK_COMPLAINTS).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateComplaintStatus(
  trackingCode: string,
  newStatus: ComplaintStatus,
  replyText?: string
): Promise<void> {
  const code = trackingCode.trim().toUpperCase();
  const isoTime = new Date().toISOString();

  try {
    const docRef = doc(db, "complaints", code);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const currentData = snap.data() as ComplaintItem;
      const replies = currentData.publicReplies || [];
      if (replyText?.trim()) {
        replies.push({ text: replyText.trim(), at: isoTime });
      }

      await updateDoc(docRef, {
        status: newStatus,
        publicReplies: replies,
        updatedAt: isoTime,
      });
      return;
    }
  } catch (error) {
    console.warn("Update complaint in Firestore error, updating mock:", error);
  }

  // Update in mock
  if (MOCK_COMPLAINTS[code]) {
    MOCK_COMPLAINTS[code].status = newStatus;
    if (replyText?.trim()) {
      MOCK_COMPLAINTS[code].publicReplies.push({
        text: replyText.trim(),
        at: isoTime,
      });
    }
    MOCK_COMPLAINTS[code].updatedAt = isoTime;
  }
}

// ==========================================
// ADMIN MUTATIONS (Phase 4)
// ==========================================

export async function saveNewsItem(item: Partial<NewsItem>): Promise<string> {
  const isoTime = new Date().toISOString();
  const id = item.id || `news-${Date.now()}`;
  const data: NewsItem = {
    id,
    title: item.title || "",
    slug: item.slug || `news-${Date.now()}`,
    category: item.category || "pr",
    excerpt: item.excerpt || "",
    content: item.content || "",
    coverUrl: item.coverUrl || "https://picsum.photos/seed/desup/1200/800",
    galleryUrls: item.galleryUrls || [],
    attachments: item.attachments || [],
    videoUrl: item.videoUrl || "",
    published: item.published ?? true,
    pinned: item.pinned ?? false,
    views: item.views ?? 0,
    createdAt: item.createdAt || isoTime,
    updatedAt: isoTime,
  };

  try {
    await setDoc(doc(db, "news", id), data);
  } catch (error) {
    console.warn("Firestore save news error, saving to mock:", error);
  }

  const existingIdx = MOCK_NEWS.findIndex((n) => n.id === id);
  if (existingIdx >= 0) {
    MOCK_NEWS[existingIdx] = data;
  } else {
    MOCK_NEWS.unshift(data);
  }

  return id;
}

export async function deleteNewsItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "news", id));
  } catch {
    // ignore
  }
  const idx = MOCK_NEWS.findIndex((n) => n.id === id);
  if (idx >= 0) MOCK_NEWS.splice(idx, 1);
}

export async function saveEventItem(item: Partial<EventItem>): Promise<string> {
  const id = item.id || `evt-${Date.now()}`;
  const data: EventItem = {
    id,
    title: item.title || "",
    description: item.description || "",
    type: item.type || "academic",
    location: item.location || "โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
    startAt: item.startAt || new Date().toISOString(),
    endAt: item.endAt || new Date().toISOString(),
    allDay: item.allDay ?? false,
    coverUrl: item.coverUrl,
    published: item.published ?? true,
  };

  try {
    await setDoc(doc(db, "events", id), data);
  } catch {
    // fallback
  }

  const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
  if (idx >= 0) {
    MOCK_EVENTS[idx] = data;
  } else {
    MOCK_EVENTS.unshift(data);
  }

  return id;
}

export async function deleteEventItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "events", id));
  } catch {
    // ignore
  }
  const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
  if (idx >= 0) MOCK_EVENTS.splice(idx, 1);
}

export async function saveDownloadItem(item: Partial<DownloadItem>): Promise<string> {
  const id = item.id || `dl-${Date.now()}`;
  const data: DownloadItem = {
    id,
    title: item.title || "",
    category: item.category || "forms",
    fileType: item.fileType || "PDF",
    fileUrl: item.fileUrl || "https://example.com/file.pdf",
    fileSize: item.fileSize || "1.0 MB",
    downloads: item.downloads || 0,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "downloads", id), data);
  } catch {
    // fallback
  }

  const idx = MOCK_DOWNLOADS.findIndex((d) => d.id === id);
  if (idx >= 0) {
    MOCK_DOWNLOADS[idx] = data;
  } else {
    MOCK_DOWNLOADS.unshift(data);
  }

  return id;
}

export async function deleteDownloadItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "downloads", id));
  } catch {
    // ignore
  }
  const idx = MOCK_DOWNLOADS.findIndex((d) => d.id === id);
  if (idx >= 0) MOCK_DOWNLOADS.splice(idx, 1);
}

export async function savePersonItem(item: Partial<PersonItem>): Promise<string> {
  const id = item.id || `person-${Date.now()}`;
  const data: PersonItem = {
    id,
    name: item.name || "",
    role: item.role || "board",
    position: item.position || "",
    department: item.department || "",
    grade: item.grade || "",
    yearTH: item.yearTH || 2569,
    photoUrl: item.photoUrl || "https://picsum.photos/seed/person/600/750",
    quote: item.quote,
    order: item.order || 99,
  };

  try {
    await setDoc(doc(db, "people", id), data);
  } catch {
    // fallback
  }

  const idx = MOCK_PEOPLE.findIndex((p) => p.id === id);
  if (idx >= 0) {
    MOCK_PEOPLE[idx] = data;
  } else {
    MOCK_PEOPLE.push(data);
  }

  return id;
}

export async function deletePersonItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "people", id));
  } catch {
    // ignore
  }
  const idx = MOCK_PEOPLE.findIndex((p) => p.id === id);
  if (idx >= 0) MOCK_PEOPLE.splice(idx, 1);
}

export async function saveBudgetData(budgetData: BudgetYearData): Promise<void> {
  try {
    await setDoc(doc(db, "budgets", String(budgetData.yearTH)), budgetData);
  } catch {
    // fallback
  }
  Object.assign(MOCK_BUDGET, budgetData);
}

// ==========================================
// SEED ALL SAMPLE DATA (Section 5.4)
// ==========================================

export async function seedAllSampleData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Seed News (8 items)
    for (const news of MOCK_NEWS) {
      await setDoc(doc(db, "news", news.id), news);
    }

    // 2. Seed Events (10 items)
    for (const ev of MOCK_EVENTS) {
      await setDoc(doc(db, "events", ev.id), ev);
    }

    // 3. Seed Downloads (8 items)
    for (const dl of MOCK_DOWNLOADS) {
      await setDoc(doc(db, "downloads", dl.id), dl);
    }

    // 4. Seed People (12 board + 3 advisors + 6 presidents = 21 items)
    for (const p of MOCK_PEOPLE) {
      await setDoc(doc(db, "people", p.id), p);
    }

    // 5. Seed Budget (1 year)
    await setDoc(doc(db, "budgets", String(MOCK_BUDGET.yearTH)), MOCK_BUDGET);

    // 6. Seed Site Settings
    await setDoc(doc(db, "settings", "site"), {
      ticker: MOCK_TICKER,
      totalVisits: MOCK_STATS.totalVisits,
    });

    // 7. Seed Demo Complaints
    for (const [code, comp] of Object.entries(MOCK_COMPLAINTS)) {
      await setDoc(doc(db, "complaints", code), comp);
      if (comp.contact) {
        await setDoc(doc(db, `complaints/${code}/private`, "contact"), comp.contact);
      }
    }

    return {
      success: true,
      message: "เติมข้อมูลตัวอย่าง (Seed Data) ลงในระบบ Cloud Firestore ครบถ้วนเรียบร้อยแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการเติมข้อมูล: ${error.message || String(error)}`,
    };
  }
}

// ==========================================
// CONTACT MESSAGE SERVICE
// ==========================================

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  honeypot?: string;
}): Promise<void> {
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    throw new Error("Spam detected.");
  }

  try {
    await addDoc(collection(db, "messages"), {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || "",
      message: payload.message.trim(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Could not send contact message to Firestore, noted in mock:", error);
  }
}

// ==========================================
// HERO SLIDES SERVICE (สำหรับสไลด์ข่าวสารหน้าแรก วน 5 วินาที)
// ==========================================

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "slide-1",
    title: "เปิดรับสมัครสมาชิกชมรมและชุมนุมนักเรียน ประจำภาคเรียนที่ 1/2569",
    subtitle: "ค้นหาความสนใจ พัฒนาทักษะความเป็นผู้นำ และสร้างมิตรภาพผ่านกิจกรรมชุมนุมกว่า 25 ชมรม",
    tag: "ข่าวด่วนประชาสัมพันธ์",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
    linkUrl: "/news/pr-1",
    order: 1,
    published: true,
  },
  {
    id: "slide-2",
    title: "ขอเชิญร่วมงานนิทรรศการวิชาการและเปิดบ้านสาธิต ม.พะเยา 'Open House 2026'",
    subtitle: "ชมนิทรรศการผลงานโครงงานวิทยาศาสตร์ นวัตกรรม และการแสดงความสามารถทางวิชาการของนักเรียน",
    tag: "กิจกรรมเด่น",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
    linkUrl: "/news/pr-2",
    order: 2,
    published: true,
  },
  {
    id: "slide-3",
    title: "องค์การนักเรียนเปิดช่องทางรับฟังความคิดเห็นและข้อร้องเรียนออนไลน์ 24 ชม.",
    subtitle: "ร่วมส่งเสียงสะท้อนเพื่อการพัฒนาโรงเรียน ตรวจสอบสถานะการดำเนินงานได้อย่างโปร่งใส",
    tag: "บริการนักเรียน",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop",
    linkUrl: "/complaint",
    order: 3,
    published: true,
  },
  {
    id: "slide-4",
    title: "ประกาศผลการเลือกตั้งคณะกรรมการองค์การนักเรียน ประจำปีการศึกษา 2569",
    subtitle: "ขอแสดงความยินดีกับคณะกรรมการชุดใหม่ พร้อมเดินหน้าขับเคลื่อนสิทธิและสวัสดิการของนักเรียน",
    tag: "ประกาศผลทางการ",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1600&auto=format&fit=crop",
    linkUrl: "/about/board",
    order: 4,
    published: true,
  },
];

let localHeroSlides: HeroSlideItem[] = [...DEFAULT_HERO_SLIDES];

export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const snap = await getDocs(collection(db, "hero_slides"));
    if (!snap.empty) {
      const items: HeroSlideItem[] = [];
      snap.forEach((d) => items.push(d.data() as HeroSlideItem));
      items.sort((a, b) => a.order - b.order);
      localHeroSlides = items;
      return items.filter((item) => item.published);
    }
  } catch (error) {
    console.warn("Could not fetch hero slides from Firestore, using local slides:", error);
  }
  return localHeroSlides.filter((item) => item.published);
}

export async function getAllHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const snap = await getDocs(collection(db, "hero_slides"));
    if (!snap.empty) {
      const items: HeroSlideItem[] = [];
      snap.forEach((d) => items.push(d.data() as HeroSlideItem));
      items.sort((a, b) => a.order - b.order);
      localHeroSlides = items;
      return items;
    }
  } catch (error) {
    console.warn("Could not fetch hero slides from Firestore, using local slides:", error);
  }
  return localHeroSlides;
}

export async function saveHeroSlide(slide: Partial<HeroSlideItem>): Promise<HeroSlideItem> {
  const slideId = slide.id || `slide-${Date.now()}`;
  const fullSlide: HeroSlideItem = {
    id: slideId,
    title: slide.title || "หัวข้อข่าวเด่น",
    subtitle: slide.subtitle || "",
    tag: slide.tag || "ข่าวประชาสัมพันธ์",
    imageUrl: slide.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
    linkUrl: slide.linkUrl || "/news",
    isExternal: slide.isExternal ?? (slide.linkUrl?.startsWith("http") || false),
    order: slide.order ?? (localHeroSlides.length + 1),
    published: slide.published ?? true,
    createdAt: slide.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "hero_slides", slideId), fullSlide);
  } catch (error) {
    console.warn("Could not save hero slide to Firestore, saving locally:", error);
  }

  const existingIndex = localHeroSlides.findIndex((s) => s.id === slideId);
  if (existingIndex >= 0) {
    localHeroSlides[existingIndex] = fullSlide;
  } else {
    localHeroSlides.push(fullSlide);
  }
  localHeroSlides.sort((a, b) => a.order - b.order);

  return fullSlide;
}

export async function deleteHeroSlide(slideId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "hero_slides", slideId));
  } catch (error) {
    console.warn("Could not delete hero slide from Firestore, deleting locally:", error);
  }
  localHeroSlides = localHeroSlides.filter((s) => s.id !== slideId);
}

