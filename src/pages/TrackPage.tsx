import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MagnifyingGlass,
  CheckCircle,
  Clock,
  ChatCircleText,
  CalendarBlank,
  MapPin,
  ShieldCheck,
} from "@phosphor-icons/react";
import { ComplaintItem, ComplaintStatus } from "@/src/types";
import { getComplaintByTrackingCode } from "@/src/lib/dataService";
import { formatThaiDate, COMPLAINT_STATUS_CONFIG } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

const TIMELINE_STEPS: { key: ComplaintStatus; label: string; desc: string }[] = [
  { key: "received", label: "รับเรื่องแล้ว", desc: "ระบบและแอดมินได้รับข้อมูลเข้าสู่ระบบเรียบร้อย" },
  { key: "considering", label: "กำลังพิจารณา", desc: "อยู่ระหว่างการตรวจสอบข้อเท็จจริงและจัดสรรฝ่ายงาน" },
  { key: "in_progress", label: "กำลังดำเนินการ", desc: "ประสานงานกับฝ่ายที่เกี่ยวข้องเพื่อแก้ไขปัญหา" },
  { key: "resolved", label: "เสร็จสิ้น", desc: "ดำเนินการแก้ไขหรือมีข้อสรุปข้อยุติเรียบร้อยแล้ว" },
];

const STATUS_ORDER: Record<ComplaintStatus, number> = {
  received: 1,
  considering: 2,
  in_progress: 3,
  resolved: 4,
};

