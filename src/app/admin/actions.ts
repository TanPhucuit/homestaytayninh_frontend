"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assignUserRole, createUser, setUserBanned } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { mutationError, mutationSuccess, type MutationState } from "@/lib/mutation-state";
import { getCurrentUser, normalizeRole } from "@/lib/rbac";

function adminError(error: unknown): never {
  redirect(flashUrl("/admin", "error", actionErrorMessage(error)));
}

function adminActionError(error: unknown): MutationState {
  return mutationError(actionErrorMessage(error));
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.authorizationError) throw new Error(user.authorizationError);
  if (user.role !== "ADMIN") throw new Error("Chỉ Admin được quản lý tài khoản, phân quyền và thống kê hệ thống.");
  return user;
}

function requiredEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ.");
  return email;
}

function optionalPhone(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone && !/^[0-9+\-\s().]{8,20}$/.test(phone)) throw new Error("Số điện thoại không hợp lệ.");
  return phone || undefined;
}

export async function createAdminUserAction(formData: FormData) {
  const result = await createAdminUserInlineAction({}, formData);
  if (result.type === "error") adminError(new Error(result.message));
  redirect(flashUrl("/admin", "success", "Đã tạo profile. Nếu chưa có authId, người dùng cần đăng nhập Google để liên kết."));
}

export async function createAdminUserInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    const email = requiredEmail(formData);
    const phone = optionalPhone(formData);
    const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
    if (!name) throw new Error("Thiếu tên để tạo tài khoản.");
    await createUser({ name, email, phone, role }, "ADMIN");
    revalidatePath("/admin");
    return mutationSuccess("Đã tạo profile. Nếu chưa có authId, người dùng cần đăng nhập Google để liên kết.");
  } catch (error) {
    return adminActionError(error);
  }
}

export async function assignRoleAction(formData: FormData) {
  const result = await assignRoleInlineAction({}, formData);
  if (result.type === "error") adminError(new Error(result.message));
  redirect(flashUrl("/admin", "success", "Đã cập nhật vai trò người dùng."));
}

export async function assignRoleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    const currentUser = await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
    if (!userId) throw new Error("Thiếu user để phân quyền.");
    if (userId === currentUser.id) throw new Error("Admin không được tự thay đổi vai trò của chính mình.");
    await assignUserRole(userId, role, "ADMIN");
    revalidatePath("/admin");
    return mutationSuccess("Đã cập nhật vai trò người dùng.");
  } catch (error) {
    return adminActionError(error);
  }
}

export async function banUserAction(formData: FormData) {
  const result = await banUserInlineAction({}, formData);
  if (result.type === "error") adminError(new Error(result.message));
  redirect(flashUrl("/admin", "success", "Đã khóa tài khoản."));
}

export async function banUserInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    const currentUser = await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    if (!userId) throw new Error("Thiếu user để khóa tài khoản.");
    if (userId === currentUser.id) throw new Error("Admin không được tự khóa tài khoản của chính mình.");
    await setUserBanned(userId, true, "ADMIN");
    revalidatePath("/admin");
    return mutationSuccess("Đã khóa tài khoản.");
  } catch (error) {
    return adminActionError(error);
  }
}

export async function unbanUserAction(formData: FormData) {
  const result = await unbanUserInlineAction({}, formData);
  if (result.type === "error") adminError(new Error(result.message));
  redirect(flashUrl("/admin", "success", "Đã mở khóa tài khoản."));
}

export async function unbanUserInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    if (!userId) throw new Error("Thiếu user để mở khóa tài khoản.");
    await setUserBanned(userId, false, "ADMIN");
    revalidatePath("/admin");
    return mutationSuccess("Đã mở khóa tài khoản.");
  } catch (error) {
    return adminActionError(error);
  }
}
