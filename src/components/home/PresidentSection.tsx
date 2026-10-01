import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Quotes } from "@phosphor-icons/react";
import { getPresidentGreeting } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const PresidentSection: React.FC = () => {
  const [president, setPresident] = useState<{
    name: string;
    position: string;
    grade: string;
    photoUrl: string;
    greetingText: string;
    academicYear: number;
  } | null>(null);

  useEffect(() => {
    getPresidentGreeting().then(setPresident);
  }, []);

  if (!president) return null;

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F0] border-t border-[#B8923A]/15 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <SectionHeading
          number="06"
          eyebrow="PRESIDENT · สารจากผู้นำนักเรียน"
          title="สารจากประธานองค์การนักเรียน"
          description="เจตนารมณ์และความมุ่งมั่นในการร่วมสร้างสรรค์โรงเรียนสาธิตมหาวิทยาลัยพะเยา"
          align="left"
        />

        {/* Overlapping Editorial Magazine Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center pt-4">
          {/* Left Column: Portrait Photo with Offset Gold Frame (5 cols) */}
          <div className="lg:col-span-5 relative z-10">
            <div className="relative w-full max-w-[340px] aspect-[4/5] mx-auto lg:mx-0">
              {/* Offset Gold Border */}
              <div
                className="absolute inset-0 translate-x-3 translate-y-3 border border-[#B8923A] rounded-[4px] pointer-events-none"
                aria-hidden="true"
              />

              {/* Photo Box */}
              <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-[#EDE6F5] shadow-[0_12px_32px_-10px_rgba(42,18,69,0.2)]">
                <img
                  src={president.photoUrl}
                  alt={president.name}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale contrast-105 hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Overlapping Quote Box (8 cols, overlaps left col by 1 col on desktop) */}
          <div className="lg:col-span-8 lg:-ml-12 relative z-20">
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-8 sm:p-12 rounded-[4px] shadow-[0_8px_32px_-12px_rgba(42,18,69,0.12)]">
              {/* Large Gold Quote Mark */}
              <div className="text-[#D9B867] mb-4">
                <Quotes weight="light" className="w-10 h-10 opacity-70" />
              </div>

              {/* Greeting Quote Text */}
              <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl text-[#1B1226] leading-relaxed italic mb-8">
                "{president.greetingText}"
              </blockquote>

              {/* Signature Info */}
              <div className="pt-6 border-t border-[#B8923A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#1B1226]">
                    {president.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4B1F7A] font-medium font-sans mt-0.5">
                    {president.position} ({president.grade})
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    to="/about/hall"
                    className="editorial-btn-secondary text-xs sm:text-sm font-medium tracking-wide group"
                  >
                    <span>ดูทำเนียบประธานทุกรุ่น</span>
                    <span className="ml-1 text-[#9C7A2B] transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
