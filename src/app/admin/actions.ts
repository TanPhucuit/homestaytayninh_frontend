"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assignUserRole, createUser, setUserBanned } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { normalizeRole } from "@/lib/rbac";

function adminError(error: unknown): never {
  redirect(flashUrl("/admin", "error", actionErrorMessage(error)));
}

export async function createAdminUserAction(formData: FormData) {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
    if (!name || !email) throw new Error("Thiếu tên hoặc email để tạo tài khoản.");
    await createUser({ name, email, phone: phone || undefined, role }, "ADMIN");
    revalidatePath("/admin");
  } catch (error) {
    adminError(error);
  }
  redirect(flashUrl("/admin", "success", "Đã tạo profile. Nếu chưa có authId, người dùng cần đăng nhập Google để liên kết."));
}

export async function assignRoleAction(formData: FormData) {
  try {
    const userId = String(formData.get("userId") ?? "");
    const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
    if (!userId) throw new Error("Thiếu user để phân quyền.");
    await assignUserRole(userId, role, "ADMIN");
    revalidatePath("/admin");
  } catch (error) {
    adminError(error);
  }
  redirect(flashUrl("/admin", "success", "Đã cập nhật vai trò người dùng."));
}

export async function banUserAction(formData: FormData) {
  try {
    const userId = String(formData.get("userId") ?? "");
    if (!userId) throw new Error("Thiếu user để khóa tài khoản.");
    await setUserBanned(userId, true, "ADMIN");
    revalidatePath("/admin");
  } catch (error) {
    adminError(error);
  }
  redirect(flashUrl("/admin", "success", "Đã khóa tài khoản."));
}

export async function unbanUserAction(formData: FormData) {
  try {
    const userId = String(formData.get("userId") ?? "");
    if (!userId) throw new Error("Thiếu user để mở khóa tài khoản.");
    await setUserBanned(userId, false, "ADMIN");
    revalidatePath("/admin");
  } catch (error) {
    adminError(error);
  }
  redirect(flashUrl("/admin", "success", "Đã mở khóa tài khoản."));
}
