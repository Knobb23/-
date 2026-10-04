import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChatCircleDots,
  ShieldWarning,
  Question,
  Lightbulb,
  ThumbsUp,
  DotsThreeCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  UploadSimple,
  Trash,
  Camera,
  Warning,
} from "@phosphor-icons/react";
import { ComplaintType, ComplaintAttachment } from "@/src/types";
import { submitComplaint } from "@/src/lib/dataService";
import { compressImageFile, fileToDataUrl } from "@/src/lib/imageService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

const COMPLAINT_TYPES: {
  key: ComplaintType;
  title: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    key: "complaint",
    title: "เรื่องร้องเรียนทั่วไป",
    desc: "ปัญหาความไม่สะดวก สิ่งอำนวยความสะดวก หรือความเดือดร้อน",
    icon: ChatCircleDots,
  },
  {
    key: "corruption",
    title: "แจ้งเบาะแส / ความไม่เป็นธรรม",
    desc: "เบาะแสการทุจริต หรือการใช้อำนาจหน้าที่ในทางมิชอบ",
    icon: ShieldWarning,
  },
  {
    key: "inquiry",
    title: "ติดต่อสอบถามข้อมูล",
    desc: "ข้อสงสัยเกี่ยวกับกฎระเบียบ กิจกรรม หรือการดำเนินงาน",
    icon: Question,
  },
  {
    key: "suggestion",
    title: "ข้อเสนอแนะเพื่อพัฒนา",
    desc: "ความคิดเห็น ไอเดีย หรือข้อเสนอแนะในการปรับปรุงโรงเรียน",
    icon: Lightbulb,
  },
  {
    key: "praise",
    title: "คำชมเชยและกำลังใจ",
    desc: "ส่งต่อคำขอบคุณและกำลังใจให้แก่เพื่อนหรือคณะกรรมการ",
    icon: ThumbsUp,
  },
  {
    key: "other",
    title: "เรื่องอื่น ๆ",
    desc: "เรื่องอื่น ๆ ที่ประสงค์แจ้งให้องค์การนักเรียนรับทราบ",
    icon: DotsThreeCircle,
  },
];

