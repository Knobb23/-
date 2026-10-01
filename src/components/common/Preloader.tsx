import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Emblem } from "./Emblem";

export const Preloader: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session
    const hasLoaded = sessionStorage.getItem("desup_preloader_seen");
    if (!hasLoaded) {
      setShow(true);
      // Automatically finish within 1.5s
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("desup_preloader_seen", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#2A1245] text-[#FAF7F0] select-none"
        >
          {/* Subtle background ornamentation */}
          <div className="relative flex flex-col items-center">
            {/* Emblem with Animated Golden SVG Ring */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-5">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="#FAF7F0"
                  strokeOpacity="0.1"
                  strokeWidth="1.5"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="#D9B867"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              {/* Reveal Emblem */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 flex items-center justify-center"
              >
                <Emblem theme="on-dark" size={60} priority />
              </motion.div>
            </div>

            {/* School / Student Org Text Reveal */}
            <div className="overflow-hidden text-center">
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#FAF7F0]">
                  องค์การนักเรียน
                </p>
                <p className="text-xs sm:text-sm font-sans tracking-wider text-[#D9B867] mt-1">
                  โรงเรียนสาธิตมหาวิทยาลัยพะเยา
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
