"use client";

import { ErrorState } from "./feedback-state";

export function RouteError({ reset, title }: { reset: () => void; title?: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <ErrorState title={title} description="Trang gặp lỗi runtime hoặc API không phản hồi đúng định dạng. Bấm thử lại để render lại route." onRetry={reset} />
    </main>
  );
}

