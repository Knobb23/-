import React, { useEffect, useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import { getTickerAnnouncements } from "@/src/lib/dataService";

export const Ticker: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    getTickerAnnouncements().then(setItems);
  }, []);

  if (!items.length) return null;

  return (
    <div className="bg-[#2A1245] text-[#FAF7F0] border-b border-[#B8923A]/20 text-xs sm:text-sm py-2 overflow-hidden select-none relative z-30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center">
        {/* Label badge */}
        <div className="shrink-0 flex items-center gap-1.5 pr-4 border-r border-[#D9B867]/30 text-[#D9B867] font-medium tracking-wide">
          <SpeakerHigh weight="light" className="w-4 h-4 text-[#D9B867]" />
          <span className="hidden sm:inline">ข่าวด่วน</span>
        </div>

        {/* Marquee ticker that pauses on hover */}
        <div className="flex-1 overflow-hidden ml-4 group">
          <div className="whitespace-nowrap inline-flex animate-ticker group-hover:[animation-play-state:paused] gap-12 text-[#FAF7F0]/90">
            {items.map((text, idx) => (
              <span key={`ticker-1-${idx}`} className="inline-flex items-center gap-3">
                <span className="text-[#D9B867] text-[8px]">◆</span>
                <span className="hover:text-[#D9B867] transition-colors cursor-pointer">{text}</span>
              </span>
            ))}
            {/* Duplicated for seamless infinite loop */}
            {items.map((text, idx) => (
              <span key={`ticker-2-${idx}`} className="inline-flex items-center gap-3">
                <span className="text-[#D9B867] text-[8px]">◆</span>
                <span className="hover:text-[#D9B867] transition-colors cursor-pointer">{text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-anim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker-anim 35s linear infinite;
        }
      `}</style>
    </div>
  );
};
