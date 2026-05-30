"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArticle, deleteArticle, getUsers, resolveViolationReport, setArticlePublished, setUserBanned, updateArticle } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { mutationError, mutationSuccess, type MutationState } from "@/lib/mutation-state";
import { getCurrentUser } from "@/lib/rbac";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requiredText(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Vui lòng nhập ${label}.`);
  return value;
}

function requiredSlug(formData: FormData) {
  const slug = text(formData, "slug").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug chỉ dùng chữ thường không dấu, số và dấu gạch ngang, ví dụ du-lich-nui-ba-den.");
  }
  return slug;
}

function optionalUrl(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error(`${label} phải là URL http/https hợp lệ.`);
  }
  return value;
}

function staffError(path: string, error: unknown): never {
  redirect(flashUrl(path, "error", actionErrorMessage(error)));
}

function staffActionError(error: unknown): MutationState {
  return mutationError(actionErrorMessage(error));
}

async function requireStaff() {
  const user = await getCurrentUser();
  if (user.authorizationError) throw new Error(user.authorizationError);
  if (user.role !== "STAFF") throw new Error("Chỉ Staff được quản lý nội dung và kiểm soát người dùng.");
}

async function requireCustomerTarget(userId: string) {
  const target = (await getUsers("STAFF")).find((user) => user.id === userId);
  if (!target) throw new Error("Không tìm thấy tài khoản cần kiểm soát.");
  if (target.role !== "CUSTOMER") throw new Error("Staff chỉ được khóa hoặc mở khóa tài khoản Customer.");
}

export async function createArticleAction(formData: FormData) {
  const result = await createArticleInlineAction({}, formData);
  if (result.type === "error") staffError("/staff", new Error(result.message));
  redirect(flashUrl("/staff", "success", "Đã tạo bài viết."));
}

export async function createArticleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const title = requiredText(formData, "title", "tiêu đề bài viết");
    const slug = requiredSlug(formData);
    await createArticle({
      title,
      slug,
      imageUrl: optionalUrl(formData, "imageUrl", "URL ảnh bài viết"),
      excerpt: requiredText(formData, "excerpt", "tóm tắt bài viết"),
      content: requiredText(formData, "content", "nội dung bài viết"),
      status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
    });
    revalidatePath("/staff");
    return mutationSuccess("Đã tạo bài viết.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function updateArticleAction(formData: FormData) {
  const result = await updateArticleInlineAction({}, formData);
  if (result.type === "error") staffError("/staff", new Error(result.message));
  redirect(flashUrl("/staff", "success", "Đã lưu chỉnh sửa bài viết."));
}

export async function updateArticleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để cập nhật.");
    await updateArticle(articleId, {
      title: requiredText(formData, "title", "tiêu đề bài viết"),
      slug: requiredSlug(formData),
      imageUrl: optionalUrl(formData, "imageUrl", "URL ảnh bài viết"),
      excerpt: requiredText(formData, "excerpt", "tóm tắt bài viết"),
      content: requiredText(formData, "content", "nội dung bài viết"),
      status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
    });
    revalidatePath("/staff");
    return mutationSuccess("Đã lưu chỉnh sửa bài viết.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function deleteArticleAction(formData: FormData) {
  const result = await deleteArticleInlineAction({}, formData);
  if (result.type === "error") staffError("/staff", new Error(result.message));
  redirect(flashUrl("/staff", "success", "Đã xóa bài viết."));
}

export async function deleteArticleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để xóa.");
    await deleteArticle(articleId);
    revalidatePath("/staff");
    return mutationSuccess("Đã xóa bài viết.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function publishArticleAction(formData: FormData) {
  const result = await publishArticleInlineAction({}, formData);
  if (result.type === "error") staffError("/staff", new Error(result.message));
  redirect(flashUrl("/staff", "success", "Đã publish bài viết."));
}

export async function publishArticleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để publish.");
    await setArticlePublished(articleId, true);
    revalidatePath("/staff");
    return mutationSuccess("Đã publish bài viết.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function unpublishArticleAction(formData: FormData) {
  const result = await unpublishArticleInlineAction({}, formData);
  if (result.type === "error") staffError("/staff", new Error(result.message));
  redirect(flashUrl("/staff", "success", "Đã chuyển bài viết về bản nháp."));
}

export async function unpublishArticleInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để unpublish.");
    await setArticlePublished(articleId, false);
    revalidatePath("/staff");
    return mutationSuccess("Đã chuyển bài viết về bản nháp.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function resolveReportAction(formData: FormData) {
  const result = await resolveReportInlineAction({}, formData);
  if (result.type === "error") staffError("/staff/moderation", new Error(result.message));
  redirect(flashUrl("/staff/moderation", "success", "Đã đánh dấu report là đã xử lý."));
}

export async function resolveReportInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const reportId = text(formData, "reportId");
    if (!reportId) throw new Error("Thiếu report để xử lý.");
    await resolveViolationReport(reportId);
    revalidatePath("/staff/moderation");
    return mutationSuccess("Đã đánh dấu report là đã xử lý.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function banModeratedUserAction(formData: FormData) {
  const result = await banModeratedUserInlineAction({}, formData);
  if (result.type === "error") staffError("/staff/moderation", new Error(result.message));
  redirect(flashUrl("/staff/moderation", "success", "Đã khóa tài khoản."));
}

export async function banModeratedUserInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const userId = text(formData, "userId");
    if (!userId) throw new Error("Thiếu user để khóa tài khoản.");
    await requireCustomerTarget(userId);
    await setUserBanned(userId, true, "STAFF");
    revalidatePath("/staff/moderation");
    return mutationSuccess("Đã khóa tài khoản.");
  } catch (error) {
    return staffActionError(error);
  }
}

export async function unbanModeratedUserAction(formData: FormData) {
  const result = await unbanModeratedUserInlineAction({}, formData);
  if (result.type === "error") staffError("/staff/moderation", new Error(result.message));
  redirect(flashUrl("/staff/moderation", "success", "Đã mở khóa tài khoản."));
}

export async function unbanModeratedUserInlineAction(_state: MutationState, formData: FormData): Promise<MutationState> {
  try {
    await requireStaff();
    const userId = text(formData, "userId");
    if (!userId) throw new Error("Thiếu user để mở khóa tài khoản.");
    await requireCustomerTarget(userId);
    await setUserBanned(userId, false, "STAFF");
    revalidatePath("/staff/moderation");
    return mutationSuccess("Đã mở khóa tài khoản.");
  } catch (error) {
    return staffActionError(error);
  }
}
