import { EmptyState } from "./feedback-state";

export function AccessDenied({ description = "Bạn cần đăng nhập đúng vai trò để truy cập khu vực này." }: { description?: string }) {
  return (
    <main className="min-h-screen bg-[#fdf9f4] px-4 py-10 text-[#2b211d]">
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Không có quyền truy cập" description={description} actionHref="/login" actionLabel="Đăng nhập đúng vai trò" />
      </div>
    </main>
  );
}
