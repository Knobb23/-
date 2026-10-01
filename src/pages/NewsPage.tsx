import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MagnifyingGlass, CalendarBlank, Eye, ArrowRight } from "@phosphor-icons/react";
import { NewsItem, NewsCategory } from "@/src/types";
import { getNews } from "@/src/lib/dataService";
import { formatThaiDate, NEWS_CATEGORY_NAMES } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

const CATEGORIES: { key: NewsCategory | "all"; label: string }[] = [
  { key: "all", label: "ข่าวทั้งหมด" },
  { key: "pr", label: "ข่าวประชาสัมพันธ์" },
  { key: "activities", label: "ภาพข่าวกิจกรรม" },
  { key: "regulations", label: "ระเบียบและข้อบังคับ" },
  { key: "announcements", label: "ประกาศและคำสั่ง" },
  { key: "knowledge", label: "สาระความรู้" },
  { key: "videos", label: "คลิปวิดีโอ" },
];

export const NewsPage: React.FC = () => {
  const { category: routeCategory } = useParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "all">(
    (routeCategory as NewsCategory) || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Sync category param if route changes
  useEffect(() => {
    if (routeCategory && Object.keys(NEWS_CATEGORY_NAMES).includes(routeCategory)) {
      setSelectedCategory(routeCategory as NewsCategory);
    } else if (!routeCategory) {
      setSelectedCategory("all");
    }
  }, [routeCategory]);

  // Debounce search query 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(6);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch news
  useEffect(() => {
    setIsLoading(true);
    getNews({
      category: selectedCategory,
      search: debouncedQuery,
    }).then(({ items, total }) => {
      setNewsList(items);
      setTotalCount(total);
      setIsLoading(false);
    });
  }, [selectedCategory, debouncedQuery]);

  const displayedNews = newsList.slice(0, visibleCount);
  const hasMore = visibleCount < newsList.length;

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Title */}
        <SectionHeading
          number="01"
          eyebrow="NEWS & ARTICLES · ข่าวสารและประกาศ"
          title="ข่าวสารและประชาสัมพันธ์"
          description="ศูนย์รวมข้อมูลข่าวสาร กิจกรรม ประกาศ และระเบียบข้อบังคับทางการขององค์การนักเรียน"
          align="left"
        />

        {/* Filter and Search Bar */}
        <div className="mt-8 mb-10 space-y-6">
          {/* Live Search Input (Underline input as per design system) */}
          <div className="relative max-w-md">
            <MagnifyingGlass
              weight="light"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C7A2B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามหัวข้อ หรือเนื้อหาข่าว..."
              className="w-full pl-8 pr-4 py-2.5 bg-transparent border-b border-[#B8923A]/40 text-[#1B1226] placeholder-[#1B1226]/40 focus:outline-none focus:border-[#9C7A2B] focus:border-b-2 text-sm sm:text-base font-sans transition-all"
            />
          </div>

          {/* Underline Tabs */}
          <div className="flex items-center overflow-x-auto border-b border-[#B8923A]/20 pb-1 scrollbar-none gap-2 sm:gap-6">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setVisibleCount(6);
                  }}
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

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#FAF7F0] border border-[#B8923A]/20 rounded-[4px] overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-[#EDE6F5]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-[#B8923A]/20 rounded w-1/3" />
                  <div className="h-5 bg-[#1B1226]/15 rounded w-full" />
                  <div className="h-4 bg-[#1B1226]/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedNews.length === 0 && (
          <div className="py-20 text-center bg-[#EDE6F5]/40 rounded-[4px] border border-[#B8923A]/20 p-8 my-8">
            <span className="text-3xl select-none">📰</span>
            <p className="font-serif text-xl font-bold text-[#1B1226] mt-3">
              ยังไม่มีข่าวในหมวดนี้ เดี๋ยวมีมาแน่นอน
            </p>
            <p className="text-sm text-[#1B1226]/60 mt-1 font-sans">
              ลองเลือกหมวดอื่น หรือเปลี่ยนคำค้นหาใหม่อีกครั้ง
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6 px-5 py-2 rounded-full border border-[#B8923A] text-xs font-sans text-[#4B1F7A] hover:bg-[#FAF7F0]"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && displayedNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedNews.map((item) => (
              <Link
                key={item.id}
                to={`/news/read/${item.id}`}
                data-cursor="news"
                className="group relative flex flex-col justify-between bg-[#FAF7F0] rounded-[4px] border border-[#B8923A]/30 overflow-hidden shadow-[0_1px_0_rgba(42,18,69,.08)] hover:shadow-[0_12px_24px_-8px_rgba(42,18,69,.15)] transition-all duration-300"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE6F5]">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      width={600}
                      height={375}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
                    />

                    {/* SVG Corner accents */}
                    <div className="absolute inset-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D9B867]" />
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D9B867]" />
                      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D9B867]" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D9B867]" />
                    </div>

                    {/* Category Label */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] text-[10px] font-sans font-medium tracking-wider uppercase shadow-sm">
                        {NEWS_CATEGORY_NAMES[item.category] || "ข่าว"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[11px] text-[#1B1226]/60 mb-2 font-sans">
                      <span className="inline-flex items-center gap-1">
                        <CalendarBlank weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
                        {formatThaiDate(item.createdAt)}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
                        {item.views.toLocaleString("th-TH")}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#1B1226] group-hover:text-[#4B1F7A] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#1B1226]/75 line-clamp-2 leading-relaxed font-sans">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer read more */}
                <div className="px-6 pb-6 pt-2">
                  <div className="pt-3 border-t border-[#B8923A]/15 flex items-center justify-between text-xs font-sans text-[#4B1F7A] group-hover:text-[#2A1245]">
                    <span>อ่านฉบับเต็ม</span>
                    <span className="text-[#9C7A2B] transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button (No numbered pagination per spec) */}
        {!isLoading && hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="relative inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#FAF7F0] border border-[#B8923A] text-[#4B1F7A] font-sans font-medium text-sm hover:bg-[#EDE6F5] transition-colors shadow-sm"
            >
              <span>โหลดเพิ่ม</span>
              <span className="text-xs text-[#9C7A2B]">
                ({displayedNews.length} / {totalCount})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default NewsPage;
