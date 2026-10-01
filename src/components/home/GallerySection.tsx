import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowsOutSimple, CalendarBlank, X } from "@phosphor-icons/react";
import { GalleryPhoto } from "@/src/types";
import { getGalleryPhotos } from "@/src/lib/dataService";
import { formatThaiDate } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

export const GallerySection: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    getGalleryPhotos().then(setPhotos);
  }, []);

  if (!photos.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F0] border-t border-[#B8923A]/15">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <SectionHeading
          number="05"
          eyebrow="GALLERY · ประมวลภาพความทรงจำ"
          title="ภาพบรรยากาศกิจกรรมนักเรียน"
          description="บันทึกเรื่องราว ความคิดสร้างสรรค์ และพลังความร่วมมือของชาวสาธิต ม.พะเยา"
          actionText="ชมภาพข่าวกิจกรรมทั้งหมด"
          actionHref="/news/activities"
        />

        {/* Editorial Masonry Grid (6 photos with varying ratios 4:5, 3:2, 1:1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((item, index) => {
            // Apply varied aspect ratios
            const aspectClass =
              item.aspect === "4:5"
                ? "aspect-[4/5]"
                : item.aspect === "3:2"
                ? "aspect-[3/2]"
                : "aspect-square";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`group relative rounded-[4px] overflow-hidden border border-[#B8923A]/30 bg-[#EDE6F5] cursor-pointer shadow-[0_1px_0_rgba(42,18,69,.06)] hover:shadow-[0_12px_24px_-8px_rgba(42,18,69,.16)] transition-all duration-300 ${aspectClass}`}
              >
                {/* Photo */}
                <img
                  src={item.url}
                  alt={item.title}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Offset gold frame on hover */}
                <div className="absolute inset-2 border border-[#D9B867] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Dark Vignette Overlay with Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1245]/90 via-[#2A1245]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-[#FAF7F0]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#D9B867] mb-1 font-sans">
                    <CalendarBlank weight="light" className="w-3.5 h-3.5" />
                    <span>{formatThaiDate(item.date)}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#FAF7F0]/80">
                    <ArrowsOutSimple weight="light" className="w-3.5 h-3.5 text-[#D9B867]" />
                    <span>คลิกเพื่อดูภาพขยาย</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99990] bg-[#1B1226]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#FAF7F0] rounded-[4px] border border-[#B8923A]/40 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#2A1245]/70 text-[#FAF7F0] hover:bg-[#2A1245] transition-colors"
              aria-label="ปิดภาพขยาย"
            >
              <X weight="light" className="w-5 h-5" />
            </button>

            {/* Enlarged Image */}
            <div className="max-h-[70vh] bg-[#EDE6F5] overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            {/* Caption bar */}
            <div className="p-6 bg-[#FAF7F0]">
              <div className="flex items-center gap-2 text-xs text-[#9C7A2B] font-sans font-medium mb-1.5">
                <span>{formatThaiDate(selectedPhoto.date)}</span>
                <span>·</span>
                <span>บันทึกภาพกิจกรรม</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                {selectedPhoto.title}
              </h3>
              <p className="text-sm text-[#1B1226]/75 mt-1 font-sans leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
