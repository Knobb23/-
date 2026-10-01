import React, { useState } from "react";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  FacebookLogo,
  PaperPlaneTilt,
  CheckCircle,
} from "@phosphor-icons/react";
import { SITE_CONFIG } from "@/src/config/site";
import { submitContactMessage } from "@/src/lib/dataService";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("กรุณากรอกชื่อ อีเมล และข้อความที่ต้องการติดต่อ");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await submitContactMessage({
        name,
        email,
        phone,
        message,
        honeypot,
      });

      setShowToast(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setTimeout(() => setShowToast(false), 4500);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0] relative">
      {/* Toast Notification (Designed in violet-900 per spec) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1245] text-[#FAF7F0] px-5 py-3.5 rounded-[4px] border border-[#B8923A]/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle weight="fill" className="w-5 h-5 text-[#D9B867]" />
          <div className="text-xs sm:text-sm font-sans">
            <span className="font-semibold block">ส่งข้อความเรียบร้อยแล้ว</span>
            <span className="text-[#FAF7F0]/75">องค์การนักเรียนจะติดต่อกลับทางอีเมลโดยเร็ว</span>
          </div>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="07"
          eyebrow="COMMUNICATION · ข้อมูลและช่องทางติดต่อ"
          title="ติดต่อองค์การนักเรียน"
          description="ที่ทำการองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา และแบบฟอร์มส่งข้อความติดต่อ"
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 my-10">
          {/* Col 1: Contact Information & Google Maps (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)] space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                ที่ทำการองค์การนักเรียน
              </h3>

              <div className="space-y-4 font-sans text-sm text-[#1B1226]/80">
                <div className="flex items-start gap-3">
                  <MapPin weight="light" className="w-5 h-5 text-[#9C7A2B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1B1226] block">{SITE_CONFIG.schoolName}</strong>
                    <span>{SITE_CONFIG.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone weight="light" className="w-5 h-5 text-[#9C7A2B] shrink-0" />
                  <span>{SITE_CONFIG.phone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <EnvelopeSimple weight="light" className="w-5 h-5 text-[#9C7A2B] shrink-0" />
                  <span>{SITE_CONFIG.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FacebookLogo weight="light" className="w-5 h-5 text-[#9C7A2B] shrink-0" />
                  <a
                    href={SITE_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4B1F7A] hover:underline"
                  >
                    {SITE_CONFIG.facebookName}
                  </a>
                </div>
              </div>
            </div>

            {/* Embedded Google Maps (iframe with coords from site.ts) */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm aspect-[16/10] sm:aspect-[16/9]">
              <iframe
                src={SITE_CONFIG.mapsEmbedUrl}
                title="แผนที่โรงเรียนสาธิตมหาวิทยาลัยพะเยา"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Col 2: Short Contact Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <h3 className="font-serif text-xl font-bold text-[#1B1226] mb-1">
                ส่งข้อความถึงองค์การ
              </h3>
              <p className="text-xs text-[#1B1226]/65 font-sans mb-6">
                กรอกข้อความเพื่อติดต่อสอบถาม หรือประสานงานความร่วมมือ
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-[3px] bg-[#9B1C31]/10 border border-[#9B1C31]/30 text-[#9B1C31] text-xs font-sans">
                  {errorMsg}
                </div>
              )}

              {/* Hidden honeypot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Underline Input: Name */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    ชื่อ-นามสกุล หรือชื่อผู้ติดต่อ <span className="text-[#9B1C31]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น อาจารย์ประสานงาน หรือ นายตัวอย่าง"
                    className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                  />
                </div>

                {/* Underline Input: Email */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    อีเมลสำหรับตอบกลับ <span className="text-[#9B1C31]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                  />
                </div>

                {/* Underline Input: Phone */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    หมายเลขโทรศัพท์ (ไม่บังคับ)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans"
                  />
                </div>

                {/* Underline Textarea: Message */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-[#1B1226]/80 uppercase tracking-wider mb-1">
                    ข้อความที่ต้องการติดต่อ <span className="text-[#9B1C31]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ระบุข้อความหรือเรื่องที่ประสงค์ติดต่อ..."
                    className="w-full py-2 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] focus:outline-none focus:border-[#9C7A2B] text-sm font-sans resize-y"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>กำลังส่งข้อความ...</span>
                    ) : (
                      <>
                        <PaperPlaneTilt weight="light" className="w-4 h-4 text-[#D9B867]" />
                        <span>ส่งข้อความ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
