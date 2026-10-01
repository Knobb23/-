import React from "react";
import { Emblem } from "@/src/components/common/Emblem";
import { SectionHeading } from "@/src/components/common/SectionHeading";
import { Divider } from "@/src/components/common/Divider";

export const EmblemPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="04"
          eyebrow="IDENTITY · ตราสัญลักษณ์และเอกลักษณ์"
          title="ตราสัญลักษณ์และความหมาย"
          description="ความหมายอันทรงคุณค่าของตราประจำองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา"
          align="left"
        />

        {/* Big Emblem Presentation Card */}
        <div className="my-10 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-8 sm:p-14 shadow-[0_1px_0_rgba(42,18,69,.06)] text-center">
          <div className="flex justify-center mb-8">
            <div className="relative p-6 rounded-full bg-[#FAF7F0] border border-[#B8923A]/30 shadow-inner">
              <Emblem size={180} theme="on-paper" priority />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1226] mb-2">
            ตราประจำองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา
          </h2>
          <p className="text-sm sm:text-base text-[#9C7A2B] font-sans font-medium tracking-wide">
            DeSUP Student Organization Official Seal
          </p>
        </div>

        {/* Color Meanings (Violet & Gold) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          {/* Purple Block */}
          <div className="border border-[#B8923A]/30 rounded-[4px] p-8 bg-[#2A1245] text-[#FAF7F0] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-5 h-5 rounded-full bg-[#4B1F7A] border border-[#D9B867]" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF7F0]">
                สีม่วง (Violet) — สติปัญญาและเกียรติภูมิ
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#FAF7F0]/80 leading-relaxed font-sans">
              สีประจำมหาวิทยาลัยพะเยาและโรงเรียนสาธิตฯ สื่อถึงความสง่างาม สติปัญญาอันเฉียบแหลม ความมุ่งมั่นทางวิชาการ และความคิดสร้างสรรค์ในการพัฒนานวัตกรรมเพื่อสังคม เป็นสัญลักษณ์แห่งการหลอมรวมจิตวิญญาณและความภาคภูมิใจของชาวสาธิตพะเยา
            </p>
          </div>

          {/* Gold Block */}
          <div className="border border-[#B8923A]/30 rounded-[4px] p-8 bg-[#FAF7F0] text-[#1B1226] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-5 h-5 rounded-full bg-[#B8923A] border border-[#4B1F7A]" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1226]">
                สีทอง (Gold) — ความเป็นเลิศและคุณธรรม
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#1B1226]/80 leading-relaxed font-sans">
              สื่อถึงคุณค่าทางจิตใจ ความสว่างไสวแห่งปัญญา ความเจริญรุ่งเรือง และการยึดมั่นในความโปร่งใสซื่อสัตย์สุจริต ดั่งทองคำแท้ที่ไม่แปรเปลี่ยนแม้ผ่านกาลเวลา สะท้อนถึงการปฏิบัติหน้าที่ขององค์การนักเรียนด้วยความรับผิดชอบสูงสุด
            </p>
          </div>
        </div>

        <Divider />

        {/* Emblem Components & Philosophy */}
        <div className="my-10 space-y-6 max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl font-bold text-[#1B1226] text-center mb-6">
            องค์ประกอบทางปรัชญาในดวงตรา
          </h3>

          <div className="space-y-4 font-sans text-sm sm:text-base text-[#1B1226]/80 leading-relaxed divide-y divide-[#B8923A]/20">
            <div className="pt-4">
              <h4 className="font-bold text-[#4B1F7A] mb-1 font-serif text-lg">
                1. ตัวอักษรย่อและชื่อสถาบัน
              </h4>
              <p>
                แสดงความเป็นเอกลักษณ์ภายใต้ร่มเงาของโรงเรียนสาธิตมหาวิทยาลัยพะเยา และมหาวิทยาลัยพะเยา สถาบันอุดมศึกษาชั้นนำแห่งล้านนาตะวันออก
              </p>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-[#4B1F7A] mb-1 font-serif text-lg">
                2. วงกลมล้อมรอบ
              </h4>
              <p>
                แสดงถึงความกลมเกลียว ความสามัคคีเป็นอันหนึ่งอันเดียวกันของนักเรียนทุกระดับชั้นตั้งแต่ ม.1 ถึง ม.6 ตลอดจนความผูกพันอันแน่นแฟ้นระหว่างศิษย์ ครู และผู้ปกครอง
              </p>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-[#4B1F7A] mb-1 font-serif text-lg">
                3. ลวดลายเรขาคณิตและเส้นสายร่วมสมัย
              </h4>
              <p>
                สะท้อนถึงการผสมผสานระหว่างรากเหง้าวัฒนธรรมล้านนาอันงดงาม และวิสัยทัศน์สมัยใหม่ที่พร้อมขับเคลื่อนการเปลี่ยนแปลงอย่างสร้างสรรค์
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmblemPage;
