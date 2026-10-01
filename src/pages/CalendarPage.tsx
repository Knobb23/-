import React, { useState, useEffect } from "react";
import {
  CaretLeft,
  CaretRight,
  MapPin,
  Clock,
  DownloadSimple,
  CalendarCheck,
} from "@phosphor-icons/react";
import { EventItem, EventType } from "@/src/types";
import { getEvents } from "@/src/lib/dataService";
import { formatThaiDate, getEventDateParts, EVENT_TYPE_NAMES } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const WEEKDAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

const EVENT_TYPES: { key: EventType; label: string; color: string }[] = [
  { key: "sports", label: "กีฬาและนันทนาการ", color: "#4B1F7A" },
  { key: "academic", label: "วิชาการและอบรม", color: "#2F6B4F" },
  { key: "culture", label: "ศิลปวัฒนธรรม", color: "#9C7A2B" },
  { key: "volunteer", label: "จิตอาสา", color: "#B8923A" },
  { key: "meeting", label: "การประชุมและสภา", color: "#544368" },
];

export const CalendarPage: React.FC = () => {
  // Current view date (year and month)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // Default Oct 2026
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 8));
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getEvents().then((items) => {
      setEvents(items);
      setIsLoading(false);
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const yearTH = year + 543;

  // Filter events by selected category chips
  const filteredEvents = events.filter((e) => {
    if (selectedTypes.length === 0) return true;
    return selectedTypes.includes(e.type);
  });

  // Calculate days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Check which events fall on a given date (year, month, day)
  const getEventsForDay = (d: number, m: number, y: number) => {
    return filteredEvents.filter((e) => {
      const evDate = new Date(e.startAt);
      return (
        evDate.getDate() === d &&
        evDate.getMonth() === m &&
        evDate.getFullYear() === y
      );
    });
  };

  // Selected date events
  const selectedDayEvents = getEventsForDay(
    selectedDate.getDate(),
    selectedDate.getMonth(),
    selectedDate.getFullYear()
  );

  // Today check
  const today = new Date();
  const isToday = (d: number) =>
    today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  // Generate .ics file client-side
  const downloadICS = (eventItem: EventItem) => {
    const startDate = new Date(eventItem.startAt);
    const endDate = new Date(eventItem.endAt);

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatICSDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
      )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DeSUP Student Organization//TH",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${eventItem.title}`,
      `DESCRIPTION:${eventItem.description}`,
      `LOCATION:${eventItem.location}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${eventItem.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="02"
          eyebrow="SCHEDULE · ปฏิทินและกำหนดการ"
          title="ปฏิทินกิจกรรมโรงเรียนและองค์การ"
          description="ตรวจสอบกำหนดการ กิจกรรมวิชาการ การแข่งขัน และวันสำคัญตลอดปีการศึกษา"
          align="left"
        />

        {/* Category Filter Chips (Multi-select) */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-[#1B1226]/60 mr-2">กรองตามประเภท:</span>
          {EVENT_TYPES.map((t) => {
            const isSelected = selectedTypes.includes(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleType(t.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all select-none ${
                  isSelected
                    ? "bg-[#4B1F7A] text-[#FAF7F0] shadow-sm"
                    : "bg-[#FAF7F0] text-[#1B1226]/80 border border-[#B8923A]/40 hover:bg-[#EDE6F5]"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? "#D9B867" : t.color }}
                />
                <span>{t.label}</span>
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => setSelectedTypes([])}
              className="text-xs font-sans text-[#9C7A2B] hover:underline ml-2"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Desktop Calendar Grid + Right Panel Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
          {/* Left: Custom Monthly Calendar (7 cols) */}
          <div className="col-span-7 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 shadow-[0_1px_0_rgba(42,18,69,.06)]">
            {/* Month Header with Buddhist Year พ.ศ. */}
            <div className="flex items-center justify-between pb-5 border-b border-[#B8923A]/20 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1B1226]">
                  {THAI_MONTHS[month]} <span className="font-num text-[#9C7A2B]">{yearTH}</span>
                </h3>
                <span className="text-xs font-sans text-[#1B1226]/60">
                  ภาคเรียนที่ 1 ปีการศึกษา 2569
                </span>
              </div>

              {/* Prev / Next Month Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-[3px] border border-[#B8923A]/30 text-[#4B1F7A] hover:bg-[#EDE6F5] transition-colors"
                  aria-label="เดือนก่อนหน้า"
                >
                  <CaretLeft weight="light" className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-[3px] border border-[#B8923A]/30 text-[#4B1F7A] hover:bg-[#EDE6F5] transition-colors"
                  aria-label="เดือนถัดไป"
                >
                  <CaretRight weight="light" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week (Sunday Start as per spec) */}
            <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs font-semibold text-[#1B1226]/60 mb-2">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`py-1.5 ${idx === 0 ? "text-[#9C7A2B]" : ""}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Previous month filler days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="h-16 p-1.5 rounded-[3px] bg-[#EDE6F5]/10 text-[#1B1226]/25 text-xs font-num flex flex-col justify-between"
                  >
                    <span>{dayNum}</span>
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = getEventsForDay(dayNum, month, year);
                const hasEvents = dayEvents.length > 0;
                const isSelected =
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                    className={`h-16 p-2 rounded-[3px] border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#4B1F7A] bg-[#EDE6F5] shadow-sm ring-1 ring-[#4B1F7A]"
                        : "border-[#B8923A]/20 bg-[#FAF7F0] hover:border-[#B8923A]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Day number with today marker */}
                      <span
                        className={`font-num text-sm font-semibold ${
                          isToday(dayNum)
                            ? "w-6 h-6 rounded-full border border-[#4B1F7A] text-[#4B1F7A] flex items-center justify-center -m-1"
                            : "text-[#1B1226]"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Gold dot for events */}
                      {hasEvents && (
                        <span
                          className="w-2 h-2 rounded-full bg-[#B8923A] ring-2 ring-[#B8923A]/20"
                          title={`${dayEvents.length} กิจกรรม`}
                        />
                      )}
                    </div>

                    {hasEvents && (
                      <span className="text-[10px] text-[#4B1F7A] truncate font-sans font-medium">
                        {dayEvents[0].title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Day's Events Panel (5 cols) */}
          <div className="col-span-5 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 shadow-[0_1px_0_rgba(42,18,69,.06)]">
            <div className="border-b border-[#B8923A]/20 pb-4 mb-5">
              <span className="text-xs font-sans text-[#9C7A2B] uppercase tracking-widest font-semibold block">
                กิจกรรมประจำวัน
              </span>
              <h4 className="font-serif text-xl font-bold text-[#1B1226] mt-1">
                {formatThaiDate(selectedDate)}
              </h4>
            </div>

            {/* Events on this day */}
            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center text-[#1B1226]/50 font-sans text-sm">
                <CalendarCheck weight="light" className="w-8 h-8 mx-auto text-[#B8923A]/50 mb-2" />
                <p>ไม่มีกิจกรรมหรือกำหนดการในวันนี้</p>
                <p className="text-xs text-[#1B1226]/40 mt-1">
                  คลิกเลือกวันที่มีจุดสีทองเพื่อดูกำหนดการ
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/25 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] text-[10px] font-sans font-medium">
                        {EVENT_TYPE_NAMES[evt.type] || "กิจกรรม"}
                      </span>

                      {/* Download .ics button */}
                      <button
                        type="button"
                        onClick={() => downloadICS(evt)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#9C7A2B] hover:text-[#4B1F7A] transition-colors"
                        title="เพิ่มลงปฏิทินของฉัน (.ics)"
                      >
                        <DownloadSimple weight="light" className="w-3.5 h-3.5" />
                        <span>เพิ่มลงปฏิทิน</span>
                      </button>
                    </div>

                    <h5 className="font-serif text-base font-bold text-[#1B1226]">
                      {evt.title}
                    </h5>

                    <p className="text-xs text-[#1B1226]/75 font-sans leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="pt-2 border-t border-[#B8923A]/15 flex flex-col gap-1 text-xs text-[#1B1226]/70 font-sans">
                      <div className="flex items-center gap-1.5">
                        <MapPin weight="light" className="w-3.5 h-3.5 text-[#9C7A2B] shrink-0" />
                        <span>{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock weight="light" className="w-3.5 h-3.5 text-[#9C7A2B] shrink-0" />
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Agenda List View (per spec: "มือถือ: เปลี่ยนเป็นรายการ agenda เรียงตามวันที่แบบเลื่อนลง จัดกลุ่มตามเดือน") */}
        <div className="lg:hidden space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1B1226] mb-3">
            รายการกำหนดการทั้งหมด (Agenda)
          </h3>
          {filteredEvents.map((evt) => {
            const { day, month, year: yearStr } = getEventDateParts(evt.startAt);

            return (
              <div
                key={evt.id}
                className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-4 flex gap-4 items-start shadow-sm"
              >
                {/* Date block left */}
                <div className="shrink-0 flex flex-col items-center justify-center w-14 py-2 bg-[#EDE6F5] rounded-[3px] border border-[#B8923A]/20">
                  <span className="font-num text-2xl font-bold text-[#4B1F7A] leading-none">
                    {day}
                  </span>
                  <span className="text-[11px] font-serif font-medium text-[#9C7A2B] mt-0.5">
                    {month}
                  </span>
                </div>

                {/* Info right */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-sans font-medium text-[#4B1F7A] px-2 py-0.5 rounded bg-[#EDE6F5]">
                      {EVENT_TYPE_NAMES[evt.type] || "กิจกรรม"}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadICS(evt)}
                      className="text-[#9C7A2B] text-xs flex items-center gap-1"
                    >
                      <DownloadSimple weight="light" className="w-3.5 h-3.5" />
                      <span>.ics</span>
                    </button>
                  </div>

                  <h4 className="font-serif text-sm sm:text-base font-bold text-[#1B1226]">
                    {evt.title}
                  </h4>

                  <div className="mt-2 text-xs text-[#1B1226]/65 space-y-1 font-sans">
                    <div className="flex items-center gap-1">
                      <MapPin weight="light" className="w-3 h-3 text-[#9C7A2B]" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CalendarPage;
