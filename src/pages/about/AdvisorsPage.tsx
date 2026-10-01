import React, { useState, useEffect } from "react";
import { PersonItem } from "@/src/types";
import { getPeople } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const AdvisorsPage: React.FC = () => {
  const [advisors, setAdvisors] = useState<PersonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getPeople("advisor").then((items) => {
      setAdvisors(items);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="04"
          eyebrow="ADVISORS · คณะครูที่ปรึกษา"
          title="คณะครูอาจารย์ที่ปรึกษา"
          description="ผู้ให้คำแนะนำ การสนับสนุน และการดูแลการดำเนินงานขององค์การนักเรียนอย่างใกล้ชิด"
          align="left"
        />

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-10">
          {advisors.map((advisor) => (
            <div
              key={advisor.id}
              className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden p-6 shadow-sm text-center group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/5] rounded-[3px] overflow-hidden bg-[#EDE6F5] mb-5 max-w-[260px] mx-auto">
                <img
                  src={advisor.photoUrl}
                  alt={advisor.name}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-[400ms]"
                />
              </div>

              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors">
                {advisor.name}
              </h3>

              <p className="text-xs sm:text-sm font-sans font-medium text-[#4B1F7A] mt-1">
                {advisor.position}
              </p>

              <p className="text-xs font-sans text-[#1B1226]/60 mt-0.5">
                {advisor.department}
              </p>

              {advisor.quote && (
                <div className="mt-4 pt-4 border-t border-[#B8923A]/20">
                  <p className="text-xs font-serif italic text-[#1B1226]/75 leading-relaxed">
                    "{advisor.quote}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdvisorsPage;
