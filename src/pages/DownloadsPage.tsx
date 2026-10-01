import React, { useState, useEffect } from "react";
import { MagnifyingGlass, DownloadSimple, FileText, Check } from "@phosphor-icons/react";
import { DownloadItem, DownloadCategory } from "@/src/types";
import { getDownloads, incrementDownloadCount } from "@/src/lib/dataService";
import { formatThaiDate } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

const CATEGORIES: { key: DownloadCategory | "all"; label: string }[] = [
  { key: "all", label: "เอกสารทั้งหมด" },
  { key: "forms", label: "แบบฟอร์มคำร้อง" },
  { key: "regulations", label: "ระเบียบและข้อบังคับ" },
  { key: "minutes", label: "รายงานการประชุม" },
  { key: "others", label: "คู่มือและเอกสารอื่น ๆ" },
];

export const DownloadsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DownloadCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getDownloads({
      category: selectedCategory,
      search: searchQuery,
    }).then((items) => {
      setDownloads(items);
      setIsLoading(false);
    });
  }, [selectedCategory, searchQuery]);

  const handleDownload = (item: DownloadItem) => {
    incrementDownloadCount(item.id);
    // Update local state count
    setDownloads((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, downloads: d.downloads + 1 } : d))
    );
    // Open download link
    window.open(item.fileUrl, "_blank");
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="03"
          eyebrow="REPOSITORY · คลังเอกสารทางการ"
          title="คลังดาวน์โหลดเอกสาร"
          description="แบบฟอร์มการขอจัดกิจกรรม ระเบียบข้อบังคับ และรายงานการประชุมสภานักเรียน"
          align="left"
        />

        {/* Filter & Search Bar */}
        <div className="mt-8 mb-10 space-y-6">
          {/* Underline Search */}
          <div className="relative max-w-md">
            <MagnifyingGlass
              weight="light"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C7A2B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเอกสาร หรือแบบฟอร์ม..."
              className="w-full pl-8 pr-4 py-2.5 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] placeholder-[#1B1226]/40 focus:outline-none focus:border-[#9C7A2B] focus:border-b-2 text-sm sm:text-base font-sans transition-all"
            />
          </div>

          {/* Underline Filter Tabs */}
          <div className="flex items-center overflow-x-auto border-b border-[#B8923A]/20 pb-1 scrollbar-none gap-2 sm:gap-6">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`relative py-2.5 px-1 whitespace-nowrap text-sm font-medium transition-colors cursor-pointer select-none font-sans ${
                    isActive
                      ? "text-[#4B1F7A] font-semibold"
                      : "text-[#1B1226]/70 hover:text-[#4B1F7A]"
                  }`}
                >
                  <span>{cat.label}</span>
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#B8923A]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editorial Table (Strictly NOT cards as requested in spec) */}
        <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-[0_1px_0_rgba(42,18,69,.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#B8923A]/20 bg-[#EDE6F5]/40 text-xs font-sans text-[#1B1226]/70 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">ชื่อเอกสาร</th>
                  <th className="py-4 px-4 font-semibold hidden sm:table-cell">หมวดหมู่</th>
                  <th className="py-4 px-4 font-semibold text-center">ประเภท</th>
                  <th className="py-4 px-4 font-semibold hidden md:table-cell">วันที่เผยแพร่</th>
                  <th className="py-4 px-4 font-semibold text-right hidden lg:table-cell">ดาวน์โหลดแล้ว</th>
                  <th className="py-4 px-6 font-semibold text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8923A]/15 text-sm font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#1B1226]/50">
                      กำลังโหลดรายการเอกสาร...
                    </td>
                  </tr>
                ) : downloads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#1B1226]/50">
                      ไม่พบเอกสารในหมวดหมู่นี้
                    </td>
                  </tr>
                ) : (
                  downloads.map((item) => {
                    const categoryLabel =
                      CATEGORIES.find((c) => c.key === item.category)?.label || "เอกสาร";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#EDE6F5]/30 transition-colors group"
                      >
                        {/* Title */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <FileText weight="light" className="w-5 h-5 text-[#9C7A2B] shrink-0" />
                            <div>
                              <span className="font-serif font-bold text-base text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors block">
                                {item.title}
                              </span>
                              {item.fileSize && (
                                <span className="text-xs text-[#1B1226]/50 font-sans sm:hidden">
                                  ขนาด {item.fileSize}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-xs text-[#1B1226]/70 hidden sm:table-cell">
                          {categoryLabel}
                        </td>

                        {/* File Type Badge (uppercase in thin border per spec) */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-[2px] border border-[#B8923A]/60 text-[10px] font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase">
                            {item.fileType}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs text-[#1B1226]/60 hidden md:table-cell whitespace-nowrap">
                          {formatThaiDate(item.createdAt, { shortMonth: true })}
                        </td>

                        {/* Downloads count */}
                        <td className="py-4 px-4 text-right text-xs font-num text-[#1B1226]/70 hidden lg:table-cell tabular-nums">
                          {item.downloads.toLocaleString("th-TH")} ครั้ง
                        </td>

                        {/* Download CTA Button */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownload(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-sans font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
                          >
                            <DownloadSimple weight="light" className="w-3.5 h-3.5 text-[#D9B867]" />
                            <span>ดาวน์โหลด</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DownloadsPage;
