import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Quotes } from "@phosphor-icons/react";
import { PersonItem } from "@/src/types";
import { getPeople } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const HallPage: React.FC = () => {
  const [presidents, setPresidents] = useState<PersonItem[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 80%"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  useEffect(() => {
    getPeople("president").then(setPresidents);
  }, []);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="04"
          eyebrow="HALL OF PRESIDENTS · ทำเนียบผู้นำนักเรียน"
          title="ทำเนียบประธานองค์การนักเรียน"
          description="บันทึกประวัติศาสตร์การนำพาและการขับเคลื่อนงานของประธานองค์การนักเรียนในแต่ละรุ่น"
          align="left"
        />

        {/* Vertical Alternating Timeline with Golden Center Line */}
        <div ref={timelineRef} className="relative my-16 max-w-4xl mx-auto">
          {/* Static Background Guide Line */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#B8923A]/20 pointer-events-none" />

          {/* Animated Golden Center Line (draws itself on scroll) */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-4 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#B8923A] origin-top pointer-events-none z-10"
          />

          <div className="space-y-16">
            {presidents.map((pres, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={pres.id}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content Card (Half width on desktop) */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div
                      className={`bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 shadow-[0_1px_0_rgba(42,18,69,.06)] hover:shadow-md transition-shadow group ${
                        isEven ? "md:mr-8" : "md:ml-8"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        {/* Photo */}
                        <div className="shrink-0 w-24 sm:w-28 aspect-[4/5] rounded-[3px] overflow-hidden bg-[#EDE6F5] border border-[#B8923A]/30">
                          <img
                            src={pres.photoUrl}
                            alt={pres.name}
                            loading="lazy"
                            className="w-full h-full object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-[400ms]"
                          />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="inline-block px-2.5 py-0.5 rounded-[2px] bg-[#4B1F7A] text-[#FAF7F0] text-[11px] font-num font-semibold mb-1.5">
                            ปีการศึกษา {pres.yearTH}
                          </div>

                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors leading-snug">
                            {pres.name}
                          </h3>

                          <p className="text-xs text-[#9C7A2B] font-sans font-medium mt-0.5">
                            {pres.position} ({pres.grade})
                          </p>
                        </div>
                      </div>

                      {/* Quote */}
                      {pres.quote && (
                        <div className="mt-4 pt-3 border-t border-[#B8923A]/20 flex items-start gap-2">
                          <Quotes weight="light" className="w-4 h-4 text-[#D9B867] shrink-0 mt-0.5" />
                          <p className="text-xs font-serif italic text-[#1B1226]/80 leading-relaxed">
                            "{pres.quote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Golden Center Node Diamond */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FAF7F0] border-2 border-[#B8923A] z-20 flex items-center justify-center text-[8px] text-[#4B1F7A]">
                    ◆
                  </div>

                  {/* Empty Spacer on other side for desktop symmetry */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HallPage;
