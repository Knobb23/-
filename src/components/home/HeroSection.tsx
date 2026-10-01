import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Emblem } from "@/src/components/common/Emblem";

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Gentle 0.15x parallax layer for subtle decorative gold lines
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-[#FAF7F0]"
    >
      {/* Parallax decorative background gold line layer */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="editorial-grid" width="160" height="160" patternUnits="userSpaceOnUse">
              <path
                d="M 160 0 L 0 0 0 160"
                fill="none"
                stroke="#B8923A"
                strokeWidth="0.5"
                strokeDasharray="4 8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#editorial-grid)" />
        </svg>
      </motion.div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols): Editorial Typography */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#9C7A2B] uppercase">
                STUDENT VOICE · สาธิตมหาวิทยาลัยพะเยา
              </span>
              <span className="h-[1px] w-12 bg-[#B8923A]/40" />
            </div>

            {/* Staggered Mask Reveal Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold font-serif leading-[1.25] text-[#1B1226] mb-6">
              <span className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  เสียงของนักเรียน
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  สร้างโรงเรียนที่{" "}
                  <span className="font-num italic text-[#9C7A2B] font-medium tracking-normal text-[1.05em]">
                    Inspiring
                  </span>{" "}
                  และเราภูมิใจ
                </motion.span>
              </span>
            </h1>

            {/* 2-line Description */}
            <p className="text-base sm:text-lg text-[#1B1226]/80 leading-relaxed max-w-xl mb-8 font-sans">
              พื้นที่กลางในการสะท้อนความคิดเห็น สร้างสรรค์กิจกรรมที่มีคุณค่า
              และร่วมขับเคลื่อนโรงเรียนสาธิตมหาวิทยาลัยพะเยาให้เป็นสังคมแห่งการเรียนรู้ที่เติบโตไปด้วยกัน
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-6">
              {/* Primary CTA (capsule, violet-700 -> violet-900, inset gold border, arrow shifts right) */}
              <Link
                to="/complaint"
                className="relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] font-sans font-medium text-base shadow-[0_4px_16px_rgba(42,18,69,0.18)] hover:bg-[#2A1245] transition-all duration-300 group border border-[#D9B867]/40 ring-2 ring-[#D9B867]/20 ring-inset"
              >
                <span>ส่งเสียงถึงองค์การ</span>
                <ArrowRight
                  weight="light"
                  className="w-4 h-4 text-[#D9B867] transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/* Secondary CTA (No bg, gold 1px underline expanding on hover) */}
              <Link
                to="/news"
                className="editorial-btn-secondary text-base font-medium py-1.5 group"
              >
                <span>ดูข่าวล่าสุด</span>
                <span className="ml-2 text-[#9C7A2B] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column (5 cols): 4:5 Photo Frame with 8px Offset Gold Border */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] aspect-[4/5]">
              {/* Emblem Watermark in the background */}
              <div
                className="absolute -top-10 -left-10 w-44 h-44 opacity-[0.07] pointer-events-none select-none z-0"
                aria-hidden="true"
              >
                <Emblem size={176} theme="on-paper" />
              </div>

              {/* Offset Gold Border (8px offset) */}
              <div
                className="absolute inset-0 translate-x-2 translate-y-2 border border-[#B8923A]/70 rounded-[4px] pointer-events-none z-0"
                aria-hidden="true"
              />

              {/* Image Container (max 4px radius) */}
              <div className="relative w-full h-full rounded-[4px] overflow-hidden shadow-[0_12px_32px_-12px_rgba(42,18,69,0.22)] z-10 bg-[#EDE6F5]">
                <img
                  src="https://picsum.photos/seed/desup-hero-students/800/1000"
                  alt="ภาพกิจกรรมนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา"
                  width={800}
                  height={1000}
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />

                {/* Editorial Caption Tag in bottom corner */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#2A1245]/90 backdrop-blur-sm text-[#FAF7F0] px-3.5 py-2 rounded-[3px] border border-[#B8923A]/30">
                  <span className="text-[10px] uppercase tracking-wider text-[#D9B867] font-serif block">
                    DE-SUP 2569
                  </span>
                  <span className="text-xs font-sans font-medium line-clamp-1">
                    พลังคนรุ่นใหม่ เพื่อสาธิต ม.พะเยา
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
