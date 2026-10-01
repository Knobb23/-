import React, { useState, useEffect } from "react";
import { PersonItem } from "@/src/types";
import { getPeople } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const BoardPage: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<PersonItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2569);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getPeople("board", selectedYear).then((items) => {
      setBoardMembers(items);
      setIsLoading(false);
    });
  }, [selectedYear]);

  // Group into hierarchy
  const president = boardMembers.find((p) => p.position.includes("ประธานองค์การ"));
  const vicePresidents = boardMembers.filter((p) => p.position.includes("รองประธาน"));
  const departmentHeads = boardMembers.filter(
    (p) => !p.position.includes("ประธาน") && !p.position.includes("รองประธาน")
  );

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading & Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading
            number="04"
            eyebrow="LEADERSHIP · คณะผู้บริหารนักเรียน"
            title="คณะกรรมการองค์การนักเรียน"
            description="แผนผังโครงสร้างและรายนามคณะกรรมการประจำปีการศึกษา"
            align="left"
          />

          {/* Academic Year Selector */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <span className="text-xs font-sans text-[#1B1226]/60">ปีการศึกษา:</span>
            {[2569, 2568].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-[3px] text-xs font-num font-semibold transition-colors ${
                  selectedYear === yr
                    ? "bg-[#4B1F7A] text-[#FAF7F0]"
                    : "bg-[#FAF7F0] border border-[#B8923A]/40 text-[#1B1226]/80 hover:bg-[#EDE6F5]"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Level 1: President Card (Centered) */}
        {president && (
          <div className="flex flex-col items-center mb-12">
            <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase mb-4">
              ประธานองค์การนักเรียน
            </span>
            <div className="max-w-[320px] w-full bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] overflow-hidden p-4 shadow-md text-center group">
              <div className="relative aspect-[4/5] rounded-[3px] overflow-hidden bg-[#EDE6F5] mb-4">
                <img
                  src={president.photoUrl}
                  alt={president.name}
                  className="w-full h-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-[400ms]"
                />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors">
                {president.name}
              </h4>
              <p className="text-xs font-sans font-medium text-[#4B1F7A] mt-0.5">
                {president.position}
              </p>
              <p className="text-xs font-sans text-[#1B1226]/60 mt-1">
                ห้อง {president.grade} · ปีการศึกษา {president.yearTH}
              </p>
            </div>

            {/* Connecting Line Down */}
            <div className="w-[1px] h-8 bg-[#B8923A]/40 my-2" />
          </div>
        )}

        {/* Level 2: Vice Presidents (2 cols) */}
        {vicePresidents.length > 0 && (
          <div className="mb-14">
            <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase text-center block mb-6">
              รองประธานองค์การนักเรียน
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {vicePresidents.map((vp) => (
                <div
                  key={vp.id}
                  className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden p-4 shadow-sm text-center group"
                >
                  <div className="relative aspect-[4/5] rounded-[3px] overflow-hidden bg-[#EDE6F5] mb-4">
                    <img
                      src={vp.photoUrl}
                      alt={vp.name}
                      className="w-full h-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-[400ms]"
                    />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors">
                    {vp.name}
                  </h4>
                  <p className="text-xs font-sans font-medium text-[#4B1F7A] mt-0.5">
                    {vp.position}
                  </p>
                  <p className="text-xs font-sans text-[#1B1226]/60 mt-1">
                    ห้อง {vp.grade}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 3: Department Heads & Officers Grid */}
        <div>
          <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase text-center block mb-6">
            หัวหน้าฝ่ายงานและการบริหาร
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departmentHeads.map((member) => (
              <div
                key={member.id}
                className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden p-4 shadow-sm text-center group hover:shadow-md transition-shadow"
              >
                {/* B&W photo turning to color on hover (400ms per spec) */}
                <div className="relative aspect-[4/5] rounded-[3px] overflow-hidden bg-[#EDE6F5] mb-3">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-[400ms]"
                  />
                </div>

                <h4 className="font-serif text-base font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors line-clamp-1">
                  {member.name}
                </h4>
                <p className="text-xs font-sans font-medium text-[#4B1F7A] mt-0.5">
                  {member.position}
                </p>
                <p className="text-[11px] font-sans text-[#1B1226]/60 mt-1">
                  {member.department} · ห้อง {member.grade}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BoardPage;