export const ComplaintPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [type, setType] = useState<ComplaintType>("complaint");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleAttachmentUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setAttachmentError(null);

    const remainingSlots = 2 - attachments.length;
    if (remainingSlots <= 0) {
      setAttachmentError("แนบรูปภาพได้สูงสุด 2 รูปเท่านั้น");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsCompressing(true);

    try {
      const newItems: ComplaintAttachment[] = [];
      for (const file of filesToProcess) {
        // Compress to WebP <= 300KB
        const compressed = await compressImageFile(file, "attachment");
        const dataUrl = await fileToDataUrl(compressed);
        newItems.push({
          name: file.name,
          dataUrl,
          size: compressed.size,
          type: compressed.type,
          createdAt: new Date().toISOString(),
        });
      }
      setAttachments((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      setAttachmentError(err.message || "เกิดข้อผิดพลาดในการย่อขนาดรูปภาพ");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [gradeRoom, setGradeRoom] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTrackingCode, setSuccessTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Step 1 -> 2
  const handleNextStep1 = () => {
    setStep(2);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Step 2 -> 3
  const handleNextStep2 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      errs.title = "กรุณากรอกหัวข้อเรื่องอย่างน้อย 5 ตัวอักษร";
    }
    if (!body.trim() || body.trim().length < 20) {
      errs.body = "กรุณากรอกรายละเอียดเนื้อหาอย่างน้อย 20 ตัวอักษร เพื่อให้ข้อมูลเพียงพอต่อการตรวจสอบ";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep(3);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!anonymous) {
      if (!name.trim()) errs.name = "กรุณาระบุชื่อ-นามสกุล หรือชื่อเล่น";
      if (!contactChannel.trim()) errs.contactChannel = "กรุณาระบุ LINE ID หรืออีเมลสำหรับติดต่อกลับ";
    }

    if (!pdpaConsent) {
      errs.pdpa = "กรุณาทำเครื่องหมายยินยอมตามนโยบายความเป็นส่วนตัว (PDPA)";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await submitComplaint({
        type,
        title,
        body,
        location,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
        attachments,
        anonymous,
        contact: anonymous ? undefined : { name, gradeRoom, contactChannel },
        honeypot,
      });

      setSuccessTrackingCode(res.trackingCode);
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err: any) {
      setErrors({ submit: err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!successTrackingCode) return;
    navigator.clipboard.writeText(successTrackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[840px] mx-auto px-4 sm:px-6">
        {/* Page Heading */}
        <SectionHeading
          number="05"
          eyebrow="VOICE & WHISTLEBLOWING · ระบบรับฟังเสียงสะท้อน"
          title="ส่งเรื่องร้องเรียนและข้อเสนอแนะ"
          description="พื้นที่ปลอดภัยสำหรับสะท้อนปัญหาอย่างตรงไปตรงมา พร้อมรหัสติดตามสถานะโปร่งใส"
          align="left"
        />

        {/* If submitted successfully, show Success / Thank You screen */}
        {successTrackingCode ? (
          <div className="my-10 bg-[#FAF7F0] border-2 border-[#B8923A] rounded-[4px] p-8 sm:p-12 shadow-lg text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E2F0E8] text-[#2F6B4F] flex items-center justify-center mx-auto mb-6">
              <CheckCircle weight="fill" className="w-10 h-10" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1226] mb-2">
              องค์การนักเรียนได้รับเรื่องของท่านแล้ว
            </h3>

            <p className="text-sm sm:text-base text-[#1B1226]/80 font-sans max-w-lg mx-auto leading-relaxed mb-8">
              เรื่องของท่านจะถูกส่งต่อไปยังคณะกรรมการที่รับผิดชอบเพื่อพิจารณาโดยเร็ว
              กรุณาบันทึกรหัสติดตามนี้ไว้เพื่อใช้ตรวจสอบสถานะและการตอบกลับ
            </p>

            {/* Tracking Code Box */}
            <div className="max-w-md mx-auto bg-[#EDE6F5] border border-[#B8923A]/40 rounded-[4px] p-6 mb-6">
              <span className="text-xs font-sans font-semibold tracking-widest text-[#4B1F7A] uppercase block mb-1">
                รหัสติดตามสถานะของท่าน
              </span>
              <div className="font-num text-3xl sm:text-4xl font-bold text-[#2A1245] tracking-wider my-2">
                {successTrackingCode}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FAF7F0] border border-[#B8923A] text-xs font-sans font-medium text-[#4B1F7A] hover:bg-[#EDE6F5] transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check weight="bold" className="w-4 h-4 text-[#2F6B4F]" />
                    <span className="text-[#2F6B4F]">คัดลอกรหัสเรียบร้อยแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy weight="light" className="w-4 h-4 text-[#9C7A2B]" />
                    <span>คัดลอกรหัสติดตาม</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F0] border border-[#B8923A]/20 rounded-[3px] max-w-md mx-auto text-xs text-[#1B1226]/70 mb-8 leading-relaxed">
              ⚠️ <strong>คำแนะนำ:</strong> เนื่องจากระบบไม่บังคับให้ล็อกอิน
              รหัสติดตามนี้จึงเป็นกุญแจสำคัญเพียงอย่างเดียวในการตรวจสอบสถานะ
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={`/track?code=${successTrackingCode}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
              >
                <span>ไปที่หน้าติดตามสถานะ</span>
                <ArrowRight weight="light" className="w-4 h-4 text-[#D9B867]" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSuccessTrackingCode(null);
                  setStep(1);
                  setTitle("");
                  setBody("");
                  setLocation("");
                  setImageUrl("");
                }}
                className="px-6 py-3 rounded-full border border-[#B8923A]/40 text-[#1B1226] text-sm font-sans hover:bg-[#EDE6F5] transition-colors"
              >
                ส่งเรื่องใหม่เพิ่มเติม
              </button>
            </div>
          </div>
        ) : (
          <div className="my-8">
            {/* Stepper (3 Steps) */}
            <div className="mb-10 pb-6 border-b border-[#B8923A]/25">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-num text-sm font-bold border transition-colors ${
                      step >= 1
                        ? "bg-[#4B1F7A] text-[#FAF7F0] border-[#4B1F7A]"
                        : "bg-[#FAF7F0] text-[#1B1226]/40 border-[#B8923A]/30"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs font-sans mt-1.5 font-medium text-[#1B1226]">
                    ประเภทเรื่อง
                  </span>
                </div>

                <div
                  className={`flex-1 h-[2px] mx-3 transition-colors ${
                    step >= 2 ? "bg-[#B8923A]" : "bg-[#B8923A]/20"
                  }`}
                />

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-num text-sm font-bold border transition-colors ${
                      step >= 2
                        ? "bg-[#4B1F7A] text-[#FAF7F0] border-[#4B1F7A]"
                        : "bg-[#FAF7F0] text-[#1B1226]/40 border-[#B8923A]/30"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-sans mt-1.5 font-medium text-[#1B1226]">
                    รายละเอียด
                  </span>
                </div>

                <div
                  className={`flex-1 h-[2px] mx-3 transition-colors ${
                    step >= 3 ? "bg-[#B8923A]" : "bg-[#B8923A]/20"
                  }`}
                />

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-num text-sm font-bold border transition-colors ${
                      step === 3
                        ? "bg-[#4B1F7A] text-[#FAF7F0] border-[#4B1F7A]"
                        : "bg-[#FAF7F0] text-[#1B1226]/40 border-[#B8923A]/30"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-sans mt-1.5 font-medium text-[#1B1226]">
                    ข้อมูลผู้ส่ง
                  </span>
                </div>
              </div>
            </div>

            {/* Hidden Honeypot Input */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Error banner */}
            {errors.submit && (
              <div className="mb-6 p-4 rounded-[4px] bg-[#9B1C31]/10 border border-[#9B1C31]/30 text-[#9B1C31] text-sm font-sans">
                {errors.submit}
              </div>
            )}

            {/* STEP 1: Select Type */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                    ขั้นตอนที่ 1: เลือกประเภทของเรื่องที่ต้องการส่ง
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1B1226]/70 font-sans mt-0.5">
                    เลือกหมวดหมู่ที่ตรงกับเรื่องของคุณมากที่สุด
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COMPLAINT_TYPES.map((t) => {
                    const isSelected = type === t.key;
                    const Icon = t.icon;

                    return (
                      <div
                        key={t.key}
                        onClick={() => setType(t.key)}
                        className={`p-5 rounded-[4px] border cursor-pointer transition-all select-none flex items-start gap-4 ${
                          isSelected
                            ? "border-[#4B1F7A] bg-[#EDE6F5] shadow-sm ring-2 ring-[#4B1F7A]/20"
                            : "border-[#B8923A]/30 bg-[#FAF7F0] hover:border-[#B8923A] hover:bg-[#EDE6F5]/30"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#4B1F7A] text-[#D9B867]"
                              : "bg-[#EDE6F5] text-[#4B1F7A]"
                          }`}
                        >
                          <Icon weight="light" className="w-5 h-5" />
                        </div>

                        <div>
                          <h4 className="font-serif text-base font-bold text-[#1B1226]">
                            {t.title}
                          </h4>
                          <p className="text-xs text-[#1B1226]/70 mt-1 font-sans leading-relaxed">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
                  >
                    <span>ถัดไป: กรอกรายละเอียด</span>
                    <ArrowRight weight="light" className="w-4 h-4 text-[#D9B867]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                    ขั้นตอนที่ 2: กรอกข้อมูลและรายละเอียด
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1B1226]/70 font-sans mt-0.5">
                    หมวดหมู่ที่เลือก:{" "}
                    <strong className="text-[#4B1F7A]">
                      {COMPLAINT_TYPES.find((t) => t.key === type)?.title}
                    </strong>
                  </p>
                </div>

                {/* Underline Input: Title */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    หัวข้อเรื่อง <span className="text-[#9B1C31]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น ปัญหาอุปกรณ์ห้องปฏิบัติการชำรุด หรือ ข้อเสนอเพิ่มพื้นที่อ่านหนังสือ"
                    className="w-full py-2.5 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] focus:border-b-2 text-sm sm:text-base font-sans transition-all"
                  />
                  {errors.title && (
                    <span className="text-xs text-[#9B1C31] mt-1 block font-sans">
                      {errors.title}
                    </span>
                  )}
                </div>

                {/* Underline Textarea: Body */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    เนื้อหารายละเอียด <span className="text-[#9B1C31]">* (ขั้นต่ำ 20 ตัวอักษร)</span>
                  </label>
                  <textarea
                    rows={5}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="ระบุข้อเท็จจริง สิ่งที่เกิดขึ้น หรือข้อเสนอแนะอย่างละเอียด..."
                    className="w-full py-2.5 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] focus:border-b-2 text-sm sm:text-base font-sans transition-all resize-y"
                  />
                  <div className="flex justify-between items-center text-xs text-[#1B1226]/50 mt-1">
                    {errors.body ? (
                      <span className="text-[#9B1C31] font-sans">{errors.body}</span>
                    ) : (
                      <span>ความยาว: {body.length} ตัวอักษร</span>
                    )}
                  </div>
                </div>

                {/* Underline Input: Location (Optional) */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    สถานที่ / ฝ่ายงานที่เกี่ยวข้อง (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น อาคาร 2 ชั้น 3, โรงอาหาร, หรือ ฝ่ายกิจกรรม"
                    className="w-full py-2.5 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] focus:border-b-2 text-sm sm:text-base font-sans transition-all"
                  />
                </div>

                {/* Image Attachments (Up to 2 images, compressed <= 300KB each, private to Admin) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider">
                      แนบรูปภาพประกอบเรื่องร้องเรียน (สูงสุด 2 รูป)
                    </label>
                    <span className="text-[11px] text-[#1B1226]/60">
                      ย่อขนาด ≤ 300KB อัตโนมัติ ({attachments.length}/2 รูป)
                    </span>
                  </div>

                  {/* Privacy Warning Box as specified by user */}
                  <div className="p-3.5 rounded-[6px] bg-amber-50/80 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                    <Warning weight="fill" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-amber-950">
                        คำเตือนความเป็นส่วนตัวและความปลอดภัย (PDPA):
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                        กรุณาหลีกเลี่ยงการแนบรูปภาพที่ปรากฏใบหน้าบุคคล บัตรประจำตัวประชาชน หรือข้อมูลส่วนบุคคลของผู้อื่นโดยไม่จำเป็น เพื่อคุ้มครองสิทธิและความเป็นส่วนตัวของผู้เกี่ยวข้อง (รูปภาพจะถูกจัดเก็บเป็นความลับและเปิดดูได้เฉพาะแอดมินเท่านั้น)
                      </p>
                    </div>
                  </div>

                  {/* Attachment Error */}
                  {attachmentError && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {attachmentError}
                    </div>
                  )}

                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-[6px] border border-[#B8923A]/30 bg-white flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={att.dataUrl}
                              alt={`รูปแนบที่ ${idx + 1}`}
                              className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#1B1226] truncate">
                                {att.name}
                              </p>
                              <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-mono">
                                {(att.size / 1024).toFixed(0)} KB (≤ 300KB)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors shrink-0"
                            title="ลบรูปนี้"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attachment Upload Controls */}
                  {attachments.length < 2 && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F0] hover:bg-[#EDE6F5] border border-[#B8923A]/40 text-[#1B1226] text-xs font-medium transition-colors shadow-sm">
                        <UploadSimple className="w-4 h-4 text-[#4B1F7A]" />
                        <span>{isCompressing ? "กำลังย่อขนาดภาพ..." : "เลือกรูปภาพประกอบ (จากเครื่อง)"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isCompressing}
                          onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files)}
                        />
                      </label>

                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F0] hover:bg-[#EDE6F5] border border-[#B8923A]/40 text-[#1B1226] text-xs font-medium transition-colors shadow-sm">
                        <Camera className="w-4 h-4 text-[#4B1F7A]" />
                        <span>ถ่ายภาพด้วยมือถือ</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={isCompressing}
                          onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files)}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm font-sans text-[#1B1226]/70 hover:text-[#4B1F7A]"
                  >
                    <ArrowLeft weight="light" className="w-4 h-4" />
                    <span>ย้อนกลับ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
                  >
                    <span>ถัดไป: ข้อมูลผู้ส่ง</span>
                    <ArrowRight weight="light" className="w-4 h-4 text-[#D9B867]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Sender Info & Privacy */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                    ขั้นตอนที่ 3: ตัวเลือกการระบุตัวตนและความเป็นส่วนตัว
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1B1226]/70 font-sans mt-0.5">
                    คุณสามารถเลือกที่จะไม่เปิดเผยตัวตนได้ตามความสมัครใจ
                  </p>
                </div>

                {/* Anonymous Toggle Radio / Checkbox */}
                <div className="p-5 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="opt-anon"
                      name="identity"
                      checked={anonymous}
                      onChange={() => setAnonymous(true)}
                      className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A] cursor-pointer"
                    />
                    <label htmlFor="opt-anon" className="text-sm font-sans font-medium text-[#1B1226] cursor-pointer">
                      ส่งแบบไม่ระบุตัวตน (Anonymous) — แนะนำสำหรับเรื่องร้องเรียนทั่วไป
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="opt-identify"
                      name="identity"
                      checked={!anonymous}
                      onChange={() => setAnonymous(false)}
                      className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A] cursor-pointer"
                    />
                    <label htmlFor="opt-identify" className="text-sm font-sans font-medium text-[#1B1226] cursor-pointer">
                      ต้องการระบุตัวตน เพื่อให้คณะกรรมการติดต่อกลับโดยตรง
                    </label>
                  </div>
                </div>

                {/* Identified Inputs (if not anonymous) */}
                {!anonymous && (
                  <div className="space-y-5 p-5 rounded-[4px] border border-[#B8923A]/25 bg-[#FAF7F0] animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                        ชื่อ-นามสกุล หรือชื่อเล่น <span className="text-[#9B1C31]">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น สมชาย ใจดี หรือ พี่ ม.6"
                        className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                      />
                      {errors.name && (
                        <span className="text-xs text-[#9B1C31] mt-1 block font-sans">{errors.name}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                        ระดับชั้น / ห้องเรียน
                      </label>
                      <input
                        type="text"
                        value={gradeRoom}
                        onChange={(e) => setGradeRoom(e.target.value)}
                        placeholder="เช่น ม.5/2"
                        className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                        ช่องทางติดต่อกลับ (LINE ID หรือ อีเมล) <span className="text-[#9B1C31]">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactChannel}
                        onChange={(e) => setContactChannel(e.target.value)}
                        placeholder="เช่น line_id หรือ email@up.ac.th"
                        className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                      />
                      {errors.contactChannel && (
                        <span className="text-xs text-[#9B1C31] mt-1 block font-sans">
                          {errors.contactChannel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* PDPA Privacy Policy Checkbox */}
                <div className="pt-2">
                  <div className="flex items-start gap-3 p-4 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/20">
                    <input
                      type="checkbox"
                      id="pdpa-check"
                      checked={pdpaConsent}
                      onChange={(e) => setPdpaConsent(e.target.checked)}
                      className="w-4 h-4 mt-1 text-[#4B1F7A] accent-[#4B1F7A] cursor-pointer shrink-0"
                    />
                    <label htmlFor="pdpa-check" className="text-xs text-[#1B1226]/80 leading-relaxed font-sans cursor-pointer">
                      ข้าพเจ้ายินยอมให้องค์การนักเรียนใช้ข้อมูลนี้ในการตรวจสอบและแก้ไขปัญหา
                      ข้อมูลติดต่อจะถูกจัดเก็บเป็นความลับในระบบรักษาความปลอดภัย
                      เฉพาะผู้ดูแลระบบที่มีสิทธิ์เท่านั้นที่สามารถเข้าถึงได้ (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)
                    </label>
                  </div>
                  {errors.pdpa && (
                    <span className="text-xs text-[#9B1C31] mt-1 block font-sans">{errors.pdpa}</span>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-sm font-sans text-[#1B1226]/70 hover:text-[#4B1F7A]"
                  >
                    <ArrowLeft weight="light" className="w-4 h-4" />
                    <span>ย้อนกลับ</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>กำลังส่งเรื่อง...</span>
                    ) : (
                      <>
                        <span>ยืนยันการส่งเรื่อง</span>
                        <ArrowRight weight="light" className="w-4 h-4 text-[#D9B867]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ComplaintPage;
