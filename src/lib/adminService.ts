/**
 * Admin User Management & Audit Logging Service
 * Role-Based Access Control (RBAC): super_admin | admin | editor
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { AdminRole, AdminUser, AuditLogAction, AuditLogItem } from "@/src/types";
import { ADMIN_BOOTSTRAP_EMAILS } from "@/src/config/site";

const ADMINS_COLLECTION = "admins";
const AUDIT_LOGS_COLLECTION = "auditLogs";

/**
 * Format email to lowercase trimmed standard
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Fetch a single admin user by email
 */
export async function getAdminUser(email: string): Promise<AdminUser | null> {
  const normalized = normalizeEmail(email);
  try {
    const docRef = doc(db, ADMINS_COLLECTION, normalized);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { email: docSnap.id, ...(docSnap.data() as Omit<AdminUser, "email">) };
    }
    return null;
  } catch (error) {
    console.warn("getAdminUser error:", error);
    return null;
  }
}

/**
 * Fetch all admin users
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, ADMINS_COLLECTION);
    const snap = await getDocs(colRef);
    const users: AdminUser[] = [];
    snap.forEach((d) => {
      users.push({ email: d.id, ...(d.data() as Omit<AdminUser, "email">) });
    });
    // Sort by role hierarchy: super_admin > admin > editor, then addedAt desc
    const roleWeight: Record<AdminRole, number> = {
      super_admin: 3,
      admin: 2,
      editor: 1,
    };
    users.sort((a, b) => {
      const weightDiff = (roleWeight[b.role] || 0) - (roleWeight[a.role] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ADMINS_COLLECTION);
  }
}

/**
 * Count active super admins in the database
 */
export async function getActiveSuperAdminCount(): Promise<number> {
  try {
    const colRef = collection(db, ADMINS_COLLECTION);
    const q = query(colRef, where("role", "==", "super_admin"), where("active", "==", true));
    const snap = await getDocs(q);
    return snap.size;
  } catch (error) {
    console.warn("Count active super admins error:", error);
    return 1; // Fallback to safe presumption
  }
}

/**
 * Write an immutable audit log entry
 */
export async function writeAuditLog(params: {
  action: AuditLogAction;
  targetEmail: string;
  performedBy: string;
  previousRole?: AdminRole | null;
  newRole?: AdminRole | null;
  previousActive?: boolean | null;
  newActive?: boolean | null;
  note?: string;
}): Promise<void> {
  try {
    const payload = {
      action: params.action,
      targetEmail: normalizeEmail(params.targetEmail),
      performedBy: normalizeEmail(params.performedBy),
      previousRole: params.previousRole || null,
      newRole: params.newRole || null,
      previousActive: params.previousActive ?? null,
      newActive: params.newActive ?? null,
      note: params.note || "",
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), payload);
  } catch (error) {
    console.warn("Failed to write audit log:", error);
  }
}

/**
 * Fetch Audit Logs (Reserved for Super Admin)
 */
export async function getAuditLogs(limitCount = 60): Promise<AuditLogItem[]> {
  try {
    const colRef = collection(db, AUDIT_LOGS_COLLECTION);
    const snap = await getDocs(colRef);
    const logs: AuditLogItem[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as Omit<AuditLogItem, "id">) });
    });
    // Sort in memory by createdAt descending
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.slice(0, limitCount);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, AUDIT_LOGS_COLLECTION);
  }
}

/**
 * Bootstrap an admin user upon login
 * If the user's email is in ADMIN_BOOTSTRAP_EMAILS, ensures a super_admin record exists
 */
