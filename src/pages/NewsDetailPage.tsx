import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarBlank,
  Eye,
  ShareNetwork,
  Copy,
  FacebookLogo,
  ChatCircleText,
  FileArrowDown,
  ArrowLeft,
  Play,
  Check,
} from "@phosphor-icons/react";
import { NewsItem } from "@/src/types";
import { getNewsById, getRelatedNews, incrementNewsViews } from "@/src/lib/dataService";
import { formatThaiDate, NEWS_CATEGORY_NAMES } from "@/src/lib/format";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setVideoLoaded(false);

    getNewsById(id).then((item) => {
      setNews(item);
      setIsLoading(false);

      if (item) {
        // Increment view count once per session
        incrementNewsViews(item.id);

        // Fetch related news (3 items)
        getRelatedNews(item.id, item.category, 3).then(setRelated);
      }
    });
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleShareLine = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(news?.title || "");
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${title}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="py-24 max-w-[720px] mx-auto px-4 animate-pulse space-y-6">
        <div className="h-6 bg-[#B8923A]/20 rounded w-1/4" />
        <div className="h-10 bg-[#1B1226]/20 rounded w-full" />
        <div className="h-4 bg-[#1B1226]/10 rounded w-1/2" />
        <div className="aspect-[16/10] bg-[#EDE6F5] rounded" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="py-24 text-center px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-serif font-bold text-[#1B1226]">ไม่พบข่าวที่คุณต้องการ</h2>
        <p className="text-sm text-[#1B1226]/70 mt-2 font-sans">
          ข่าวนี้อาจถูกนำออกหรือเปลี่ยนเส้นทางไปแล้ว
        </p>
        <Link
          to="/news"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm"
        >
          <ArrowLeft weight="light" className="w-4 h-4" />
          <span>กลับสู่หน้ารวมข่าว</span>
        </Link>
      </div>
    );
  }

  // Gallery slides for lightbox
  const gallerySlides = news.galleryUrls?.map((url) => ({ src: url })) || [];

  return (
    <article className="py-12 sm:py-16 bg-[#FAF7F0]">
      {/* Back button */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 mb-6">
        <Link
          to="/news"
          className="editorial-btn-secondary text-xs sm:text-sm font-medium text-[#4B1F7A] group"
        >
          <span className="mr-1.5 text-[#9C7A2B]">←</span>
          <span>ย้อนกลับไปหน้ารวมข่าว</span>
        </Link>
      </div>

      {/* Main Reading Container (~720px width) */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#1B1226]/70 mb-3">
          <span className="px-2.5 py-1 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] font-medium uppercase tracking-wider text-[11px]">
            {NEWS_CATEGORY_NAMES[news.category] || "ข่าวสาร"}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
            {formatThaiDate(news.createdAt)}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Eye weight="light" className="w-3.5 h-3.5 text-[#9C7A2B]" />
            {news.views.toLocaleString("th-TH")} ครั้ง
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1B1226] leading-[1.3] mb-6">
          {news.title}
        </h1>

        {/* Cover Photo or YouTube Lite Embed */}
        {news.category === "videos" && news.videoUrl ? (
          <div className="relative aspect-video rounded-[4px] overflow-hidden bg-[#2A1245] my-8 border border-[#B8923A]/30 shadow-md">
            {!videoLoaded ? (
              <div
                onClick={() => setVideoLoaded(true)}
                className="relative w-full h-full cursor-pointer group flex items-center justify-center"
              >
                <img
                  src={news.coverUrl}
                  alt={news.title}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute w-16 h-16 rounded-full bg-[#4B1F7A]/90 text-[#FAF7F0] border-2 border-[#D9B867] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play weight="fill" className="w-6 h-6 ml-1 text-[#D9B867]" />
                </div>
                <span className="absolute bottom-3 left-3 bg-[#2A1245]/80 text-[#FAF7F0] text-xs px-2.5 py-1 rounded-[3px] font-sans">
                  คลิกเพื่อเล่นวิดีโอ YouTube
                </span>
              </div>
            ) : (
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title={news.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="relative aspect-[16/10] rounded-[4px] overflow-hidden bg-[#EDE6F5] my-8 border border-[#B8923A]/30 shadow-md">
            <img
              src={news.coverUrl}
              alt={news.title}
              width={1200}
              height={750}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content (18px, line-height 1.75) */}
        <div
          className="text-base sm:text-[18px] leading-[1.8] text-[#1B1226]/90 font-sans space-y-4 my-8"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Attached Gallery (if available) */}
        {news.galleryUrls && news.galleryUrls.length > 0 && (
          <div className="my-10 pt-6 border-t border-[#B8923A]/20">
            <h3 className="font-serif text-xl font-bold text-[#1B1226] mb-4">
              ภาพบรรยากาศเพิ่มเติม ({news.galleryUrls.length} ภาพ)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {news.galleryUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="aspect-[4/3] rounded-[3px] overflow-hidden bg-[#EDE6F5] border border-[#B8923A]/30 cursor-pointer group relative"
                >
                  <img
                    src={url}
                    alt={`ภาพประกอบ ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#2A1245]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#FAF7F0] text-xs font-sans">
                    ดูภาพขยาย
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox for gallery */}
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              index={lightboxIndex}
              slides={gallerySlides}
            />
          </div>
        )}

        {/* Attached Downloads (if available) */}
        {news.attachments && news.attachments.length > 0 && (
          <div className="my-8 p-5 bg-[#EDE6F5]/40 rounded-[4px] border border-[#B8923A]/30">
            <h4 className="text-sm font-sans font-semibold text-[#4B1F7A] mb-3 flex items-center gap-2">
              <FileArrowDown weight="light" className="w-4 h-4 text-[#9C7A2B]" />
              <span>เอกสารแนบสำหรับดาวน์โหลด</span>
            </h4>
            <div className="space-y-2">
              {news.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-[3px] bg-[#FAF7F0] border border-[#B8923A]/20 hover:border-[#4B1F7A] transition-colors group"
                >
                  <span className="text-xs sm:text-sm font-medium text-[#1B1226] group-hover:text-[#4B1F7A] truncate pr-2">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#9C7A2B] shrink-0 font-sans">
                    ดาวน์โหลด {file.size ? `(${file.size})` : ""}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share Bar */}
        <div className="py-6 border-t border-b border-[#B8923A]/20 my-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-sans text-[#1B1226]/70">
            <ShareNetwork weight="light" className="w-4 h-4 text-[#9C7A2B]" />
            <span>แบ่งปันข่าวนี้:</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Facebook Share */}
            <button
              onClick={handleShareFacebook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#B8923A]/30 text-xs font-sans hover:bg-[#EDE6F5] transition-colors"
            >
              <FacebookLogo weight="light" className="w-4 h-4 text-[#4B1F7A]" />
              <span>Facebook</span>
            </button>

            {/* LINE Share */}
            <button
              onClick={handleShareLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#B8923A]/30 text-xs font-sans hover:bg-[#EDE6F5] transition-colors"
            >
              <ChatCircleText weight="light" className="w-4 h-4 text-[#2F6B4F]" />
              <span>LINE</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#B8923A]/30 text-xs font-sans hover:bg-[#EDE6F5] transition-colors relative"
            >
              {copied ? (
                <>
                  <Check weight="bold" className="w-4 h-4 text-[#2F6B4F]" />
                  <span className="text-[#2F6B4F]">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy weight="light" className="w-4 h-4 text-[#9C7A2B]" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related News (3 items) */}
        {related.length > 0 && (
          <div className="my-12">
            <h3 className="font-serif text-2xl font-bold text-[#1B1226] mb-6">
              ข่าวสารที่เกี่ยวข้อง
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/read/${item.id}`}
                  data-cursor="news"
                  className="group flex flex-col justify-between bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden p-3 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="aspect-[16/10] rounded-[2px] overflow-hidden bg-[#EDE6F5] mb-3">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] text-[#9C7A2B] font-sans font-medium uppercase tracking-wider block mb-1">
                      {NEWS_CATEGORY_NAMES[item.category] || "ข่าว"}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#1B1226] group-hover:text-[#4B1F7A] line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#1B1226]/50 mt-3 font-sans block">
                    {formatThaiDate(item.createdAt, { shortMonth: true })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
export default NewsDetailPage;
