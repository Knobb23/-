import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { Emblem } from "@/src/components/common/Emblem";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center bg-[#FAF7F0]">
      {/* Small subtle emblem */}
      <div className="mb-6 opacity-80">
        <Emblem size={64} theme="on-paper" />
      </div>

      {/* 404 with golden stroked font */}
      <h1
        className="font-num text-8xl sm:text-9xl md:text-[11rem] font-bold leading-none tracking-tight select-none"
        style={{
          WebkitTextStroke: "2px #B8923A",
          color: "transparent",
        }}
      >
        404
      </h1>

      {/* Friendly Thai copy as specified in prompt */}
      <p className="mt-6 text-xl sm:text-2xl font-serif font-bold text-[#1B1226]">
        หน้านี้หายไปเหมือนการบ้านที่ลืมส่ง
      </p>

      <p className="mt-2 text-sm sm:text-base text-[#1B1226]/70 max-w-md font-sans">
        ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา ลิงก์อาจถูกย้าย หรือหน้าเว็บอาจยังไม่เปิดให้บริการในขณะนี้
      </p>

      {/* Back to Home CTA button */}
      <div className="mt-8">
        <Link
          to="/"
          className="relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] font-sans font-medium text-sm shadow-md hover:bg-[#2A1245] transition-all duration-300 group border border-[#D9B867]/40 ring-2 ring-[#D9B867]/20 ring-inset"
        >
          <ArrowLeft
            weight="light"
            className="w-4 h-4 text-[#D9B867] transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span>กลับสู่หน้าแรก</span>
        </Link>
      </div>
    </div>
  );
};
