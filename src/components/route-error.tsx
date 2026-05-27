"use client";

import { ErrorState } from "./feedback-state";

export function RouteError({ reset, title }: { reset: () => void; title?: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <ErrorState title={title} description="Không thể tiếp tục, vui lòng thử lại. Nếu sự cố vẫn xảy ra, hãy đăng nhập lại hoặc quay về trang trước." onRetry={reset} />
    </main>
  );
}
