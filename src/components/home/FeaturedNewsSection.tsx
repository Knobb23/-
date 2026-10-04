import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, CalendarBlank } from "@phosphor-icons/react";
import { NewsItem } from "@/src/types";
import { getFeaturedNews, MOCK_NEWS } from "@/src/lib/dataService";
import { formatThaiDate, NEWS_CATEGORY_NAMES } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const FeaturedNewsSection: React.FC = () => {
  const [featured, setFeatured] = useState<{ main: NewsItem; secondary: NewsItem[] }>(() => {
    const pinned = MOCK_NEWS.find((n) => n.pinned) || MOCK_NEWS[0];
    const others = MOCK_NEWS.filter((n) => n.id !== pinned.id).slice(0, 4);
    return { main: pinned, secondary: others };
  });

  useEffect(() => {
    getFeaturedNews().then((data) => {
      if (data && data.main) setFeatured(data);
    });
  }, []);

  if (!featured || !featured.main) return null;

  const { main, secondary } = featured;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-t border-[#B8923A]/15">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <SectionHeading
          number="01"
          eyebrow="NEWS · ข่าวสารและประกาศ"
          title="ข่าวเด่นและกิจกรรมสำคัญ"
          description="ติดตามข่าวสาร การดำเนินงาน และกิจกรรมสร้างสรรค์ของนักเรียนสาธิต ม.พะเยา"
          actionText="ข่าวทั้งหมด"
          actionHref="/news"
        />

        {/* Asymmetrical Layout: 1 Large Left (7 cols) + 4 Vertical Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Featured Item (7 cols) */}
          <div className="lg:col-span-7">
            <Link
              to={`/news/read/${main.id}`}
              data-cursor="news"
              className="group relative block bg-[#FAF7F0] rounded-[4px] border border-[#B8923A]/30 overflow-hidden shadow-[0_1px_0_rgba(42,18,69,.08),0_12px_24px_-12px_rgba(42,18,69,.12)] transition-shadow duration-300 hover:shadow-[0_16px_32px_-12px_rgba(42,18,69,.18)]"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE6F5]">
                <img
                  src={main.coverUrl}
                  alt={main.title}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
                />

                {/* SVG Corner Accents on Hover */}
                <div
                  className="absolute inset-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                >
                  {/* Top-left corner */}
                  <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#D9B867]" />
                  {/* Top-right corner */}
                  <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#D9B867]" />
                  {/* Bottom-left corner */}
                  <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#D9B867]" />
                  {/* Bottom-right corner */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#D9B867]" />
                </div>

                {/* Pinned / Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] text-[11px] font-sans font-medium tracking-wider uppercase shadow-sm">
                    {NEWS_CATEGORY_NAMES[main.category] || "ข่าวสาร"}
                  </span>
                  {main.pinned && (
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#9C7A2B] text-[#FAF7F0] text-[10px] font-sans font-semibold tracking-wider">
                      ปักหมุด
                    </span>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-4 text-xs text-[#1B1226]/60 mb-2.5 font-sans">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarBlank weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
                    {formatThaiDate(main.createdAt)}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
                    {main.views.toLocaleString("th-TH")} ครั้ง
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors line-clamp-2 leading-snug">
                  {main.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base text-[#1B1226]/75 line-clamp-2 leading-relaxed font-sans">
                  {main.excerpt}
                </p>

                <div className="mt-5 pt-4 border-t border-[#B8923A]/15 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#4B1F7A] group-hover:text-[#2A1245] inline-flex items-center gap-1 font-sans">
                    อ่านเนื้อหาฉบับเต็ม
                    <span className="text-[#9C7A2B] transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary News List (5 cols: 4 items in newspaper style) */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-[#B8923A]/20">
            {secondary.map((item, index) => (
              <Link
                key={item.id}
                to={`/news/read/${item.id}`}
                data-cursor="news"
                className={`group flex gap-4 py-4 first:pt-0 last:pb-0 items-start hover:bg-[#EDE6F5]/40 p-2 rounded-[3px] transition-colors`}
              >
                {/* Small Thumbnail 1:1 or 4:3 */}
                <div className="shrink-0 w-24 sm:w-28 aspect-[4/3] rounded-[3px] overflow-hidden bg-[#EDE6F5] border border-[#B8923A]/20">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    width={200}
                    height={150}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[#9C7A2B] font-sans font-medium mb-1">
                    <span className="uppercase tracking-wider">
                      {NEWS_CATEGORY_NAMES[item.category] || "ข่าว"}
                    </span>
                    <span>·</span>
                    <span className="text-[#1B1226]/60">{formatThaiDate(item.createdAt, { shortMonth: true })}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}

            {/* View all link for mobile */}
            <div className="pt-4 lg:hidden">
              <Link
                to="/news"
                className="w-full py-2.5 flex items-center justify-center gap-2 rounded-[4px] border border-[#B8923A]/40 text-sm font-medium text-[#4B1F7A] hover:bg-[#EDE6F5]"
              >
                <span>ดูข่าวสารทั้งหมด</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
