"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArticle, deleteArticle, resolveViolationReport, setArticlePublished, setUserBanned, updateArticle } from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { getCurrentUser } from "@/lib/rbac";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function staffError(path: string, error: unknown): never {
  redirect(flashUrl(path, "error", actionErrorMessage(error)));
}

async function requireStaff() {
  const user = await getCurrentUser();
  if (user.authorizationError) throw new Error(user.authorizationError);
  if (user.role !== "STAFF") throw new Error("Chỉ Staff được quản lý nội dung và kiểm soát người dùng.");
}

export async function createArticleAction(formData: FormData) {
  try {
    await requireStaff();
    const title = text(formData, "title");
    const slug = text(formData, "slug");
    if (!title || !slug) throw new Error("Thiếu tiêu đề hoặc slug bài viết.");
    await createArticle({
      title,
      slug,
      imageUrl: text(formData, "imageUrl"),
      excerpt: text(formData, "excerpt"),
      content: text(formData, "content"),
      status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
    });
    revalidatePath("/staff");
  } catch (error) {
    staffError("/staff", error);
  }
  redirect(flashUrl("/staff", "success", "Đã tạo bài viết."));
}

export async function updateArticleAction(formData: FormData) {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để cập nhật.");
    await updateArticle(articleId, {
      title: text(formData, "title"),
      slug: text(formData, "slug"),
      imageUrl: text(formData, "imageUrl"),
      excerpt: text(formData, "excerpt"),
      content: text(formData, "content"),
      status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
    });
    revalidatePath("/staff");
  } catch (error) {
    staffError("/staff", error);
  }
  redirect(flashUrl("/staff", "success", "Đã lưu chỉnh sửa bài viết."));
}

export async function deleteArticleAction(formData: FormData) {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để xóa.");
    await deleteArticle(articleId);
    revalidatePath("/staff");
  } catch (error) {
    staffError("/staff", error);
  }
  redirect(flashUrl("/staff", "success", "Đã xóa bài viết."));
}

export async function publishArticleAction(formData: FormData) {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để publish.");
    await setArticlePublished(articleId, true);
    revalidatePath("/staff");
  } catch (error) {
    staffError("/staff", error);
  }
  redirect(flashUrl("/staff", "success", "Đã publish bài viết."));
}

export async function unpublishArticleAction(formData: FormData) {
  try {
    await requireStaff();
    const articleId = text(formData, "articleId");
    if (!articleId) throw new Error("Thiếu bài viết để unpublish.");
    await setArticlePublished(articleId, false);
    revalidatePath("/staff");
  } catch (error) {
    staffError("/staff", error);
  }
  redirect(flashUrl("/staff", "success", "Đã chuyển bài viết về bản nháp."));
}

export async function resolveReportAction(formData: FormData) {
  try {
    await requireStaff();
    const reportId = text(formData, "reportId");
    if (!reportId) throw new Error("Thiếu report để xử lý.");
    await resolveViolationReport(reportId);
    revalidatePath("/staff/moderation");
  } catch (error) {
    staffError("/staff/moderation", error);
  }
  redirect(flashUrl("/staff/moderation", "success", "Đã đánh dấu report là đã xử lý."));
}

export async function banModeratedUserAction(formData: FormData) {
  try {
    await requireStaff();
    const userId = text(formData, "userId");
    if (!userId) throw new Error("Thiếu user để khóa tài khoản.");
    await setUserBanned(userId, true, "STAFF");
    revalidatePath("/staff/moderation");
  } catch (error) {
    staffError("/staff/moderation", error);
  }
  redirect(flashUrl("/staff/moderation", "success", "Đã khóa tài khoản."));
}

export async function unbanModeratedUserAction(formData: FormData) {
  try {
    await requireStaff();
    const userId = text(formData, "userId");
    if (!userId) throw new Error("Thiếu user để mở khóa tài khoản.");
    await setUserBanned(userId, false, "STAFF");
    revalidatePath("/staff/moderation");
  } catch (error) {
    staffError("/staff/moderation", error);
  }
  redirect(flashUrl("/staff/moderation", "success", "Đã mở khóa tài khoản."));
}
