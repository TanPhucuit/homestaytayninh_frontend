"use server";

import { revalidatePath } from "next/cache";
import { assignUserRole, createUser, setUserBanned } from "@/lib/api";
import { normalizeRole } from "@/lib/rbac";

export async function createAdminUserAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
  await createUser({ name, email, phone: phone || undefined, role }, "ADMIN");
  revalidatePath("/admin");
}

export async function assignRoleAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const role = normalizeRole(String(formData.get("role") ?? "CUSTOMER"));
  await assignUserRole(userId, role, "ADMIN");
  revalidatePath("/admin");
}

export async function banUserAction(formData: FormData) {
  await setUserBanned(String(formData.get("userId") ?? ""), true, "ADMIN");
  revalidatePath("/admin");
}

export async function unbanUserAction(formData: FormData) {
  await setUserBanned(String(formData.get("userId") ?? ""), false, "ADMIN");
  revalidatePath("/admin");
}
