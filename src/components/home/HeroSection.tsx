import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CaretLeft,
  CaretRight,
  ArrowRight,
  Play,
  Pause,
  Sparkle,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { HeroSlideItem } from "@/src/types";
import { DEFAULT_HERO_SLIDES, getHeroSlides } from "@/src/lib/dataService";

const SLIDE_DURATION_MS = 5000; // 5 วินาทีต่อภาพ

export const HeroSection: React.FC = () => {
  // Initialize immediately with default slides for 0ms instant loading
  const [slides, setSlides] = useState<HeroSlideItem[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);

  // Touch swipe refs for native mobile experience
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    // Revalidate in background from Firestore without blocking UI
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

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      nextSlide();
    } else if (distance < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 5-second Autoplay cycle with smooth progress bar
  useEffect(() => {
    if (!isPlaying || isHovered || totalSlides <= 1) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50;
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

  const currentSlide = slides[currentIndex] || DEFAULT_HERO_SLIDES[0];
  const isExternal = currentSlide.isExternal || currentSlide.linkUrl?.startsWith("http");

  return (
    <section
      className="relative bg-[#FAF7F0] pt-2.5 sm:pt-5 pb-5 sm:pb-10 overflow-hidden border-b border-[#B8923A]/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="ข่าวสารล่าสุดและกิจกรรมเด่น"
    >
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-12">
        {/* Top Mini Header with Live Indicator & Integrated Controls */}
        <div className="flex items-center justify-between pb-2 text-xs">
          <div className="flex items-center gap-2 text-[#4B1F7A] font-semibold">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8923A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4B1F7A]" />
            </span>
            <span className="tracking-wide font-sans text-xs truncate">
              ข่าวสารเด่นและกิจกรรมล่าสุด
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[#1B1226]/80">
            <button
              type="button"
              onClick={prevSlide}
              className="p-1 hover:text-[#4B1F7A] active:scale-95 transition-all text-[#1B1226]/70 hover:text-[#4B1F7A]"
              title="ข่าวก่อนหน้า"
              aria-label="ข่าวก่อนหน้า"
            >
              <CaretLeft weight="bold" className="w-3.5 h-3.5" />
            </button>
            <span className="font-num text-xs tabular-nums text-[#9C7A2B] font-semibold">
              {String(currentIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={nextSlide}
              className="p-1 hover:text-[#4B1F7A] active:scale-95 transition-all text-[#1B1226]/70 hover:text-[#4B1F7A]"
              title="ข่าวถัดไป"
              aria-label="ข่าวถัดไป"
            >
              <CaretRight weight="bold" className="w-3.5 h-3.5" />
            </button>
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

        {/* Compact Widescreen Main Slide Showcase - Balanced proportions without overflowing */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-[6px] overflow-hidden border border-[#B8923A]/40 shadow-[0_8px_24px_-10px_rgba(42,18,69,0.18)] bg-[#2A1245] aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[250px] xs:max-h-[280px] sm:max-h-[380px] lg:max-h-[440px] select-none"
        >
          {/* Animated Background Image - Clean Widescreen & Fully Visible */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                    className="w-full h-full object-cover object-center"
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
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </Link>
              )}

              {/* Minimal bottom gradient: keeps 70%+ of photo clear, provides solid contrast for title */}
              <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* 5-Second Linear Progress Bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FAF7F0]/20 z-30">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D9B867] to-[#FAF7F0]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Bottom Content & Navigation Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-6 lg:p-7 flex flex-col justify-end pointer-events-none">
            <div className="flex items-end justify-between gap-3 w-full">
              {/* Text Container with seamless Thai text wrapping */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1 sm:space-y-2 max-w-full sm:max-w-2xl lg:max-w-3xl pointer-events-auto min-w-0 pr-2 sm:pr-4"
                >
                  {/* Tag / Category Badge */}
                  {currentSlide.tag && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#2A1245]/90 backdrop-blur-md border border-[#D9B867] !text-[#D9B867] text-[10px] sm:text-xs font-semibold tracking-wide shadow-sm">
                      <Sparkle weight="fill" className="w-2.5 h-2.5 text-[#D9B867]" />
                      <span style={{ color: "#D9B867" }}>{currentSlide.tag}</span>
                    </div>
                  )}

                  {/* Slide Title with proper Thai wrapping */}
                  <div className="w-full">
                    {isExternal ? (
                      <a
                        href={currentSlide.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/title block"
                      >
                        <h2
                          className="font-serif text-xs xs:text-sm sm:text-xl lg:text-2xl font-bold !text-[#FAF7F0] group-hover/title:!text-[#D9B867] leading-snug break-words [overflow-wrap:anywhere] line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] transition-colors"
                          style={{ color: "#FAF7F0" }}
                        >
                          {currentSlide.title}
                        </h2>
                      </a>
                    ) : (
                      <Link to={currentSlide.linkUrl} className="group/title block">
                        <h2
                          className="font-serif text-xs xs:text-sm sm:text-xl lg:text-2xl font-bold !text-[#FAF7F0] group-hover/title:!text-[#D9B867] leading-snug break-words [overflow-wrap:anywhere] line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] transition-colors"
                          style={{ color: "#FAF7F0" }}
                        >
                          {currentSlide.title}
                        </h2>
                      </Link>
                    )}
                  </div>

                  {/* Action Link & Shortcuts */}
                  <div className="pt-0.5 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
                    {isExternal ? (
                      <a
                        href={currentSlide.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold !text-[#D9B867] hover:underline"
                      >
                        <span>เปิดอ่านรายละเอียดข่าว</span>
                        <ArrowRight weight="bold" className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={currentSlide.linkUrl}
                        className="inline-flex items-center gap-1 font-semibold !text-[#D9B867] hover:underline"
                      >
                        <span>เปิดอ่านรายละเอียดข่าว</span>
                        <ArrowRight weight="bold" className="w-3 h-3" />
                      </Link>
                    )}
                    <span className="text-white/40 hidden xs:inline">·</span>
                    <Link
                      to="/news"
                      className="text-[11px] sm:text-xs !text-[#FAF7F0]/80 hover:!text-[#FAF7F0] transition-colors"
                      style={{ color: "rgba(250, 247, 240, 0.85)" }}
                    >
                      ดูข่าวทั้งหมด →
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slide Arrow Navigation Controls (Desktop/Tablet) */}
              <div className="hidden sm:flex items-center gap-2 pointer-events-auto shrink-0 self-end">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1B1226]/80 hover:bg-[#4B1F7A] backdrop-blur-md border border-[#FAF7F0]/30 hover:border-[#D9B867] flex items-center justify-center text-[#FAF7F0] transition-all duration-200 shadow-md active:scale-95"
                  aria-label="ข่าวก่อนหน้า"
                >
                  <CaretLeft weight="bold" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1B1226]/80 hover:bg-[#4B1F7A] backdrop-blur-md border border-[#FAF7F0]/30 hover:border-[#D9B867] flex items-center justify-center text-[#FAF7F0] transition-all duration-200 shadow-md active:scale-95"
                  aria-label="ข่าวถัดไป"
                >
                  <CaretRight weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Dots Navigation Bar & Quick Links */}
        <div className="mt-2.5 sm:mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 px-1">
          {/* Slide Indicators / Tabs */}
          <div className="flex items-center gap-2 py-0.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-[#4B1F7A]"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#B8923A]/40 hover:bg-[#B8923A]"
                }`}
                aria-label={`ไปที่ข่าวที่ ${idx + 1}`}
                title={s.title}
              />
            ))}
          </div>

          {/* Quick Shortcuts to Organization Services */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#1B1226]/75">
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
