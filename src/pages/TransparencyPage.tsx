import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FileText,
  TrendUp,
  Clock,
  CheckCircle,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { BudgetYearData, SiteStatistics } from "@/src/types";
import { getBudget, getSiteStatistics } from "@/src/lib/dataService";
import { formatCurrency, formatThaiDate } from "@/src/lib/format";
import { SectionHeading } from "@/src/components/common/SectionHeading";

// Donut Chart Palette conforming to 70/20/10 design tokens
const DONUT_COLORS = [
  "#4B1F7A", // violet-700
  "#6B3FA0", // violet-500
  "#9C7A2B", // gold-600
  "#B8923A", // gold-500
  "#2F6B4F", // deep green
  "#544368", // grey-violet
];

const COMPLAINT_TYPE_DATA = [
  { name: "เรื่องร้องเรียนทั่วไป", value: 38 },
  { name: "ข้อเสนอแนะเพื่อพัฒนา", value: 24 },
  { name: "ติดต่อสอบถามข้อมูล", value: 12 },
  { name: "แจ้งเบาะแส/ความเป็นธรรม", value: 6 },
  { name: "คำชมเชยและกำลังใจ", value: 4 },
];

const MONTHLY_STATS_DATA = [
  { month: "พ.ค.", received: 14, resolved: 14 },
  { month: "มิ.ย.", received: 18, resolved: 17 },
  { month: "ก.ค.", received: 22, resolved: 21 },
  { month: "ส.ค.", received: 16, resolved: 15 },
  { month: "ก.ย.", received: 14, resolved: 11 },
];

