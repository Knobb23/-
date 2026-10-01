import React, { useState } from "react";
import {
  FacebookLogo,
  ArrowUpRight,
  Sparkle,
  Image,
  CheckCircle,
  X,
  Eye,
  FloppyDisk,
  PencilSimple,
} from "@phosphor-icons/react";
import { SITE_CONFIG } from "@/src/config/site";
import { NewsCategory, NewsItem } from "@/src/types";

interface FacebookPostImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDirectly: (news: Partial<NewsItem>) => Promise<void>;
  onEditInForm: (news: Partial<NewsItem>) => void;
}

export const FacebookPostImporter: React.FC<FacebookPostImporterProps> = ({
  isOpen,
  onClose,
  onSaveDirectly,
  onEditInForm,
}) => {
  const [postUrl, setPostUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<NewsCategory>("pr");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Formatted state
  const [formattedTitle, setFormattedTitle] = useState("");
  const [formattedExcerpt, setFormattedExcerpt] = useState("");
  const [formattedHtml, setFormattedHtml] = useState("");

  if (!isOpen) return null;

  // Process text into title, excerpt and HTML content
  const handleAutoFormat = () => {
    if (!rawText.trim()) return;

    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    // Line 1 is usually the headline or subject
    let title = lines[0];
    // Clean up markdown hashes, asterisks or common prefixes
    title = title.replace(/^[#*•\-\s]+/, "").trim();
    if (title.length > 90) {
      title = title.slice(0, 88) + "...";
    }

    // Excerpt: 1st or 2nd sentence/line
    let excerpt = "";
    if (lines.length > 1) {
      excerpt = lines[1];
    } else {
      excerpt = lines[0];
    }
    if (excerpt.length > 160) {
      excerpt = excerpt.slice(0, 158) + "...";
    }

    // Format paragraphs into clean HTML
    const paragraphsHtml = lines
      .map((line) => {
        // Turn links into active anchors
        const linkedLine = line.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#4B1F7A] underline">$1</a>'
        );
        return `<p class="mb-4 leading-relaxed">${linkedLine}</p>`;
      })
      .join("");

    // Credit and source box at bottom
    const sourceHtml = `
      <div class="mt-8 p-4 rounded bg-[#EDE6F5]/50 border border-[#B8923A]/30 text-xs sm:text-sm text-[#1B1226]">
        <div class="flex items-center gap-2 font-semibold text-[#4B1F7A] mb-1">
          <span>ที่มาข้อมูล: Facebook เพจองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา</span>
        </div>
        ${
          postUrl.trim()
            ? `<p class="text-xs text-[#1B1226]/75">ดูโพสต์ต้นฉบับ: <a href="${postUrl.trim()}" target="_blank" rel="noopener noreferrer" class="text-[#4B1F7A] font-medium underline break-all">${postUrl.trim()}</a></p>`
            : `<p class="text-xs text-[#1B1226]/75">ติดตามข่าวสารเพิ่มเติมทางเพจ: <a href="${SITE_CONFIG.facebookUrl}" target="_blank" rel="noopener noreferrer" class="text-[#4B1F7A] font-medium underline">${SITE_CONFIG.facebookName}</a></p>`
        }
      </div>
    `;

    setFormattedTitle(title);
    setFormattedExcerpt(excerpt);
    setFormattedHtml(paragraphsHtml + sourceHtml);
  };

  const handleCreateNewsData = (): Partial<NewsItem> => {
    // If not auto-formatted yet, run it
    const titleToUse = formattedTitle.trim() || rawText.split("\n")[0] || "ข่าวสารจากองค์การนักเรียน";
    const excerptToUse = formattedExcerpt.trim() || rawText.slice(0, 120);
    const htmlToUse =
      formattedHtml.trim() ||
      `<p>${rawText.replace(/\n/g, "<br/>")}</p>`;

    return {
      title: titleToUse,
      category,
      excerpt: excerptToUse,
      content: htmlToUse,
      coverUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
      published: true,
      pinned,
      views: 1,
    };
  };

  const handleSaveDirect = async () => {
    if (!rawText.trim()) {
      alert("กรุณาวางเนื้อหาข้อความจากโพสต์ Facebook");
      return;
    }
    try {
      setIsSubmitting(true);
      const newsData = handleCreateNewsData();
      await onSaveDirectly(newsData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToForm = () => {
    if (!rawText.trim()) {
      alert("กรุณาวางเนื้อหาข้อความจากโพสต์ Facebook");
      return;
    }
    const newsData = handleCreateNewsData();
    onEditInForm(newsData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99990] bg-[#1B1226]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[6px] max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#B8923A]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2]">
              <FacebookLogo weight="fill" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1226]">
                นำเข้าข่าวสารด่วนจาก Facebook เพจองค์การนักเรียน
              </h3>
              <p className="text-xs text-[#1B1226]/65 mt-0.5">
                ก๊อปปี้ข้อความและรูปภาพจากโพสต์ Facebook มาวาง ระบบจะช่วยจัดรูปเล่มข่าวสารของโรงเรียนให้อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EDE6F5] text-[#1B1226]/60 hover:text-[#1B1226] transition-colors"
          >
            <X weight="bold" className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Link to Official Page */}
        <div className="p-3 rounded-[4px] bg-[#EDE6F5]/50 border border-[#B8923A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#4B1F7A] font-medium">
            <FacebookLogo weight="bold" className="w-4 h-4 text-[#1877F2]" />
            <span>เพจทางการ: {SITE_CONFIG.facebookName}</span>
          </div>
          <a
            href={SITE_CONFIG.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#4B1F7A] hover:text-[#2A1245] font-semibold underline self-start sm:self-auto"
          >
            <span>เปิดหน้าเพจ Facebook ในแท็บใหม่เพื่อก๊อปปี้โพสต์</span>
            <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Body (Split 2 Columns on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
          {/* Left Column: Input Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                1. ลิงก์โพสต์ Facebook (ถ้ามี):
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.facebook.com/.../posts/..."
                className="w-full p-2.5 rounded border border-[#B8923A]/40 text-xs font-sans bg-white focus:outline-none focus:border-[#4B1F7A]"
              />
              <span className="text-[11px] text-[#1B1226]/60 mt-0.5 block">
                ระบบจะนำลิงก์นี้ไปใส่เป็นปุ่ม "ดูโพสต์ต้นฉบับบน Facebook" ท้ายข่าว
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1B1226]">
                  2. ข้อความแคปชันจากโพสต์ (Facebook Text) * :
                </label>
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4B1F7A] hover:underline"
                >
                  <Sparkle weight="fill" className="w-3 h-3 text-[#D9B867]" />
                  <span>จัดรูปแบบอัจฉริยะ (Auto-Format)</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                }}
                onBlur={handleAutoFormat}
                placeholder="วางข้อความจากโพสต์ Facebook ที่นี่... เช่น: [ประกาศองค์การนักเรียน] ขอเชิญชวนเพื่อนๆ ร่วมกิจกรรม..."
                className="w-full p-2.5 rounded border border-[#B8923A]/40 text-xs font-sans bg-white focus:outline-none focus:border-[#4B1F7A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                3. ลิงก์รูปภาพประกอบ (Image URL):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="วางลิงก์รูปภาพจาก Facebook หรือเว็บฝากรูป..."
                  className="w-full p-2.5 rounded border border-[#B8923A]/40 text-xs font-sans bg-white focus:outline-none focus:border-[#4B1F7A]"
                />
              </div>
              <span className="text-[11px] text-[#1B1226]/60 mt-0.5 block">
                คลิกขวาที่รูปใน Facebook แล้วเลือก "Copy image address / คัดลอกที่อยู่รูปภาพ" มาวางได้เลยครับ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                  หมวดหมู่ข่าว:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className="w-full p-2 rounded border border-[#B8923A]/40 text-xs bg-white font-sans"
                >
                  <option value="pr">ข่าวประชาสัมพันธ์</option>
                  <option value="activities">ภาพข่าวกิจกรรม</option>
                  <option value="regulations">ระเบียบและข้อบังคับ</option>
                  <option value="announcements">ประกาศและคำสั่ง</option>
                  <option value="knowledge">สาระความรู้</option>
                  <option value="videos">คลิปวิดีโอ</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A]"
                  />
                  <span>ปักหมุดเป็นข่าวเด่นหน้าแรก</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Editorial Preview */}
          <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#B8923A]/20 mb-3">
                <span className="text-xs font-semibold text-[#9C7A2B] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye weight="light" className="w-4 h-4" />
                  <span>ตัวอย่างการแสดงผลบนเว็บ (Live Preview)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E2F0E8] text-[#2F6B4F] font-medium">
                  พร้อมเผยแพร่
                </span>
              </div>

              {/* Preview Card */}
              <div className="space-y-3">
                {imageUrl ? (
                  <div className="aspect-video w-full rounded overflow-hidden bg-[#2A1245]/5 border border-[#B8923A]/20">
                    <img
                      src={imageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop";
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded bg-[#EDE6F5]/40 border border-dashed border-[#B8923A]/30 flex flex-col items-center justify-center text-[#1B1226]/40 text-xs">
                    <Image weight="light" className="w-8 h-8 mb-1 text-[#9C7A2B]/60" />
                    <span>รูปภาพปกข่าวเริ่มต้น</span>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold text-[#4B1F7A] uppercase">
                    หมวด: {category}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#1B1226] leading-snug mt-0.5">
                    {formattedTitle || (rawText ? rawText.split("\n")[0] : "หัวข้อข่าวจะปรากฏที่นี่")}
                  </h4>
                  <p className="text-xs text-[#1B1226]/70 mt-1 line-clamp-3 font-sans leading-relaxed">
                    {formattedExcerpt || (rawText ? rawText.slice(0, 140) : "ข้อความเกริ่นนำข่าวจะแสดงตรงนี้...")}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#EDE6F5]/40 border border-[#B8923A]/20 text-[11px] text-[#4B1F7A]">
                  ✓ มีกล่องอ้างอิงและลิงก์เชื่อมโยงกลับไปที่ Facebook เพจองค์การนักเรียนโดยอัตโนมัติ
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#B8923A]/20 text-[11px] text-[#1B1226]/60">
              💡 เคล็ดลับ: คุณสามารถกด "เผยแพร่ขึ้นเว็บทันที" หรือกด "ปรับแต่งต่อใน Editor" เพื่อจัดตัวหนา/สี/ใส่ไฟล์แนบเพิ่มเติมได้ครับ
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#B8923A]/20 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#B8923A]/40 text-xs font-sans hover:bg-[#EDE6F5] transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSendToForm}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#FAF7F0] border border-[#4B1F7A] text-[#4B1F7A] text-xs font-medium hover:bg-[#EDE6F5] transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <PencilSimple weight="bold" className="w-3.5 h-3.5" />
            <span>นำไปแก้ไขต่อในแบบฟอร์มเต็ม</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveDirect}
            className="w-full sm:w-auto px-6 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <FloppyDisk weight="bold" className="w-3.5 h-3.5 text-[#D9B867]" />
            <span>{isSubmitting ? "กำลังบันทึก..." : "เผยแพร่ขึ้นเว็บทันที"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
