import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { ServiceLinkItem } from "@/src/types";
import { getServiceShortcuts } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<ServiceLinkItem[]>([]);

  useEffect(() => {
    getServiceShortcuts().then(setServices);
  }, []);

  if (!services.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-t border-[#B8923A]/15">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <SectionHeading
          number="04"
          eyebrow="INDEX · บริการและช่องทางด่วน"
          title="ทางลัดบริการสำหรับนักเรียน"
          description="เข้าถึงบริการหลักและข้อมูลสำคัญขององค์การนักเรียนได้อย่างสะดวก รวดเร็ว"
          align="left"
        />

        {/* Editorial Book Index Table List (No icon boxes!) */}
        <div className="border-t border-[#B8923A]/30 divide-y divide-[#B8923A]/20">
          {services.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-[#EDE6F5]/40 px-3 sm:px-5 -mx-3 sm:-mx-5 rounded-[2px] transition-colors"
            >
              {/* Left: Index Number & Title */}
              <div className="flex items-baseline gap-4 sm:gap-8">
                <span className="font-num text-lg sm:text-xl font-semibold text-[#9C7A2B] tabular-nums shrink-0">
                  {item.number}
                </span>

                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1B1226]/65 mt-0.5 font-sans">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right: Editorial Arrow */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-sans text-[#1B1226]/40 group-hover:text-[#4B1F7A] transition-colors hidden sm:inline">
                  เข้าสู่บริการ
                </span>
                <div className="w-8 h-8 rounded-[4px] border border-[#B8923A]/30 flex items-center justify-center text-[#9C7A2B] group-hover:border-[#4B1F7A] group-hover:bg-[#4B1F7A] group-hover:text-[#FAF7F0] transition-all duration-300">
                  <ArrowUpRight weight="light" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
