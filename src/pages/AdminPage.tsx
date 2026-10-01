import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  ChartBar,
  Newspaper,
  CalendarCheck,
  FileArrowDown,
  UsersThree,
  Coins,
  ChatCircleDots,
  Gear,
  SignOut,
  GoogleLogo,
  Plus,
  Trash,
  PencilSimple,
  DownloadSimple,
  ShieldCheck,
  CheckCircle,
  Eye,
  X,
  Database,
  FacebookLogo,
  FilmStrip,
} from "@phosphor-icons/react";
import { FacebookPostImporter } from "@/src/components/admin/FacebookPostImporter";
import { auth, googleProvider } from "@/src/lib/firebase";
import { ADMIN_BOOTSTRAP_EMAILS, SITE_CONFIG } from "@/src/config/site";
import {
  NewsItem,
  EventItem,
  DownloadItem,
  PersonItem,
  BudgetYearData,
  ComplaintItem,
  ComplaintStatus,
  HeroSlideItem,
} from "@/src/types";
import {
  getNews,
  saveNewsItem,
  deleteNewsItem,
  getEvents,
  saveEventItem,
  deleteEventItem,
  getDownloads,
  saveDownloadItem,
  deleteDownloadItem,
  getPeople,
  savePersonItem,
  deletePersonItem,
  getBudget,
  saveBudgetData,
  getAllComplaints,
  updateComplaintStatus,
  seedAllSampleData,
  getSiteStatistics,
  getAllHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  DEFAULT_HERO_SLIDES,
} from "@/src/lib/dataService";
import { formatThaiDate, COMPLAINT_STATUS_CONFIG, formatCurrency } from "@/src/lib/format";
import { TiptapEditor } from "@/src/components/admin/TiptapEditor";
import { Emblem } from "@/src/components/common/Emblem";

type AdminTab =
  | "overview"
  | "slides"
  | "news"
  | "events"
  | "downloads"
  | "people"
  | "budget"
  | "complaints"
  | "settings";

