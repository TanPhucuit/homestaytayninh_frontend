"use server";

import { revalidatePath } from "next/cache";
import { createArticle, deleteArticle, resolveViolationReport, setArticlePublished, updateArticle } from "@/lib/api";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createArticleAction(formData: FormData) {
  await createArticle({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    content: text(formData, "content"),
    status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  });
  revalidatePath("/staff");
}

export async function updateArticleAction(formData: FormData) {
  const articleId = text(formData, "articleId");
  await updateArticle(articleId, {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    content: text(formData, "content"),
    status: text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  });
  revalidatePath("/staff");
}

export async function deleteArticleAction(formData: FormData) {
  await deleteArticle(text(formData, "articleId"));
  revalidatePath("/staff");
}

export async function publishArticleAction(formData: FormData) {
  await setArticlePublished(text(formData, "articleId"), true);
  revalidatePath("/staff");
}

export async function unpublishArticleAction(formData: FormData) {
  await setArticlePublished(text(formData, "articleId"), false);
  revalidatePath("/staff");
}

export async function resolveReportAction(formData: FormData) {
  await resolveViolationReport(text(formData, "reportId"));
  revalidatePath("/staff/moderation");
}
