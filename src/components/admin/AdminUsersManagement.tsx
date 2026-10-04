import React, { useState, useEffect } from "react";
import {
  UsersThree,
  ShieldCheck,
  UserPlus,
  PencilSimple,
  Trash,
  ClockCounterClockwise,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  ArrowClockwise,
  ShieldWarning,
  Info,
  X,
} from "@phosphor-icons/react";
import { AdminRole, AdminUser, AuditLogItem } from "@/src/types";
import {
  getAllAdminUsers,
  getAuditLogs,
  addAdminUser,
  updateAdminUserRole,
  toggleAdminUserActive,
  revokeAdminUser,
} from "@/src/lib/adminService";
import { formatThaiDate } from "@/src/lib/format";

interface AdminUsersManagementProps {
  currentAdmin: AdminUser;
  onShowToast: (message: string) => void;
}

const ROLE_LABELS: Record<AdminRole, { name: string; desc: string; badgeClass: string }> = {
  super_admin: {
    name: "ผู้ดูแลระบบสูงสุด (Super Admin)",
    desc: "จัดการได้ทุกเมนู ทุกบทบาท และดูประวัติการเปลี่ยนสิทธิ์",
    badgeClass: "bg-[#2A1245] text-[#D9B867] border border-[#D9B867]/40",
  },
  admin: {
    name: "ผู้ดูแลระบบ (Admin)",
    desc: "จัดการข้อมูลส่วนใหญ่ และแต่งตั้ง/ถอนสิทธิ์ได้เฉพาะ Editor",
    badgeClass: "bg-[#4B1F7A]/15 text-[#4B1F7A] border border-[#4B1F7A]/30",
  },
  editor: {
    name: "ผู้จัดการเนื้อหา (Editor)",
    desc: "จัดการข่าวสาร สไลด์ และกิจกรรม (ไม่มีสิทธิ์จัดการผู้ดูแล)",
    badgeClass: "bg-blue-50 text-blue-800 border border-blue-200",
  },
};

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  currentAdmin,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "audit">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<{ email: string; displayName: string; role: AdminRole }>({
    email: "",
    displayName: "",
    role: currentAdmin.role === "super_admin" ? "admin" : "editor",
  });

  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: AdminUser;
    newRole: AdminRole;
  } | null>(null);

  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    user: AdminUser;
    newActive: boolean;
  } | null>(null);

  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Load data
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminUsers();
      setUsers(data);
    } catch (err: any) {
      onShowToast(`โหลดรายชื่อไม่สำเร็จ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (currentAdmin.role !== "super_admin") return;
    try {
      const data = await getAuditLogs(100);
      setAuditLogs(data);
    } catch (err: any) {
      console.warn("Load audit logs error:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    if (currentAdmin.role === "super_admin") {
      loadAuditLogs();
    }
  }, [currentAdmin]);

  // Handle Add Admin
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email.trim()) return;

    setSubmitting(true);
    const res = await addAdminUser(addForm, currentAdmin);
    setSubmitting(false);

    if (res.success) {
      onShowToast(res.message);
      setIsAddModalOpen(false);
      setAddForm({
        email: "",
        displayName: "",
        role: currentAdmin.role === "super_admin" ? "admin" : "editor",
      });
      loadUsers();
      loadAuditLogs();
    } else {
      alert(res.message);
    }
  };

  // Handle Role Change
  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    setSubmitting(true);
    const res = await updateAdminUserRole(
      roleChangeTarget.user.email,
      roleChangeTarget.newRole,
      currentAdmin
    );
    setSubmitting(false);

    if (res.success) {
      onShowToast(res.message);
      setRoleChangeTarget(null);
      loadUsers();
      loadAuditLogs();
    } else {
      alert(res.message);
    }
  };

  // Handle Status Toggle
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setSubmitting(true);
    const res = await toggleAdminUserActive(
      statusChangeTarget.user.email,
      statusChangeTarget.newActive,
      currentAdmin
    );
    setSubmitting(false);

    if (res.success) {
      onShowToast(res.message);
      setStatusChangeTarget(null);
      loadUsers();
      loadAuditLogs();
    } else {
      alert(res.message);
    }
  };

  // Handle Revoke
  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    setSubmitting(true);
    const res = await revokeAdminUser(revokeTarget.email, currentAdmin);
    setSubmitting(false);

    if (res.success) {
      onShowToast(res.message);
      setRevokeTarget(null);
      loadUsers();
      loadAuditLogs();
    } else {
      alert(res.message);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q);
  });

  // Calculate counts
  const superCount = users.filter((u) => u.role === "super_admin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1B1226] flex items-center gap-2.5">
            <ShieldCheck weight="fill" className="w-6 h-6 text-[#4B1F7A]" />
            <span>จัดการสิทธิ์และผู้ดูแลระบบ (Role-Based Access Control)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#1B1226]/60 mt-1">
            กำหนดระดับสิทธิ์การเข้าถึงข้อมูล ควบคุมการเข้าใช้งาน และตรวจสอบประวัติความปลอดภัย
          </p>
        </div>

        {/* Add User Action Button */}
        {currentAdmin.role !== "editor" && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#4B1F7A] hover:bg-[#3B1564] text-[#FAF7F0] text-xs sm:text-sm font-semibold transition-all shadow-sm self-start sm:self-auto shrink-0"
          >
            <UserPlus weight="bold" className="w-4 h-4 text-[#D9B867]" />
            <span>เพิ่มผู้ดูแลระบบ</span>
          </button>
        )}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FAF7F0] p-4 rounded-[4px] border border-[#B8923A]/30 flex flex-col justify-between">
          <span className="text-xs text-[#1B1226]/60 font-medium">ผู้ดูแลทั้งหมด</span>
          <span className="font-num text-2xl font-bold text-[#1B1226] mt-1">{users.length}</span>
        </div>
        <div className="bg-[#FAF7F0] p-4 rounded-[4px] border border-[#B8923A]/30 flex flex-col justify-between">
          <span className="text-xs text-[#D9B867] font-medium flex items-center gap-1">
            <ShieldCheck weight="fill" className="w-3.5 h-3.5 text-[#B8923A]" /> Super Admin
          </span>
          <span className="font-num text-2xl font-bold text-[#4B1F7A] mt-1">{superCount}</span>
        </div>
        <div className="bg-[#FAF7F0] p-4 rounded-[4px] border border-[#B8923A]/30 flex flex-col justify-between">
          <span className="text-xs text-[#4B1F7A] font-medium">Admin</span>
          <span className="font-num text-2xl font-bold text-[#1B1226] mt-1">{adminCount}</span>
        </div>
        <div className="bg-[#FAF7F0] p-4 rounded-[4px] border border-[#B8923A]/30 flex flex-col justify-between">
          <span className="text-xs text-blue-700 font-medium">Editor</span>
          <span className="font-num text-2xl font-bold text-[#1B1226] mt-1">{editorCount}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-[#B8923A]/30 pt-2">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveSubTab("users")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeSubTab === "users"
                ? "text-[#4B1F7A]"
                : "text-[#1B1226]/60 hover:text-[#1B1226]"
            }`}
          >
            <span className="flex items-center gap-2">
              <UsersThree weight="bold" className="w-4 h-4" />
              <span>รายชื่อผู้ดูแลระบบ ({users.length})</span>
            </span>
            {activeSubTab === "users" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4B1F7A]" />
            )}
          </button>

          {currentAdmin.role === "super_admin" && (
            <button
              type="button"
              onClick={() => setActiveSubTab("audit")}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeSubTab === "audit"
                  ? "text-[#4B1F7A]"
                  : "text-[#1B1226]/60 hover:text-[#1B1226]"
              }`}
            >
              <span className="flex items-center gap-2">
                <ClockCounterClockwise weight="bold" className="w-4 h-4" />
                <span>ประวัติการเปลี่ยนสิทธิ์ (Audit Logs)</span>
              </span>
              {activeSubTab === "audit" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4B1F7A]" />
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            loadUsers();
            loadAuditLogs();
          }}
          className="text-xs text-[#1B1226]/70 hover:text-[#4B1F7A] inline-flex items-center gap-1.5 pb-2"
          title="รีเฟรชข้อมูล"
        >
          <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>

      {/* SUB-TAB 1: USERS TABLE */}
      {activeSubTab === "users" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-md bg-white px-3 py-2 rounded-[4px] border border-[#B8923A]/30">
            <MagnifyingGlass className="w-4 h-4 text-[#1B1226]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วยอีเมล หรือชื่อผู้ดูแล..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-[#1B1226]/40 text-[#1B1226]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#1B1226]/40 hover:text-[#1B1226]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[4px] border border-[#B8923A]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF7F0] border-b border-[#B8923A]/20 text-[#1B1226]/80 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ผู้ดูแลระบบ</th>
                    <th className="py-3 px-4">บทบาท (Role)</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 hidden md:table-cell">เพิ่มโดย / วันที่</th>
                    <th className="py-3 px-4 hidden lg:table-cell">เข้าสู่ระบบล่าสุด</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15 font-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#1B1226]/60">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-[#B8923A] border-t-transparent animate-spin" />
                          <span>กำลังโหลดข้อมูลผู้ดูแล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#1B1226]/60">
                        ไม่พบข้อมูลผู้ดูแลระบบ
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.email.toLowerCase() === currentAdmin.email.toLowerCase();
                      const canModify =
                        !isSelf &&
                        (currentAdmin.role === "super_admin" ||
                          (currentAdmin.role === "admin" && u.role === "editor"));

                      return (
                        <tr
                          key={u.email}
                          className={`hover:bg-[#FAF7F0]/60 transition-colors ${
                            !u.active ? "opacity-60 bg-gray-50/50" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#4B1F7A]/10 text-[#4B1F7A] font-bold text-xs flex items-center justify-center shrink-0">
                                {u.displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-[#1B1226] truncate flex items-center gap-1.5">
                                  <span>{u.displayName}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#D9B867]/20 text-[#9C7A2B] font-bold">
                                      คุณ
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#1B1226]/60 truncate font-mono">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                                ROLE_LABELS[u.role]?.badgeClass || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {u.role === "super_admin"
                                ? "Super Admin"
                                : u.role === "admin"
                                ? "Admin"
                                : "Editor"}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {u.active ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>เปิดใช้งาน</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span>ระงับการใช้งาน</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 hidden md:table-cell text-xs text-[#1B1226]/70 whitespace-nowrap">
                            <div>{u.addedBy || "-"}</div>
                            <div className="text-[10px] text-[#1B1226]/50">
                              {u.addedAt ? formatThaiDate(u.addedAt) : "-"}
                            </div>
                          </td>

                          <td className="py-3 px-4 hidden lg:table-cell text-xs text-[#1B1226]/60 whitespace-nowrap">
                            {u.lastLoginAt ? formatThaiDate(u.lastLoginAt) : "ยังไม่เคยเข้าสู่ระบบ"}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {canModify ? (
                              <div className="inline-flex items-center gap-1.5">
                                {/* Change Role Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRoleChangeTarget({
                                      user: u,
                                      newRole: u.role,
                                    })
                                  }
                                  className="p-1.5 text-[#1B1226]/60 hover:text-[#4B1F7A] hover:bg-[#4B1F7A]/10 rounded transition-colors"
                                  title="เปลี่ยนบทบาทสิทธิ์"
                                >
                                  <PencilSimple weight="bold" className="w-4 h-4" />
                                </button>

                                {/* Toggle Active Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStatusChangeTarget({
                                      user: u,
                                      newActive: !u.active,
                                    })
                                  }
                                  className={`p-1.5 rounded transition-colors ${
                                    u.active
                                      ? "text-rose-600 hover:bg-rose-50"
                                      : "text-emerald-600 hover:bg-emerald-50"
                                  }`}
                                  title={u.active ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                                >
                                  {u.active ? (
                                    <XCircle weight="bold" className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle weight="bold" className="w-4 h-4" />
                                  )}
                                </button>

                                {/* Revoke / Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => setRevokeTarget(u)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                                  title="ถอนสิทธิ์ผู้ดูแลอย่างถาวร"
                                >
                                  <Trash weight="bold" className="w-4 h-4" />
                                </button>
                              </div>
                            ) : isSelf ? (
                              <span className="text-[11px] text-[#1B1226]/40 italic">
                                บัญชีปัจจุบัน
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#1B1226]/40 italic">
                                สิทธิ์สูงกว่า
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT LOGS (Super Admin only) */}
      {activeSubTab === "audit" && currentAdmin.role === "super_admin" && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F0] p-3 rounded-[4px] border border-[#B8923A]/30 text-xs text-[#1B1226]/80 flex items-start gap-2">
            <Info weight="fill" className="w-4 h-4 text-[#B8923A] shrink-0 mt-0.5" />
            <span>
              ประวัติการเปลี่ยนแปลงสิทธิ์ (Audit Logs) เป็นบันทึกถาวร (Immutable)
              ห้ามแก้ไขหรือลบโดยเด็ดขาดตามนโยบายความมั่นคงปลอดภัย เพื่อความโปร่งใสและตรวจสอบย้อนหลังได้
            </span>
          </div>

          <div className="bg-white rounded-[4px] border border-[#B8923A]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF7F0] border-b border-[#B8923A]/20 text-[#1B1226]/80 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">วันและเวลา</th>
                    <th className="py-3 px-4">ผู้ดำเนินการ (Performed By)</th>
                    <th className="py-3 px-4">การกระทำ (Action)</th>
                    <th className="py-3 px-4">ผู้ได้รับผลกระทบ (Target)</th>
                    <th className="py-3 px-4">รายละเอียด / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8923A]/15 font-sans">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#1B1226]/60">
                        ยังไม่มีประวัติการเปลี่ยนสิทธิ์
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const actionBadge =
                        log.action === "grant"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : log.action === "role_change"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : log.action === "status_change"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200";

                      const actionLabel =
                        log.action === "grant"
                          ? "ให้สิทธิ์ใหม่"
                          : log.action === "role_change"
                          ? "เปลี่ยนบทบาท"
                          : log.action === "status_change"
                          ? "เปลี่ยนสถานะ"
                          : "ถอนสิทธิ์";

                      return (
                        <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-xs text-[#1B1226]/80">
                            {formatThaiDate(log.createdAt, { shortMonth: true })}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[#4B1F7A]">
                            {log.performedBy}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${actionBadge}`}
                            >
                              {actionLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[#1B1226]">
                            {log.targetEmail}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#1B1226]/75">
                            <div>{log.note || "-"}</div>
                            {log.previousRole && log.newRole && (
                              <div className="text-[11px] text-[#1B1226]/50">
                                {log.previousRole} → {log.newRole}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD ADMIN USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[6px] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#2A1245] text-[#FAF7F0] flex items-center justify-between">
              <h3 className="text-base font-serif font-bold flex items-center gap-2">
                <UserPlus weight="bold" className="w-5 h-5 text-[#D9B867]" />
                <span>แต่งตั้งผู้ดูแลระบบใหม่</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#FAF7F0]/70 hover:text-[#FAF7F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                  ที่อยู่อีเมล (Google Account) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="เช่น example@up.ac.th หรือ gmail.com"
                  className="w-full px-3 py-2 text-sm rounded border border-[#B8923A]/40 bg-white outline-none focus:border-[#4B1F7A]"
                />
                <span className="text-[11px] text-[#1B1226]/60 mt-1 block">
                  ต้องเป็นอีเมลที่ใช้ล็อกอินผ่านปุ่ม Google Login ในหน้าผู้ดูแล
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                  ชื่อที่แสดง / ตำแหน่ง (Display Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.displayName}
                  onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                  placeholder="เช่น อ.กนกวรรณ หรือ นายสมชาย (ฝ่ายสารสนเทศ)"
                  className="w-full px-3 py-2 text-sm rounded border border-[#B8923A]/40 bg-white outline-none focus:border-[#4B1F7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                  บทบาทและระดับสิทธิ์ (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 text-sm rounded border border-[#B8923A]/40 bg-white outline-none focus:border-[#4B1F7A]"
                >
                  {currentAdmin.role === "super_admin" && (
                    <>
                      <option value="super_admin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                      <option value="admin">ผู้ดูแลระบบทั่วไป (Admin)</option>
                    </>
                  )}
                  <option value="editor">ผู้จัดการเนื้อหา (Editor)</option>
                </select>
                <div className="mt-2 p-2.5 rounded bg-[#FAF7F0] border border-[#B8923A]/20 text-[11px] text-[#1B1226]/80">
                  {ROLE_LABELS[addForm.role]?.desc}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#B8923A]/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-[#1B1226]/70 hover:bg-black/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-[#4B1F7A] hover:bg-[#3B1564] text-[#FAF7F0] text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? "กำลังบันทึก..." : "ยืนยันการเพิ่มสิทธิ์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE ROLE */}
      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[6px] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#2A1245] text-[#FAF7F0] flex items-center justify-between">
              <h3 className="text-base font-serif font-bold flex items-center gap-2">
                <PencilSimple weight="bold" className="w-5 h-5 text-[#D9B867]" />
                <span>เปลี่ยนบทบาทผู้ดูแลระบบ</span>
              </h3>
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                className="text-[#FAF7F0]/70 hover:text-[#FAF7F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-[#1B1226]/80">
                ต้องการเปลี่ยนบทบาทของ <strong>{roleChangeTarget.user.displayName}</strong> (
                <span className="font-mono text-[11px]">{roleChangeTarget.user.email}</span>)
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1226] mb-1">
                  เลือกบทบาทใหม่
                </label>
                <select
                  value={roleChangeTarget.newRole}
                  onChange={(e) =>
                    setRoleChangeTarget({
                      ...roleChangeTarget,
                      newRole: e.target.value as AdminRole,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded border border-[#B8923A]/40 bg-white outline-none focus:border-[#4B1F7A]"
                >
                  {currentAdmin.role === "super_admin" && (
                    <>
                      <option value="super_admin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                      <option value="admin">ผู้ดูแลระบบทั่วไป (Admin)</option>
                    </>
                  )}
                  <option value="editor">ผู้จัดการเนื้อหา (Editor)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldWarning weight="fill" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  การเปลี่ยนบทบาทจะมีผลทันที และได้รับการบันทึกใน Audit Logs ไม่สามารถย้อนกลับได้โดยอัตโนมัติ
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#B8923A]/20">
                <button
                  type="button"
                  onClick={() => setRoleChangeTarget(null)}
                  className="px-4 py-2 rounded text-xs text-[#1B1226]/70 hover:bg-black/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmRoleChange}
                  className="px-5 py-2 rounded bg-[#4B1F7A] hover:bg-[#3B1564] text-[#FAF7F0] text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนบทบาท"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TOGGLE ACTIVE / SUSPEND */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] border border-[#B8923A]/40 rounded-[6px] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#2A1245] text-[#FAF7F0] flex items-center justify-between">
              <h3 className="text-base font-serif font-bold flex items-center gap-2">
                <ShieldWarning weight="bold" className="w-5 h-5 text-[#D9B867]" />
                <span>
                  {statusChangeTarget.newActive ? "เปิดใช้งานบัญชีผู้ดูแล" : "ระงับการใช้งานบัญชีผู้ดูแล"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setStatusChangeTarget(null)}
                className="text-[#FAF7F0]/70 hover:text-[#FAF7F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-[#1B1226]/80 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการ{" "}
                <strong className={statusChangeTarget.newActive ? "text-emerald-700" : "text-rose-700"}>
                  {statusChangeTarget.newActive ? "เปิดใช้งาน" : "ระงับการใช้งานชั่วคราว"}
                </strong>{" "}
                บัญชีของ <strong>{statusChangeTarget.user.displayName}</strong> (
                <span className="font-mono text-xs">{statusChangeTarget.user.email}</span>)?
              </p>

              {!statusChangeTarget.newActive && (
                <div className="p-3 bg-rose-50 rounded border border-rose-200 text-xs text-rose-800">
                  เมื่อระงับการใช้งาน บัญชีนี้จะไม่สามารถเข้าถึงระบบแอดมินหรือจัดการข้อมูลใดๆ ได้ทันที
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#B8923A]/20">
                <button
                  type="button"
                  onClick={() => setStatusChangeTarget(null)}
                  className="px-4 py-2 rounded text-xs text-[#1B1226]/70 hover:bg-black/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmStatusChange}
                  className={`px-5 py-2 rounded text-xs font-semibold text-white transition-all disabled:opacity-50 ${
                    statusChangeTarget.newActive
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? "กำลังดำเนินการ..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVOKE / DELETE ADMIN */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] border border-rose-300 rounded-[6px] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <h3 className="text-base font-serif font-bold flex items-center gap-2">
                <Trash weight="bold" className="w-5 h-5 text-rose-300" />
                <span>ยืนยันการถอนสิทธิ์ผู้ดูแลระบบ</span>
              </h3>
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-[#1B1226]/90 leading-relaxed">
                คุณกำลังจะถอนสิทธิ์ของ <strong>{revokeTarget.displayName}</strong> (
                <span className="font-mono text-xs">{revokeTarget.email}</span>) ออกจากระบบอย่างถาวร
              </p>

              <div className="p-3 bg-rose-50 rounded border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-semibold">⚠️ คำเตือนสำคัญ:</div>
                <div>
                  • ข้อมูลสิทธิ์ผู้ดูแลจะถูกลบออกจากฐานข้อมูล Firestore ทันที
                </div>
                <div>
                  • หากต้องการให้กลับมาใช้งานใหม่ จะต้องทำการแต่งตั้งสิทธิ์ใหม่เท่านั้น
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#B8923A]/20">
                <button
                  type="button"
                  onClick={() => setRevokeTarget(null)}
                  className="px-4 py-2 rounded text-xs text-[#1B1226]/70 hover:bg-black/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmRevoke}
                  className="px-5 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? "กำลังถอนสิทธิ์..." : "ยืนยันถอนสิทธิ์ถาวร"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
