import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Clock } from "@phosphor-icons/react";
import { Emblem } from "@/src/components/common/Emblem";

interface UnderConstructionPageProps {
  title: string;
  phase: string;
  description: string;
}

export const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({
  title,
  phase,
  description,
}) => {
  const location = useLocation();

  return (
    <div className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 max-w-[1240px] mx-auto text-center">
      <div className="max-w-xl mx-auto bg-[#FAF7F0] border border-[#B8923A]/30 p-8 sm:p-12 rounded-[4px] shadow-[0_4px_24px_-10px_rgba(42,18,69,0.1)]">
        <div className="flex justify-center mb-6">
          <Emblem size={56} theme="on-paper" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE6F5] text-xs font-sans font-medium text-[#4B1F7A] mb-4">
          <Clock weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
          <span>{phase}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1B1226] mb-3">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-[#1B1226]/70 leading-relaxed mb-8 font-sans">
          {description}
        </p>

        <div className="pt-6 border-t border-[#B8923A]/15 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="editorial-btn-secondary text-sm font-medium tracking-wide group"
          >
            <span className="mr-1 text-[#9C7A2B]">←</span>
            <span>กลับสู่หน้าแรก</span>
          </Link>
          <span className="hidden sm:inline text-[#B8923A]/40">·</span>
          <span className="text-xs text-[#1B1226]/50">
            เส้นทาง: {location.pathname}
          </span>
        </div>
      </div>
    </div>
  );
};
