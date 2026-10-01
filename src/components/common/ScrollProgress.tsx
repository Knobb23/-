import React from "react";
import { motion, useScroll } from "motion/react";

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#B8923A] z-[9995] origin-left pointer-events-none"
      style={{ scaleX: scrollYProgress }}
    />
  );
};
