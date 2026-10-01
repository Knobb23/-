import React, { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringNews, setIsHoveringNews] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Soft spring physics for smooth following
  const mouseX = useSpring(0, { stiffness: 350, damping: 28 });
  const mouseY = useSpring(0, { stiffness: 350, damping: 28 });

  useEffect(() => {
    // Only enable on desktop fine pointer devices
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const newsCard = target.closest('[data-cursor="news"]');
      setIsHoveringNews(!!newsCard);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isFinePointer || !isVisible) return null;

  const size = isHoveringNews ? 56 : 28;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9990] flex items-center justify-center rounded-full border border-[#B8923A]/80 transition-[width,height,background-color] duration-300"
      style={{
        x: mouseX,
        y: mouseY,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: isHoveringNews ? "rgba(75, 31, 122, 0.9)" : "transparent",
        backdropFilter: isHoveringNews ? "blur(2px)" : "none",
        boxShadow: isHoveringNews ? "0 4px 12px rgba(42,18,69,0.25)" : "none",
      }}
    >
      {isHoveringNews && (
        <span className="text-[11px] font-sans font-medium text-[#FAF7F0] select-none tracking-wider">
          อ่าน
        </span>
      )}
    </motion.div>
  );
};