export async function bootstrapAdminUser(user: User): Promise<AdminUser | null> {
  if (!user.email) return null;
  const email = normalizeEmail(user.email);
  const isBootstrap = ADMIN_BOOTSTRAP_EMAILS.some((b) => normalizeEmail(b) === email);

  try {
    const existing = await getAdminUser(email);
    if (existing) {
      // Update lastLoginAt
      try {
        await updateDoc(doc(db, ADMINS_COLLECTION, email), {
          lastLoginAt: new Date().toISOString(),
          displayName: user.displayName || existing.displayName,
        });
      } catch {
        // Non-critical
      }
      return {
        ...existing,
        lastLoginAt: new Date().toISOString(),
        displayName: user.displayName || existing.displayName,
      };
    }

    // If not existing, but email is an authorized bootstrap super admin:
    if (isBootstrap) {
      const newAdmin: Omit<AdminUser, "email"> = {
        role: "super_admin",
        displayName: user.displayName || email.split("@")[0],
        active: true,
        addedBy: "system_bootstrap",
        addedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(doc(db, ADMINS_COLLECTION, email), newAdmin);

      await writeAuditLog({
        action: "grant",
        targetEmail: email,
        performedBy: "system_bootstrap",
        newRole: "super_admin",
        newActive: true,
        note: "สร้างบัญชีผู้ดูแลระบบสูงสุดเริ่มต้น (Bootstrap Super Admin)",
      });

      return { email, ...newAdmin };
    }

    return null;
  } catch (error) {
    console.error("bootstrapAdminUser error:", error);
    // If permission or network issue occurs on bootstrap, provide fallback for authorized bootstrap email
    if (isBootstrap) {
      return {
        email,
        role: "super_admin",
        displayName: user.displayName || email.split("@")[0],
        active: true,
        addedBy: "system_bootstrap",
        addedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }
    return null;
  }
}

/**
 * Add a new admin user
 */
export async function addAdminUser(
  params: {
    email: string;
    role: AdminRole;
    displayName: string;
  },
  performedBy: AdminUser
): Promise<{ success: boolean; message: string }> {
  const targetEmail = normalizeEmail(params.email);

  if (!targetEmail.includes("@") || targetEmail.length < 5) {
    return { success: false, message: "กรุณาระบุที่อยู่อีเมลให้ถูกต้อง" };
  }

  if (targetEmail === normalizeEmail(performedBy.email)) {
    return { success: false, message: "ไม่สามารถเพิ่มหรือแก้ไขสิทธิ์ของตนเองได้" };
  }

  // Permission check: Admin can only grant 'editor' role
  if (performedBy.role === "admin" && params.role !== "editor") {
    return { success: false, message: "ผู้ดูแลระดับ Admin สามารถเพิ่มผู้ดูแลได้เฉพาะบทบาท Editor เท่านั้น" };
  }
  if (performedBy.role === "editor") {
    return { success: false, message: "ผู้ดูแลระดับ Editor ไม่มีสิทธิ์จัดการผู้ดูแลระบบ" };
  }

  try {
    const existing = await getAdminUser(targetEmail);
    if (existing) {
      return {
        success: false,
        message: `อีเมล ${targetEmail} มีสิทธิ์เป็น ${existing.role} อยู่แล้ว`,
      };
    }

    const payload: Omit<AdminUser, "email"> = {
      role: params.role,
      displayName: params.displayName.trim() || targetEmail.split("@")[0],
      active: true,
      addedBy: normalizeEmail(performedBy.email),
      addedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, ADMINS_COLLECTION, targetEmail), payload);

    await writeAuditLog({
      action: "grant",
      targetEmail,
      performedBy: performedBy.email,
      newRole: params.role,
      newActive: true,
      note: `เพิ่มผู้ดูแลระบบ (${params.displayName || targetEmail}) สิทธิ์ ${params.role}`,
    });

    return { success: true, message: `เพิ่มสิทธิ์ผู้ดูแล ${targetEmail} สำเร็จ` };
  } catch (error: any) {
    console.error("addAdminUser error:", error);
    return { success: false, message: error.message || "ไม่สามารถเพิ่มผู้ดูแลระบบได้" };
  }
}

/**
 * Change Role of an admin user
 */
export async function updateAdminUserRole(
  targetEmail: string,
  newRole: AdminRole,
  performedBy: AdminUser
): Promise<{ success: boolean; message: string }> {
  const email = normalizeEmail(targetEmail);

  if (email === normalizeEmail(performedBy.email)) {
    return { success: false, message: "ห้ามแก้ไขสิทธิ์หรือบทบาทของตนเอง" };
  }

  if (performedBy.role === "editor") {
    return { success: false, message: "ไม่มีสิทธิ์ในการจัดการบทบาทผู้ดูแล" };
  }

  try {
    const targetDoc = await getAdminUser(email);
    if (!targetDoc) {
      return { success: false, message: "ไม่พบบัญชีผู้ดูแลที่ต้องการแก้ไข" };
    }

    // Role hierarchy constraints
    if (performedBy.role === "admin") {
      if (targetDoc.role !== "editor" || newRole !== "editor") {
        return {
          success: false,
          message: "ผู้ดูแลระดับ Admin จัดการได้เฉพาะบทบาท Editor และไม่สามารถปรับสิทธิ์สูงกว่าที่มีได้",
        };
      }
    }

    // Ensure at least 1 active super_admin remains
    if (targetDoc.role === "super_admin" && targetDoc.active && newRole !== "super_admin") {
      const activeSuperCount = await getActiveSuperAdminCount();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          message: "ไม่สามารถลดบทบาท Super Admin คนนี้ได้ เนื่องจากต้องมี Super Admin ที่เปิดใช้งานอยู่อย่างน้อย 1 คนในระบบ",
        };
      }
    }

    await updateDoc(doc(db, ADMINS_COLLECTION, email), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    await writeAuditLog({
      action: "role_change",
      targetEmail: email,
      performedBy: performedBy.email,
      previousRole: targetDoc.role,
      newRole,
      note: `เปลี่ยนบทบาทจาก ${targetDoc.role} เป็น ${newRole}`,
    });

    return { success: true, message: `เปลี่ยนบทบาทของ ${email} เป็น ${newRole} สำเร็จ` };
  } catch (error: any) {
    console.error("updateAdminUserRole error:", error);
    return { success: false, message: error.message || "ไม่สามารถเปลี่ยนบทบาทได้" };
  }
}

