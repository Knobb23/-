import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CaretDown, Scales, BookOpen } from "@phosphor-icons/react";
import { SectionHeading } from "@/src/components/common/SectionHeading";

interface ArticleItem {
  id: number;
  section: string;
  title: string;
  content: string[];
}

const ARTICLES: ArticleItem[] = [
  {
    id: 1,
    section: "หมวดที่ 1 บททั่วไป",
    title: "มาตรา 1: สถานะและเจตนารมณ์ขององค์การนักเรียน",
    content: [
      "องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา เป็นองค์กรตัวแทนสูงสุดของนักเรียน มีหน้าที่ดำเนินกิจกรรม พิทักษ์สิทธิ และส่งเสริมสวัสดิภาพของนักเรียนทุกคน",
      "การดำเนินงานขององค์การนักเรียนต้องยึดมั่นในระบอบประชาธิปไตย ความโปร่งใส ตรวจสอบได้ และความเสมอภาคโดยไม่เลือกปฏิบัติ",
    ],
  },
  {
    id: 2,
    section: "หมวดที่ 2 อำนาจและหน้าที่",
    title: "มาตรา 2: อำนาจหน้าที่หลักของคณะกรรมการองค์การนักเรียน",
    content: [
      "วางแผน ประสานงาน และดำเนินโครงการกิจกรรมเสริมหลักสูตร ทั้งด้านวิชาการ กีฬา ศิลปวัฒนธรรม และจิตอาสา",
      "เป็นตัวแทนสะท้อนปัญหา ข้อคิดเห็น และข้อเสนอแนะของนักเรียนต่อผู้บริหารโรงเรียนและคณะครู",
      "บริหารจัดการและจัดสรรงบประมาณกิจกรรมนักเรียนที่ได้รับอนุมัติอย่างมีประสิทธิภาพและคุ้มค่า",
      "กำกับดูแล ส่งเสริม และประสานงานการจัดตั้งชมรมนักเรียนภายในโรงเรียน",
    ],
  },
  {
    id: 3,
    section: "หมวดที่ 3 โครงสร้างและการบริหาร",
    title: "มาตรา 3: โครงสร้างคณะกรรมการและการแบ่งส่วนงาน",
    content: [
      "คณะกรรมการองค์การนักเรียนประกอบด้วย ประธาน รองประธาน และหัวหน้าฝ่ายต่าง ๆ รวมไม่น้อยกว่า 12 คน และไม่เกิน 20 คน",
      "การแบ่งส่วนงานประกอบด้วย 6 ฝ่ายหลัก ได้แก่ ฝ่ายบริหารกลางและสารบรรณ, ฝ่ายวิชาการ, ฝ่ายกิจกรรมและกีฬา, ฝ่ายศิลปวัฒนธรรม, ฝ่ายประชาสัมพันธ์และเทคโนโลยี, และฝ่ายสวัสดิการและพิทักษ์สิทธิ์",
      "วาระการดำรงตำแหน่งมีกำหนด 1 ปีการศึกษา นับแต่วันที่มีคำสั่งแต่งตั้งเป็นทางการ",
    ],
  },
  {
    id: 4,
    section: "หมวดที่ 4 สิทธิและสวัสดิภาพนักเรียน",
    title: "มาตรา 4: การพิทักษ์สิทธิและรับเรื่องร้องเรียน",
    content: [
      "องค์การนักเรียนมีหน้าที่รับเรื่องร้องเรียน ข้อเสนอแนะ หรือเบาะแสความไม่เป็นธรรมจากนักเรียนทุกคน โดยต้องปกปิดข้อมูลส่วนตัวของผู้ร้องเรียนเป็นความลับขั้นสูงสุด",
      "ต้องมีการบันทึกสถานะ ติดตามผล และแจ้งความคืบหน้าให้ผู้ร้องเรียนทราบผ่านระบบติดตามสถานะอย่างโปร่งใส",
      "มีอำนาจประสานงานร่วมกับฝ่ายปกครองหรือคณะครูที่เกี่ยวข้องเพื่อหาข้อยุติที่เป็นธรรมและรวดเร็ว",
    ],
  },
  {
    id: 5,
    section: "หมวดที่ 5 การเงินและงบประมาณ",
    title: "มาตรา 5: ความโปร่งใสในการบริหารงบประมาณ",
    content: [
      "งบประมาณทุกบาททุกสตางค์ที่ได้รับการจัดสรรต้องมีการทำบัญชีรายรับ-รายจ่ายที่ชัดเจน",
      "เหรัญญิกต้องจัดทำรายงานสถานะการเงินเสนอต่อสภานักเรียนทุกสิ้นภาคเรียน และเปิดเผยต่อสาธารณะผ่านหน้าความโปร่งใสบนเว็บไซต์ทางการ",
    ],
  },
];

export const AuthorityPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="04"
          eyebrow="CONSTITUTION · ธรรมนูญและอำนาจหน้าที่"
          title="อำนาจหน้าที่ตามธรรมนูญนักเรียน"
          description="บทบัญญัติว่าด้วยบทบาท อำนาจ หน้าที่ และกรอบการทำงานขององค์การนักเรียน โรงเรียนสาธิต ม.พะเยา"
          align="left"
        />

        {/* Legal Header Card */}
        <div className="my-8 p-6 sm:p-8 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[4px] bg-[#4B1F7A] text-[#FAF7F0] flex items-center justify-center shrink-0">
              <Scales weight="light" className="w-6 h-6 text-[#D9B867]" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1B1226]">
                ธรรมนูญองค์การนักเรียน ฉบับปรับปรุง พ.ศ. 2569
              </h3>
              <p className="text-xs sm:text-sm text-[#1B1226]/70 font-sans">
                บังคับใช้แก่นักเรียนทุกคน และเป็นกรอบอ้างอิงสูงสุดในการบริหารงาน
              </p>
            </div>
          </div>

          <Link
            to="/downloads"
            className="editorial-btn-secondary text-xs sm:text-sm font-medium text-[#4B1F7A] shrink-0"
          >
            <span>ดาวน์โหลดเอกสารฉบับเต็ม (PDF)</span>
            <span className="ml-1 text-[#9C7A2B]">→</span>
          </Link>
        </div>

        {/* Accordions (Open one at a time as per spec) */}
        <div className="my-8 space-y-4 max-w-4xl">
          {ARTICLES.map((article, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={article.id}
                className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-[0_1px_0_rgba(42,18,69,.06)] transition-all"
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#EDE6F5]/30 transition-colors select-none"
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="text-[11px] font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase block mb-1">
                      {article.section}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#1B1226]">
                      {article.title}
                    </h4>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full border border-[#B8923A]/30 flex items-center justify-center shrink-0 text-[#4B1F7A] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#EDE6F5]" : ""
                    }`}
                  >
                    <CaretDown weight="light" className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Content Body */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#B8923A]/15 font-sans text-sm sm:text-base text-[#1B1226]/85 space-y-3 leading-relaxed">
                    {article.content.map((paragraph, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-3">
                        <span className="text-xs text-[#9C7A2B] font-num mt-1 shrink-0">
                          ({pIdx + 1})
                        </span>
                        <p>{paragraph}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default AuthorityPage;
