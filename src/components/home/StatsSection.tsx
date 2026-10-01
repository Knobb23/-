import React, { useEffect, useState, useRef } from "react";
import { animate, useInView } from "motion/react";
import { getSiteStatistics } from "@/src/lib/dataService";
import { SiteStatistics } from "@/src/types";

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ to, decimals = 0, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        onUpdate(value) {
          setVal(value);
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  const formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("th-TH");

  return (
    <span ref={ref} className="font-num tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<SiteStatistics | null>(null);

  useEffect(() => {
    getSiteStatistics().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#2A1245] text-[#FAF7F0] overflow-hidden">
      {/* Subtle gold line watermark in background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] select-none"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90%" cy="50%" r="350" stroke="#D9B867" strokeWidth="1" fill="none" />
          <circle cx="90%" cy="50%" r="480" stroke="#D9B867" strokeWidth="0.8" fill="none" strokeDasharray="6 6" />
          <circle cx="10%" cy="80%" r="280" stroke="#D9B867" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Eyebrow Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-num text-2xl font-bold tracking-wider text-[#D9B867]/50">
              02
            </span>
            <span className="text-[9px] text-[#D9B867]/50">◆</span>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#D9B867] uppercase">
              TRANSPARENCY & IMPACT
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-[#FAF7F0]">
            ความโปร่งใสและสถิติการดำเนินงาน
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#FAF7F0]/70 max-w-xl">
            ข้อมูลเชิงประจักษ์ในการขับเคลื่อนกิจกรรม และการรับฟังแก้ไขปัญหาเพื่อประโยชน์สูงสุดของนักเรียน
          </p>
        </div>

        {/* Asymmetrical Editorial Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Stat 1: Total Visits (Hero Stat - 5 cols) */}
          <div className="md:col-span-5 bg-[#FAF7F0]/[0.03] border border-[#D9B867]/25 p-8 rounded-[4px] flex flex-col justify-between">
            <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#D9B867]">
              ผู้เข้าชมเว็บไซต์สะสม
            </span>
            <div className="my-6">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAF7F0] font-num tracking-tight">
                <CountUp to={stats.totalVisits} />
              </div>
              <span className="text-sm font-sans text-[#FAF7F0]/60 mt-1 block">
                ครั้งที่มีการเข้าถึงข้อมูลข่าวสาร
              </span>
            </div>
            <div className="pt-4 border-t border-[#D9B867]/20 flex items-center justify-between text-xs text-[#D9B867]">
              <span>ระบบนับสถิติอัตโนมัติ</span>
              <span>ปีการศึกษา 2569</span>
            </div>
          </div>

          {/* Stat 2 & 3 & 4: (7 cols divided asymmetrically) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat 2: Resolved Complaints Percentage */}
            <div className="bg-[#FAF7F0]/[0.03] border border-[#D9B867]/25 p-7 rounded-[4px] flex flex-col justify-between">
              <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#D9B867]">
                ดำเนินการแก้ไขแล้ว
              </span>
              <div className="my-4">
                <div className="text-4xl sm:text-5xl font-bold text-[#D9B867] font-num">
                  <CountUp to={stats.resolvedPercentage} decimals={1} suffix="%" />
                </div>
                <span className="text-xs sm:text-sm font-sans text-[#FAF7F0]/70 mt-1 block">
                  จากเรื่องร้องเรียนทั้งหมด {stats.totalComplaints} เรื่อง
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#FAF7F0]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D9B867] rounded-full transition-all duration-1000"
                  style={{ width: `${stats.resolvedPercentage}%` }}
                />
              </div>
            </div>

            {/* Stat 3: Total Activities */}
            <div className="bg-[#FAF7F0]/[0.03] border border-[#D9B867]/25 p-7 rounded-[4px] flex flex-col justify-between">
              <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#D9B867]">
                กิจกรรมตลอดปีการศึกษา
              </span>
              <div className="my-4">
                <div className="text-4xl sm:text-5xl font-bold text-[#FAF7F0] font-num">
                  <CountUp to={stats.activitiesThisYear} suffix=" โครงการ" />
                </div>
                <span className="text-xs sm:text-sm font-sans text-[#FAF7F0]/70 mt-1 block">
                  ครอบคลุมวิชาการ กีฬา และศิลปวัฒนธรรม
                </span>
              </div>
              <span className="text-xs text-[#FAF7F0]/50">
                ขับเคลื่อนโดย 6 ฝ่ายองค์การ
              </span>
            </div>

            {/* Stat 4: Average Resolution Time (Spans full width of right col) */}
            <div className="sm:col-span-2 bg-[#FAF7F0]/[0.03] border border-[#D9B867]/25 p-6 rounded-[4px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#D9B867]">
                  ระยะเวลาเฉลี่ยในการประสานงานแก้ไข
                </span>
                <p className="text-sm text-[#FAF7F0]/80 mt-0.5">
                  ความรวดเร็วในการรับเรื่องและส่งต่อฝ่ายที่เกี่ยวข้อง
                </p>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D9B867] font-num whitespace-nowrap">
                <CountUp to={stats.avgResolutionDays} decimals={1} suffix=" วันทำการ" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
