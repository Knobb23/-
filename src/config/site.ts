/**
 * Configuration for Student Organization Website
 * โรงเรียนสาธิตมหาวิทยาลัยพะเยา (DeSUP)
 */

/**
 * ตราสัญลักษณ์องค์การนักเรียน
 * หมายเหตุ: หากลิงก์ postimg หมดอายุหรือไม่สามารถโหลดได้ ให้ดาวน์โหลดไฟล์มาวางไว้ที่ /public/emblem.png
 * แล้วแก้ EMBLEM_URL เป็น "/emblem.png" ได้ทันที
 */
export const EMBLEM_URL = "https://i.postimg.cc/KvCqGrBG/IMG-5744.png";

/**
 * รายชื่ออีเมล Super Admin เริ่มต้นที่ได้รับสิทธิ์ดูแลระบบ
 */
export const ADMIN_BOOTSTRAP_EMAILS = [
  "67342100@up.ac.th",
  "supakornsrion@gmail.com",
];

export const SITE_CONFIG = {
  name: "องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
  shortName: "สธ.มพ.",
  englishName: "DeSUP Student Organization",
  schoolName: "โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
  universityName: "มหาวิทยาลัยพะเยา",
  address: "19 หมู่ 2 ตำบลแม่กา อำเภอเมืองพะเยา จังหวัดพะเยา 56000",
  phone: "054-466-666 ต่อ 1450",
  email: "satit@up.ac.th",
  facebookUrl: "https://www.facebook.com/profile.php?id=61591508559552",
  facebookName: "องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
  academicSystemUrl: "https://academic.satit.up.ac.th/",
  studentAffairsSystemUrl: "https://student-affairs.satit.up.ac.th/login",
  // พิกัดโรงเรียนสาธิต ม.พะเยา สำหรับ Google Maps Embed
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.2057371977727!2d99.89388337583695!3d18.966453982213768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d833446059d435%3A0x633e8b0bfa5188f6!2z4LmC4Lij4LiH4LmA4Lij4Li14Lii4LiZ4Liq4Liy4LiY4Li04LiV4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4Lie4Liw4LmA4Lii4Liy!5e0!3m2!1sth!2sth!4v1710000000000!5m2!1sth!2sth",
  currentAcademicYear: 2569,
};

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isExternal?: boolean;
  children?: { label: string; href: string; description: string; isExternal?: boolean }[];
}

export const MAIN_NAV: NavItem[] = [
  { label: "หน้าหลัก", href: "/" },
  {
    label: "ข่าวสาร",
    href: "/news",
    description: "ข่าวประชาสัมพันธ์ กิจกรรม และประกาศอย่างเป็นทางการ",
    children: [
      { label: "ข่าวประชาสัมพันธ์", href: "/news/pr", description: "ข้อมูลข่าวสารทั่วไปและประกาศล่าสุด" },
      { label: "ภาพข่าวกิจกรรม", href: "/news/activities", description: "ประมวลภาพบรรยากาศกิจกรรมของนักเรียน" },
      { label: "ระเบียบและข้อบังคับ", href: "/news/regulations", description: "กฎ ระเบียบ ข้อบังคับของโรงเรียนและองค์การ" },
      { label: "ประกาศและคำสั่ง", href: "/news/announcements", description: "หนังสือประกาศและคำสั่งทางการ" },
      { label: "สาระความรู้", href: "/news/knowledge", description: "บทความและองค์ความรู้ที่มีประโยชน์" },
      { label: "คลิปวิดีโอ", href: "/news/videos", description: "บันทึกภาพเคลื่อนไหวและคลิปกิจกรรม" },
    ],
  },
  { label: "ปฏิทินกิจกรรม", href: "/calendar", description: "ตารางกิจกรรมและการดำเนินงานตลอดปีการศึกษา" },
  { label: "ดาวน์โหลด", href: "/downloads", description: "แบบฟอร์ม ระเบียบ และเอกสารทางการ" },
  {
    label: "เกี่ยวกับเรา",
    href: "/about/emblem",
    description: "ข้อมูลโครงสร้าง ประวัติ และคณะกรรมการองค์การนักเรียน",
    children: [
      { label: "ตราสัญลักษณ์", href: "/about/emblem", description: "ความหมายของตราสัญลักษณ์และสีประจำองค์การ" },
      { label: "อำนาจหน้าที่", href: "/about/authority", description: "บทบาท อำนาจหน้าที่ตามธรรมนูญนักเรียน" },
      { label: "คณะกรรมการ", href: "/about/board", description: "โครงสร้างและรายนามคณะกรรมการประจำปีการศึกษา" },
      { label: "ครูที่ปรึกษา", href: "/about/advisors", description: "คณะครูอาจารย์ที่ปรึกษาองค์การนักเรียน" },
      { label: "ทำเนียบประธาน", href: "/about/hall", description: "ทำเนียบประธานองค์การนักเรียนในแต่ละปีการศึกษา" },
    ],
  },
  {
    label: "ระบบที่เกี่ยวข้อง",
    href: "https://academic.satit.up.ac.th/",
    description: "ระบบบริการสารสนเทศและการบริหารงานโรงเรียน",
    isExternal: true,
    children: [
      {
        label: "ระบบบริหารงานวิชาการ",
        href: "https://academic.satit.up.ac.th/",
        description: "ระบบตรวจสอบผลการเรียน งานวิชาการ และตารางเรียน",
        isExternal: true,
      },
      {
        label: "ระบบบริหารงานกิจการนักเรียน",
        href: "https://student-affairs.satit.up.ac.th/login",
        description: "ระบบงานกิจการนักเรียน การดูแลความประพฤติ และสถิติการมาเรียน",
        isExternal: true,
      },
      {
        label: "Facebook เพจองค์การนักเรียน",
        href: "https://www.facebook.com/profile.php?id=61591508559552",
        description: "ติดตามข่าวสาร อัปเดตกิจกรรมอย่างรวดเร็วผ่านแฟนเพจทางการ",
        isExternal: true,
      },
    ],
  },
  { label: "ความโปร่งใส", href: "/transparency", description: "รายงานสถิติการดำเนินงานและงบประมาณ" },
  { label: "ติดต่อ", href: "/contact", description: "ที่ตั้ง แผนที่ และช่องทางการติดต่อองค์การ" },
];
