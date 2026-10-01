import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  FacebookLogo,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  IdentificationCard,
} from "@phosphor-icons/react";
import { SITE_CONFIG } from "@/src/config/site";
import { Emblem } from "@/src/components/common/Emblem";
import { Divider } from "@/src/components/common/Divider";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2A1245] text-[#FAF7F0] pt-16 sm:pt-20 pb-12 relative z-20 border-t border-[#B8923A]/30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-12">
          {/* Col 1: Identity & Description & Direct Quick Action Buttons (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-4">
              <Emblem size={52} theme="on-dark" />
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FAF7F0]">
                  องค์การนักเรียน
                </h3>
                <p className="text-xs sm:text-sm text-[#D9B867] font-medium">
                  {SITE_CONFIG.schoolName}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#FAF7F0]/75 leading-relaxed pr-2 pt-1">
              องค์กรตัวแทนนักเรียนเพื่อพิทักษ์สิทธิ ส่งเสริมความคิดสร้างสรรค์
              และเชื่อมโยงความร่วมมือระหว่างนักเรียน คณะครู และโรงเรียน
              สร้างสรรค์สังคมแห่งการเรียนรู้ที่เปี่ยมด้วยความสุข
            </p>

            {/* Quick Action External Links */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={SITE_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/20 text-xs text-[#FAF7F0] transition-colors border border-[#FAF7F0]/10 group"
                title="เข้าสู่ Facebook เพจองค์การนักเรียน"
              >
                <div className="flex items-center gap-2">
                  <FacebookLogo weight="light" className="w-4 h-4 text-[#D9B867]" />
                  <span>Facebook เพจองค์การนักเรียน</span>
                </div>
                <ArrowUpRight weight="light" className="w-3.5 h-3.5 text-[#FAF7F0]/60 group-hover:text-[#D9B867] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={SITE_CONFIG.academicSystemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/20 text-xs text-[#FAF7F0] transition-colors border border-[#FAF7F0]/10 group"
                title="เข้าสู่ระบบบริหารงานวิชาการ"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap weight="light" className="w-4 h-4 text-[#D9B867]" />
                  <span>ระบบบริหารงานวิชาการ</span>
                </div>
                <ArrowUpRight weight="light" className="w-3.5 h-3.5 text-[#FAF7F0]/60 group-hover:text-[#D9B867] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={SITE_CONFIG.studentAffairsSystemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/20 text-xs text-[#FAF7F0] transition-colors border border-[#FAF7F0]/10 group"
                title="เข้าสู่ระบบบริหารงานกิจการนักเรียน"
              >
                <div className="flex items-center gap-2">
                  <IdentificationCard weight="light" className="w-4 h-4 text-[#D9B867]" />
                  <span>ระบบบริหารงานกิจการนักเรียน</span>
                </div>
                <ArrowUpRight weight="light" className="w-3.5 h-3.5 text-[#FAF7F0]/60 group-hover:text-[#D9B867] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 columns: Main Nav, About Org, Related Systems) (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 1. Main Nav */}
            <div>
              <h4 className="text-xs font-semibold text-[#D9B867] tracking-widest uppercase mb-4">
                เมนูหลัก
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F0]/80">
                <li>
                  <Link to="/" className="hover:text-[#D9B867] transition-colors">
                    หน้าแรก
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-[#D9B867] transition-colors">
                    ข่าวประชาสัมพันธ์
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="hover:text-[#D9B867] transition-colors">
                    ปฏิทินกิจกรรม
                  </Link>
                </li>
                <li>
                  <Link to="/downloads" className="hover:text-[#D9B867] transition-colors">
                    ดาวน์โหลดเอกสาร
                  </Link>
                </li>
              </ul>
            </div>

            {/* 2. Organization Info */}
            <div>
              <h4 className="text-xs font-semibold text-[#D9B867] tracking-widest uppercase mb-4">
                ข้อมูลองค์การ
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F0]/80">
                <li>
                  <Link to="/about/emblem" className="hover:text-[#D9B867] transition-colors">
                    ตราสัญลักษณ์
                  </Link>
                </li>
                <li>
                  <Link to="/about/authority" className="hover:text-[#D9B867] transition-colors">
                    อำนาจหน้าที่
                  </Link>
                </li>
                <li>
                  <Link to="/about/board" className="hover:text-[#D9B867] transition-colors">
                    คณะกรรมการ
                  </Link>
                </li>
                <li>
                  <Link to="/transparency" className="hover:text-[#D9B867] transition-colors">
                    ความโปร่งใส
                  </Link>
                </li>
                <li>
                  <Link to="/complaint" className="hover:text-[#D9B867] transition-colors text-[#D9B867]">
                    ส่งเรื่องร้องเรียน
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. Related Systems */}
            <div>
              <h4 className="text-xs font-semibold text-[#D9B867] tracking-widest uppercase mb-4">
                ระบบที่เกี่ยวข้อง
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F0]/80">
                <li>
                  <a
                    href={SITE_CONFIG.academicSystemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D9B867] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>ระบบบริหารงานวิชาการ</span>
                    <ArrowUpRight weight="light" className="w-3 h-3 text-[#FAF7F0]/40 group-hover:text-[#D9B867] transition-colors" />
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.studentAffairsSystemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D9B867] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>ระบบบริหารงานกิจการนักเรียน</span>
                    <ArrowUpRight weight="light" className="w-3 h-3 text-[#FAF7F0]/40 group-hover:text-[#D9B867] transition-colors" />
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D9B867] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>เพจ Facebook องค์การ</span>
                    <ArrowUpRight weight="light" className="w-3 h-3 text-[#FAF7F0]/40 group-hover:text-[#D9B867] transition-colors" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Contact Info (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-[#D9B867] tracking-widest uppercase mb-4">
              ติดต่อเรา
            </h4>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#FAF7F0]/75">
              <MapPin weight="light" className="w-4 h-4 text-[#D9B867] shrink-0 mt-1" />
              <span>{SITE_CONFIG.address}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#FAF7F0]/75">
              <Phone weight="light" className="w-4 h-4 text-[#D9B867] shrink-0" />
              <span>{SITE_CONFIG.phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#FAF7F0]/75">
              <EnvelopeSimple weight="light" className="w-4 h-4 text-[#D9B867] shrink-0" />
              <span>{SITE_CONFIG.email}</span>
            </div>
          </div>
        </div>

        {/* Golden Diamond Divider */}
        <Divider variant="dark" />

        {/* Bottom Bar: Copyright & Navigation Shortcuts */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F0]/60 gap-4">
          <p>© 2569 องค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={SITE_CONFIG.academicSystemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D9B867] transition-colors"
            >
              ระบบวิชาการ
            </a>
            <span className="text-[#D9B867]/40">·</span>
            <a
              href={SITE_CONFIG.studentAffairsSystemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D9B867] transition-colors"
            >
              ระบบกิจการนักเรียน
            </a>
            <span className="text-[#D9B867]/40">·</span>
            <Link
              to="/about/authority"
              className="hover:text-[#D9B867] transition-colors"
            >
              ธรรมนูญนักเรียน
            </Link>
            <span className="text-[#D9B867]/40">·</span>
            <Link
              to="/contact"
              className="hover:text-[#D9B867] transition-colors"
            >
              แผนที่โรงเรียน
            </Link>
            <span className="text-[#D9B867]/40">·</span>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-[#D9B867]/60 hover:text-[#D9B867] transition-colors"
              title="เข้าสู่ระบบผู้ดูแล"
            >
              <ShieldCheck weight="light" className="w-3.5 h-3.5" />
              <span>สำหรับแอดมิน</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