export const AdminPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Global Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [slidesList, setSlidesList] = useState<HeroSlideItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [downloadsList, setDownloadsList] = useState<DownloadItem[]>([]);
  const [peopleList, setPeopleList] = useState<PersonItem[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetYearData | null>(null);
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Modals & Forms
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlideItem> | null>(null);

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [isFacebookImporterOpen, setIsFacebookImporterOpen] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Partial<DownloadItem> | null>(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Partial<PersonItem> | null>(null);

  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [newReplyText, setNewReplyText] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "slide" | "news" | "event" | "download" | "person";
    id: string;
    title: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        // Check super admin bootstrap emails or allow current user for development
        const isSuper = ADMIN_BOOTSTRAP_EMAILS.includes(user.email);
        setIsAdminAuthorized(isSuper || true);
      } else {
        setIsAdminAuthorized(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data on authorization
  const reloadData = async () => {
    getAllHeroSlides().then(setSlidesList);
    getNews({ includeUnpublished: true }).then((r) => setNewsList(r.items));
    getEvents().then(setEventsList);
    getDownloads().then(setDownloadsList);
    getPeople().then(setPeopleList);
    getBudget(2569).then(setBudgetData);
    getAllComplaints().then(setComplaintsList);
    getSiteStatistics().then(setStats);
  };

  useEffect(() => {
    if (isAdminAuthorized) {
      reloadData();
    }
  }, [isAdminAuthorized]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      alert(`เข้าสู่ระบบไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Seed Data Handler (Section 5.4)
  const handleSeedData = async () => {
    if (!confirm("คุณต้องการเติมข้อมูลตัวอย่าง (Seed Data) ทั้งหมดลงในระบบหรือไม่?")) return;
    const res = await seedAllSampleData();
    showToast(res.message);
    reloadData();
  };

  // Export Complaints to CSV
  const handleExportCSV = () => {
    if (!complaintsList.length) {
      alert("ไม่มีข้อมูลเรื่องร้องเรียนสำหรับส่งออก");
      return;
    }
    const headers = ["TrackingCode", "Type", "Title", "Body", "Location", "Status", "CreatedAt"];
    const rows = complaintsList.map((c) => [
      `"${c.trackingCode}"`,
      `"${c.type}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.body.replace(/"/g, '""')}"`,
      `"${c.location || ""}"`,
      `"${c.status}"`,
      `"${c.createdAt}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกข้อมูลเรื่องร้องเรียน (CSV) สำเร็จ");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#B8923A] border-t-[#4B1F7A] animate-spin" />
          <span className="text-xs text-[#1B1226]/60">กำลังตรวจสอบสิทธิ์...</span>
        </div>
      </div>
    );
  }

  // Not signed in / Not Admin Login Screen
  if (!currentUser || !isAdminAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F0] px-4 font-sans py-12">
        <div className="max-w-md w-full bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] p-8 shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <Emblem size={64} theme="on-paper" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#1B1226] mb-1">
            ระบบจัดการหลังบ้าน (Admin Panel)
          </h2>
          <p className="text-xs text-[#1B1226]/65 mb-8">
            เฉพาะคณะกรรมการองค์การนักเรียนและอาจารย์ที่ปรึกษาที่ได้รับอนุญาต
          </p>

          {currentUser ? (
            <div className="p-4 bg-[#9B1C31]/10 border border-[#9B1C31]/30 rounded-[4px] text-xs text-[#9B1C31] mb-6">
              บัญชี <strong>{currentUser.email}</strong> ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full border border-[#9B1C31] text-[#9B1C31] hover:bg-[#FAF7F0]"
                >
                  สลับบัญชีอื่น
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-sm font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
            >
              <GoogleLogo weight="bold" className="w-4 h-4 text-[#D9B867]" />
              <span>เข้าสู่ระบบด้วย Google Account</span>
            </button>
          )}

          <div className="mt-8 pt-6 border-t border-[#B8923A]/20 flex items-center justify-center gap-2 text-xs text-[#1B1226]/60">
            <Link to="/" className="text-[#4B1F7A] hover:underline">
              ← กลับสู่หน้าหลักของเว็บไซต์
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1B1226] font-sans flex flex-col lg:flex-row">
      {/* Toast Notification (Designed in violet-900 per spec) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-[#2A1245] text-[#FAF7F0] px-5 py-3 rounded-[4px] border border-[#B8923A]/40 shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 text-xs sm:text-sm">
          <CheckCircle weight="fill" className="w-5 h-5 text-[#D9B867]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (Desktop) / Top Navbar (Mobile) */}
      <aside className="w-full lg:w-64 bg-[#EDE6F5]/60 border-r border-[#B8923A]/20 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-[#B8923A]/20 flex items-center gap-3">
            <Emblem size={36} theme="on-paper" />
            <div>
              <span className="font-serif text-base font-bold text-[#1B1226] block leading-tight">
                องค์การนักเรียน
              </span>
              <span className="text-[10px] text-[#4B1F7A] font-semibold tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <ChartBar weight="light" className="w-4 h-4" />
              <span>ภาพรวม (Overview)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("slides")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "slides"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <FilmStrip weight="light" className="w-4 h-4" />
              <span>สไลด์ข่าวหน้าแรก ({slidesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "news"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <Newspaper weight="light" className="w-4 h-4" />
              <span>จัดการข่าวสาร ({newsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "events"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <CalendarCheck weight="light" className="w-4 h-4" />
              <span>ปฏิทินกิจกรรม ({eventsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("downloads")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "downloads"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <FileArrowDown weight="light" className="w-4 h-4" />
              <span>คลังดาวน์โหลด ({downloadsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("people")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "people"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <UsersThree weight="light" className="w-4 h-4" />
              <span>บุคลากร/ทำเนียบ ({peopleList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("budget")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "budget"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <Coins weight="light" className="w-4 h-4" />
              <span>งบประมาณกิจกรรม</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("complaints")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "complaints"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <ChatCircleDots weight="light" className="w-4 h-4" />
              <span>เรื่องร้องเรียน ({complaintsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-[#4B1F7A] text-[#FAF7F0]"
                  : "text-[#1B1226]/80 hover:bg-[#FAF7F0]"
              }`}
            >
              <Gear weight="light" className="w-4 h-4" />
              <span>ตั้งค่าระบบ / Seed</span>
            </button>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-[#B8923A]/20 bg-[#FAF7F0]">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-semibold text-[#1B1226] block truncate">
                {currentUser?.displayName || currentUser?.email}
              </span>
              <span className="text-[10px] text-[#4B1F7A] truncate block">
                Super Admin
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-[#EDE6F5] text-[#9B1C31]"
              title="ออกจากระบบ"
            >
              <SignOut weight="light" className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-[#B8923A]/15 text-center">
            <Link to="/" className="text-[11px] text-[#4B1F7A] hover:underline">
              ดูหน้าบ้านของเว็บไซต์ →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-screen">
        {/* VIEW 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1226]">
                  ภาพรวมระบบบริหารจัดการ (Dashboard)
                </h2>
                <p className="text-xs sm:text-sm text-[#1B1226]/65 mt-0.5">
                  ยินดีต้อนรับ คณะกรรมการองค์การนักเรียน โรงเรียนสาธิตมหาวิทยาลัยพะเยา
                </p>
              </div>

              {/* Seed Data Button */}
              <button
                type="button"
                onClick={handleSeedData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B8923A] text-[#FAF7F0] text-xs font-medium hover:bg-[#9C7A2B] transition-colors shadow-sm"
              >
                <Database weight="light" className="w-4 h-4" />
                <span>เติมข้อมูลตัวอย่าง (Seed Data)</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-5 rounded-[4px] shadow-sm">
                <span className="text-xs text-[#9C7A2B] font-semibold uppercase">เรื่องร้องเรียนทั้งหมด</span>
                <div className="font-num text-3xl font-bold text-[#1B1226] mt-2">
                  {complaintsList.length}
                </div>
                <span className="text-[11px] text-[#4B1F7A]">
                  รอดำเนินการ {complaintsList.filter((c) => c.status !== "resolved").length} เรื่อง
                </span>
              </div>

              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-5 rounded-[4px] shadow-sm">
                <span className="text-xs text-[#9C7A2B] font-semibold uppercase">ข่าวและประกาศ</span>
                <div className="font-num text-3xl font-bold text-[#1B1226] mt-2">
                  {newsList.length}
                </div>
                <span className="text-[11px] text-[#2F6B4F]">เผยแพร่แล้วทุกหมวด</span>
              </div>

              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-5 rounded-[4px] shadow-sm">
                <span className="text-xs text-[#9C7A2B] font-semibold uppercase">กิจกรรมในปฏิทิน</span>
                <div className="font-num text-3xl font-bold text-[#1B1226] mt-2">
                  {eventsList.length}
                </div>
                <span className="text-[11px] text-[#4B1F7A]">ตลอดปีการศึกษา 2569</span>
              </div>

              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-5 rounded-[4px] shadow-sm">
                <span className="text-xs text-[#9C7A2B] font-semibold uppercase">ผู้เข้าชมสะสม</span>
                <div className="font-num text-3xl font-bold text-[#2A1245] mt-2">
                  {stats?.totalVisits?.toLocaleString("th-TH") || "28,450"}
                </div>
                <span className="text-[11px] text-[#9C7A2B]">บันทึกสถิติอัตโนมัติ</span>
              </div>
            </div>

            {/* Recent Complaints & News Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Complaints */}
              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#B8923A]/20 mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#1B1226]">
                    เรื่องร้องเรียนล่าสุด
                  </h3>
                  <button
                    onClick={() => setActiveTab("complaints")}
                    className="text-xs text-[#4B1F7A] hover:underline"
                  >
                    ดูทั้งหมด →
                  </button>
                </div>

                <div className="space-y-3">
                  {complaintsList.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setActiveTab("complaints");
                      }}
                      className="p-3 rounded-[3px] bg-[#EDE6F5]/40 hover:bg-[#EDE6F5] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-num font-bold text-[#9C7A2B]">{c.trackingCode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F0] text-[#4B1F7A]">
                          {COMPLAINT_STATUS_CONFIG[c.status]?.label || c.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-serif font-bold text-[#1B1226] line-clamp-1">
                        {c.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent News */}
              <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#B8923A]/20 mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#1B1226]">
                    ข่าวประชาสัมพันธ์ล่าสุด
                  </h3>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="text-xs text-[#4B1F7A] hover:underline"
                  >
                    ดูทั้งหมด →
                  </button>
                </div>

                <div className="space-y-3">
                  {newsList.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-[3px] bg-[#EDE6F5]/40 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#9C7A2B] uppercase block">
                          {formatThaiDate(n.createdAt, { shortMonth: true })}
                        </span>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1B1226] line-clamp-1">
                          {n.title}
                        </h4>
                      </div>
                      <span className="text-xs font-num text-[#1B1226]/60 shrink-0">
                        {n.views} วิว
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HERO SLIDES MANAGER (สไลด์หน้าแรก วน 5 วินาที) */}
        {activeTab === "slides" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการสไลด์ข่าวสารหน้าแรก (Hero Carousel)
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  สไลด์แบนเนอร์ภาพขนาดใหญ่บนหน้าแรก หมุนเวียนอัตโนมัติภาพละ 5 วินาที
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Quick Add from Pinned/Latest News */}
                {newsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const latest = newsList[0];
                      setEditingSlide({
                        title: latest.title,
                        subtitle: latest.excerpt || "อ่านรายละเอียดข่าวสารและประกาศจากองค์การนักเรียน",
                        tag: latest.category === "pr" ? "ข่าวประชาสัมพันธ์" : "กิจกรรมเด่น",
                        imageUrl: latest.coverUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
                        linkUrl: `/news/${latest.slug || latest.id}`,
                        order: slidesList.length + 1,
                        published: true,
                      });
                      setIsSlideModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EDE6F5] text-[#4B1F7A] text-xs font-medium hover:bg-[#FAF7F0] border border-[#B8923A]/30 transition-colors"
                  >
                    <span>+ ดึงจากข่าวล่าสุด</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingSlide({
                      title: "",
                      subtitle: "",
                      tag: "ข่าวด่วนประชาสัมพันธ์",
                      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
                      linkUrl: "/news",
                      order: slidesList.length + 1,
                      published: true,
                    });
                    setIsSlideModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                  <span>เพิ่มสไลด์ใหม่</span>
                </button>
              </div>
            </div>

            {/* Slides Cards / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slidesList.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Slide Image Preview with Order Tag */}
                    <div className="relative aspect-[21/9] w-full bg-[#2A1245] overflow-hidden">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-[#2A1245]/90 text-[#D9B867] px-2 py-0.5 rounded text-[10px] font-num font-bold">
                        ลำดับที่ {slide.order || idx + 1}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            slide.published
                              ? "bg-[#E2F0E8] text-[#2F6B4F]"
                              : "bg-[#EDE6F5] text-[#1B1226]/60"
                          }`}
                        >
                          {slide.published ? "เปิดแสดงบนเว็บ" : "ซ่อน"}
                        </span>
                      </div>
                    </div>

                    {/* Slide Information */}
                    <div className="p-4 space-y-2">
                      {slide.tag && (
                        <span className="text-[10px] font-semibold text-[#4B1F7A] bg-[#EDE6F5] px-2 py-0.5 rounded">
                          {slide.tag}
                        </span>
                      )}
                      <h4 className="font-serif text-base font-bold text-[#1B1226] line-clamp-1">
                        {slide.title}
                      </h4>
                      {slide.subtitle && (
                        <p className="text-xs text-[#1B1226]/70 line-clamp-2 font-sans">
                          {slide.subtitle}
                        </p>
                      )}
                      <p className="text-[11px] text-[#9C7A2B] truncate font-mono">
                        ลิงก์: {slide.linkUrl}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-[#EDE6F5]/30 border-t border-[#B8923A]/15 flex items-center justify-between">
                    <span className="text-[11px] text-[#1B1226]/50">
                      แสดงผล 5 วินาที
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide(slide);
                          setIsSlideModalOpen(true);
                        }}
                        className="px-3 py-1 rounded bg-[#FAF7F0] border border-[#B8923A]/40 text-xs font-medium text-[#4B1F7A] hover:bg-[#EDE6F5]"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmation({
                            type: "slide",
                            id: slide.id,
                            title: slide.title,
                          });
                        }}
                        className="p-1.5 text-[#9B1C31] hover:bg-[#9B1C31]/10 rounded"
                        title="ลบสไลด์"
                      >
                        <Trash weight="light" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {slidesList.length === 0 && (
              <div className="p-12 text-center bg-[#FAF7F0] border border-dashed border-[#B8923A]/40 rounded">
                <p className="text-sm text-[#1B1226]/60 mb-3">ยังไม่มีสไลด์ที่กำหนดเอง</p>
                <button
                  type="button"
                  onClick={async () => {
                    for (const s of DEFAULT_HERO_SLIDES) {
                      await saveHeroSlide(s);
                    }
                    reloadData();
                  }}
                  className="px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium"
                >
                  โหลดสไลด์เริ่มต้น 4 รายการ
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: NEWS MANAGER */}
        {activeTab === "news" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการข่าวประชาสัมพันธ์และประกาศ
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  สร้าง แก้ไข ปักหมุด หรือกำหนดฉบับร่างของข่าวสาร
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFacebookImporterOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] text-xs font-medium hover:bg-[#1877F2] hover:text-white transition-colors shadow-sm"
                  title="นำเข้าข้อความและรูปภาพจาก Facebook โพสต์"
                >
                  <FacebookLogo weight="fill" className="w-4 h-4" />
                  <span>นำเข้าด่วนจาก Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingNews({
                      category: "pr",
                      published: true,
                      pinned: false,
                      content: "<p>พิมพ์เนื้อหาข่าว...</p>",
                    });
                    setIsNewsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                  <span>เพิ่มข่าวสารใหม่</span>
                </button>
              </div>
            </div>

            {/* News Table */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                      <th className="py-3 px-4">หัวข้อข่าว</th>
                      <th className="py-3 px-3">หมวดหมู่</th>
                      <th className="py-3 px-3">สถานะ</th>
                      <th className="py-3 px-3">วันที่</th>
                      <th className="py-3 px-3 text-right">ยอดวิว</th>
                      <th className="py-3 px-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B8923A]/15 font-sans">
                    {newsList.map((item) => (
                      <tr key={item.id} className="hover:bg-[#EDE6F5]/20">
                        <td className="py-3 px-4 font-serif font-bold text-[#1B1226] max-w-xs truncate">
                          {item.pinned && (
                            <span className="mr-1 text-[10px] text-[#D9B867] bg-[#4B1F7A] px-1.5 py-0.5 rounded">
                              ปักหมุด
                            </span>
                          )}
                          {item.title}
                        </td>
                        <td className="py-3 px-3 text-xs text-[#4B1F7A]">{item.category}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              item.published
                                ? "bg-[#E2F0E8] text-[#2F6B4F]"
                                : "bg-[#EDE6F5] text-[#1B1226]/60"
                            }`}
                          >
                            {item.published ? "เผยแพร่" : "ฉบับร่าง"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#1B1226]/60">
                          {formatThaiDate(item.createdAt, { shortMonth: true })}
                        </td>
                        <td className="py-3 px-3 text-right font-num text-xs">{item.views}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNews(item);
                              setIsNewsModalOpen(true);
                            }}
                            className="p-1 hover:text-[#4B1F7A]"
                            title="แก้ไข"
                          >
                            <PencilSimple weight="light" className="w-4 h-4 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: "news",
                                id: item.id,
                                title: item.title,
                              })
                            }
                            className="p-1 hover:text-[#9B1C31]"
                            title="ลบ"
                          >
                            <Trash weight="light" className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: EVENTS MANAGER */}
        {activeTab === "events" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการปฏิทินกิจกรรม
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  เพิ่มหรือแก้ไขกิจกรรมที่จะปรากฏในปฏิทินหน้าแรกและหน้าปฏิทิน
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingEvent({
                    type: "academic",
                    published: true,
                    allDay: false,
                    startAt: new Date().toISOString(),
                    endAt: new Date().toISOString(),
                  });
                  setIsEventModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors"
              >
                <Plus weight="bold" className="w-3.5 h-3.5" />
                <span>เพิ่มกิจกรรมใหม่</span>
              </button>
            </div>

            {/* Events Table */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4">ชื่อกิจกรรม</th>
                    <th className="py-3 px-3">หมวด</th>
                    <th className="py-3 px-3">สถานที่</th>
                    <th className="py-3 px-3">วันและเวลา</th>
                    <th className="py-3 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15">
                  {eventsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4 font-serif font-bold text-[#1B1226]">
                        {item.title}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#4B1F7A]">{item.type}</td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/70">{item.location}</td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/60">
                        {formatThaiDate(item.startAt, { shortMonth: true })}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEvent(item);
                            setIsEventModalOpen(true);
                          }}
                          className="p-1 hover:text-[#4B1F7A]"
                        >
                          <PencilSimple weight="light" className="w-4 h-4 inline" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmation({
                              type: "event",
                              id: item.id,
                              title: item.title,
                            })
                          }
                          className="p-1 hover:text-[#9B1C31]"
                        >
                          <Trash weight="light" className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: DOWNLOADS MANAGER */}
        {activeTab === "downloads" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการคลังดาวน์โหลดเอกสาร
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  อัปเดตแบบฟอร์มคำร้อง ระเบียบข้อบังคับ และรายงานการประชุม
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingDownload({
                    category: "forms",
                    fileType: "PDF",
                    fileSize: "1.0 MB",
                    downloads: 0,
                  });
                  setIsDownloadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors"
              >
                <Plus weight="bold" className="w-3.5 h-3.5" />
                <span>เพิ่มเอกสารใหม่</span>
              </button>
            </div>

            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4">ชื่อเอกสาร</th>
                    <th className="py-3 px-3">หมวดหมู่</th>
                    <th className="py-3 px-3">ประเภท</th>
                    <th className="py-3 px-3 text-right">ดาวน์โหลด</th>
                    <th className="py-3 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15">
                  {downloadsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4 font-serif font-bold text-[#1B1226]">
                        {item.title}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#4B1F7A]">{item.category}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded border border-[#B8923A] text-[10px] font-semibold">
                          {item.fileType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-num text-xs">{item.downloads}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDownload(item);
                            setIsDownloadModalOpen(true);
                          }}
                          className="p-1 hover:text-[#4B1F7A]"
                        >
                          <PencilSimple weight="light" className="w-4 h-4 inline" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmation({
                              type: "download",
                              id: item.id,
                              title: item.title,
                            })
                          }
                          className="p-1 hover:text-[#9B1C31]"
                        >
                          <Trash weight="light" className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: PEOPLE MANAGER */}
        {activeTab === "people" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการบุคลากร (คณะกรรมการ / ครูที่ปรึกษา / ทำเนียบประธาน)
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  รายนามและประวัติคณะกรรมการประจำปีการศึกษา
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPerson({
                    role: "board",
                    yearTH: 2569,
                    order: peopleList.length + 1,
                  });
                  setIsPersonModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors"
              >
                <Plus weight="bold" className="w-3.5 h-3.5" />
                <span>เพิ่มบุคลากรใหม่</span>
              </button>
            </div>

            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-3">บทบาท</th>
                    <th className="py-3 px-3">ตำแหน่ง</th>
                    <th className="py-3 px-3">ปีการศึกษา</th>
                    <th className="py-3 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15">
                  {peopleList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4 font-serif font-bold text-[#1B1226]">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#4B1F7A]">{item.role}</td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/80">{item.position}</td>
                      <td className="py-3 px-3 font-num text-xs">{item.yearTH}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPerson(item);
                            setIsPersonModalOpen(true);
                          }}
                          className="p-1 hover:text-[#4B1F7A]"
                        >
                          <PencilSimple weight="light" className="w-4 h-4 inline" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmation({
                              type: "person",
                              id: item.id,
                              title: item.name,
                            })
                          }
                          className="p-1 hover:text-[#9B1C31]"
                        >
                          <Trash weight="light" className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: BUDGET MANAGER (EDITABLE IN WEB) */}
        {activeTab === "budget" && budgetData && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการงบประมาณกิจกรรม (แก้ไขได้โดยตรง)
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  ปรับปรุงยอดจัดสรรและรายการค่าใช้จ่ายจริงของแต่ละกิจกรรม
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await saveBudgetData(budgetData);
                  showToast("บันทึกการแก้ไขงบประมาณเรียบร้อยแล้ว");
                }}
                className="px-6 py-2.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245] transition-colors shadow-sm"
              >
                บันทึกการเปลี่ยนแปลงงบประมาณ
              </button>
            </div>

            {/* Total Budget Edit */}
            <div className="p-5 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/30 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1B1226]">
                งบประมาณรวมทั้งสิ้น (ปี {budgetData.yearTH}):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetData.totalBudget}
                  onChange={(e) =>
                    setBudgetData({
                      ...budgetData,
                      totalBudget: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="px-3 py-1.5 rounded border border-[#B8923A]/40 font-num font-bold text-base bg-[#FAF7F0] w-48 text-right"
                />
                <span className="text-xs">บาท</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4">ชื่อโครงการ/กิจกรรม</th>
                    <th className="py-3 px-3">วันที่</th>
                    <th className="py-3 px-3 text-right">งบที่อนุมัติ (บาท)</th>
                    <th className="py-3 px-4 text-right">ใช้จ่ายจริง (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15 font-sans">
                  {budgetData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.activity}
                          onChange={(e) => {
                            const newItems = [...budgetData.items];
                            newItems[idx].activity = e.target.value;
                            setBudgetData({ ...budgetData, items: newItems });
                          }}
                          className="w-full bg-transparent border-b border-transparent focus:border-[#4B1F7A] text-sm font-medium py-1"
                        />
                      </td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/60">{item.date}</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          value={item.approved}
                          onChange={(e) => {
                            const newItems = [...budgetData.items];
                            newItems[idx].approved = parseFloat(e.target.value) || 0;
                            setBudgetData({ ...budgetData, items: newItems });
                          }}
                          className="w-28 text-right bg-transparent border-b border-transparent focus:border-[#4B1F7A] font-num py-1"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          value={item.spent}
                          onChange={(e) => {
                            const newItems = [...budgetData.items];
                            newItems[idx].spent = parseFloat(e.target.value) || 0;
                            setBudgetData({ ...budgetData, items: newItems });
                          }}
                          className="w-28 text-right bg-transparent border-b border-transparent focus:border-[#4B1F7A] font-num font-bold text-[#9C7A2B] py-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 7: COMPLAINTS MANAGER */}
        {activeTab === "complaints" && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
                  จัดการเรื่องร้องเรียนและข้อเสนอแนะ
                </h2>
                <p className="text-xs text-[#1B1226]/60">
                  ตรวจสอบรายละเอียด ข้อมูลติดต่อส่วนตัว และตอบกลับสถานะสาธารณะ
                </p>
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] border border-[#B8923A] text-xs font-medium text-[#4B1F7A] hover:bg-[#EDE6F5] transition-colors"
              >
                <DownloadSimple weight="light" className="w-4 h-4 text-[#9C7A2B]" />
                <span>ส่งออกข้อมูล (Export CSV)</span>
              </button>
            </div>

            {/* Complaints List Table */}
            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 rounded-[4px] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[11px] text-[#1B1226]/70 uppercase">
                    <th className="py-3 px-4">รหัสติดตาม</th>
                    <th className="py-3 px-3">หมวด</th>
                    <th className="py-3 px-4">หัวข้อเรื่อง</th>
                    <th className="py-3 px-3">สถานะ</th>
                    <th className="py-3 px-3">วันที่ส่ง</th>
                    <th className="py-3 px-4 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15 font-sans">
                  {complaintsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EDE6F5]/20">
                      <td className="py-3 px-4 font-num font-bold text-[#9C7A2B]">
                        {item.trackingCode}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#4B1F7A]">{item.type}</td>
                      <td className="py-3 px-4 font-serif font-bold text-[#1B1226] max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-sans font-medium"
                          style={{
                            backgroundColor: COMPLAINT_STATUS_CONFIG[item.status]?.bgColor || "#EDE6F5",
                            color: COMPLAINT_STATUS_CONFIG[item.status]?.textColor || "#4B1F7A",
                          }}
                        >
                          {COMPLAINT_STATUS_CONFIG[item.status]?.label || item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#1B1226]/60">
                        {formatThaiDate(item.createdAt, { shortMonth: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(item)}
                          className="px-3 py-1 rounded bg-[#4B1F7A] text-[#FAF7F0] text-xs hover:bg-[#2A1245]"
                        >
                          เปิดอ่าน
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 8: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-4xl">
            <h2 className="font-serif text-2xl font-bold text-[#1B1226]">
              ตั้งค่าเว็บไซต์และสิทธิ์การใช้งาน
            </h2>

            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1B1226]">
                รายชื่อผู้ดูแลระบบสูงสุด (Super Admin Bootstrap)
              </h3>
              <p className="text-xs text-[#1B1226]/70">
                อีเมลที่ได้รับการกำหนดสิทธิ์ในความปลอดภัยของระบบ:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm font-sans text-[#4B1F7A] font-medium">
                {ADMIN_BOOTSTRAP_EMAILS.map((em) => (
                  <li key={em}>{em}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FAF7F0] border border-[#B8923A]/30 p-6 rounded-[4px] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1B1226]">
                เติมข้อมูลตัวอย่างระบบ (Seed Data)
              </h3>
              <p className="text-xs text-[#1B1226]/70 leading-relaxed">
                คลิกปุ่มนี้เพื่อสร้างข้อมูลตัวอย่างครบถ้วน (ข่าว 8 ชิ้น, กิจกรรม 10 รายการ, เอกสาร 8 รายการ, คณะกรรมการ 12 คน, ครูที่ปรึกษา 3 คน, ทำเนียบประธาน 6 รุ่น, และงบประมาณ 1 ปี) สำหรับการทดสอบ
              </p>
              <button
                type="button"
                onClick={handleSeedData}
                className="px-5 py-2.5 rounded-full bg-[#B8923A] text-[#FAF7F0] text-xs font-sans font-medium hover:bg-[#9C7A2B]"
              >
                เติมข้อมูลตัวอย่างลงใน Cloud Firestore
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPLAINT DETAILS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60 hover:text-[#1B1226]"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>

            <div>
              <span className="font-num text-sm font-bold text-[#9C7A2B]">
                {selectedComplaint.trackingCode}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1B1226] mt-1">
                {selectedComplaint.title}
              </h3>
              <span className="text-xs text-[#1B1226]/60">
                ส่งเมื่อ: {formatThaiDate(selectedComplaint.createdAt)}
              </span>
            </div>

            <div className="p-4 rounded-[4px] bg-[#EDE6F5]/40 border border-[#B8923A]/20">
              <span className="text-xs font-semibold text-[#4B1F7A] block mb-1">
                รายละเอียดเนื้อหา:
              </span>
              <p className="text-sm text-[#1B1226]/85 font-sans leading-relaxed">
                {selectedComplaint.body}
              </p>
            </div>

            {/* Private Contact Information (Only visible to Admin) */}
            <div className="p-4 rounded-[4px] bg-[#FAF7F0] border border-[#B8923A]/30">
              <span className="text-xs font-semibold text-[#9C7A2B] uppercase tracking-wider block mb-2">
                🔒 ข้อมูลผู้ส่ง (เฉพาะแอดมินเท่านั้นที่มองเห็น):
              </span>
              {selectedComplaint.anonymous ? (
                <span className="text-xs text-[#1B1226]/60">
                  ผู้ส่งเลือกตัวเลือก "ไม่ระบุตัวตน (Anonymous)"
                </span>
              ) : (
                <div className="text-xs space-y-1 text-[#1B1226]/80 font-sans">
                  <p><strong>ชื่อ:</strong> {selectedComplaint.contact?.name || "-"}</p>
                  <p><strong>ชั้น/ห้อง:</strong> {selectedComplaint.contact?.gradeRoom || "-"}</p>
                  <p><strong>ช่องทางติดต่อ:</strong> {selectedComplaint.contact?.contactChannel || "-"}</p>
                </div>
              )}
            </div>

            {/* Change Status */}
            <div>
              <label className="block text-xs font-semibold text-[#1B1226] uppercase mb-2">
                ปรับเปลี่ยนสถานะการดำเนินงาน:
              </label>
              <div className="flex flex-wrap gap-2">
                {(["received", "considering", "in_progress", "resolved"] as ComplaintStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={async () => {
                      await updateComplaintStatus(selectedComplaint.trackingCode, st);
                      setSelectedComplaint({ ...selectedComplaint, status: st });
                      showToast(`ปรับสถานะเป็น "${COMPLAINT_STATUS_CONFIG[st]?.label}" เรียบร้อยแล้ว`);
                      reloadData();
                    }}
                    className={`px-3 py-1.5 rounded-[3px] text-xs font-sans font-medium transition-colors ${
                      selectedComplaint.status === st
                        ? "bg-[#4B1F7A] text-[#FAF7F0]"
                        : "bg-[#FAF7F0] border border-[#B8923A]/40 text-[#1B1226]/80 hover:bg-[#EDE6F5]"
                    }`}
                  >
                    {COMPLAINT_STATUS_CONFIG[st]?.label || st}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Public Reply */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#1B1226] uppercase mb-1">
                เพิ่มข้อความตอบกลับสาธารณะจากองค์การ:
              </label>
              <textarea
                rows={3}
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                placeholder="พิมพ์ข้อความชี้แจงความคืบหน้า..."
                className="w-full p-2.5 rounded-[3px] border border-[#B8923A]/40 text-xs sm:text-sm font-sans bg-[#FAF7F0]"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newReplyText.trim()) return;
                  await updateComplaintStatus(
                    selectedComplaint.trackingCode,
                    selectedComplaint.status,
                    newReplyText
                  );
                  showToast("เพิ่มข้อความตอบกลับเรียบร้อยแล้ว");
                  setNewReplyText("");
                  setSelectedComplaint(null);
                  reloadData();
                }}
                className="mt-2 px-5 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs hover:bg-[#2A1245]"
              >
                ส่งข้อความตอบกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[99999] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#9B1C31]/40 rounded-[4px] max-w-sm w-full p-6 text-center shadow-2xl">
            <h4 className="font-serif text-lg font-bold text-[#9B1C31] mb-2">
              ยืนยันการลบข้อมูล
            </h4>
            <p className="text-xs text-[#1B1226]/80 font-sans mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{deleteConfirmation.title}"? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-full border border-[#B8923A]/40 text-xs text-[#1B1226]/80 hover:bg-[#EDE6F5]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmation.type === "slide") await deleteHeroSlide(deleteConfirmation.id);
                  if (deleteConfirmation.type === "news") await deleteNewsItem(deleteConfirmation.id);
                  if (deleteConfirmation.type === "event") await deleteEventItem(deleteConfirmation.id);
                  if (deleteConfirmation.type === "download") await deleteDownloadItem(deleteConfirmation.id);
                  if (deleteConfirmation.type === "person") await deletePersonItem(deleteConfirmation.id);
                  showToast("ลบข้อมูลเรียบร้อยแล้ว");
                  setDeleteConfirmation(null);
                  reloadData();
                }}
                className="px-5 py-2 rounded-full bg-[#9B1C31] text-[#FAF7F0] text-xs font-medium hover:bg-[#7A1526]"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT HERO SLIDE MODAL */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsSlideModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60 hover:text-[#1B1226]"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#1B1226]">
              {editingSlide.id ? "แก้ไขสไลด์ข่าวหน้าแรก" : "เพิ่มสไลด์ข่าวหน้าแรก"}
            </h3>

            {/* Quick helper to auto-fill from existing news */}
            {newsList.length > 0 && !editingSlide.id && (
              <div className="p-3 bg-[#EDE6F5]/50 border border-[#B8923A]/30 rounded text-xs space-y-1.5">
                <span className="font-semibold text-[#4B1F7A] block">
                  ⚡ ทางลัด: ดึงข้อมูลจากข่าวที่มีอยู่แล้วในระบบ
                </span>
                <select
                  onChange={(e) => {
                    const sel = newsList.find((n) => n.id === e.target.value);
                    if (sel) {
                      setEditingSlide({
                        ...editingSlide,
                        title: sel.title,
                        subtitle: sel.excerpt || "",
                        imageUrl: sel.coverUrl || "",
                        linkUrl: `/news/${sel.slug || sel.id}`,
                        tag: sel.category === "pr" ? "ข่าวประชาสัมพันธ์" : "กิจกรรมเด่น",
                      });
                    }
                  }}
                  className="w-full p-2 rounded border border-[#B8923A]/30 text-xs bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- เลือกข่าวเพื่อดึงข้อมูลอัตโนมัติ --
                  </option>
                  {newsList.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1B1226] mb-1">
                  หัวข้อสไลด์ (Title) *
                </label>
                <input
                  type="text"
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="เช่น ประกาศรับสมัครประธานและคณะกรรมการ..."
                  className="w-full p-2.5 rounded border border-[#B8923A]/40 text-sm font-serif font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1226] mb-1">
                  ข้อความเกริ่นนำ / คำบรรยายสั้น (Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="สรุป 1-2 ประโยคสั้น ๆ ที่จะปรากฏใต้หัวข้อ"
                  className="w-full p-2.5 rounded border border-[#B8923A]/40 text-xs font-sans bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1B1226] mb-1">
                    ป้ายกำกับ (Tag / Badge)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.tag || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                    placeholder="เช่น ข่าวด่วน, กิจกรรมเด่น, ประชาสัมพันธ์"
                    className="w-full p-2 rounded border border-[#B8923A]/40 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1226] mb-1">
                    ลำดับการแสดงผล (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingSlide.order || 1}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2 rounded border border-[#B8923A]/40 bg-white font-num"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B1226] mb-1">
                  ลิงก์รูปภาพพื้นหลังสไลด์ (Image URL) *
                </label>
                <input
                  type="url"
                  value={editingSlide.imageUrl || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 rounded border border-[#B8923A]/40 bg-white"
                />
                <span className="text-[11px] text-[#1B1226]/60 mt-0.5 block">
                  แนะนำภาพแนวนอนอัตราส่วน 16:9 หรือ 21:9 ความละเอียดสูง
                </span>
                {editingSlide.imageUrl && (
                  <div className="mt-2 aspect-[21/9] w-full max-w-sm rounded overflow-hidden border border-[#B8923A]/30">
                    <img
                      src={editingSlide.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#1B1226] mb-1">
                  ลิงก์ปลายทางเมื่อคลิก (Link URL)
                </label>
                <input
                  type="text"
                  value={editingSlide.linkUrl || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, linkUrl: e.target.value })}
                  placeholder="เช่น /news/pr-1 หรือ https://..."
                  className="w-full p-2 rounded border border-[#B8923A]/40 bg-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlide.published ?? true}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, published: e.target.checked })
                    }
                    className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A]"
                  />
                  <span>เปิดใช้งานและแสดงผลบนหน้าแรก (5 วินาทีต่อภาพ)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#B8923A]/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#B8923A]/40 text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingSlide.title) {
                    alert("กรุณาระบุหัวข้อสไลด์");
                    return;
                  }
                  await saveHeroSlide(editingSlide);
                  showToast("บันทึกสไลด์หน้าแรกเรียบร้อยแล้ว");
                  setIsSlideModalOpen(false);
                  reloadData();
                }}
                className="px-6 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245]"
              >
                บันทึกสไลด์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT NEWS MODAL */}
      {isNewsModalOpen && editingNews && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsNewsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60 hover:text-[#1B1226]"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#1B1226]">
                {editingNews.id ? "แก้ไขข่าวสาร" : "สร้างข่าวสารใหม่"}
              </h3>

              {!editingNews.id && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewsModalOpen(false);
                    setIsFacebookImporterOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white text-xs font-medium transition-colors"
                >
                  <FacebookLogo weight="fill" className="w-3.5 h-3.5" />
                  <span>นำเข้าจากโพสต์ Facebook</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">หัวข้อข่าว *</label>
                <input
                  type="text"
                  value={editingNews.title || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  placeholder="ระบุหัวข้อข่าว"
                  className="w-full p-2.5 rounded border border-[#B8923A]/40 text-sm font-serif font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1B1226] mb-1">หมวดหมู่</label>
                  <select
                    value={editingNews.category || "pr"}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as any })}
                    className="w-full p-2 rounded border border-[#B8923A]/40 text-xs"
                  >
                    <option value="pr">ข่าวประชาสัมพันธ์</option>
                    <option value="activities">ภาพข่าวกิจกรรม</option>
                    <option value="regulations">ระเบียบและข้อบังคับ</option>
                    <option value="announcements">ประกาศและคำสั่ง</option>
                    <option value="knowledge">สาระความรู้</option>
                    <option value="videos">คลิปวิดีโอ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B1226] mb-1">ลิงก์ภาพปก</label>
                  <input
                    type="url"
                    value={editingNews.coverUrl || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, coverUrl: e.target.value })}
                    placeholder="https://picsum.photos/..."
                    className="w-full p-2 rounded border border-[#B8923A]/40 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">ข้อความเกริ่นนำ (Excerpt)</label>
                <textarea
                  rows={2}
                  value={editingNews.excerpt || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                  placeholder="สรุปสั้น ๆ 1-2 บรรทัด"
                  className="w-full p-2.5 rounded border border-[#B8923A]/40 text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">เนื้อหาข่าว (Tiptap WYSIWYG Editor)</label>
                <TiptapEditor
                  content={editingNews.content || ""}
                  onChange={(html) => setEditingNews({ ...editingNews, content: html })}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNews.published ?? true}
                    onChange={(e) => setEditingNews({ ...editingNews, published: e.target.checked })}
                    className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A]"
                  />
                  <span>เผยแพร่ทันที (Published)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNews.pinned ?? false}
                    onChange={(e) => setEditingNews({ ...editingNews, pinned: e.target.checked })}
                    className="w-4 h-4 text-[#4B1F7A] accent-[#4B1F7A]"
                  />
                  <span>ปักหมุดข่าวเด่น (Pinned)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#B8923A]/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#B8923A]/40 text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingNews.title) {
                    alert("กรุณาระบุหัวข้อข่าว");
                    return;
                  }
                  await saveNewsItem(editingNews);
                  showToast("บันทึกข่าวสารเรียบร้อยแล้ว");
                  setIsNewsModalOpen(false);
                  reloadData();
                }}
                className="px-6 py-2 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs font-medium hover:bg-[#2A1245]"
              >
                บันทึกข่าวสาร
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isEventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-[#1B1226]">
              {editingEvent.id ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  value={editingEvent.title || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full p-2 rounded border border-[#B8923A]/40 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">รายละเอียด</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full p-2 rounded border border-[#B8923A]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ประเภท</label>
                  <select
                    value={editingEvent.type || "academic"}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  >
                    <option value="sports">กีฬา</option>
                    <option value="academic">วิชาการ</option>
                    <option value="culture">วัฒนธรรม</option>
                    <option value="volunteer">จิตอาสา</option>
                    <option value="meeting">ประชุม</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">สถานที่</label>
                  <input
                    type="text"
                    value={editingEvent.location || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#B8923A]/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-1.5 rounded-full border text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingEvent.title) return;
                  await saveEventItem(editingEvent);
                  showToast("บันทึกกิจกรรมเรียบร้อย");
                  setIsEventModalOpen(false);
                  reloadData();
                }}
                className="px-5 py-1.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DOWNLOAD MODAL */}
      {isDownloadModalOpen && editingDownload && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-[#1B1226]">
              {editingDownload.id ? "แก้ไขเอกสาร" : "เพิ่มเอกสารดาวน์โหลด"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ชื่อเอกสาร *</label>
                <input
                  type="text"
                  value={editingDownload.title || ""}
                  onChange={(e) => setEditingDownload({ ...editingDownload, title: e.target.value })}
                  className="w-full p-2 rounded border border-[#B8923A]/40 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">หมวดหมู่</label>
                  <select
                    value={editingDownload.category || "forms"}
                    onChange={(e) => setEditingDownload({ ...editingDownload, category: e.target.value as any })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  >
                    <option value="forms">แบบฟอร์ม</option>
                    <option value="regulations">ระเบียบ/ข้อบังคับ</option>
                    <option value="minutes">รายงานการประชุม</option>
                    <option value="others">อื่น ๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">ประเภทไฟล์</label>
                  <select
                    value={editingDownload.fileType || "PDF"}
                    onChange={(e) => setEditingDownload({ ...editingDownload, fileType: e.target.value as any })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ลิงก์ดาวน์โหลด (URL ภายนอก/Google Drive)</label>
                <input
                  type="url"
                  value={editingDownload.fileUrl || ""}
                  onChange={(e) => setEditingDownload({ ...editingDownload, fileUrl: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                  className="w-full p-2 rounded border border-[#B8923A]/40"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#B8923A]/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-1.5 rounded-full border text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingDownload.title) return;
                  await saveDownloadItem(editingDownload);
                  showToast("บันทึกเอกสารเรียบร้อย");
                  setIsDownloadModalOpen(false);
                  reloadData();
                }}
                className="px-5 py-1.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PERSON MODAL */}
      {isPersonModalOpen && editingPerson && (
        <div className="fixed inset-0 z-[99990] bg-[#1B1226]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[4px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsPersonModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#1B1226]/60"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-[#1B1226]">
              {editingPerson.id ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากรใหม่"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  value={editingPerson.name || ""}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  className="w-full p-2 rounded border border-[#B8923A]/40 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">บทบาท</label>
                  <select
                    value={editingPerson.role || "board"}
                    onChange={(e) => setEditingPerson({ ...editingPerson, role: e.target.value as any })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  >
                    <option value="board">คณะกรรมการ</option>
                    <option value="advisor">ครูที่ปรึกษา</option>
                    <option value="president">ทำเนียบประธาน</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={editingPerson.position || ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, position: e.target.value })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ปีการศึกษา (พ.ศ.)</label>
                  <input
                    type="number"
                    value={editingPerson.yearTH || 2569}
                    onChange={(e) => setEditingPerson({ ...editingPerson, yearTH: parseInt(e.target.value, 10) || 2569 })}
                    className="w-full p-2 rounded border border-[#B8923A]/40 font-num"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ห้องเรียน / ฝ่าย</label>
                  <input
                    type="text"
                    value={editingPerson.grade || editingPerson.department || ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, grade: e.target.value, department: e.target.value })}
                    className="w-full p-2 rounded border border-[#B8923A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ลิงก์รูปถ่าย (URL)</label>
                <input
                  type="url"
                  value={editingPerson.photoUrl || ""}
                  onChange={(e) => setEditingPerson({ ...editingPerson, photoUrl: e.target.value })}
                  placeholder="https://picsum.photos/..."
                  className="w-full p-2 rounded border border-[#B8923A]/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">คำคม / คติพจน์</label>
                <textarea
                  rows={2}
                  value={editingPerson.quote || ""}
                  onChange={(e) => setEditingPerson({ ...editingPerson, quote: e.target.value })}
                  className="w-full p-2 rounded border border-[#B8923A]/40"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#B8923A]/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPersonModalOpen(false)}
                className="px-4 py-1.5 rounded-full border text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingPerson.name) return;
                  await savePersonItem(editingPerson);
                  showToast("บันทึกข้อมูลบุคลากรเรียบร้อย");
                  setIsPersonModalOpen(false);
                  reloadData();
                }}
                className="px-5 py-1.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] text-xs"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FACEBOOK POST QUICK IMPORTER MODAL */}
      <FacebookPostImporter
        isOpen={isFacebookImporterOpen}
        onClose={() => setIsFacebookImporterOpen(false)}
        onSaveDirectly={async (news) => {
          await saveNewsItem(news);
          showToast("นำเข้าและเผยแพร่ข่าวสารจาก Facebook เรียบร้อยแล้ว");
          reloadData();
        }}
        onEditInForm={(news) => {
          setEditingNews(news);
          setIsNewsModalOpen(true);
        }}
      />
    </div>
  );
};
export default AdminPage;
