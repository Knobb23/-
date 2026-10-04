import React, { useEffect, useRef } from "react";
import { Outlet, useLocation, useRouteError, Link } from "react-router-dom";
import Lenis from "lenis";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Preloader } from "@/src/components/common/Preloader";
import { ScrollProgress } from "@/src/components/common/ScrollProgress";
import { CustomCursor } from "@/src/components/common/CustomCursor";

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const routeError = useRouteError();
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
        {routeError ? (
          <div className="py-20 px-4 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-[6px] border border-[#B8923A]/30 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-xl font-bold">
                !
              </div>
              <h2 className="text-xl font-bold font-serif text-[#1B1226]">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h2>
              <p className="text-xs text-[#1B1226]/70 leading-relaxed font-sans">
                {routeError instanceof Error ? routeError.message : "ขออภัย ระบบไม่สามารถเปิดหน้านี้ได้ในขณะนี้"}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded bg-[#FAF7F0] border border-[#B8923A] text-[#1B1226] text-xs font-semibold hover:bg-[#EDE6F5] transition-colors"
                >
                  โหลดใหม่
                </button>
                <Link
                  to="/"
                  onClick={() => {
                    if (window.location.pathname !== "/") {
                      window.location.href = "/";
                    }
                  }}
                  className="px-4 py-2 rounded bg-[#4B1F7A] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A1245] transition-colors"
                >
                  กลับสู่หน้าแรก
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
