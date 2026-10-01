import React from "react";
import { HeroSection } from "@/src/components/home/HeroSection";
import { Ticker } from "@/src/components/layout/Ticker";
import { FeaturedNewsSection } from "@/src/components/home/FeaturedNewsSection";
import { StatsSection } from "@/src/components/home/StatsSection";
import { UpcomingEventsSection } from "@/src/components/home/UpcomingEventsSection";
import { ServicesSection } from "@/src/components/home/ServicesSection";
import { GallerySection } from "@/src/components/home/GallerySection";
import { PresidentSection } from "@/src/components/home/PresidentSection";

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Announcements Ticker (positioned right below Hero as per spec 4.1) */}
      <Ticker />

      {/* 01: Featured News */}
      <FeaturedNewsSection />

      {/* 02: Real-time & Count-up Statistics */}
      <StatsSection />

      {/* 03: Upcoming Events Embla Carousel */}
      <UpcomingEventsSection />

      {/* 04: Services & Direct Shortcuts Index */}
      <ServicesSection />

      {/* 05: Activity Photos Masonry Gallery with Lightbox */}
      <GallerySection />

      {/* 06: Editorial President Greeting */}
      <PresidentSection />
    </div>
  );
};
export default HomePage;
