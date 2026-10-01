import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Preloader } from "@/src/components/common/Preloader";
import { ScrollProgress } from "@/src/components/common/ScrollProgress";
import { CustomCursor } from "@/src/components/common/CustomCursor";

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scroll using Lenis (auto-disabled if reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#FAF7F0] text-[#1B1226] flex flex-col font-sans selection:bg-[#EDE6F5] selection:text-[#2A1245]">
      {/* Paper Grain Overlay */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* Top 2px Golden Scroll Progress Bar */}
      <ScrollProgress />

      {/* First-visit Session Preloader */}
      <Preloader />

      {/* Custom 28px/56px Gold Ring Cursor */}
      <CustomCursor />

      {/* Sticky Smart Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