/**
 * Toggle active/inactive status of an admin user
 */
export async function toggleAdminUserActive(
  targetEmail: string,
  newActive: boolean,
  performedBy: AdminUser
): Promise<{ success: boolean; message: string }> {
  const email = normalizeEmail(targetEmail);

  if (email === normalizeEmail(performedBy.email)) {
    return { success: false, message: "ห้ามระงับการใช้งานบัญชีของตนเอง" };
  }

  if (performedBy.role === "editor") {
    return { success: false, message: "ไม่มีสิทธิ์ในการเปิด/ปิดการใช้งานผู้ดูแล" };
  }

  try {
    const targetDoc = await getAdminUser(email);
    if (!targetDoc) {
      return { success: false, message: "ไม่พบบัญชีผู้ดูแลที่ต้องการแก้ไข" };
    }

    if (performedBy.role === "admin" && targetDoc.role !== "editor") {
      return { success: false, message: "ผู้ดูแลระดับ Admin สามารถเปิด/ปิดการใช้งานได้เฉพาะผู้ดูแลระดับ Editor เท่านั้น" };
    }

    // Ensure at least 1 active super_admin remains
    if (targetDoc.role === "super_admin" && !newActive) {
      const activeSuperCount = await getActiveSuperAdminCount();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          message: "ไม่สามารถระงับการใช้งาน Super Admin ท่านนี้ได้ เนื่องจากต้องมี Super Admin ที่เปิดใช้งานอย่างน้อย 1 คน",
        };
      }
    }

    await updateDoc(doc(db, ADMINS_COLLECTION, email), {
      active: newActive,
      updatedAt: new Date().toISOString(),
    });

    await writeAuditLog({
      action: "status_change",
      targetEmail: email,
      performedBy: performedBy.email,
      previousActive: targetDoc.active,
      newActive,
      note: newActive ? "เปิดใช้งานบัญชีผู้ดูแล" : "ระงับการใช้งานบัญชีผู้ดูแลชั่วคราว",
    });

    return {
      success: true,
      message: `${newActive ? "เปิดใช้งาน" : "ระงับการใช้งาน"} บัญชี ${email} เรียบร้อยแล้ว`,
    };
  } catch (error: any) {
    console.error("toggleAdminUserActive error:", error);
    return { success: false, message: error.message || "ไม่สามารถปรับสถานะการใช้งานได้" };
  }
}

/**
 * Revoke/Delete an admin user completely
 */
export async function revokeAdminUser(
  targetEmail: string,
  performedBy: AdminUser
): Promise<{ success: boolean; message: string }> {
  const email = normalizeEmail(targetEmail);

  if (email === normalizeEmail(performedBy.email)) {
    return { success: false, message: "ห้ามถอนสิทธิ์บัญชีของตนเอง" };
  }

  if (performedBy.role === "editor") {
    return { success: false, message: "ไม่มีสิทธิ์ในการถอนสิทธิ์ผู้ดูแลระบบ" };
  }

  try {
    const targetDoc = await getAdminUser(email);
    if (!targetDoc) {
      return { success: false, message: "ไม่พบบัญชีผู้ดูแลที่ต้องการถอนสิทธิ์" };
    }

    if (performedBy.role === "admin" && targetDoc.role !== "editor") {
      return { success: false, message: "ผู้ดูแลระดับ Admin ถอนสิทธิ์ได้เฉพาะผู้ดูแลระดับ Editor เท่านั้น" };
    }

    // Ensure at least 1 active super_admin remains
    if (targetDoc.role === "super_admin" && targetDoc.active) {
      const activeSuperCount = await getActiveSuperAdminCount();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          message: "ไม่สามารถถอนสิทธิ์ Super Admin ท่านนี้ได้ เนื่องจากต้องมี Super Admin ที่เปิดใช้งานอย่างน้อย 1 คนในระบบ",
        };
      }
    }

    await deleteDoc(doc(db, ADMINS_COLLECTION, email));

    await writeAuditLog({
      action: "revoke",
      targetEmail: email,
      performedBy: performedBy.email,
      previousRole: targetDoc.role,
      previousActive: targetDoc.active,
      note: `ถอนสิทธิ์ผู้ดูแลระบบ (${targetDoc.role}) ออกจากระบบอย่างถาวร`,
    });

    return { success: true, message: `ถอนสิทธิ์ผู้ดูแล ${email} ออกจากระบบเรียบร้อยแล้ว` };
  } catch (error: any) {
    console.error("revokeAdminUser error:", error);
    return { success: false, message: error.message || "ไม่สามารถถอนสิทธิ์ผู้ดูแลได้" };
  }
}