export const TransparencyPage: React.FC = () => {
  const [stats, setStats] = useState<SiteStatistics | null>(null);
  const [budget, setBudget] = useState<BudgetYearData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2569);

  useEffect(() => {
    getSiteStatistics().then(setStats);
    getBudget(selectedYear).then(setBudget);
  }, [selectedYear]);

  const totalSpent = budget?.items.reduce((acc, item) => acc + item.spent, 0) || 0;
  const totalApproved = budget?.items.reduce((acc, item) => acc + item.approved, 0) || 0;
  const remainingBudget = (budget?.totalBudget || 0) - totalSpent;
  const spentPercent = budget?.totalBudget ? (totalSpent / budget.totalBudget) * 100 : 0;

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Heading */}
        <SectionHeading
          number="06"
          eyebrow="OPEN GOVERNANCE · รายงานความโปร่งใส"
          title="ความโปร่งใสและรายงานการดำเนินงาน"
          description="การเปิดเผยข้อมูลสถิติการรับเรื่องร้องเรียน การบริหารงบประมาณ และรายงานการประชุมสภานักเรียน"
          align="left"
        />

        {/* 1. Summary Metrics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
            {/* Card 1 */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <span className="text-xs font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase">
                เรื่องร้องเรียนทั้งหมด
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-num text-4xl font-bold text-[#1B1226] tabular-nums">
                  {stats.totalComplaints}
                </span>
                <span className="text-xs text-[#1B1226]/60 font-sans">เรื่อง</span>
              </div>
              <p className="text-xs text-[#1B1226]/60 mt-1 font-sans">
                ประจำปีการศึกษา 2569
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <span className="text-xs font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase">
                ดำเนินการเสร็จสิ้น
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-num text-4xl font-bold text-[#2F6B4F] tabular-nums">
                  {stats.resolvedPercentage}%
                </span>
                <span className="text-xs text-[#1B1226]/60 font-sans">({stats.resolvedComplaints} เรื่อง)</span>
              </div>
              <p className="text-xs text-[#1B1226]/60 mt-1 font-sans">
                อัตราการแก้ไขปัญหาสำเร็จ
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <span className="text-xs font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase">
                ระยะเวลาเฉลี่ยในการปิดเรื่อง
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-num text-4xl font-bold text-[#4B1F7A] tabular-nums">
                  {stats.avgResolutionDays}
                </span>
                <span className="text-xs text-[#1B1226]/60 font-sans">วันทำการ</span>
              </div>
              <p className="text-xs text-[#1B1226]/60 mt-1 font-sans">
                นับจากวันที่ได้รับข้อมูล
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)]">
              <span className="text-xs font-sans font-semibold tracking-wider text-[#9C7A2B] uppercase">
                กิจกรรมตลอดปีการศึกษา
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-num text-4xl font-bold text-[#B8923A] tabular-nums">
                  {stats.activitiesThisYear}
                </span>
                <span className="text-xs text-[#1B1226]/60 font-sans">โครงการ</span>
              </div>
              <p className="text-xs text-[#1B1226]/60 mt-1 font-sans">
                ครอบคลุม 6 ฝ่ายงาน
              </p>
            </div>
          </div>
        )}

        {/* 2. Recharts Charts Grid (Donut Chart + Monthly Bar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-12">
          {/* Donut Chart: By Type (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#B8923A]/30 p-6 sm:p-7 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)] flex flex-col justify-between">
            <div>
              <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase block">
                สัดส่วนจำแนกตามประเภท
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1B1226] mt-1">
                การจำแนกประเภทเรื่องร้องเรียน
              </h3>
            </div>

            <div className="w-full h-64 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COMPLAINT_TYPE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {COMPLAINT_TYPE_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF7F0",
                      borderColor: "#B8923A",
                      borderRadius: "3px",
                      fontSize: "12px",
                      fontFamily: "IBM Plex Sans Thai",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#B8923A]/15 text-xs font-sans text-[#1B1226]/80">
              {COMPLAINT_TYPE_DATA.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                  />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Monthly Stats (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#B8923A]/30 p-6 sm:p-7 rounded-[4px] shadow-[0_1px_0_rgba(42,18,69,.06)] flex flex-col justify-between">
            <div>
              <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase block">
                แนวโน้มรายเดือน
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1B1226] mt-1">
                จำนวนเรื่องที่รับเข้า และดำเนินการแล้วเสร็จ
              </h3>
            </div>

            <div className="w-full h-64 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_STATS_DATA} barGap={4}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#1B1226", fontFamily: "IBM Plex Sans Thai" }}
                    stroke="#B8923A"
                    strokeWidth={0.5}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#1B1226", fontFamily: "IBM Plex Sans Thai" }}
                    stroke="#B8923A"
                    strokeWidth={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF7F0",
                      borderColor: "#B8923A",
                      borderRadius: "3px",
                      fontSize: "12px",
                      fontFamily: "IBM Plex Sans Thai",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", fontFamily: "IBM Plex Sans Thai" }}
                  />
                  <Bar
                    dataKey="received"
                    name="รับเรื่อง"
                    fill="#4B1F7A"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="resolved"
                    name="แก้ไขเสร็จสิ้น"
                    fill="#B8923A"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-[#B8923A]/15 text-xs text-[#1B1226]/60 font-sans flex items-center justify-between">
              <span>ข้อมูลอัปเดตรายเดือนอัตโนมัติ</span>
              <span>ภาคเรียนที่ 1/2569</span>
            </div>
          </div>
        </div>

        {/* 3. Budget Section (Section 4.6) */}
        {budget && (
          <div className="my-14 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 sm:p-8 shadow-[0_1px_0_rgba(42,18,69,.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#B8923A]/20">
              <div>
                <span className="text-xs font-sans font-semibold tracking-widest text-[#9C7A2B] uppercase block">
                  BUDGET & ALLOCATION · งบประมาณกิจกรรม
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1B1226] mt-1">
                  รายงานการใช้จ่ายงบประมาณ ปีการศึกษา {budget.yearTH}
                </h3>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-[#1B1226]/60">ปีงบประมาณ:</span>
                {[2569].map((yr) => (
                  <span
                    key={yr}
                    className="px-3 py-1 rounded-[3px] bg-[#4B1F7A] text-[#FAF7F0] text-xs font-num font-semibold"
                  >
                    พ.ศ. {yr}
                  </span>
                ))}
              </div>
            </div>

            {/* Budget Progress Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 p-6 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/20">
              <div>
                <span className="text-xs font-sans text-[#1B1226]/60">งบประมาณที่ได้รับจัดสรร</span>
                <div className="font-num text-2xl font-bold text-[#1B1226] mt-1">
                  {formatCurrency(budget.totalBudget)}
                </div>
              </div>
              <div>
                <span className="text-xs font-sans text-[#1B1226]/60">เบิกจ่ายจริงแล้ว</span>
                <div className="font-num text-2xl font-bold text-[#9C7A2B] mt-1">
                  {formatCurrency(totalSpent)}
                </div>
              </div>
              <div>
                <span className="text-xs font-sans text-[#1B1226]/60">งบประมาณคงเหลือ</span>
                <div className="font-num text-2xl font-bold text-[#2F6B4F] mt-1">
                  {formatCurrency(remainingBudget)}
                </div>
              </div>

              {/* Thin Golden Progress Bar (per spec) */}
              <div className="sm:col-span-3 pt-2">
                <div className="flex items-center justify-between text-xs text-[#1B1226]/70 mb-1 font-sans">
                  <span>ความคืบหน้าการใช้งบประมาณ</span>
                  <span className="font-num font-semibold text-[#9C7A2B]">
                    {spentPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#FAF7F0] border border-[#B8923A]/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B8923A] transition-all duration-700"
                    style={{ width: `${spentPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Activities Budget Table */}
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[#B8923A]/20 bg-[#EDE6F5]/30 text-xs text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4 font-semibold">โครงการ / กิจกรรม</th>
                    <th className="py-3 px-3 font-semibold hidden sm:table-cell">วันที่</th>
                    <th className="py-3 px-3 font-semibold text-right">งบที่เสนอขอ</th>
                    <th className="py-3 px-3 font-semibold text-right">งบที่อนุมัติ</th>
                    <th className="py-3 px-4 font-semibold text-right">ใช้จ่ายจริง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15">
                  {budget.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4 font-medium text-[#1B1226]">
                        {item.activity}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/60 hidden sm:table-cell whitespace-nowrap">
                        {formatThaiDate(item.date, { shortMonth: true })}
                      </td>
                      <td className="py-3 px-3 text-right font-num text-[#1B1226]/70 tabular-nums">
                        {item.requested.toLocaleString("th-TH")} ฿
                      </td>
                      <td className="py-3 px-3 text-right font-num text-[#4B1F7A] font-semibold tabular-nums">
                        {item.approved.toLocaleString("th-TH")} ฿
                      </td>
                      <td className="py-3 px-4 text-right font-num font-bold text-[#9C7A2B] tabular-nums">
                        {item.spent > 0 ? `${item.spent.toLocaleString("th-TH")} ฿` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Link to Minutes & Financial Docs */}
            <div className="mt-8 pt-6 border-t border-[#B8923A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#1B1226]/70">
                <FileText weight="light" className="w-4 h-4 text-[#9C7A2B]" />
                <span>รายงานงบประมาณผ่านการรับรองจากที่ประชุมสภานักเรียน</span>
              </div>

              <Link
                to="/downloads"
                className="editorial-btn-secondary text-xs sm:text-sm font-medium text-[#4B1F7A]"
              >
                <span>ดูรายงานการประชุมและมติสภานักเรียน</span>
                <span className="ml-1 text-[#9C7A2B]">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TransparencyPage;
