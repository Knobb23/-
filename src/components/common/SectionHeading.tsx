import React from "react";

interface SectionHeadingProps {
  number?: string; // e.g. "01", "02"
  eyebrow?: string; // e.g. "NEWS · ข่าวประชาสัมพันธ์"
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  theme?: "light" | "dark";
  align?: "left" | "center" | "split";
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  number,
  eyebrow,
  title,
  description,
  actionText,
  actionHref,
  theme = "light",
  align = "split",
}) => {
  const isDark = theme === "dark";
  const numColor = isDark ? "text-[#D9B867]/40" : "text-[#B8923A]/30";
  const eyebrowColor = isDark ? "text-[#D9B867]" : "text-[#9C7A2B]";
  const titleColor = isDark ? "text-[#FAF7F0]" : "text-[#1B1226]";
  const descColor = isDark ? "text-[#FAF7F0]/80" : "text-[#1B1226]/80";

  return (
    <div className={`mb-10 lg:mb-14 ${align === "center" ? "text-center mx-auto max-w-2xl" : ""}`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {/* Eyebrow and Section Number */}
          <div className="flex items-center gap-3 mb-2.5">
            {number && (
              <span className={`font-num text-2xl lg:text-3xl font-semibold tracking-wider ${numColor}`}>
                {number}
              </span>
            )}
            {number && <span className={`text-[9px] ${numColor}`}>◆</span>}
            {eyebrow && (
              <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${eyebrowColor}`}>
                {eyebrow}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif leading-tight ${titleColor}`}>
            {title}
          </h2>

          {description && (
            <p className={`mt-2.5 text-base sm:text-lg max-w-2xl leading-relaxed ${descColor}`}>
              {description}
            </p>
          )}
        </div>

        {/* Action Link (if split layout) */}
        {actionText && actionHref && align === "split" && (
          <div className="shrink-0 pt-2 md:pt-0">
            <a
              href={actionHref}
              className="editorial-btn-secondary text-sm font-medium tracking-wide group"
            >
              <span>{actionText}</span>
              <span className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1 text-[#9C7A2B]">
                →
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
