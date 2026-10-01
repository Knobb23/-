import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CaretLeft,
  CaretRight,
  ArrowRight,
  Play,
  Pause,
  Broadcast,
  Sparkle,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { HeroSlideItem } from "@/src/types";
import { getHeroSlides } from "@/src/lib/dataService";

const SLIDE_DURATION_MS = 5000; // 5 วินาทีต่อภาพตามที่ผู้ใช้กำหนด

export const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    getHeroSlides().then((data) => {
      if (data && data.length > 0) {
        setSlides(data);
      }
    });
  }, []);

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // 5-second Autoplay cycle with progress bar
  useEffect(() => {
    if (!isPlaying || isHovered || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50; // update progress every 50ms
    const stepIncrement = (intervalStep / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isHovered, currentIndex, totalSlides]);

  if (totalSlides === 0) {
    return (
      <section className="bg-[#FAF7F0] py-8 border-b border-[#B8923A]/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12 h-64 flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs text-[#1B1226]/60">
            <div className="w-5 h-5 rounded-full border-2 border-[#B8923A] border-t-[#4B1F7A] animate-spin" />
            <span>กำลังโหลดข่าวสารล่าสุด...</span>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const isExternal = currentSlide.isExternal || currentSlide.linkUrl?.startsWith("http");

  return (
    <section
      className="relative bg-[#FAF7F0] pt-4 sm:pt-6 pb-8 sm:pb-12 overflow-hidden border-b border-[#B8923A]/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="ข่าวสารล่าสุดและกิจกรรมเด่น"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top Mini Header with Live Indicator */}
        <div className="flex items-center justify-between pb-3 text-xs">
          <div className="flex items-center gap-2 text-[#4B1F7A] font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8923A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4B1F7A]" />
            </span>
            <span className="tracking-wide font-sans text-xs">
              ข่าวสารเด่นและกิจกรรมล่าสุด
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[#1B1226]/70">
            <span className="font-num text-xs tabular-nums text-[#9C7A2B] font-semibold">
              {String(currentIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
            <span className="text-[#B8923A]/40">·</span>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-[#4B1F7A] transition-colors"
              title={isPlaying ? "หยุดชั่วคราว" : "เล่นต่อ"}
            >
              {isPlaying ? (
                <Pause weight="fill" className="w-3.5 h-3.5 text-[#4B1F7A]" />
              ) : (
                <Play weight="fill" className="w-3.5 h-3.5 text-[#9C7A2B]" />
              )}
            </button>
          </div>
        </div>

        {/* Cinematic Main Slide Showcase */}
        <div className="relative rounded-[6px] overflow-hidden border border-[#B8923A]/40 shadow-[0_16px_40px_-15px_rgba(42,18,69,0.18)] bg-[#2A1245] aspect-[16/9] sm:aspect-[21/9] min-h-[340px] sm:min-h-[420px] lg:min-h-[480px]">
          {/* Animated Background Image - Clean & Fully Visible */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0"
            >
              {isExternal ? (
                <a
                  href={currentSlide.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full cursor-pointer"
                  title={currentSlide.title}
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </a>
              ) : (
                <Link
                  to={currentSlide.linkUrl}
                  className="block w-full h-full cursor-pointer"
                  title={currentSlide.title}
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </Link>
              )}

              {/* Minimal bottom-only gradient strip so the photo is 80%+ clear and fully visible */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* 5-Second Linear Progress Bar at top of card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FAF7F0]/20 z-30">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D9B867] to-[#FAF7F0]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Compact Bottom Caption Strip (No Subtitle, Maximum Image Visibility) */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="space-y-2 max-w-3xl pointer-events-auto"
              >
                {/* Tag / Category Badge */}
                {currentSlide.tag && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#2A1245]/90 backdrop-blur-md border border-[#D9B867] !text-[#D9B867] text-xs font-semibold tracking-wide shadow-sm">
                    <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#D9B867]" />
                    <span style={{ color: "#D9B867" }}>{currentSlide.tag}</span>
                  </div>
                )}

                {/* Slide Title */}
                <div>
                  {isExternal ? (
                    <a
                      href={currentSlide.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/title block"
                    >
                      <h2
                        className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold !text-[#FAF7F0] group-hover/title:!text-[#D9B867] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-colors"
                        style={{ color: "#FAF7F0" }}
                      >
                        {currentSlide.title}
                      </h2>
                    </a>
                  ) : (
                    <Link to={currentSlide.linkUrl} className="group/title block">
                      <h2
                        className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold !text-[#FAF7F0] group-hover/title:!text-[#D9B867] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-colors"
                        style={{ color: "#FAF7F0" }}
                      >
                        {currentSlide.title}
                      </h2>
                    </Link>
                  )}
                </div>

                {/* Action Link */}
                <div className="pt-1 flex items-center gap-3">
                  {isExternal ? (
                    <a
                      href={currentSlide.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold !text-[#D9B867] hover:underline"
                    >
                      <span>เปิดอ่านรายละเอียดข่าว</span>
                      <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      to={currentSlide.linkUrl}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold !text-[#D9B867] hover:underline"
                    >
                      <span>เปิดอ่านรายละเอียดข่าว</span>
                      <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <span className="text-white/40">·</span>
                  <Link
                    to="/news"
                    className="text-xs sm:text-sm !text-[#FAF7F0]/80 hover:!text-[#FAF7F0] transition-colors"
                    style={{ color: "rgba(250, 247, 240, 0.85)" }}
                  >
                    ดูข่าวทั้งหมด →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Arrow Navigation Controls */}
            <div className="flex items-center gap-2 pointer-events-auto shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={prevSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B1226]/70 hover:bg-[#4B1F7A] backdrop-blur-md border border-[#FAF7F0]/30 hover:border-[#D9B867] flex items-center justify-center text-[#FAF7F0] transition-all duration-200 shadow-md"
                aria-label="ข่าวก่อนหน้า"
              >
                <CaretLeft weight="bold" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B1226]/70 hover:bg-[#4B1F7A] backdrop-blur-md border border-[#FAF7F0]/30 hover:border-[#D9B867] flex items-center justify-center text-[#FAF7F0] transition-all duration-200 shadow-md"
                aria-label="ข่าวถัดไป"
              >
                <CaretRight weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Dots Navigation Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-between gap-3 px-1">
          {/* Slide Indicators / Tabs */}
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? "w-8 h-2 bg-[#4B1F7A]"
                    : "w-2 h-2 bg-[#B8923A]/40 hover:bg-[#B8923A]"
                }`}
                aria-label={`ไปที่ข่าวที่ ${idx + 1}`}
                title={s.title}
              />
            ))}
          </div>

          {/* Quick Shortcuts to Organization Services */}
          <div className="flex items-center gap-4 text-xs text-[#1B1226]/75">
            <Link to="/news/pr" className="hover:text-[#4B1F7A] transition-colors">
              • ข่าวประชาสัมพันธ์
            </Link>
            <Link to="/calendar" className="hover:text-[#4B1F7A] transition-colors">
              • ปฏิทินกิจกรรม
            </Link>
            <Link to="/complaint" className="hover:text-[#4B1F7A] text-[#4B1F7A] font-semibold transition-colors">
              • ส่งเรื่องร้องเรียน
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
