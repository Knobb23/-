import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CaretDown, ArrowRight } from "@phosphor-icons/react";
import { MAIN_NAV, SITE_CONFIG } from "@/src/config/site";
import { Emblem } from "@/src/components/common/Emblem";
import { AnimatePresence, motion } from "motion/react";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  // Scroll direction detection (hide on scroll down, show on scroll up)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // Scrolling down -> hide
        setIsVisible(false);
        setActiveDropdown(null);
      } else {
        // Scrolling up -> show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-[#FAF7F0]/92 backdrop-blur-md border-b border-[#B8923A]/25 shadow-[0_4px_20px_-10px_rgba(42,18,69,0.06)]"
            : "bg-[#FAF7F0]"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12 h-20 sm:h-24 flex items-center justify-between">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-3.5 group select-none py-1">
            <Emblem size={46} theme="on-paper" className="transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="foil-gold-text font-serif text-lg sm:text-xl font-bold tracking-tight leading-snug">
                องค์การนักเรียน
              </span>
              <span className="text-[11px] sm:text-xs text-[#1B1226]/75 font-sans font-medium tracking-wide">
                {SITE_CONFIG.schoolName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {MAIN_NAV.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);

              return (
                <div
                  key={item.label}
                  className="relative py-2"
                  onMouseEnter={() => hasChildren && setActiveDropdown(item.label)}
                  onMouseLeave={() => hasChildren && setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium tracking-wide transition-colors ${
                      isActive
                        ? "text-[#4B1F7A] font-semibold"
                        : "text-[#1B1226]/85 hover:text-[#4B1F7A]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasChildren && (
                      <CaretDown
                        weight="light"
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-[#9C7A2B] ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Mega-panel dropdown */}
                  {hasChildren && activeDropdown === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 xl:w-96 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] shadow-[0_12px_28px_-8px_rgba(42,18,69,0.14)] p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="text-[11px] font-semibold text-[#9C7A2B] tracking-widest uppercase px-3 py-1 border-b border-[#B8923A]/20 mb-2">
                        {item.description || item.label}
                      </div>
                      <div className="space-y-1">
                        {item.children?.map((child) => {
                          const isExternal = child.isExternal || child.href.startsWith("http");
                          if (isExternal) {
                            return (
                              <a
                                key={child.label}
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-3 py-2 rounded-[3px] hover:bg-[#EDE6F5] transition-colors group/item"
                              >
                                <div className="text-sm font-medium text-[#1B1226] group-hover/item:text-[#4B1F7A] flex items-center justify-between">
                                  <span>{child.label}</span>
                                  <span className="text-xs text-[#9C7A2B] opacity-70 group-hover/item:opacity-100 transition-opacity">
                                    ↗
                                  </span>
                                </div>
                                <div className="text-xs text-[#1B1226]/65 mt-0.5 line-clamp-1">
                                  {child.description}
                                </div>
                              </a>
                            );
                          }
                          return (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-3 py-2 rounded-[3px] hover:bg-[#EDE6F5] transition-colors group/item"
                            >
                              <div className="text-sm font-medium text-[#1B1226] group-hover/item:text-[#4B1F7A] flex items-center justify-between">
                                <span>{child.label}</span>
                                <span className="text-xs text-[#9C7A2B] opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  →
                                </span>
                              </div>
                              <div className="text-xs text-[#1B1226]/65 mt-0.5 line-clamp-1">
                                {child.description}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Header Action: Primary CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/complaint"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-medium tracking-wide shadow-sm hover:bg-[#2A1245] transition-all duration-300 group border border-[#D9B867]/40 ring-2 ring-[#D9B867]/20 ring-inset"
            >
              <span>ส่งเสียงถึงองค์การ</span>
              <ArrowRight
                weight="light"
                className="w-3.5 h-3.5 text-[#D9B867] transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Mobile Hamburger Button (2 thin lines turning into X) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1B1226] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center relative">
              <span
                className={`w-6 h-[1.5px] bg-[#1B1226] transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "rotate-45 translate-y-[9px] bg-[#FAF7F0]" : ""
                }`}
              />
              <span
                className={`w-6 h-[1.5px] bg-[#1B1226] transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-[9px] bg-[#FAF7F0]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#2A1245] text-[#FAF7F0] lg:hidden flex flex-col justify-between p-6 sm:p-10 overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#FAF7F0]/10 pb-5">
                <div className="flex items-center gap-3">
                  <Emblem size={40} theme="on-dark" />
                  <span className="font-serif text-lg font-bold text-[#FAF7F0]">
                    องค์การนักเรียน
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#FAF7F0] text-sm hover:text-[#D9B867]"
                >
                  ✕ ปิด
                </button>
              </div>

              {/* Main Links List */}
              <nav className="mt-8 space-y-4">
                {MAIN_NAV.map((item, idx) => {
                  const isItemExternal = item.isExternal || item.href.startsWith("http");

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    >
                      {isItemExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between font-serif text-2xl text-[#FAF7F0] hover:text-[#D9B867] transition-colors py-1.5"
                        >
                          <span>{item.label}</span>
                          <span className="text-base text-[#D9B867]">↗</span>
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-serif text-2xl text-[#FAF7F0] hover:text-[#D9B867] transition-colors py-1.5"
                        >
                          {item.label}
                        </Link>
                      )}
                      {item.children && (
                        <div className="ml-4 mt-1 border-l border-[#FAF7F0]/20 pl-3 space-y-2">
                          {item.children.map((child) => {
                            const isChildExternal = child.isExternal || child.href.startsWith("http");
                            if (isChildExternal) {
                              return (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center justify-between text-sm text-[#FAF7F0]/80 hover:text-[#D9B867] py-1"
                                >
                                  <span>{child.label}</span>
                                  <span className="text-xs text-[#D9B867]/80">↗</span>
                                </a>
                              );
                            }
                            return (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm text-[#FAF7F0]/70 hover:text-[#D9B867] py-1"
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Bottom CTA */}
            <div className="pt-8 border-t border-[#FAF7F0]/10 mt-8">
              <Link
                to="/complaint"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-base font-medium border border-[#D9B867]/50 shadow-md"
              >
                <span>ส่งเสียงถึงองค์การ (ร้องเรียน/เสนอแนะ)</span>
                <ArrowRight weight="light" className="w-4 h-4 text-[#D9B867]" />
              </Link>
              <p className="text-center text-xs text-[#FAF7F0]/50 mt-4">
                {SITE_CONFIG.schoolName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
