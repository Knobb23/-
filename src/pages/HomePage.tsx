import React from "react";
import { motion } from "motion/react";
import { HeroSection } from "@/src/components/home/HeroSection";
import { Ticker } from "@/src/components/layout/Ticker";
import { FeaturedNewsSection } from "@/src/components/home/FeaturedNewsSection";
import { StatsSection } from "@/src/components/home/StatsSection";
import { UpcomingEventsSection } from "@/src/components/home/UpcomingEventsSection";
import { ServicesSection } from "@/src/components/home/ServicesSection";
import { GallerySection } from "@/src/components/home/GallerySection";
import { PresidentSection } from "@/src/components/home/PresidentSection";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  delay?: number;
}

const ScrollRevealSection: React.FC<ScrollRevealSectionProps> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Announcements Ticker (positioned right below Hero as per spec 4.1) */}
      <Ticker />

      {/* 01: Featured News */}
      <ScrollRevealSection>
        <FeaturedNewsSection />
      </ScrollRevealSection>

      {/* 02: Real-time & Count-up Statistics */}
      <ScrollRevealSection>
        <StatsSection />
      </ScrollRevealSection>

      {/* 03: Upcoming Events Embla Carousel */}
      <ScrollRevealSection>
        <UpcomingEventsSection />
      </ScrollRevealSection>

      {/* 04: Services & Direct Shortcuts Index */}
      <ScrollRevealSection>
        <ServicesSection />
      </ScrollRevealSection>

      {/* 05: Activity Photos Masonry Gallery with Lightbox */}
      <ScrollRevealSection>
        <GallerySection />
      </ScrollRevealSection>

      {/* 06: Editorial President Greeting */}
      <ScrollRevealSection>
        <PresidentSection />
      </ScrollRevealSection>
    </div>
  );
};
export default HomePage;