export const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-search if query param ?code=...
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setTrackingCodeInput(codeParam);
      performSearch(codeParam);
    }
  }, [searchParams]);

  const performSearch = (codeToSearch: string) => {
    const code = codeToSearch.trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    setHasSearched(true);

    getComplaintByTrackingCode(code).then((result) => {
      setComplaint(result);
      setIsLoading(false);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackingCodeInput);
  };

  const currentStepNumber = complaint ? STATUS_ORDER[complaint.status] || 1 : 0;

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[840px] mx-auto px-4 sm:px-6">
        {/* Page Heading */}
        <SectionHeading
          number="05"
          eyebrow="TRACKING · ตรวจสอบความคืบหน้า"
          title="ติดตามสถานะเรื่องร้องเรียน"
          description="ตรวจสอบความคืบหน้าและการดำเนินการตอบกลับขององค์การนักเรียนด้วยรหัสติดตาม"
          align="left"
        />

        {/* Large Tracking Code Input Box */}
        <div className="my-8 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-widest">
              กรอกรหัสติดตามสถานะ (รูปแบบ SC-2569-XXXXXX)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <input
                  type="text"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="เช่น SC-2569-DEMO01 หรือ SC-2569-XXXXXX"
                  className="w-full px-4 py-3.5 bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[3px] text-lg font-num font-semibold text-[#1B1226] uppercase tracking-wider focus:outline-none focus:border-[#4B1F7A] focus:ring-1 focus:ring-[#4B1F7A]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors whitespace-nowrap shadow-sm"
              >
                {isLoading ? "กำลังค้นหา..." : "ตรวจสอบสถานะ"}
              </button>
            </div>

            <p className="text-xs text-[#1B1226]/60 font-sans">
              ทดลองด้วยรหัสตัวอย่าง:{" "}
              <button
                type="button"
                onClick={() => {
                  setTrackingCodeInput("SC-2569-DEMO01");
                  performSearch("SC-2569-DEMO01");
                }}
                className="text-[#9C7A2B] underline font-num hover:text-[#4B1F7A]"
              >
                SC-2569-DEMO01
              </button>{" "}
              หรือ{" "}
              <button
                type="button"
                onClick={() => {
                  setTrackingCodeInput("SC-2569-DEMO02");
                  performSearch("SC-2569-DEMO02");
                }}
                className="text-[#9C7A2B] underline font-num hover:text-[#4B1F7A]"
              >
                SC-2569-DEMO02
              </button>
            </p>
          </form>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="py-16 text-center text-[#1B1226]/50 font-sans">
            กำลังสืบค้นข้อมูลในระบบความปลอดภัย...
          </div>
        )}

        {!isLoading && hasSearched && !complaint && (
          <div className="my-8 p-8 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/30 text-center">
            <h4 className="font-serif text-lg font-bold text-[#1B1226]">
              ไม่พบข้อมูลสำหรับรหัส "{trackingCodeInput}"
            </h4>
            <p className="text-xs sm:text-sm text-[#1B1226]/70 mt-1 font-sans">
              กรุณาตรวจสอบความถูกต้องของรหัสติดตามอีกครั้ง หรือติดต่อฝ่ายบริการขององค์การนักเรียน
            </p>
          </div>
        )}

        {!isLoading && complaint && (
          <div className="my-8 space-y-8 animate-in fade-in duration-300">
            {/* Complaint Header Card */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#B8923A]/20">
                <div className="flex items-center gap-2">
                  <span className="font-num text-sm font-bold text-[#9C7A2B]">
                    {complaint.trackingCode}
                  </span>
                  <span>·</span>
                  <span className="text-xs text-[#1B1226]/60 font-sans">
                    ส่งเมื่อ {formatThaiDate(complaint.createdAt)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium"
                  style={{
                    backgroundColor: COMPLAINT_STATUS_CONFIG[complaint.status]?.bgColor || "#EDE6F5",
                    color: COMPLAINT_STATUS_CONFIG[complaint.status]?.textColor || "#4B1F7A",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COMPLAINT_STATUS_CONFIG[complaint.status]?.dotColor || "#6B3FA0" }}
                  />
                  <span>{COMPLAINT_STATUS_CONFIG[complaint.status]?.label || complaint.status}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1226] leading-snug">
                  {complaint.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base text-[#1B1226]/80 font-sans leading-relaxed">
                  {complaint.body}
                </p>

                {complaint.location && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-[#1B1226]/65 font-sans">
                    <MapPin weight="light" className="w-4 h-4 text-[#9C7A2B]" />
                    <span>สถานที่ / ฝ่ายที่เกี่ยวข้อง: {complaint.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4-Step Vertical Timeline (Section 4.7) */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <h4 className="font-serif text-lg font-bold text-[#1B1226] mb-6">
                ลำดับขั้นตอนการดำเนินงาน
              </h4>

              <div className="relative pl-6 sm:pl-8 space-y-8">
                {TIMELINE_STEPS.map((stepItem, idx) => {
                  const stepNumber = idx + 1;
                  const isCompleted = stepNumber <= currentStepNumber;
                  const isCurrent = stepNumber === currentStepNumber;
                  const isLast = idx === TIMELINE_STEPS.length - 1;

                  return (
                    <div key={stepItem.key} className="relative">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[-17px] sm:left-[-25px] top-6 bottom-[-32px] w-[2px] transition-colors ${
                            stepNumber < currentStepNumber ? "bg-[#B8923A]" : "bg-[#B8923A]/20"
                          }`}
                        />
                      )}

                      {/* Timeline Node */}
                      <div
                        className={`absolute left-[-24px] sm:left-[-32px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "bg-[#FAF7F0] border-[#B8923A] ring-2 ring-[#B8923A]/20"
                            : "bg-[#FAF7F0] border-[#B8923A]/30"
                        }`}
                      >
                        {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-[#B8923A]" />}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h5
                            className={`font-serif text-base font-bold ${
                              isCompleted ? "text-[#1B1226]" : "text-[#1B1226]/40"
                            }`}
                          >
                            {stepItem.label}
                          </h5>

                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-[2px] bg-[#EDE6F5] text-[10px] font-sans font-medium text-[#4B1F7A]">
                              สถานะปัจจุบัน
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#1B1226]/70 font-sans mt-0.5">
                          {stepItem.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public Replies from Student Org (Section 4.7) */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <h4 className="font-serif text-lg font-bold text-[#1B1226] mb-4 flex items-center gap-2">
                <ChatCircleText weight="light" className="w-5 h-5 text-[#9C7A2B]" />
                <span>ข้อความตอบกลับสาธารณะจากองค์การนักเรียน</span>
              </h4>

              {complaint.publicReplies && complaint.publicReplies.length > 0 ? (
                <div className="space-y-4">
                  {complaint.publicReplies.map((reply, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-[4px] bg-[#EDE6F5]/50 border-l-2 border-[#4B1F7A] text-sm text-[#1B1226]/85 font-sans leading-relaxed"
                    >
                      <p>{reply.text}</p>
                      <span className="text-[11px] text-[#1B1226]/50 mt-2 block">
                        ตอบกลับเมื่อ: {formatThaiDate(reply.at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#1B1226]/60 font-sans">
                  ยังไม่มีข้อความตอบกลับจากคณะกรรมการ อยู่ระหว่างการประสานงาน
                </p>
              )}

              {/* Privacy Notice */}
              <div className="mt-6 pt-4 border-t border-[#B8923A]/20 flex items-center gap-2 text-xs text-[#1B1226]/50">
                <ShieldCheck weight="light" className="w-4 h-4 text-[#2F6B4F]" />
                <span>หน้าติดตามนี้แสดงเฉพาะข้อมูลสาธารณะ ไม่เปิดเผยชื่อหรือข้อมูลส่วนตัวของผู้ส่ง</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TrackPage;
