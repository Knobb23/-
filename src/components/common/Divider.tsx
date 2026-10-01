import React from "react";

interface DividerProps {
  className?: string;
  variant?: "light" | "dark";
}

/**
 * เส้นคั่นส่วน (Divider): เส้นทองบาง 1px ตรงกลางมีรูปข้าวหลามตัดเล็ก ◆
 */
export const Divider: React.FC<DividerProps> = ({ className = "", variant = "light" }) => {
  const lineColor = variant === "light" ? "bg-[#B8923A]/30" : "bg-[#D9B867]/30";
  const diamondColor = variant === "light" ? "text-[#9C7A2B]" : "text-[#D9B867]";

  return (
    <div className={`flex items-center justify-center w-full py-6 ${className}`} aria-hidden="true">
      <div className={`h-[1px] flex-1 max-w-[200px] ${lineColor}`} />
      <span className={`mx-3 text-[10px] select-none ${diamondColor}`}>◆</span>
      <div className={`h-[1px] flex-1 max-w-[200px] ${lineColor}`} />
    </div>
  );
};
