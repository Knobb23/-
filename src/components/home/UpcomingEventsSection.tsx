import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { CaretLeft, CaretRight, MapPin, Clock } from "@phosphor-icons/react";
import { EventItem } from "@/src/types";
import { getUpcomingEvents } from "@/src/lib/dataService";
import { getEventDateParts, EVENT_TYPE_NAMES } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const UpcomingEventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    getUpcomingEvents(8).then(setEvents);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (!events.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-t border-[#B8923A]/15 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading + Carousel Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
          <SectionHeading
            number="03"
            eyebrow="CALENDAR · กำหนดการสำคัญ"
            title="กิจกรรมที่กำลังจะมาถึง"
            description="ตารางกิจกรรมและการปฏิบัติงานขององค์การนักเรียน โรงเรียนสาธิต ม.พะเยา"
            align="left"
          />

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 mb-8 sm:mb-14 self-end">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`p-2.5 rounded-[4px] border border-[#B8923A]/40 transition-colors ${
                canScrollPrev
                  ? "bg-[#FAF7F0] hover:bg-[#EDE6F5] text-[#4B1F7A]"
                  : "opacity-40 cursor-not-allowed text-[#1B1226]/40"
              }`}
              aria-label="กิจกรรมก่อนหน้า"
            >
              <CaretLeft weight="light" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`p-2.5 rounded-[4px] border border-[#B8923A]/40 transition-colors ${
                canScrollNext
                  ? "bg-[#FAF7F0] hover:bg-[#EDE6F5] text-[#4B1F7A]"
                  : "opacity-40 cursor-not-allowed text-[#1B1226]/40"
              }`}
              aria-label="กิจกรรมถัดไป"
            >
              <CaretRight weight="light" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-5 sm:-ml-6">
            {events.map((evt) => {
              const { day, month } = getEventDateParts(evt.startAt);

              return (
                <div
                  key={evt.id}
                  className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] min-w-0 pl-5 sm:pl-6"
                >
                  <div className="h-full flex flex-col justify-between bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)] hover:border-[#B8923A] transition-colors duration-200">
                    <div>
                      {/* Top: Date block + Type badge */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-num text-3xl sm:text-4xl font-bold text-[#4B1F7A] leading-none">
                            {day}
                          </span>
                          <span className="text-sm font-serif font-semibold text-[#9C7A2B]">
                            {month}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 rounded-[3px] bg-[#EDE6F5] text-[#4B1F7A] text-[11px] font-sans font-medium tracking-wide">
                          {EVENT_TYPE_NAMES[evt.type] || "กิจกรรม"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-serif font-bold text-[#1B1226] line-clamp-2 leading-snug mb-3">
                        {evt.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#1B1226]/70 line-clamp-2 leading-relaxed mb-6 font-sans">
                        {evt.description}
                      </p>
                    </div>

                    {/* Location & Time footer */}
                    <div className="pt-4 border-t border-[#B8923A]/15 space-y-2 text-xs text-[#1B1226]/75 font-sans">
                      <div className="flex items-center gap-2">
                        <MapPin weight="light" className="w-4 h-4 text-[#9C7A2B] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock weight="light" className="w-4 h-4 text-[#9C7A2B] shrink-0" />
                        <span>
                          {evt.allDay
                            ? "ตลอดทั้งวัน"
                            : `${new Date(evt.startAt).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} น.`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View Calendar Link */}
        <div className="mt-8 text-center sm:text-left">
          <Link
            to="/calendar"
            className="editorial-btn-secondary text-sm font-medium tracking-wide group"
          >
            <span>เปิดปฏิทินกิจกรรมฉบับเต็ม</span>
            <span className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1 text-[#9C7A2B]">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
