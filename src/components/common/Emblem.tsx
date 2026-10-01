import React from "react";
import { EMBLEM_URL } from "@/src/config/site";

interface EmblemProps {
  className?: string;
  size?: number | string;
  theme?: "on-paper" | "on-dark" | "raw";
  alt?: string;
  priority?: boolean;
}

/**
 * คอมโพเนนต์ตราองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา
 * รองรับการแสดงผลทั้งบนพื้นหลัง paper (ใช้ multiply) และบนพื้นหลังม่วงเข้ม (รองด้วยวงกลม champagne)
 * 
 * หมายเหตุ: หากลิงก์ภายนอกมีปัญหา สามารถนำไฟล์ IMG-5744.png มาวางที่ /public/emblem.png
 * และแก้ไขตัวแปร EMBLEM_URL ใน /src/config/site.ts ได้ทันที
 */
export const Emblem: React.FC<EmblemProps> = ({
  className = "",
  size = 48,
  theme = "on-paper",
  alt = "ตราองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
  priority = false,
}) => {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  if (theme === "on-dark") {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-[#F3E9D0] p-1 shadow-sm border border-[#B8923A]/30 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <img
          src={EMBLEM_URL}
          alt={alt}
          width={typeof size === "number" ? size : 48}
          height={typeof size === "number" ? size : 48}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-contain mix-blend-multiply"
          onError={(e) => {
            // Fallback gracefully if external image fails
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-block shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <img
        src={EMBLEM_URL}
        alt={alt}
        width={typeof size === "number" ? size : 48}
        height={typeof size === "number" ? size : 48}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`w-full h-full object-contain ${theme === "on-paper" ? "mix-blend-multiply" : ""}`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    </div>
  );
};
